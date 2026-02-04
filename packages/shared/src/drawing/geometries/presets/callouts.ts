import { getRect, getRoundRect, getEllipse } from '../primitives';

// Generic callout tail logic typically involves:
// - A body (Rect, RoundRect, Ellipse)
// - A tail (defined by adjustments)

const getRectCallout = (w: number, h: number, adj?: any) => {
  // Default: Tail at bottom
  // If we have adjustments, they define the tail tip or base.
  // Simplifying to a static tail for now as typically seen in basic renderers without full adjustment engine.
  const bh = h * 0.75; // Body height
  const tailX = w * 0.2;
  const tailW = w * 0.15;

  // M TL L TR L BR L TailStart L TailTip L TailEnd L BL Z
  return `M 0 0 L ${w} 0 L ${w} ${bh} L ${tailX + tailW} ${bh} L ${tailX} ${h} L ${tailX + tailW * 0.5} ${bh} L 0 ${bh} Z`;
};

const getRoundRectCallout = (w: number, h: number, adj?: any) => {
  // Round Rect with tail
  const bh = h * 0.75;
  // Approximating by drawing RRect then tail? SVG path union is hard.
  // Just drawing custom path.
  const r = Math.min(w, bh) * 0.2;
  const tailX = w * 0.2;

  return (
    `M ${r} 0 L ${w - r} 0 Q ${w} 0 ${w} ${r} L ${w} ${bh - r} Q ${w} ${bh} ${w - r} ${bh} ` +
    `L ${tailX + 20} ${bh} L ${tailX} ${h} L ${tailX + 10} ${bh} ` +
    `L ${r} ${bh} Q 0 ${bh} 0 ${bh - r} L 0 ${r} Q 0 0 ${r} 0 Z`
  );
};

const getCloudCallout = (w: number, h: number) => {
  // Cloud shape with tail.
  // Cloud is usually multiple arcs.
  // Fallback to Ellipse Callout for now.
  return getEllipseCallout(w, h); // TODO: Real cloud
};

const getEllipseCallout = (w: number, h: number) => {
  const bh = h * 0.75;
  const rx = w / 2;
  const ry = bh / 2;

  // Ellipse with tail at bottom left
  // Hard to merge path analytically without precise intersection.
  // Returning just ellipse + tail triangle (might self-intersect visually but works for fill)
  return `M 0 ${ry} A ${rx} ${ry} 0 1 1 ${w} ${ry} A ${rx} ${ry} 0 1 1 0 ${ry} Z M ${w * 0.2} ${h} L ${w * 0.3} ${bh * 0.85} L ${w * 0.4} ${h} Z`; // Disconnected tail if not careful
  // Better: just overlay?
  // Let's return a simple bubble shape.
  return `M ${w / 2} 0 A ${w / 2} ${bh / 2} 0 1 1 ${w / 2} ${bh} L ${w * 0.2} ${h} L ${w * 0.3} ${bh * 0.9} A ${w / 2} ${bh / 2} 0 0 1 ${w / 2} 0 Z`;
};

// Placeholder for specifics
const getCallout = getRectCallout;

export const callouts = {
  rectCallout: getRectCallout,
  roundRectCallout: getRoundRectCallout,
  round1RectCallout: getRoundRectCallout,
  round2SameRectCallout: getRoundRectCallout,
  round2DiagRectCallout: getRoundRectCallout,
  snip1RectCallout: getRectCallout,
  snip2SameRectCallout: getRectCallout,
  snip2DiagRectCallout: getRectCallout,
  snipRoundRectCallout: getRoundRectCallout,

  wedgeRectCallout: getRectCallout,
  wedgeRoundRectCallout: getRoundRectCallout,
  wedgeEllipseCallout: getEllipseCallout,

  cloudCallout: getCloudCallout,

  callout1: getRectCallout, // Line callouts usually?
  callout2: getRectCallout,
  callout3: getRectCallout,
  accentCallout1: getRectCallout,
  accentCallout2: getRectCallout,
  accentCallout3: getRectCallout,
  borderCallout1: getRectCallout,
  borderCallout2: getRectCallout,
  borderCallout3: getRectCallout,
  accentBorderCallout1: getRectCallout,
  accentBorderCallout2: getRectCallout,
  accentBorderCallout3: getRectCallout,

  // Arrow Callouts
  leftArrowCallout: getRectCallout, // TODO: Arrow shape with box
  rightArrowCallout: getRectCallout,
  upArrowCallout: getRectCallout,
  downArrowCallout: getRectCallout,
  leftRightArrowCallout: getRectCallout,
  upDownArrowCallout: getRectCallout,
  quadArrowCallout: getRectCallout
};
