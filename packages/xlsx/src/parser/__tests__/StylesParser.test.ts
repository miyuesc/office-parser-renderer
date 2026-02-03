import { describe, it, expect } from 'vitest';
import { StylesParser } from '../StylesParser';

describe('StylesParser', () => {
  it('should parse fonts', () => {
    const xml = `
      <styleSheet>
        <fonts count="2">
          <font>
            <sz val="11"/>
            <color theme="1"/>
            <name val="Calibri"/>
            <family val="2"/>
            <scheme val="minor"/>
          </font>
          <font>
            <b/>
            <sz val="12"/>
            <color rgb="FFFF0000"/>
            <name val="Arial"/>
          </font>
        </fonts>
      </styleSheet>
    `;
    const styles = StylesParser.parse(xml);
    expect(styles.fonts.length).toBe(2);

    // Font 0
    expect(styles.fonts[0].name).toBe('Calibri');
    expect(styles.fonts[0].size).toBe(11);
    expect(styles.fonts[0].bold).toBeUndefined();

    // Font 1 (Red, Bold, Arial, 12)
    expect(styles.fonts[1].name).toBe('Arial');
    expect(styles.fonts[1].size).toBe(12);
    expect(styles.fonts[1].bold).toBe(true);
    // Color conversion check (FFFF0000 -> #FF0000 or rgba)
    // Based on ColorParser implementation: AARRGGBB -> rgba(r,g,b,a)
    // FF -> 255 -> alpha 1.0
    // FF0000 -> Red
    expect(styles.fonts[1].color).toContain('255, 0, 0');
  });

  it('should parse fills', () => {
    const xml = `
      <styleSheet>
        <fills count="2">
           <fill><patternFill patternType="none"/></fill>
           <fill>
             <patternFill patternType="solid">
               <fgColor rgb="FF00FF00"/>
               <bgColor indexed="64"/>
             </patternFill>
           </fill>
        </fills>
      </styleSheet>
    `;
    const styles = StylesParser.parse(xml);
    expect(styles.fills.length).toBe(2);
    expect(styles.fills[1].type).toBe('pattern');
    expect(styles.fills[1].fgColor).toBeDefined();
  });

  it('should parse cellXfs', () => {
    const xml = `
      <styleSheet>
        <cellXfs count="1">
          <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1">
            <alignment horizontal="center" vertical="center"/>
          </xf>
        </cellXfs>
      </styleSheet>
    `;
    const styles = StylesParser.parse(xml);
    expect(styles.cellXfs.length).toBe(1);
    expect(styles.cellXfs[0].fontId).toBe(1);
    expect(styles.cellXfs[0].alignment?.horizontal).toBe('center');
    expect(styles.cellXfs[0].alignment?.vertical).toBe('center');
  });

  it('should parse numFmts', () => {
    const xml = `
      <styleSheet>
        <numFmts count="1">
          <numFmt numFmtId="164" formatCode="yyyy-mm-dd"/>
        </numFmts>
        <cellXfs count="1">
          <xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
        </cellXfs>
      </styleSheet>
    `;
    const styles = StylesParser.parse(xml);

    // Check numFmts map
    expect(styles.numFmts).toBeDefined();
    expect(styles.numFmts!.has(164)).toBe(true);
    expect(styles.numFmts!.get(164)).toBe('yyyy-mm-dd');

    // Check cellXf reference
    expect(styles.cellXfs[0].numFmtId).toBe(164);
    expect(styles.cellXfs[0].applyNumberFormat).toBe(true);
  });

  it('should parse borders', () => {
    const xml = `
      <styleSheet>
        <borders count="1">
          <border>
            <left style="thin"><color rgb="FF000000"/></left>
            <right style="medium"><color rgb="FFFF0000"/></right>
            <top style="none"/>
            <bottom/> 
            <diagonal/>
          </border>
        </borders>
        <cellXfs count="1">
            <xf borderId="0" applyBorder="1"/>
        </cellXfs>
      </styleSheet>
    `;
    const styles = StylesParser.parse(xml);
    expect(styles.borders.length).toBe(1);

    const border = styles.borders[0];
    expect(border.left?.style).toBe('thin');
    expect(border.right?.style).toBe('medium');
    expect(border.right?.color).toBeDefined();

    // Check cellXf linkage
    const xf = styles.cellXfs[0];
    expect(xf.borderId).toBe(0);
    expect(xf.applyBorder).toBe(true);
  });
});
