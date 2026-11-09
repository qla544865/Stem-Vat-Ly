import { projectileState } from './physics.ts';
import type { ProjectileParams } from './physics.ts';
import { arrow, label, line, teal } from '../drawing.ts';

export function drawProjectile(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: ProjectileParams,
  time: number,
  vectors: boolean,
  target?: number,
  revealRange = true,
) {
  const s = projectileState(p, time),
    left = 72,
    top = 50,
    ground = h - 74;
  const worldWidth = Math.max(s.range, target ?? 0, 1);
  const scale = Math.min((w - left - 65) / worldWidth, (ground - top) / p.h);
  const ox = left,
    oy = ground - p.h * scale;
  ctx.fillStyle = '#e4ece6';
  ctx.fillRect(left - 26, oy, 26, ground - oy);
  line(ctx, 32, ground, w - 30, ground, '#a7bab0');
  ctx.fillStyle = '#edf1e9';
  ctx.fillRect(32, ground + 1, w - 62, 11);
  arrow(ctx, ox, oy, Math.min(w - ox - 26, worldWidth * scale + 25), 0, '#b5c6c1');
  arrow(ctx, ox, oy, 0, ground - oy + 25, '#b5c6c1');
  label(ctx, 'O', ox - 12, oy - 10, '#6d8983');
  label(ctx, 'x', w - 30, oy - 8, '#6d8983');
  label(ctx, 'y', ox - 13, ground + 26, '#6d8983');
  ctx.save();
  ctx.translate(left - 36, (oy + ground) / 2);
  ctx.rotate(-Math.PI / 2);
  label(ctx, `h = ${p.h} m`, 0, 0, '#718b83', 'center', 11);
  ctx.restore();
  ctx.beginPath();
  ctx.strokeStyle = '#a7cdc4';
  ctx.lineWidth = 1.8;
  ctx.setLineDash([4, 6]);
  for (let i = 0; i <= 100; i++) {
    const point = projectileState(p, (s.fallTime * i) / 100);
    const x = ox + point.x * scale,
      y = oy + point.y * scale;
    if (!i) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  if (revealRange) ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.strokeStyle = teal;
  ctx.lineWidth = 2.5;
  for (let i = 0; i <= 100; i++) {
    const point = projectileState(p, (s.t * i) / 100);
    const x = ox + point.x * scale,
      y = oy + point.y * scale;
    if (!i) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  if (target !== undefined) {
    const tx = ox + target * scale;
    ctx.fillStyle = '#f8e5c8';
    ctx.beginPath();
    ctx.ellipse(tx, ground, Math.max(8, 0.5 * scale), 5, 0, 0, 2 * Math.PI);
    ctx.fill();
    line(ctx, tx, ground, tx, ground - 34, '#d8993c');
    ctx.fillStyle = '#d8993c';
    ctx.beginPath();
    ctx.moveTo(tx, ground - 34);
    ctx.lineTo(tx + 16, ground - 28);
    ctx.lineTo(tx, ground - 22);
    ctx.fill();
    label(ctx, `Mục tiêu ${target} m`, tx, ground + 35, '#ad7938');
  }
  const x = ox + s.x * scale,
    y = oy + s.y * scale;
  // Offset the circle center by its radius so its edge meets the ground at impact.
  ctx.fillStyle = teal;
  ctx.shadowColor = '#0b8f8233';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(x, y - 7, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  if (vectors) {
    const vx = Math.min(68, s.vx * 4, w - x - 12),
      vy = Math.min(68, s.vy * 4);
    arrow(ctx, x, y - 7, vx, 0, '#d99b41');
    arrow(ctx, x, y - 7, 0, vy, '#779bc6');
  }
  if (target === undefined && revealRange)
    label(ctx, `L = ${s.range.toFixed(2)} m`, ox + (s.range * scale) / 2, ground + 35, '#6d8983');
  label(
    ctx,
    'Trục y hướng xuống · Bỏ qua sức cản không khí',
    w / 2,
    h - 17,
    '#8a9a96',
    'center',
    11,
  );
}
