import { springState } from './physics.ts';
import type { SpringParams } from './physics.ts';
import { arrow, label, line, teal } from '../drawing.ts';

export function drawSpring(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: SpringParams,
  time: number,
  vectors: boolean,
  acceleration = false,
  annotations = true,
) {
  const state = springState(p, time);
  const wall = Math.min(58, w * 0.12),
    center = w * 0.58,
    floor = h * 0.59,
    scale = Math.min((w * 0.24) / 0.6, 240);
  const bx = center + state.x * scale,
    block = Math.max(34, Math.min(48, w * 0.07)),
    top = floor - block;
  // Equilibrium and fixed-amplitude endpoints remain in world coordinates.
  line(ctx, center, 55, center, floor + 63, '#94b9b2', [5, 5]);
  label(ctx, 'VỊ TRÍ CÂN BẰNG', center, 40, '#6b8984', 'center', 10);
  for (const side of [-1, 1]) {
    const x = center + side * p.A * scale;
    line(ctx, x, floor + 18, x, floor + 28);
    label(ctx, `${side < 0 ? '−' : '+'}A`, x, floor + 46, '#78908c');
  }
  ctx.fillStyle = '#e5ece9';
  ctx.fillRect(wall - 16, top - 35, 16, block + 35);
  for (let y = top - 31; y < floor; y += 9) line(ctx, wall - 16, y + 8, wall - 3, y, '#a6b9b3');
  line(ctx, wall, top - 35, wall, floor, '#6f8983');
  line(ctx, wall - 16, floor + 1, w - 40, floor + 1, '#9db5af');
  for (let x = wall - 16; x < w - 40; x += 12) line(ctx, x, floor + 2, x - 6, floor + 9, '#d1ded8');
  const start = wall + 14,
    end = bx - block / 2 - 10,
    y = top + block / 2;
  line(ctx, wall, y, start, y, teal);
  ctx.beginPath();
  ctx.strokeStyle = teal;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.moveTo(start, y);
  for (let i = 0; i <= 40; i++) {
    const x = start + ((end - start) * i) / 40;
    ctx.lineTo(x, i === 0 || i === 40 ? y : y + (i % 2 ? -10 : 10));
  }
  ctx.lineTo(bx - block / 2, y);
  ctx.stroke();
  const gradient = ctx.createLinearGradient(bx, top, bx, floor);
  gradient.addColorStop(0, '#22a595');
  gradient.addColorStop(1, '#087e73');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(bx - block / 2, top, block, block, 7);
  ctx.fill();
  label(ctx, 'm', bx, top + block / 2 + 5, '#ffffff', 'center', 18);
  if (annotations) label(ctx, `k = ${p.k} N/m`, (wall + bx) / 2, top - 25, '#6d8983');
  arrow(ctx, wall + 10, floor + 68, w - wall - 70, 0, '#9ab0aa');
  label(ctx, '0', center, floor + 87, '#6d8983');
  label(ctx, 'x (m)', w - 40, floor + 87, '#6d8983');
  if (vectors) {
    // Fit the maximum speed once per parameter set; clipping each frame would
    // flatten the arrow length near equilibrium for faster oscillations.
    const maxVelocity = p.A * state.omega;
    const maxLength = Math.min(95, w * 0.18);
    const velocityLength = maxVelocity > 0 ? (state.v / maxVelocity) * maxLength : 0;
    arrow(ctx, bx, top - 10, velocityLength, 0, '#e5a148');
    if (annotations) label(ctx, 'v', bx, top - 24, '#b47d35');
  }
  if (acceleration) {
    const maxAcceleration = p.A * state.omega * state.omega;
    const length = maxAcceleration > 0 ? (state.a / maxAcceleration) * Math.min(95, w * 0.18) : 0;
    arrow(ctx, bx, top - 48, length, 0, '#779bc6');
    if (annotations) label(ctx, 'a', bx, top - 60, '#6689b2');
  }
  if (annotations)
    label(ctx, 'Mặt phẳng ngang · Bỏ qua ma sát', w / 2, h - 22, '#8a9a96', 'center', 11);
}
