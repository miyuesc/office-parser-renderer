import { FileHandler, getElementsByLocalName, getOptionalAttr, Logger, parseBooleanAttr, parseNumberAttr } from '@opr/shared';
import { WorksheetComment } from './types';

const logger = new Logger('CommentsParser');

export class CommentsParser {
  static parse(xmlString: string): WorksheetComment[] {
    const comments: WorksheetComment[] = [];

    try {
      const doc = FileHandler.parseXML(xmlString);
      const authors = this.parseAuthors(doc);
      const commentNodes = getElementsByLocalName(doc, 'comment');

      for (const commentNode of commentNodes) {
        const ref = getOptionalAttr(commentNode, 'ref');
        if (!ref) {
          continue;
        }

        const authorId = parseNumberAttr(getOptionalAttr(commentNode, 'authorId'), -1);
        comments.push({
          ref,
          authorId: authorId >= 0 ? authorId : undefined,
          author: authorId >= 0 ? authors[authorId] : undefined,
          text: this.parseCommentText(commentNode),
          visible: parseBooleanAttr(getOptionalAttr(commentNode, 'visible'))
        });
      }
    } catch (error) {
      logger.error('Failed to parse comments', error);
    }

    return comments;
  }

  private static parseAuthors(doc: Document): string[] {
    const authorsNode = getElementsByLocalName(doc, 'authors')[0];
    if (!authorsNode) {
      return [];
    }

    return getElementsByLocalName(authorsNode, 'author').map(node => node.textContent || '');
  }

  private static parseCommentText(commentNode: Element): string {
    const textNode = getElementsByLocalName(commentNode, 'text')[0];
    if (!textNode) {
      return '';
    }

    const runNodes = getElementsByLocalName(textNode, 'r');
    if (runNodes.length > 0) {
      return runNodes
        .map(runNode => {
          const textParts = getElementsByLocalName(runNode, 't').map(tNode => tNode.textContent || '');
          return textParts.join('');
        })
        .join('');
    }

    return getElementsByLocalName(textNode, 't')
      .map(node => node.textContent || '')
      .join('');
  }
}
