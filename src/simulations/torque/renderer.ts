import { HALF_BAR_LENGTH, torqueState } from './physics.ts';
import type { TorqueParams } from './physics.ts';
import { arrow, label, line, teal } from '../drawing.ts';

export function drawTorque(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: TorqueParams,
  annotations: boolean,
) {
  const s = torqueState(p),
    cx = w / 2,
    y = h * 0.46,
    scale = (w - 90) / (2 * HALF_BAR_LENGTH);
  const left = cx - p.d1 * scale,
    right = cx + p.d2 * scale;
  ctx.fillStyle = '#b7cdc1';
  ctx.beginPath();
  ctx.roundRect(38, y - 5, w - 76, 10, 4);
  ctx.fill();
  ctx.fillStyle = '#799b87';
  ctx.beginPath();
  ctx.moveTo(cx, y + 5);
  ctx.lineTo(cx - 19, y + 41);
  ctx.lineTo(cx + 19, y + 41);
  ctx.closePath();
  ctx.fill();
  line(ctx, cx - 32, y + 42, cx + 32, y + 42, '#9db3a4');
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(cx, y, 4, 0, 2 * Math.PI);
  ctx.fill();
  label(ctx, 'O', cx, y - 20, '#537964', 'center', 15);
  for (const [x, force, color, text] of [
    [left, p.F1, teal, 'F₁'],
    [right, p.F2, '#d59a3e', 'F₂'],
  ] as const) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fill();
    arrow(ctx, x, y + 8, 0, (force / 50) * 90, color);
    const labelX = text === 'F₁' ? Math.min(x, cx - 55) : Math.max(x, cx + 55);
    label(ctx, `${text} = ${force.toFixed(0)} N`, labelX, y + 122, color, 'center', 12);
  }
  for (const [x, distance, text] of [
    [left, p.d1, 'd₁'],
    [right, p.d2, 'd₂'],
  ] as const) {
    line(ctx, x, y - 36, cx, y - 36, '#9bb4a5');
    line(ctx, x, y - 41, x, y - 31, '#9bb4a5');
    const labelX =
      text === 'd₁' ? Math.min((x + cx) / 2, cx - 55) : Math.max((x + cx) / 2, cx + 55);
    label(ctx, `${text} = ${distance.toFixed(2)} m`, labelX, y - 49, '#718a77', 'center', 11);
  }
  for (let d = -3; d <= 3; d++) {
    const x = cx + d * scale;
    line(ctx, x, y - 5, x, y + 5, '#789d88');
    if (annotations && d !== 0) label(ctx, `${Math.abs(d)} m`, x, y + 27, '#90a694', 'center', 10);
  }
  const status = s.balanced
    ? 'M₁ = M₂ · Cân bằng moment'
    : s.direction === 'ccw'
      ? '↶ Xu hướng ngược chiều kim đồng hồ'
      : '↷ Xu hướng theo chiều kim đồng hồ';
  label(ctx, status, cx, 45, s.balanced ? teal : '#ae8844', 'center', w < 450 ? 11 : 14);
  if (annotations)
    label(
      ctx,
      'Thanh giữ ngang để xét cân bằng tĩnh · Không giả lập chuyển động quay',
      cx,
      h - 20,
      '#879c8c',
      'center',
      w < 550 ? 9 : 11,
    );
}
