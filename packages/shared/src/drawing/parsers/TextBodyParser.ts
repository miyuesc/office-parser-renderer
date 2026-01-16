import { XmlUtils } from '../../xml';
import { OfficeTextBody, OfficeParagraph, OfficeRun } from '../types';
import { FillParser } from './FillParser';
import { EffectParser } from './EffectParser';

export class TextBodyParser {
  static parseTextBody(node: Element): OfficeTextBody | undefined {
    if (!node) return undefined;
    const paragraphs: OfficeParagraph[] = [];

    const pNodes = XmlUtils.queryAll(node, 'a\\:p');
    pNodes.forEach(p => {
      const runs: OfficeRun[] = [];
      const rNodes = XmlUtils.queryAll(p, 'a\\:r');
      rNodes.forEach(r => {
        const t = XmlUtils.query(r, 'a\\:t')?.textContent || '';
        const rPr = XmlUtils.query(r, 'a\\:rPr');
        const run: OfficeRun = { text: t };
        if (rPr) {
          if (rPr.getAttribute('b') === '1') run.bold = true;
          if (rPr.getAttribute('i') === '1') run.italic = true;
          if (rPr.getAttribute('u') === 'sng') run.underline = 'sng';
          if (rPr.getAttribute('strike') !== 'noStrike' && rPr.getAttribute('strike')) run.strike = 'sngStrike';

          const sz = parseInt(rPr.getAttribute('sz') || '0', 10);
          if (sz > 0) run.size = sz / 100; // 100ths of pt

          const fill = FillParser.parseFill(rPr);
          if (fill) {
            run.fill = fill;
            if (fill.type === 'solid') run.color = fill.color;
          }

          const effectLst = XmlUtils.query(rPr, 'a\\:effectLst');
          if (effectLst) {
            run.effects = EffectParser.parseEffects(effectLst);
            console.log(`Parsed Run Effects for text "${t}":`, run.effects);
          }

          const baseline = parseInt(rPr.getAttribute('baseline') || '0', 10);
          if (baseline !== 0) run.baseline = baseline / 1000; // %
        }
        runs.push(run);
      });

      // Paragraph Properties
      const pPr = XmlUtils.query(p, 'a\\:pPr');
      let alignment: any = 'left';
      if (pPr) {
        const algn = pPr.getAttribute('algn');
        if (algn) {
          if (algn === 'ctr') alignment = 'center';
          else if (algn === 'r') alignment = 'right';
          else if (algn === 'just') alignment = 'justify';
        }
      }

      paragraphs.push({
        text: runs.map(r => r.text).join(''),
        runs,
        alignment
      });
    });

    let verticalAlignment: any = 'top';
    const bodyPr = XmlUtils.query(node, 'a\\:bodyPr');
    let padding = { left: 0, top: 0, right: 0, bottom: 0 };
    let wrap: 'square' | 'none' = 'square';

    if (bodyPr) {
      const anchor = bodyPr.getAttribute('anchor');
      if (anchor) {
        if (anchor === 'ctr') verticalAlignment = 'middle';
        else if (anchor === 'b') verticalAlignment = 'bottom';
        else if (anchor === 'just') verticalAlignment = 'justified';
        else if (anchor === 'dist') verticalAlignment = 'distributed';
      }

      const lIns = parseInt(bodyPr.getAttribute('lIns') || '91440', 10);
      const tIns = parseInt(bodyPr.getAttribute('tIns') || '45720', 10);
      const rIns = parseInt(bodyPr.getAttribute('rIns') || '91440', 10);
      const bIns = parseInt(bodyPr.getAttribute('bIns') || '45720', 10);

      // Convert EMU to PT (approx) or keep EMU? Renderer expects values.
      // 1 pt = 12700 EMU.
      padding = {
        left: lIns / 12700,
        top: tIns / 12700,
        right: rIns / 12700,
        bottom: bIns / 12700
      };

      const wrapAttr = bodyPr.getAttribute('wrap');
      if (wrapAttr === 'none') wrap = 'none';
    }

    return {
      text: paragraphs.map(p => p.text).join('\n'),
      paragraphs,
      verticalAlignment,
      padding,
      wrap
    };
  }
}
