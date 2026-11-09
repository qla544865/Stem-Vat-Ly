import { ink, label, line, teal } from '../drawing.ts';
import { pendulumLimits, toDegrees, toRadians } from './physics.ts';
import type { PendulumParams, PendulumState } from './physics.ts';

export function pendulumLayout(width: number, height: number, l: number, theta: number) {
  const x = width / 2;
  const y = Math.max(54, height * 0.2);
  const maxRadius = Math.max(1, Math.min(width / 2 - 45, height - y - 57));
  const radius = maxRadius * (0.35 + 0.65 * (l / pendulumLimits.l.max));
  return {
    x,
    y,
    radius,
    bobX: x + radius * Math.sin(theta),
    bobY: y + radius * Math.cos(theta),
    bobRadius: Math.max(11, Math.min(19, height / 23)),
  };
}

export function drawPendulum(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: PendulumParams,
  state: PendulumState,
  annotations: boolean,
  presenting: boolean,
) {
  const { x, y, radius, bobX, bobY, bobRadius } = pendulumLayout(
    width,
    height,
    params.l,
    state.theta,
  );
  const font = presenting ? 17 : 13;
  const down = Math.PI / 2;
  const arc = (r: number, from: number, to: number, color: string, weight: number) => {
    ctx.beginPath();
    ctx.arc(x, y, r, from, to);
    ctx.strokeStyle = color;
    ctx.lineWidth = weight;
    ctx.stroke();
  };
  const dot = (px: number, py: number, r: number, color: string) => {
    ctx.beginPath();
    ctx.arc(px, py, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
  };

  const amplitude = Math.abs(params.alpha0);
  const limit = pendulumLimits.alpha0.max;
  const scale = radius + 13;
  line(ctx, x, y, x, y + scale + 9, '#849e95', [5, 5]);
  arc(scale, down - limit, down + limit, '#c4d7cb', 1);
  arc(radius, down - amplitude, down + amplitude, '#4c9e83', 3);
  for (let degrees = -60; degrees <= 60; degrees += 15) {
    const theta = toRadians(degrees);
    const major = degrees % 30 === 0;
    const end = scale + (major ? 7 : 4);
    const sine = Math.sin(theta);
    const cosine = Math.cos(theta);
    line(ctx, x + scale * sine, y + scale * cosine, x + end * sine, y + end * cosine, '#7f9d90');
    if (major && annotations && (degrees !== 0 || width > 300)) {
      label(
        ctx,
        `${degrees}°`,
        x + (end + 18) * sine,
        y + (end + 18) * cosine + 4,
        ink,
        'center',
        font - 2,
      );
    }
  }

  ctx.fillStyle = '#c0d6c7';
  ctx.fillRect(x - 36, y - 11, 72, 10);
  line(ctx, x, y, bobX, bobY, '#304f49');
  dot(x, y, 5, ink);
  dot(bobX, bobY, bobRadius + 3, '#fff');
  dot(bobX, bobY, bobRadius, teal);
  dot(bobX - bobRadius / 4, bobY - bobRadius / 4, bobRadius / 4, '#7acbb8');

  if (annotations) {
    const current = down - state.theta;
    arc(radius * 0.36, Math.min(down, current), Math.max(down, current), '#ae7121', 2);
    const right = state.theta >= 0;
    label(
      ctx,
      `θ = ${toDegrees(state.theta).toFixed(1)}°`,
      x + (right ? -14 : 14),
      y + radius * 0.36,
      '#85531c',
      right ? 'right' : 'left',
      font,
    );
    label(
      ctx,
      `l = ${(params.l * 100).toFixed(0)} cm`,
      x + (right ? 17 : -17),
      y + 22,
      ink,
      right ? 'left' : 'right',
      font,
    );
  }
}
