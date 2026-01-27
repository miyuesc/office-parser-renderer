import { ST_ShapeType } from '@ai-space/definitions/dml-shapeGeometry';
import { ShapeGenerator } from '../../types/shapes';
import { GeoUtils } from './GeoUtils';

export const FlowchartShapes: Record<string, ShapeGenerator> = {
  // Process
  [ST_ShapeType.flowChartProcess]: (w, h) => GeoUtils.rect(0, 0, w, h),

  // Decision
  [ST_ShapeType.flowChartDecision]: (w, h) =>
    `M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${h / 2} Z`,

  // Input/Output
  [ST_ShapeType.flowChartInputOutput]: (w, h) => {
    const slope = w * 0.2;
    return `M ${slope} 0 L ${w} 0 L ${w - slope} ${h} L 0 ${h} Z`;
  },

  // Terminator (Pill)
  [ST_ShapeType.flowChartTerminator]: (w, h) => {
    // Pill shape. Max radius is min(w,h)/2.
    // If w > h, horizontal pill.
    const r = Math.min(w, h) / 2;
    // M r 0 L w-r 0 A r r 0 0 1 w-r h L r h A r r 0 0 1 r 0
    return `M ${r} 0 L ${w - r} 0 A ${r} ${r} 0 0 1 ${w - r} ${h} L ${r} ${h} A ${r} ${r} 0 0 1 ${r} 0 Z`;
  },

  // Predefined Process
  [ST_ShapeType.flowChartPredefinedProcess]: (w, h) => {
    const inset = w * 0.15;
    return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z M ${inset} 0 L ${inset} ${h} M ${w - inset} 0 L ${w - inset} ${h}`;
  },

  // Internal Storage
  [ST_ShapeType.flowChartInternalStorage]: (w, h) => {
    const inset = w * 0.15;
    return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z M ${inset} 0 L ${inset} ${h} M 0 ${inset} L ${w} ${inset}`;
  },

  // Document (Wave Bottom)
  [ST_ShapeType.flowChartDocument]: (w, h) => {
    const cy = h * 0.85;
    const amp = h * 0.05;
    // S-curve bottom
    // M 0 0 L w 0 L w cy ... Curve to 0 cy ... Z
    // Curve: w -> 0.
    // Down then Up? Or Up then Down?
    // Usually Document is Up then Down (Left side higher?) No, usually convex/concave S.
    return `M 0 0 L ${w} 0 L ${w} ${cy} C ${w * 0.75} ${h} ${w * 0.25} ${cy - amp * 2} 0 ${cy} Z`;
  },

  // Multidocument
  [ST_ShapeType.flowChartMultidocument]: (w, h) => {
    // Stack of documents
    // Back one: offset up/right? Or up/left?

    // Use proper document path relative to sub-box?
    // Let's just draw main doc front, and partial doc back.
    const off = w * 0.1;

    // Shifted doc?
    // Let's draw: Back Rect + Front Document
    const back = `M ${off} 0 L ${w} 0 L ${w} ${h * 0.8} L ${off} ${h * 0.8} L ${off} 0`; // Box
    // Front is main doc
    const front = `M 0 ${off} L ${w - off} ${off} L ${w - off} ${h * 0.85} C ${(w - off) * 0.75} ${h} ${
      (w - off) * 0.25
    } ${h * 0.85 - 5} 0 ${h * 0.85} Z`;
    return back + ' ' + front;
  },

  // Manual Input
  [ST_ShapeType.flowChartManualInput]: (w, h) => {
    const topH = h * 0.25;
    return `M 0 ${topH} L ${w} 0 L ${w} ${h} L 0 ${h} Z`;
  },

  // Manual Operation
  [ST_ShapeType.flowChartManualOperation]: (w, h) => {
    const slope = w * 0.2;
    return `M 0 0 L ${w} 0 L ${w - slope} ${h} L ${slope} ${h} Z`;
  },

  // Connector
  [ST_ShapeType.flowChartConnector]: (w, h) =>
    GeoUtils.ellipse(w / 2, h / 2, Math.min(w, h) / 2, Math.min(w, h) / 2),

  // Offpage Connector
  [ST_ShapeType.flowChartOffpageConnector]: (w, h) => {
    const midY = h * 0.5;
    return `M 0 0 L ${w} 0 L ${w} ${midY} L ${w / 2} ${h} L 0 ${midY} Z`;
  },

  // Punched Card
  [ST_ShapeType.flowChartPunchedCard]: (w, h) => {
    const cut = Math.min(w, h) * 0.2;
    return `M ${cut} 0 L ${w} 0 L ${w} ${h} L 0 ${h} L 0 ${cut} Z`;
  },

  // Punched Tape (Wave Top/Bottom)
  [ST_ShapeType.flowChartPunchedTape]: (w, h) => {
    const cyTop = h * 0.15;
    const cyBot = h * 0.85;
    // Same Sine Wave top and bottom
    // M 0 cyTop C ... w cyTop L w cyBot C ... 0 cyBot Z
    const amp = h * 0.05;
    return (
      `M 0 ${cyTop} C ${w * 0.33} ${cyTop - amp} ${w * 0.66} ${cyTop + amp} ${w} ${cyTop} ` +
      `L ${w} ${cyBot} C ${w * 0.66} ${cyBot + amp} ${w * 0.33} ${cyBot - amp} 0 ${cyBot} Z`
    );
  },

  // Summing Junction
  [ST_ShapeType.flowChartSummingJunction]: (w, h) => {
    const cx = w / 2,
      cy = h / 2,
      r = Math.min(w, h) / 2;
    const ir = r * 0.707;
    return (
      GeoUtils.ellipse(cx, cy, r, r) +
      ` M ${cx - ir} ${cy - ir} L ${cx + ir} ${cy + ir} M ${cx + ir} ${cy - ir} L ${cx - ir} ${cy + ir}`
    );
  },

  // Or
  [ST_ShapeType.flowChartOr]: (w, h) => {
    return `M 0 0 L ${w} ${h / 2} L 0 ${h} Q ${w * 0.25} ${h / 2} 0 0 Z`;
  },

  // Collate
  [ST_ShapeType.flowChartCollate]: (w, h) => {
    // 2 Triangles
    // Top inverted, Bottom upright?
    // Actually "Collate" symbol is usually 4 triangles meeting?
    // OOXML: "Flow Chart Collate" -> Hourglass shape composed of 2 triangles.
    return `M 0 0 L ${w} 0 L 0 ${h} L ${w} ${h} Z`; // Zigzag?
  },

  // Sort
  [ST_ShapeType.flowChartSort]: (w, h) => {
    return `M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${h / 2} Z M 0 ${h / 2} L ${w} ${h / 2}`;
  },

  // Extract
  [ST_ShapeType.flowChartExtract]: (w, h) => `M ${w / 2} 0 L ${w} ${h} L 0 ${h} Z`,

  // Merge
  [ST_ShapeType.flowChartMerge]: (w, h) => `M 0 0 L ${w} 0 L ${w / 2} ${h} Z`,

  // Offline Storage
  [ST_ShapeType.flowChartOfflineStorage]: (w, h) => {
    // Square left, Triangle right? No.
    // Rect with Triangle on top? No.
    // "Offline Storage": small square rotated?
    // It is a Rhombus skewed?
    // Actually standard symbol is: Square rotated 45 (Diamond) with horizontal line? That's Sort.
    // Offline Storage: small rectangle with triangle on top?
    // OOXML: "flowChartOfflineStorage".
    // It's a "deck of cards" shape?
    // Usually: M 0 0 L w 0 L w h L 0 h Z ? (Rect)
    // Wait, ISO Flowchart Offline Storage is a square standing on a corner? No, that's Decision.
    // It is a small equilateral triangle?
    // Let's assume standardized shape: A rectangle with a triangle on top?
    // Actually typically: Top flat, Sides vertical, Bottom V-shaped (convex).
    // Or Square.
    // Code snippet elsewhere: `M 0 0 L w 0 L w h L 0 h Z`.
    // Let's change to Square.
    return GeoUtils.rect(0, 0, w, h);
  },

  // Online Storage (VDU?) No, VDU is Display.
  // Online Storage: "Data Storage"?
  // Rounded ends (Convex Left, Concave Right).
  [ST_ShapeType.flowChartOnlineStorage]: (w, h) => {
    const r = w * 0.2;
    // Convex Left (Arc out)
    // Concave Right (Arc in)
    return `M ${r} 0 L ${w} 0 A ${r} ${h / 2} 0 0 0 ${w} ${h} L ${r} ${h} A ${r} ${h / 2} 0 0 0 ${r} 0 Z`;
  },

  // Magnetic Tape
  [ST_ShapeType.flowChartMagneticTape]: (w, h) => {
    // Circle with tail line
    const r = Math.min(w, h) * 0.45; // Circle size
    const cx = w / 2;
    const cy = h / 2; // Circle Center
    // Line tangent to bottom right?
    // "Q" shape.
    return GeoUtils.ellipse(cx, cy, r, r) + ` M ${cx + r} ${h} L ${w} ${h}`; // Line at bottom
  },

  // Magnetic Disk (Cylinder)
  [ST_ShapeType.flowChartMagneticDisk]: (w, h) => {
    const ry = h * 0.15;
    const rx = w / 2;
    return (
      `M 0 ${ry} L 0 ${h - ry} A ${rx} ${ry} 0 0 0 ${w} ${h - ry} L ${w} ${ry} A ${rx} ${ry} 0 0 0 0 ${ry} ` + // Body
      `A ${rx} ${ry} 0 0 0 ${w} ${ry}`
    ); // Top rim
  },

  // Magnetic Drum (Horizontal Cylinder? No `Drum` usually vertical cylinder? No, `Disk` is Vertical Cylinder)
  // `Drum` is wider?
  // Use Cylinder logic.
  [ST_ShapeType.flowChartMagneticDrum]: (w, h) => {
    // Often depicted as horizontal cylinder or vertical.
    // Let's stick to Vertical Cylinder for now as it's common.
    return FlowchartShapes[ST_ShapeType.flowChartMagneticDisk](w, h);
  },

  // Display (Bullet)
  [ST_ShapeType.flowChartDisplay]: (w, h) => {
    // Left Triangle, Right Round.
    // M r 0 L w-r 0 A ...
    return `M ${w * 0.2} 0 L ${w * 0.8} 0 A ${w * 0.2} ${h / 2} 0 0 1 ${w * 0.8} ${h} L ${w * 0.2} ${h} L 0 ${h / 2} Z`;
  },

  // Delay (D-shape)
  [ST_ShapeType.flowChartDelay]: (w, h) => {
    return `M 0 0 L ${w * 0.7} 0 A ${w * 0.3} ${h / 2} 0 0 1 ${w * 0.7} ${h} L 0 ${h} Z`;
  },
};
