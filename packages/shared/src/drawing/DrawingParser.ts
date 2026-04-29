import { FileHandler } from '../core/FileHandler';
import { Logger } from '../core/Logger';
import { UnitConversion } from '../core/UnitConversion';
import { PackageReader } from '../ooxml/PackageReader';
import { RelationshipsResolver } from '../ooxml/RelationshipsResolver';
import { MediaRegistry } from '../media/MediaRegistry';
import { ThemeModel } from '../styles/types';
import { ColorUtils } from '../styles/ColorUtils';
import { ChartParser } from '../chart/parser/ChartParser';
import { DrawingAnchor, DrawingElement, DrawingPosition, DrawingResourceRef, OfficeChart, OfficeImage, OfficeShape } from '../types';

const logger = new Logger('DrawingParser');

export interface DrawingParserOptions {
  theme?: ThemeModel;
}

export class DrawingParser {
  static parsePart(pkg: PackageReader, drawingPath: string, options: DrawingParserOptions = {}): DrawingElement[] {
    const xmlString = pkg.readText(drawingPath);
    if (!xmlString) {
      return [];
    }

    const rels = pkg.getRelationships(drawingPath);
    return this.parse(xmlString, rels, pkg, options.theme, drawingPath);
  }

  static parse(
    xmlString: string,
    rels: RelationshipsResolver | Map<string, string>,
    pkg: PackageReader,
    theme?: ThemeModel,
    sourcePartPath = ''
  ): DrawingElement[] {
    const drawings: DrawingElement[] = [];
    const doc = FileHandler.parseXML(xmlString);
    const anchors = doc.querySelectorAll('absoluteAnchor, twoCellAnchor, oneCellAnchor');

    for (let i = 0; i < anchors.length; i++) {
      const anchor = anchors[i];
      const anchorPosition = this.parseAnchorPosition(anchor);
      const drawingNode = this.getDirectDrawingChild(anchor);
      if (!drawingNode) {
        continue;
      }

      const tag = this.getLocalName(drawingNode);
      if (tag === 'pic') {
        const image = this.parsePicture(drawingNode, rels, pkg, sourcePartPath, theme);
        if (image) {
          image.position = this.mergePosition(image.position, anchorPosition);
          drawings.push(image);
        }
      } else if (tag === 'sp') {
        const shape = this.parseShape(drawingNode, 'shape', theme);
        shape.position = this.mergePosition(shape.position, anchorPosition);
        drawings.push(shape);
      } else if (tag === 'cxnSp') {
        const shape = this.parseShape(drawingNode, 'connector', theme);
        shape.position = this.mergePosition(shape.position, anchorPosition);
        drawings.push(shape);
      } else if (tag === 'grpSp') {
        const group = this.parseGroup(drawingNode, rels, pkg, theme, sourcePartPath);
        group.position = this.mergePosition(group.position, anchorPosition);
        drawings.push(group);
      } else if (tag === 'graphicFrame') {
        const chart = this.parseGraphicFrame(drawingNode, rels, pkg, theme);
        if (chart) {
          chart.position = this.mergePosition(chart.position, anchorPosition);
          drawings.push(chart);
        }
      }
    }

    return drawings;
  }

  private static parseAnchor(node: Element | null): DrawingAnchor | undefined {
    if (!node) {
      return undefined;
    }

    return {
      col: parseInt(node.querySelector('col')?.textContent || '0', 10),
      colOff: this.emuToPx(parseInt(node.querySelector('colOff')?.textContent || '0', 10)),
      row: parseInt(node.querySelector('row')?.textContent || '0', 10),
      rowOff: this.emuToPx(parseInt(node.querySelector('rowOff')?.textContent || '0', 10))
    };
  }

  private static parseGraphicFrame(
    frame: Element,
    rels: RelationshipsResolver | Map<string, string>,
    pkg: PackageReader,
    theme?: ThemeModel
  ): OfficeChart | null {
    const graphic = frame.querySelector('graphic');
    const graphicData = graphic?.querySelector('graphicData');
    if (!graphicData || graphicData.getAttribute('uri') !== 'http://schemas.openxmlformats.org/drawingml/2006/chart') {
      return null;
    }

    const chartRef = graphicData.querySelector('chart');
    const rId = chartRef?.getAttribute('r:id');
    if (!rId) {
      return null;
    }

    const relationship = this.getRelationship(rels, rId);
    if (!relationship?.resolvedTarget) {
      return null;
    }

    const xmlStr = pkg.readText(relationship.resolvedTarget);
    if (!xmlStr || xmlStr.length < 10) {
      logger.warn(`Chart XML missing or invalid: ${relationship.resolvedTarget}`);
      return null;
    }

    const chartData = new ChartParser({ theme }).parse(xmlStr);
    if (!chartData) {
      logger.warn(`Failed to parse chart data: ${relationship.resolvedTarget}`);
      return null;
    }
    if (chartData.externalData) {
      const externalDataRelationship = pkg.getRelationships(relationship.resolvedTarget).get(chartData.externalData.relationshipId);
      if (externalDataRelationship) {
        chartData.externalData = {
          ...chartData.externalData,
          target: externalDataRelationship.target,
          targetMode: externalDataRelationship.targetMode,
          resolvedTarget: externalDataRelationship.resolvedTarget,
          contentType: externalDataRelationship.resolvedTarget
            ? pkg.getPart(externalDataRelationship.resolvedTarget)?.contentType
            : undefined
        };
      }
    }

    const xfrm = frame.querySelector('xfrm');
    const transform = this.parseTransform(xfrm);
    const cNvPr = frame.querySelector('nvGraphicFramePr')?.querySelector('cNvPr');

    return {
      id: cNvPr?.getAttribute('id') || rId,
      name: cNvPr?.getAttribute('name') || 'Chart',
      type: 'chart',
      chartData,
      source: this.toResourceRef(relationship, pkg),
      position: {
        type: 'absolute',
        ...transform
      }
    };
  }

  private static parsePicture(
    pic: Element,
    rels: RelationshipsResolver | Map<string, string>,
    pkg: PackageReader,
    sourcePartPath = '',
    theme?: ThemeModel
  ): OfficeImage | null {
    const blip = pic.querySelector('blip');
    const rId = blip?.getAttribute('r:embed') || blip?.getAttribute('r:link');
    if (!rId) {
      return null;
    }

    const relationship = this.getRelationship(rels, rId);
    if (!relationship?.resolvedTarget) {
      return null;
    }

    const resource =
      rels instanceof RelationshipsResolver && sourcePartPath
        ? new MediaRegistry(pkg).resolveRelationship(sourcePartPath, rId)
        : undefined;
    const asset = resource?.data
      ? {
          id: resource.id,
          path: resource.path || resource.resolvedTarget || '',
          extension: resource.extension,
          contentType: resource.contentType,
          data: resource.data
        }
      : pkg.getMediaAsset(relationship.resolvedTarget, rId);

    if (!asset || !asset.data) {
      logger.warn(`Image file not found: ${relationship.resolvedTarget}`);
      return null;
    }

    const blob = new Blob([asset.data as BlobPart], {
      type: asset.contentType || this.getMimeType(asset.extension || '')
    });

    const spPr = pic.querySelector('spPr');
    const xfrm = spPr?.querySelector('xfrm');
    const transform = this.parseTransform(xfrm);

    return {
      id: asset.id,
      blob,
      extension: asset.extension || 'png',
      path: asset.path,
      contentType: asset.contentType,
      source: this.toResourceRef(relationship, pkg),
      position: {
        type: 'absolute',
        ...transform
      },
      style: {
        stroke: this.parseStroke(spPr?.querySelector('ln') || null, theme),
        effects: spPr ? this.parseEffects(spPr, theme) : undefined
      }
    };
  }

  private static parseGroup(
    node: Element,
    rels: RelationshipsResolver | Map<string, string>,
    pkg: PackageReader,
    theme?: ThemeModel,
    sourcePartPath = ''
  ): OfficeShape {
    const cNvPr = node.querySelector('nvGrpSpPr')?.querySelector('cNvPr');
    const id = cNvPr?.getAttribute('id') || '0';
    const name = cNvPr?.getAttribute('name') || '';
    const xfrm = node.querySelector('grpSpPr')?.querySelector('xfrm');
    const children = this.parseContainerChildren(node, rels, pkg, theme, sourcePartPath);
    const groupTransform = this.parseGroupTransform(xfrm);

    return {
      id,
      name,
      type: 'group',
      position: {
        type: 'absolute',
        ...this.parseTransform(xfrm)
      },
      geometry: {
        type: 'preset',
        preset: 'rect'
      },
      style: {},
      groupTransform,
      children
    };
  }

  private static parseShape(node: Element, type: 'shape' | 'connector', theme?: ThemeModel): OfficeShape {
    const cNvPr = node.querySelector('nvSpPr')?.querySelector('cNvPr');
    const id = cNvPr?.getAttribute('id') || '0';
    const name = cNvPr?.getAttribute('name') || '';

    const spPr = node.querySelector('spPr');
    const xfrm = spPr?.querySelector('xfrm');
    const transform = this.parseTransform(xfrm);
    const prstGeom = spPr?.querySelector('prstGeom');
    const custGeom = spPr?.querySelector('custGeom');

    let geometry: OfficeShape['geometry'] = { type: 'preset', preset: 'rect' };

    if (prstGeom) {
      const prst = prstGeom.getAttribute('prst') || 'rect';
      const adjustments = this.parseAdjustmentList(prstGeom.querySelector('avLst'));

      geometry = {
        type: 'preset',
        preset: prst,
        adjustments
      };
    } else if (custGeom) {
      geometry = {
        type: 'custom',
        path: ''
      };
    }

    return {
      id,
      name,
      type,
      position: {
        type: 'absolute',
        ...transform
      },
      geometry,
      style: {
        fill: this.parseFill(spPr, theme),
        stroke: this.parseStroke(spPr?.querySelector('ln') || null, theme)
      },
      text: this.parseTextBody(node.querySelector('txBody'), theme)
    };
  }

  private static parseContainerChildren(
    container: Element,
    rels: RelationshipsResolver | Map<string, string>,
    pkg: PackageReader,
    theme?: ThemeModel,
    sourcePartPath = ''
  ): DrawingElement[] {
    const drawings: DrawingElement[] = [];
    const children = Array.from(container.children);

    for (const child of children) {
      const tag = this.getLocalName(child);
      if (tag === 'pic') {
        const image = this.parsePicture(child, rels, pkg, sourcePartPath, theme);
        if (image) {
          drawings.push(image);
        }
      } else if (tag === 'sp') {
        drawings.push(this.parseShape(child, 'shape', theme));
      } else if (tag === 'cxnSp') {
        drawings.push(this.parseShape(child, 'connector', theme));
      } else if (tag === 'graphicFrame') {
        const chart = this.parseGraphicFrame(child, rels, pkg, theme);
        if (chart) {
          drawings.push(chart);
        }
      } else if (tag === 'grpSp') {
        drawings.push(this.parseGroup(child, rels, pkg, theme, sourcePartPath));
      }
    }

    return drawings;
  }

  private static parseAnchorPosition(anchor: Element): Partial<DrawingPosition> {
    const anchorKind = this.getLocalName(anchor) as DrawingPosition['anchorKind'];
    const ext = this.getDirectChild(anchor, 'ext');
    const pos = this.getDirectChild(anchor, 'pos');

    return {
      type: anchorKind === 'absoluteAnchor' ? 'absolute' : anchorKind,
      anchorKind,
      editAs: anchor.getAttribute('editAs') || undefined,
      x: anchorKind === 'absoluteAnchor' ? this.emuToPx(parseInt(pos?.getAttribute('x') || '0', 10)) : undefined,
      y: anchorKind === 'absoluteAnchor' ? this.emuToPx(parseInt(pos?.getAttribute('y') || '0', 10)) : undefined,
      width: ext ? this.emuToPx(parseInt(ext.getAttribute('cx') || '0', 10)) : 0,
      height: ext ? this.emuToPx(parseInt(ext.getAttribute('cy') || '0', 10)) : 0,
      from: this.parseAnchor(this.getDirectChild(anchor, 'from')),
      to: this.parseAnchor(this.getDirectChild(anchor, 'to')),
      clientData: this.parseClientData(this.getDirectChild(anchor, 'clientData'))
    };
  }

  private static parseClientData(node: Element | null): DrawingPosition['clientData'] {
    if (!node) {
      return undefined;
    }

    return {
      locksWithSheet: this.parseBooleanAttr(node.getAttribute('fLocksWithSheet')),
      printsWithSheet: this.parseBooleanAttr(node.getAttribute('fPrintsWithSheet'))
    };
  }

  private static mergePosition(current: DrawingPosition, anchor: Partial<DrawingPosition>): DrawingPosition {
    return {
      ...current,
      type: anchor.type || current.type,
      anchorKind: anchor.anchorKind || current.anchorKind,
      editAs: anchor.editAs || current.editAs,
      x: anchor.x ?? current.x,
      y: anchor.y ?? current.y,
      width: anchor.width || current.width,
      height: anchor.height || current.height,
      from: anchor.from || current.from,
      to: anchor.to || current.to,
      clientData: anchor.clientData || current.clientData
    };
  }

  private static getRelationship(
    rels: RelationshipsResolver | Map<string, string>,
    id: string
  ): { target: string; targetMode: string; resolvedTarget?: string; relationshipId: string } | undefined {
    if (rels instanceof RelationshipsResolver) {
      const relationship = rels.get(id);
      return relationship
        ? {
            relationshipId: relationship.id,
            target: relationship.target,
            targetMode: relationship.targetMode,
            resolvedTarget: relationship.resolvedTarget
          }
        : undefined;
    }

    const resolvedTarget = rels.get(id);
    return resolvedTarget
      ? {
          relationshipId: id,
          target: resolvedTarget,
          targetMode: 'Internal',
          resolvedTarget
        }
      : undefined;
  }

  private static toResourceRef(
    relationship: { target: string; targetMode: string; resolvedTarget?: string; relationshipId: string },
    pkg: PackageReader
  ): DrawingResourceRef {
    return {
      relationshipId: relationship.relationshipId,
      target: relationship.target,
      targetMode: relationship.targetMode,
      resolvedTarget: relationship.resolvedTarget,
      contentType: relationship.resolvedTarget ? pkg.getPart(relationship.resolvedTarget)?.contentType : undefined
    };
  }

  private static getLocalName(node: Element): string {
    return node.tagName.includes(':') ? node.tagName.split(':').pop() || node.tagName : node.tagName;
  }

  private static getDirectChild(node: Element, tagName: string): Element | null {
    for (const child of Array.from(node.children)) {
      if (this.getLocalName(child) === tagName) {
        return child;
      }
    }

    return null;
  }

  private static getDirectDrawingChild(node: Element): Element | null {
    for (const child of Array.from(node.children)) {
      const tag = this.getLocalName(child);
      if (tag === 'pic' || tag === 'sp' || tag === 'cxnSp' || tag === 'grpSp' || tag === 'graphicFrame') {
        return child;
      }
    }

    return null;
  }

  private static parseBooleanAttr(value: string | null): boolean | undefined {
    if (value === null) {
      return undefined;
    }

    return value === '1' || value === 'true';
  }

  private static parseAdjustmentList(node: Element | null): Record<string, number> | undefined {
    if (!node) {
      return undefined;
    }

    const adjustments: Record<string, number> = {};
    const gds = node.querySelectorAll('gd');

    for (let i = 0; i < gds.length; i++) {
      const gdName = gds[i].getAttribute('name');
      const fmla = gds[i].getAttribute('fmla');
      if (gdName && fmla && fmla.startsWith('val')) {
        const val = parseInt(fmla.split(' ')[1], 10);
        if (!isNaN(val)) {
          adjustments[gdName] = val;
        }
      }
    }

    return Object.keys(adjustments).length > 0 ? adjustments : undefined;
  }

  private static parseGroupTransform(xfrm: Element | null | undefined): OfficeShape['groupTransform'] {
    if (!xfrm) {
      return undefined;
    }

    const ext = this.getDirectChild(xfrm, 'ext');
    const chOff = this.getDirectChild(xfrm, 'chOff');
    const chExt = this.getDirectChild(xfrm, 'chExt');

    const width = ext ? this.emuToPx(parseInt(ext.getAttribute('cx') || '0', 10)) : 0;
    const height = ext ? this.emuToPx(parseInt(ext.getAttribute('cy') || '0', 10)) : 0;
    const childWidth = chExt ? this.emuToPx(parseInt(chExt.getAttribute('cx') || '0', 10)) : width;
    const childHeight = chExt ? this.emuToPx(parseInt(chExt.getAttribute('cy') || '0', 10)) : height;

    return {
      childOffsetX: chOff ? this.emuToPx(parseInt(chOff.getAttribute('x') || '0', 10)) : 0,
      childOffsetY: chOff ? this.emuToPx(parseInt(chOff.getAttribute('y') || '0', 10)) : 0,
      childWidth,
      childHeight,
      scaleX: childWidth ? width / childWidth : 1,
      scaleY: childHeight ? height / childHeight : 1
    };
  }

  private static parseTransform(xfrm: Element | null | undefined) {
    let x = 0;
    let y = 0;
    let width = 0;
    let height = 0;
    let rotation = 0;
    let flipH = false;
    let flipV = false;

    if (xfrm) {
      const off = xfrm.querySelector('off');
      if (off) {
        x = this.emuToPx(parseInt(off.getAttribute('x') || '0', 10));
        y = this.emuToPx(parseInt(off.getAttribute('y') || '0', 10));
      }

      const extSize = xfrm.querySelector('ext');
      if (extSize) {
        width = this.emuToPx(parseInt(extSize.getAttribute('cx') || '0', 10));
        height = this.emuToPx(parseInt(extSize.getAttribute('cy') || '0', 10));
      }

      const rotAttr = xfrm.getAttribute('rot');
      if (rotAttr) {
        rotation = parseInt(rotAttr, 10) / 60000;
      }

      flipH = xfrm.getAttribute('flipH') === '1' || xfrm.getAttribute('flipH') === 'true';
      flipV = xfrm.getAttribute('flipV') === '1' || xfrm.getAttribute('flipV') === 'true';
    }

    return { x, y, width, height, rotation, flipH, flipV };
  }

  private static parseFill(spPr: Element | null | undefined, theme?: ThemeModel): OfficeShape['style']['fill'] {
    if (!spPr) {
      return undefined;
    }

    if (spPr.querySelector('noFill')) {
      return { type: 'none' };
    }

    const solidFill = spPr.querySelector('solidFill');
    if (solidFill) {
      return { type: 'solid', color: this.parseColor(solidFill, theme) };
    }

    const gradFill = spPr.querySelector('gradFill');
    if (gradFill) {
      const gradient = this.parseGradient(gradFill, theme);
      if (gradient) {
        return { type: 'gradient', gradient };
      }
    }

    const pattFill = spPr.querySelector('pattFill');
    if (pattFill) {
      const pattern = this.parsePattern(pattFill, theme);
      if (pattern) {
        return { type: 'pattern', pattern };
      }
    }

    return undefined;
  }

  private static parseStroke(ln: Element | null, theme?: ThemeModel): OfficeShape['style']['stroke'] {
    if (!ln || ln.querySelector('noFill')) {
      return undefined;
    }

    const width = ln.getAttribute('w') ? this.emuToPx(parseInt(ln.getAttribute('w') || '0', 10)) : 1;
    const color = this.parseColor(ln.querySelector('solidFill') || ln, theme) || '000000';
    const dashPreset = ln.querySelector('prstDash')?.getAttribute('val');

    return {
      width,
      color,
      type: this.parseStrokeType(dashPreset)
    };
  }

  private static parseStrokeType(dashPreset?: string | null): NonNullable<OfficeShape['style']['stroke']>['type'] {
    if (!dashPreset || dashPreset === 'solid') {
      return 'solid';
    }

    if (dashPreset.includes('dot')) {
      return 'dot';
    }

    return 'dash';
  }

  private static parseTextBody(txBody: Element | null, theme?: ThemeModel): OfficeShape['text'] {
    if (!txBody) {
      return undefined;
    }

    const bodyPr = txBody.querySelector('bodyPr');
    let warp: NonNullable<OfficeShape['text']>['warp'];
    let wrapText = true;
    let kind: NonNullable<OfficeShape['text']>['kind'] = 'text';

    if (bodyPr) {
      if (bodyPr.getAttribute('wrap') === 'none') {
        wrapText = false;
      }

      const prstTxWarp = bodyPr.querySelector('prstTxWarp');
      if (prstTxWarp) {
        kind = 'wordart';
        warp = {
          preset: prstTxWarp.getAttribute('prst') || 'textNoShape',
          adjustments: this.parseAdjustmentList(prstTxWarp.querySelector('avLst'))
        };
      } else if (bodyPr.getAttribute('fromWordArt') === '1' || bodyPr.getAttribute('fromWordArt') === 'true') {
        kind = 'wordart';
      }
    }

    const paragraphs = txBody.querySelectorAll('p');
    const runsData: NonNullable<OfficeShape['text']>['runs'] = [];
    let fullText = '';
    let align: NonNullable<OfficeShape['text']>['align'] = 'left';

    for (let i = 0; i < paragraphs.length; i++) {
      const p = paragraphs[i];
      const pPr = p.querySelector('pPr');
      if (pPr) {
        const algn = pPr.getAttribute('algn');
        if (algn === 'ctr') {
          align = 'center';
        } else if (algn === 'r') {
          align = 'right';
        }
      }

      const runs = p.querySelectorAll('r');
      for (let j = 0; j < runs.length; j++) {
        const r = runs[j];
        const t = r.querySelector('t')?.textContent || '';
        if (!t) {
          continue;
        }

        fullText += t;
        runsData.push({
          text: t,
          ...this.parseRunProps(r.querySelector('rPr'), theme)
        });
      }

      if (i < paragraphs.length - 1) {
        fullText += '\n';
        runsData.push({ text: '\n' });
      }
    }

    if (!fullText) {
      return undefined;
    }

    return {
      kind,
      content: fullText,
      runs: runsData,
      align,
      valign: 'middle',
      warp,
      wrap: wrapText
    };
  }

  private static parseRunProps(rPr: Element | null, theme?: ThemeModel) {
    if (!rPr) {
      return {};
    }

    let size = 11;
    const szAttr = rPr.getAttribute('sz');
    if (szAttr) {
      size = UnitConversion.ptToPixel(parseInt(szAttr, 10) / 100);
    }

    let font = 'Arial';
    const ea = rPr.querySelector('ea');
    const latin = rPr.querySelector('latin');
    if (ea) {
      font = ea.getAttribute('typeface') || font;
    } else if (latin) {
      font = latin.getAttribute('typeface') || font;
    }

    let fill: NonNullable<NonNullable<OfficeShape['text']>['runs']>[0]['fill'] = { type: 'solid', color: '000000' };
    if (rPr.querySelector('noFill')) {
      fill = { type: 'none' };
    } else if (rPr.querySelector('solidFill')) {
      fill = { type: 'solid', color: this.parseColor(rPr.querySelector('solidFill')!, theme) };
    } else if (rPr.querySelector('gradFill')) {
      const gradient = this.parseGradient(rPr.querySelector('gradFill')!, theme);
      if (gradient) {
        fill = { type: 'gradient', gradient };
      }
    } else if (rPr.querySelector('pattFill')) {
      const pattern = this.parsePattern(rPr.querySelector('pattFill')!, theme);
      if (pattern) {
        fill = { type: 'pattern', pattern };
      }
    }

    let outline: NonNullable<NonNullable<OfficeShape['text']>['runs']>[0]['outline'];
    const stroke = this.parseStroke(rPr.querySelector('ln'), theme);
    if (stroke) {
      outline = {
        color: stroke.color || '000000',
        width: stroke.width || 1
      };
    }

    const underlineAttr = rPr.getAttribute('u');
    const strikeAttr = rPr.getAttribute('strike');
    const highlight = rPr.querySelector('highlight');

    return {
      bold: rPr.getAttribute('b') === '1',
      italic: rPr.getAttribute('i') === '1',
      underline: !!underlineAttr && underlineAttr !== 'none',
      strike: !!strikeAttr && strikeAttr !== 'noStrike',
      size,
      font,
      highlight: highlight ? this.parseColor(highlight, theme) : undefined,
      fill,
      outline,
      effects: this.parseEffects(rPr, theme)
    };
  }

  private static parseEffects(container: Element, theme?: ThemeModel): OfficeShape['style']['effects'] {
    const effectLst = container.querySelector('effectLst');
    if (!effectLst) {
      return undefined;
    }

    const effects: OfficeShape['style']['effects'] = {};
    const outerShdw = effectLst.querySelector('outerShdw');
    if (outerShdw) {
      const angleRad = (parseInt(outerShdw.getAttribute('dir') || '0', 10) / 60000) * (Math.PI / 180);
      const distPx = this.emuToPx(parseInt(outerShdw.getAttribute('dist') || '0', 10));
      effects.shadow = {
        color: this.parseColor(outerShdw, theme) || '000000',
        blur: this.emuToPx(parseInt(outerShdw.getAttribute('blurRad') || '0', 10)),
        offsetX: distPx * Math.cos(angleRad),
        offsetY: distPx * Math.sin(angleRad)
      };
    }

    const glow = effectLst.querySelector('glow');
    if (glow) {
      effects.glow = {
        color: this.parseColor(glow, theme) || 'FFD700',
        radius: this.emuToPx(parseInt(glow.getAttribute('rad') || '0', 10))
      };
    }

    return Object.keys(effects).length > 0 ? effects : undefined;
  }

  private static parseGradient(
    gradFill: Element,
    theme?: ThemeModel
  ): NonNullable<OfficeShape['style']['fill']>['gradient'] | undefined {
    const gsLst = gradFill.querySelector('gsLst');
    if (!gsLst) {
      return undefined;
    }

    const stops = Array.from(gsLst.querySelectorAll('gs')).map(gs => ({
      position: parseInt(gs.getAttribute('pos') || '0', 10) / 100000,
      color: this.parseColor(gs, theme) || '000000'
    }));

    let angle = 90;
    const angAttr = gradFill.querySelector('lin')?.getAttribute('ang');
    if (angAttr) {
      angle = parseInt(angAttr, 10) / 60000;
    }

    return {
      type: 'linear',
      angle,
      stops
    };
  }

  private static parseColor(container: Element, theme?: ThemeModel): string | undefined {
    const srgbClr = container.querySelector('srgbClr');
    if (srgbClr) {
      return ColorUtils.formatColor(srgbClr.getAttribute('val') || undefined);
    }

    const schemeClr = container.querySelector('schemeClr');
    if (schemeClr) {
      const scheme = schemeClr.getAttribute('val');
      return scheme ? ColorUtils.resolveSchemeColor(scheme, theme) || '#888888' : undefined;
    }

    const sysClr = container.querySelector('sysClr');
    if (sysClr) {
      return ColorUtils.formatColor(sysClr.getAttribute('lastClr') || sysClr.getAttribute('val') || undefined);
    }

    return undefined;
  }

  private static parsePattern(
    pattFill: Element,
    theme?: ThemeModel
  ): NonNullable<OfficeShape['style']['fill']>['pattern'] | undefined {
    const prst = pattFill.getAttribute('prst');
    if (!prst) {
      return undefined;
    }

    return {
      preset: prst,
      foregroundColor: this.parseColor(pattFill.querySelector('fgClr') || pattFill, theme) || '000000',
      backgroundColor: this.parseColor(pattFill.querySelector('bgClr') || pattFill, theme) || 'FFFFFF'
    };
  }

  private static getMimeType(ext: string): string {
    switch (ext.toLowerCase()) {
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'gif':
        return 'image/gif';
      case 'bmp':
        return 'image/bmp';
      case 'svg':
        return 'image/svg+xml';
      default:
        return 'application/octet-stream';
    }
  }

  private static emuToPx(emu: number): number {
    return Math.round(emu / 9525);
  }
}
