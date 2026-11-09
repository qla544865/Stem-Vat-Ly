import { hookeState } from './hooke.ts';
import type { HookeParams } from './hooke.ts';
import { arrow, label, line, teal } from '../drawing.ts';

export function drawHooke(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: HookeParams,
  annotations: boolean,
  secret: boolean,
) {
  const s = hookeState(p);
  const wall = 42,
    y = h * 0.57,
    scale = (w - 115) / 1.4;
  const end = wall + s.length * scale,
    natural = wall + scale;
  ctx.fillStyle = '#e2eae5';
  ctx.fillRect(wall - 15, y - 40, 15, 80);
  for (let i = -35; i < 40; i += 9) line(ctx, wall - 15, y + i + 8, wall, y + i, '#a8bdb1');
  line(ctx, natural, y - 48, natural, y + 93, '#9bb7a5', [4, 4]);
  label(ctx, 'Chiều dài tự nhiên l₀ = 1 m', natural, y + 118, '#718b79', 'center', 11);
  ctx.strokeStyle = teal;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(wall, y);
  ctx.lineTo(wall + 12, y);
  for (let i = 1; i <= 36; i++)
    ctx.lineTo(wall + 12 + ((end - wall - 24) * i) / 36, y + (i === 36 ? 0 : i % 2 ? -12 : 12));
  ctx.lineTo(end, y);
  ctx.stroke();
  ctx.fillStyle = teal;
  ctx.beginPath();
  ctx.arc(end, y, 7, 0, Math.PI * 2);
  ctx.fill();
  const forceLength = (p.externalForce / 12) * Math.min(75, w * 0.16);
  arrow(ctx, end, y - 32, forceLength, 0, '#d59a3e');
  arrow(ctx, end, y - 68, -forceLength, 0, '#779bc6');
  if (annotations) {
    label(ctx, 'F ngoại', end + forceLength / 2, y - 43, '#ab7c30', 'center', 11);
    label(ctx, 'F đàn hồi', end - forceLength / 2, y - 79, '#688bb5', 'center', 11);
    label(ctx, secret ? 'k = ?' : `k = ${p.k} N/m`, (wall + end) / 2, y + 33, '#648574');
  }
  if (Math.abs(s.deformation) > 1e-9) {
    line(ctx, natural, y + 54, end, y + 54, '#c19b50');
    line(ctx, natural, y + 49, natural, y + 59, '#c19b50');
    line(ctx, end, y + 49, end, y + 59, '#c19b50');
    label(
      ctx,
      `Δl = ${s.deformation.toFixed(3)} m`,
      (natural + end) / 2,
      y + 44,
      '#ab843e',
      'center',
      11,
    );
  }
  line(ctx, wall, y + 85, wall + 1.4 * scale, y + 85, '#abbfb0');
  for (let i = 0; i <= 5; i++) {
    const x = wall + i * 0.25 * scale;
    line(ctx, x, y + 80, x, y + 91, '#9db4a5');
    label(ctx, (i * 0.25).toFixed(2), x, y + 106, '#8c9e90', 'center', 10);
  }
  label(ctx, 'm', wall + 1.4 * scale, y + 106, '#8c9e90', 'center', 10);
  label(ctx, 'Cân bằng tĩnh · Giãn (+), nén (−)', w / 2, h - 18, '#8a9a96', 'center', 11);
}
