import { circularState } from './physics.ts';
import type { CircularParams } from './physics.ts';
import type { DisplayOptions } from '../catalog.ts';
import { arrow, label, line, teal } from '../drawing.ts';

export function drawCircular(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: CircularParams,
  time: number,
  display: DisplayOptions,
) {
  const s = circularState(p, time);
  const radius = Math.min(w * 0.19, h * 0.28),
    cx = w * 0.27,
    cy = h * 0.48;
  const projectionCenter = w * 0.77,
    projectionY = cy + radius + 34;
  const factor = radius / p.r,
    px = cx + s.x * factor,
    py = cy - s.y * factor;
  const projectedX = projectionCenter + s.projection * factor;
  ctx.strokeStyle = '#b1ccbb';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  arrow(ctx, cx - radius - 14, cy, 2 * radius + 28, 0, '#c3d3c6');
  arrow(ctx, cx, cy + radius + 12, 0, -2 * radius - 26, '#c3d3c6');
  label(ctx, 'x', cx + radius + 19, cy + 5, '#8c9f90', 'center', 11);
  label(ctx, 'y', cx + 10, cy - radius - 15, '#8c9f90', 'center', 11);
  line(ctx, cx, cy, px, py, '#77a58b');
  ctx.fillStyle = '#8da997';
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fill();
  const angleRadius = Math.min(25, radius * 0.35);
  ctx.beginPath();
  ctx.strokeStyle = '#b9a46e';
  ctx.arc(cx, cy, angleRadius, 0, -s.angle, true);
  ctx.stroke();
  label(ctx, 'O', cx - 10, cy + 16, '#769681', 'center', 11);
  // Both local x axes point right. The projection shares time and phase with the orbit.
  arrow(ctx, projectionCenter - radius - 12, projectionY, radius * 2 + 24, 0, '#a7bcab');
  line(
    ctx,
    projectionCenter,
    projectionY - 28,
    projectionCenter,
    projectionY + 20,
    '#c0d1c2',
    [3, 4],
  );
  for (const side of [-1, 1]) {
    const x = projectionCenter + side * radius;
    line(ctx, x, projectionY - 5, x, projectionY + 5, '#a1b9a7');
    label(ctx, side < 0 ? '−r' : '+r', x, projectionY + 23, '#849c89', 'center', 11);
  }
  label(ctx, '0', projectionCenter, projectionY + 23, '#849c89', 'center', 11);
  line(ctx, px, py, projectedX, projectionY, '#b8ccbd', [4, 5]);
  ctx.fillStyle = '#e8f1e8';
  ctx.fillRect(projectionCenter - radius, projectionY - 1, 2 * radius, 2);
  ctx.fillStyle = teal;
  for (const [x, y] of [
    [px, py],
    [projectedX, projectionY],
  ]) {
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  const vectorLength = Math.min(58, radius * 0.55);
  if (display.velocity) {
    arrow(
      ctx,
      px,
      py,
      (s.vx / s.speed) * vectorLength,
      (-s.vy / s.speed) * vectorLength,
      '#d59a3e',
    );
    arrow(
      ctx,
      projectedX,
      projectionY - 15,
      (s.projectionVelocity / s.speed) * vectorLength,
      0,
      '#d59a3e',
    );
  }
  if (display.acceleration)
    arrow(
      ctx,
      px,
      py,
      (s.ax / s.acceleration) * vectorLength,
      (-s.ay / s.acceleration) * vectorLength,
      '#779bc6',
    );
  label(ctx, 'CHUYỂN ĐỘNG TRÒN', cx, 37, '#7b9684', 'center', w < 500 ? 9 : 11);
  label(ctx, 'HÌNH CHIẾU LÊN TRỤC x', projectionCenter, 37, '#7b9684', 'center', w < 500 ? 8 : 11);
  if (display.annotations) {
    label(ctx, `θ = ${s.angle.toFixed(2)} rad`, cx, cy + radius + 35, '#799583', 'center', 11);
    label(
      ctx,
      'A = r · Cùng thời gian, cùng pha',
      w / 2,
      h - 18,
      '#809884',
      'center',
      w < 500 ? 10 : 12,
    );
  }
}
