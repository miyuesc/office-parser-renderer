import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';
import { DrawingParser } from '../DrawingParser';
import { PackageReader } from '../../ooxml/PackageReader';
import { ChartType } from '../../chart/model/IChartData';

describe('DrawingParser', () => {
  it('should resolve image media assets through PackageReader', async () => {
    const zip = new JSZip();

    zip.file(
      '[Content_Types].xml',
      `
        <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
          <Default Extension="xml" ContentType="application/xml"/>
          <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
          <Default Extension="png" ContentType="image/png"/>
        </Types>
      `
    );

    zip.folder('xl')!.folder('drawings')!.file(
      'drawing1.xml',
      `
        <wsDr xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
          <twoCellAnchor editAs="oneCell">
            <from><col>0</col><colOff>0</colOff><row>0</row><rowOff>0</rowOff></from>
            <to><col>1</col><colOff>0</colOff><row>1</row><rowOff>0</rowOff></to>
            <pic>
              <blipFill><blip r:embed="rId1"/></blipFill>
              <spPr>
                <xfrm>
                  <off x="0" y="0"/>
                  <ext cx="9525" cy="19050"/>
                </xfrm>
                <ln w="19050">
                  <solidFill><srgbClr val="00AAFF"/></solidFill>
                  <prstDash val="dot"/>
                </ln>
                <effectLst>
                  <outerShdw blurRad="9525" dist="9525" dir="5400000">
                    <srgbClr val="333333"/>
                  </outerShdw>
                </effectLst>
              </spPr>
            </pic>
            <clientData fLocksWithSheet="1" fPrintsWithSheet="0"/>
          </twoCellAnchor>
        </wsDr>
      `
    );
    zip.folder('xl')!.folder('drawings')!.folder('_rels')!.file(
      'drawing1.xml.rels',
      `
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rId1" Target="../media/image1.png"/>
        </Relationships>
      `
    );
    zip.folder('xl')!.folder('media')!.file('image1.png', new Uint8Array([1, 2, 3]));

    const pkg = await PackageReader.load(await zip.generateAsync({ type: 'arraybuffer' }));
    const drawings = DrawingParser.parsePart(pkg, 'xl/drawings/drawing1.xml');
    const image = drawings[0] as any;

    expect(drawings).toHaveLength(1);
    expect(image.path).toBe('xl/media/image1.png');
    expect(image.contentType).toBe('image/png');
    expect(image.position.type).toBe('twoCellAnchor');
    expect(image.position.anchorKind).toBe('twoCellAnchor');
    expect(image.position.editAs).toBe('oneCell');
    expect(image.position.clientData).toEqual({
      locksWithSheet: true,
      printsWithSheet: false
    });
    expect(image.position.height).toBe(2);
    expect(image.style).toMatchObject({
      stroke: {
        color: '#00AAFF',
        type: 'dot'
      },
      effects: {
        shadow: {
          color: '#333333',
          blur: 1,
          offsetX: expect.any(Number),
          offsetY: expect.any(Number)
        }
      }
    });
    expect(image.source).toEqual({
      relationshipId: 'rId1',
      target: '../media/image1.png',
      targetMode: 'Internal',
      resolvedTarget: 'xl/media/image1.png',
      contentType: 'image/png'
    });
  });

  it('should resolve chart parts through PackageReader relationships', async () => {
    const zip = new JSZip();

    zip.file(
      '[Content_Types].xml',
      `
        <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
          <Default Extension="xml" ContentType="application/xml"/>
          <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
          <Default Extension="xlsx" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"/>
        </Types>
      `
    );

    zip.folder('xl')!.folder('drawings')!.file(
      'drawing2.xml',
      `
        <wsDr xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
          <oneCellAnchor>
            <from><col>0</col><colOff>0</colOff><row>0</row><rowOff>0</rowOff></from>
            <graphicFrame>
              <nvGraphicFramePr><cNvPr id="2" name="Chart 1"/></nvGraphicFramePr>
              <xfrm><off x="0" y="0"/><ext cx="19050" cy="9525"/></xfrm>
              <graphic>
                <graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart">
                  <chart r:id="rId1"/>
                </graphicData>
              </graphic>
            </graphicFrame>
          </oneCellAnchor>
        </wsDr>
      `
    );
    zip.folder('xl')!.folder('drawings')!.folder('_rels')!.file(
      'drawing2.xml.rels',
      `
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rId1" Target="../charts/chart1.xml"/>
        </Relationships>
      `
    );
    zip.folder('xl')!.folder('charts')!.file(
      'chart1.xml',
      `
        <c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
          <c:style val="12"/>
          <c:externalData xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="rIdWorkbook">
            <c:autoUpdate val="1"/>
          </c:externalData>
          <c:chart>
            <c:view3D>
              <c:rotX val="20"/>
              <c:rotY val="15"/>
              <c:perspective val="30"/>
              <c:depthPercent val="120"/>
            </c:view3D>
            <c:plotArea>
              <c:bar3DChart>
                <c:ser>
                  <c:idx val="0"/>
                  <c:order val="0"/>
                  <c:tx><c:v>Series 1</c:v></c:tx>
                  <c:cat><c:strRef><c:strCache><c:pt idx="0"><c:v>A</c:v></c:pt></c:strCache></c:strRef></c:cat>
                  <c:val><c:numRef><c:numCache><c:pt idx="0"><c:v>1</c:v></c:pt></c:numCache></c:numRef></c:val>
                </c:ser>
              </c:bar3DChart>
            </c:plotArea>
          </c:chart>
        </c:chartSpace>
      `
    );
    zip.folder('xl')!.folder('charts')!.folder('_rels')!.file(
      'chart1.xml.rels',
      `
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rIdWorkbook" Target="../embeddings/Microsoft_Excel_Worksheet1.xlsx"/>
        </Relationships>
      `
    );
    zip.folder('xl')!.folder('embeddings')!.file('Microsoft_Excel_Worksheet1.xlsx', new Uint8Array([1, 2, 3]));

    const pkg = await PackageReader.load(await zip.generateAsync({ type: 'arraybuffer' }));
    const drawings = DrawingParser.parsePart(pkg, 'xl/drawings/drawing2.xml');
    const chart = drawings[0] as any;

    expect(drawings).toHaveLength(1);
    expect(chart.type).toBe('chart');
    expect(chart.chartData.type).toBe(ChartType.BAR);
    expect(chart.chartData.is3D).toBe(true);
    expect(chart.chartData.view3D).toEqual({
      rotationX: 20,
      rotationY: 15,
      perspective: 30,
      depthPercent: 120
    });
    expect(chart.chartData.style).toEqual({ styleId: 12 });
    expect(chart.chartData.externalData).toEqual({
      relationshipId: 'rIdWorkbook',
      autoUpdate: true,
      target: '../embeddings/Microsoft_Excel_Worksheet1.xlsx',
      targetMode: 'Internal',
      resolvedTarget: 'xl/embeddings/Microsoft_Excel_Worksheet1.xlsx',
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    expect(chart.position.type).toBe('oneCellAnchor');
    expect(chart.position.width).toBe(2);
    expect(chart.source).toEqual({
      relationshipId: 'rId1',
      target: '../charts/chart1.xml',
      targetMode: 'Internal',
      resolvedTarget: 'xl/charts/chart1.xml',
      contentType: 'application/xml'
    });
  });

  it('should parse grouped shapes through the shared drawing contract', async () => {
    const zip = new JSZip();

    zip.file(
      '[Content_Types].xml',
      `
        <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
          <Default Extension="xml" ContentType="application/xml"/>
          <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
        </Types>
      `
    );

    zip.folder('xl')!.folder('drawings')!.file(
      'drawing3.xml',
      `
        <wsDr xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
          <absoluteAnchor>
            <pos x="9525" y="19050"/>
            <ext cx="28575" cy="38100"/>
            <grpSp>
              <nvGrpSpPr><cNvPr id="10" name="Group 1"/></nvGrpSpPr>
              <grpSpPr>
                <xfrm>
                  <off x="0" y="0"/>
                  <ext cx="28575" cy="38100"/>
                  <chOff x="9525" y="19050"/>
                  <chExt cx="9525" cy="19050"/>
                </xfrm>
              </grpSpPr>
              <sp>
                <nvSpPr><cNvPr id="11" name="Child Shape"/></nvSpPr>
                <spPr>
                  <xfrm><off x="0" y="0"/><ext cx="9525" cy="9525"/></xfrm>
                  <prstGeom prst="rect"/>
                  <pattFill prst="diagStripe">
                    <fgClr><srgbClr val="FF0000"/></fgClr>
                    <bgClr><srgbClr val="00FF00"/></bgClr>
                  </pattFill>
                </spPr>
              </sp>
              <cxnSp>
                <nvSpPr><cNvPr id="12" name="Child Connector"/></nvSpPr>
                <spPr>
                  <xfrm><off x="9525" y="0"/><ext cx="19050" cy="9525"/></xfrm>
                  <prstGeom prst="line"/>
                </spPr>
              </cxnSp>
            </grpSp>
            <clientData fLocksWithSheet="0" fPrintsWithSheet="1"/>
          </absoluteAnchor>
        </wsDr>
      `
    );

    const pkg = await PackageReader.load(await zip.generateAsync({ type: 'arraybuffer' }));
    const drawings = DrawingParser.parsePart(pkg, 'xl/drawings/drawing3.xml');
    const group = drawings[0] as any;

    expect(drawings).toHaveLength(1);
    expect(group.type).toBe('group');
    expect(group.position.type).toBe('absolute');
    expect(group.position.anchorKind).toBe('absoluteAnchor');
    expect(group.position.x).toBe(1);
    expect(group.position.y).toBe(2);
    expect(group.position.width).toBe(3);
    expect(group.position.height).toBe(4);
    expect(group.position.clientData).toEqual({
      locksWithSheet: false,
      printsWithSheet: true
    });
    expect(group.groupTransform).toEqual({
      childOffsetX: 1,
      childOffsetY: 2,
      childWidth: 1,
      childHeight: 2,
      scaleX: 3,
      scaleY: 2
    });
    expect(group.children).toHaveLength(2);
    expect(group.children[0].type).toBe('shape');
    expect(group.children[0].style.fill).toEqual({
      type: 'pattern',
      pattern: {
        preset: 'diagStripe',
        foregroundColor: '#FF0000',
        backgroundColor: '#00FF00'
      }
    });
    expect(group.children[1].type).toBe('connector');
  });

  it('should mark warped text as wordart and preserve warp adjustments', async () => {
    const zip = new JSZip();

    zip.file(
      '[Content_Types].xml',
      `
        <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
          <Default Extension="xml" ContentType="application/xml"/>
          <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
        </Types>
      `
    );

    zip.folder('xl')!.folder('drawings')!.file(
      'drawing4.xml',
      `
        <wsDr xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
          <oneCellAnchor>
            <from><col>0</col><colOff>0</colOff><row>0</row><rowOff>0</rowOff></from>
            <sp>
              <nvSpPr><cNvPr id="21" name="WordArt"/></nvSpPr>
              <spPr>
                <xfrm><off x="0" y="0"/><ext cx="19050" cy="9525"/></xfrm>
                <prstGeom prst="rect"/>
                <ln w="19050">
                  <solidFill><srgbClr val="FF0000"/></solidFill>
                  <prstDash val="dash"/>
                </ln>
              </spPr>
              <txBody>
                <bodyPr wrap="none" fromWordArt="1">
                  <prstTxWarp prst="textArchUp">
                    <avLst>
                      <gd name="adj" fmla="val 25000"/>
                    </avLst>
                  </prstTxWarp>
                </bodyPr>
                <p>
                  <r>
                    <rPr sz="1200" u="sng" strike="sngStrike">
                      <highlight><srgbClr val="FFF2CC"/></highlight>
                    </rPr>
                    <t>WordArt</t>
                  </r>
                </p>
              </txBody>
            </sp>
          </oneCellAnchor>
        </wsDr>
      `
    );

    const pkg = await PackageReader.load(await zip.generateAsync({ type: 'arraybuffer' }));
    const drawings = DrawingParser.parsePart(pkg, 'xl/drawings/drawing4.xml');
    const shape = drawings[0] as any;

    expect(drawings).toHaveLength(1);
    expect(shape.type).toBe('shape');
    expect(shape.style.stroke).toMatchObject({
      color: '#FF0000',
      type: 'dash'
    });
    expect(shape.text).toMatchObject({
      kind: 'wordart',
      content: 'WordArt',
      wrap: false,
      warp: {
        preset: 'textArchUp',
        adjustments: {
          adj: 25000
        }
      }
    });
    expect(shape.text.runs[0]).toMatchObject({
      underline: true,
      strike: true,
      highlight: '#FFF2CC'
    });
  });
});
