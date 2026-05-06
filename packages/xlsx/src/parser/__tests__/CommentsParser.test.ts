import { describe, expect, it } from 'vitest';
import { CommentsParser } from '../CommentsParser';

describe('CommentsParser', () => {
  it('should parse authors and rich-text comment bodies', () => {
    const xml = `
      <comments xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
        <authors>
          <author>Alice</author>
        </authors>
        <commentList>
          <comment ref="B2" authorId="0" visible="1">
            <text>
              <r><t>Hello</t></r>
              <r><t xml:space="preserve"> world</t></r>
            </text>
          </comment>
        </commentList>
      </comments>
    `;

    expect(CommentsParser.parse(xml)).toEqual([
      {
        ref: 'B2',
        authorId: 0,
        author: 'Alice',
        text: 'Hello world',
        visible: true
      }
    ]);
  });
});
