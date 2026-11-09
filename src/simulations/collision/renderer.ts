import { arrow, ink, label, line, teal } from '../drawing.ts';
import { CART_LENGTH, collisionState, TRACK_LENGTH } from './physics.ts';
import type { CollisionPlan } from './physics.ts';

export function drawCollision(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  plan: CollisionPlan,
  time: number,
  velocity: boolean,
  annotations: boolean,
) {
  const state = collisionState(plan, time);
  const pad = 26;
  const scale = Math.max(1, (width - 2 * pad) / TRACK_LENGTH);
  const x = (meters: number) => pad + meters * scale;
  const railY = height * 0.63;
  const cartWidth = CART_LENGTH * scale;
  const cartHeight = Math.min(42, Math.max(26, height * 0.12));
  const stuck = state.collided && plan.params.kind === 'inelastic';
  const velocityScale =
    Math.min(width * 0.16, 82) / Math.max(4, Math.abs(plan.params.v1), Math.abs(plan.params.v2));

  line(ctx, x(0), railY, x(TRACK_LENGTH), railY, ink);
  line(ctx, x(0), railY + 6, x(TRACK_LENGTH), railY + 6, '#a1bbb0');
  for (let distance = 0; distance <= TRACK_LENGTH; distance += 2) {
    line(ctx, x(distance), railY + 6, x(distance), railY + 12, '#9eb5a8');
    if (annotations && (width >= 440 || distance % 4 === 0))
      label(ctx, `${distance}`, x(distance), railY + 29);
  }
  if (annotations) label(ctx, 'x (m) →', x(TRACK_LENGTH), railY + 50, ink, 'right');

  if (state.collided && plan.contact) {
    const mark = x((plan.contact.x1 + plan.contact.x2) / 2);
    line(ctx, mark, railY + 38, mark, railY - cartHeight - 8, '#b97d39', [4, 4]);
    if (annotations)
      label(ctx, 'Điểm tiếp xúc', Math.max(62, Math.min(width - 62, mark)), railY + 54, '#885819');
  }

  const carts = [
    { center: state.x1, speed: state.v1, mass: plan.params.m1, title: 'A', color: teal },
    { center: state.x2, speed: state.v2, mass: plan.params.m2, title: 'B', color: '#446da6' },
  ];
  carts.forEach((cart, index) => {
    const center = x(cart.center);
    ctx.fillStyle = cart.color;
    ctx.fillRect(center - cartWidth / 2, railY - cartHeight - 5, cartWidth, cartHeight);
    label(ctx, cart.title, center, railY - cartHeight / 2, 'white', 'center', 14);
    for (const sign of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(center + (sign * cartWidth) / 4, railY - 4, 4, 0, 2 * Math.PI);
      ctx.fillStyle = ink;
      ctx.fill();
    }
    const labelX = Math.max(28, Math.min(width - 28, center));
    const labelY = railY - cartHeight - 34 - 23 * index;
    if (annotations) label(ctx, `${cart.title} · ${cart.mass} kg`, labelX, labelY - 7, ink);
    if (velocity) {
      const arrowLength = velocityScale * cart.speed;
      const tip = Math.max(7, Math.min(width - 7, center + arrowLength));
      arrow(ctx, center, labelY + 2, tip - center, 0, cart.color);
    }
  });
  if (stuck) {
    const seam = x((state.x1 + state.x2) / 2);
    ctx.fillStyle = '#ebba69';
    ctx.fillRect(seam - 6, railY - 17, 12, 7);
  }
}
