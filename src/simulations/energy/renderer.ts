import { arrow, ink, label, line, teal } from '../drawing.ts';
import { energyState, workState } from './physics.ts';
import type { EnergyParams, WorkParams } from './physics.ts';

export function drawWork(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: WorkParams,
  annotations: boolean,
) {
  const y = h * 0.63;
  const start = w * 0.38;
  const span = (w * 0.47 * p.displacement) / 20;
  const force = (Math.min(w * 0.3, h * 0.35) * p.force) / 100;
  line(ctx, 22, y, w - 22, y, '#a1b4ab');
  ctx.fillStyle = '#8ebfa8';
  ctx.fillRect(start - 21, y - 33, 42, 33);
  if (span > 42) {
    ctx.strokeStyle = '#9eb5aa';
    ctx.strokeRect(start + span - 21, y - 33, 42, 33);
  }
  const vectorY = y - 23;
  arrow(ctx, start, vectorY, force * Math.cos(p.alpha), -force * Math.sin(p.alpha), '#a56725');
  arrow(ctx, start, y + 28, span, 0, teal);
  if (!annotations) return;
  if (p.force > 0) {
    const radius = 22;
    ctx.beginPath();
    ctx.arc(start, vectorY, radius, -p.alpha, 0);
    ctx.strokeStyle = '#94663c';
    ctx.stroke();
  }
  label(
    ctx,
    `F = ${p.force} N · α = ${Math.round((p.alpha * 180) / Math.PI)}°`,
    w / 2,
    y - Math.min(w * 0.3, h * 0.35) - 38,
  );
  label(ctx, `s = ${p.displacement} m`, start + span / 2, y + 48, teal);
  label(ctx, `A = ${workState(p).work.toFixed(1)} J`, w / 2, y + 73, ink);
}

export function drawEnergy(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: EnergyParams,
  time: number,
  velocity: boolean,
  annotations: boolean,
) {
  const s = energyState(p, time);
  const horizontal = s.length * Math.cos(p.beta);
  const scale = Math.min((w - 94) / horizontal, (h - 112) / p.h);
  const baseY = h - 47;
  const topY = baseY - p.h * scale;
  const left = (w - horizontal * scale) / 2;
  const right = w - left;
  const x = left + s.distance * Math.cos(p.beta) * scale;
  const y = baseY - s.height * scale;
  ctx.beginPath();
  ctx.moveTo(left, baseY);
  ctx.lineTo(left, topY);
  ctx.lineTo(right, baseY);
  ctx.closePath();
  ctx.fillStyle = '#e2efe5';
  ctx.fill();
  line(ctx, left, topY, right, baseY, ink);
  line(ctx, 24, baseY, w - 24, baseY, '#a1b4ab');
  if (annotations) {
    label(ctx, `h = ${p.h.toFixed(1)} m`, left + 8, topY - 14, ink, 'left');
    label(ctx, `β = ${Math.round((p.beta * 180) / Math.PI)}°`, right - 38, baseY - 12);
    label(ctx, 'Mốc thế năng · y = 0', right, baseY + 24, ink, 'right');
    if (s.height > 0 && s.distance > 0) line(ctx, x, y, x, baseY, '#87ab99', [4, 4]);
  }
  ctx.beginPath();
  ctx.arc(
    x + 11 * Math.sin(p.beta),
    Math.min(y - 11 * Math.cos(p.beta), baseY - 11),
    11,
    0,
    2 * Math.PI,
  );
  ctx.fillStyle = teal;
  ctx.fill();
  if (velocity) {
    const length =
      (Math.min(68, w * 0.15, (w - x - 19) / Math.cos(p.beta)) * s.speed) /
      Math.sqrt(2 * p.g * p.h);
    arrow(ctx, x + 12, y - 31, length * Math.cos(p.beta), length * Math.sin(p.beta), '#a56725');
  }
}
