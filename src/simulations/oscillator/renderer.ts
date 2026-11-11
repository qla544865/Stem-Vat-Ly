import { arrow, ink, label, line, teal } from '../drawing.ts';
import type { Oscillator } from './physics.ts';

export function drawOscillator(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: ReturnType<Oscillator['state']>,
  extent: number,
  annotations: boolean,
) {
  const center = w * 0.53;
  const y = h * 0.5;
  const span = w * 0.32;
  const block = center + (span * state.x) / extent;
  const anchor = 22;
  line(ctx, center, y - 65, center, y + 100, '#8fb3a6', [4, 4]);
  line(ctx, anchor, y - 28, anchor, y + 28, ink);
  line(ctx, anchor, y + 20, w - 20, y + 20);
  ctx.beginPath();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2;
  ctx.moveTo(anchor, y);
  for (let i = 1; i < 24; i++) {
    ctx.lineTo(anchor + ((block - 19 - anchor) * i) / 24, y + (i % 2 === 0 ? -8 : 8));
  }
  ctx.lineTo(block - 19, y);
  ctx.stroke();
  ctx.fillStyle = teal;
  ctx.fillRect(block - 19, y - 20, 38, 40);
  const forces = [
    { value: state.elasticForce, name: 'Fđh', color: '#2678ad' },
    { value: state.dampingForce, name: 'Fc', color: '#8856ad' },
    { value: state.drivingForce, name: 'Fk', color: '#a56725' },
  ];
  const forceScale = Math.min(w * 0.13, 70) / Math.max(5, ...forces.map((f) => Math.abs(f.value)));
  forces.forEach(({ value, name, color }, i) => {
    const row = y - 35 - 21 * i;
    arrow(ctx, block, row, value * forceScale, 0, color);
    if (annotations && Math.abs(value * forceScale) >= 1)
      label(ctx, name, block + value * forceScale, row - 5, color);
  });
  const axis = y + 46;
  arrow(ctx, center - span, axis, span * 2, 0, ink);
  arrow(ctx, center, axis, block - center, 0, teal);
  if (annotations) {
    label(ctx, 'x = 0', center, axis + 20);
    label(ctx, 'x (m)', center + span, axis + 20);
    label(ctx, `x = ${state.x.toFixed(2)} m`, block, axis + 43, teal);
  }
}
