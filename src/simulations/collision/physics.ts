export interface CollisionParams {
  m1: number;
  m2: number;
  v1: number;
  v2: number;
  x1: number;
  x2: number;
  kind: 'elastic' | 'inelastic';
}

export const CART_LENGTH = 1.2;
export const TRACK_LENGTH = 20;
export const OBSERVATION_TIME = 10;
const LEFT = CART_LENGTH / 2;
const RIGHT = TRACK_LENGTH - LEFT;
export const collisionDefaults: CollisionParams = {
  m1: 1,
  m2: 1,
  v1: 3,
  v2: -1,
  x1: 5,
  x2: 12,
  kind: 'elastic',
};

export function collisionTotals(p: CollisionParams, v1: number, v2: number) {
  const p1 = p.m1 * v1;
  const p2 = p.m2 * v2;
  return { v1, v2, p1, p2, momentum: p1 + p2, kinetic: (p.m1 * v1 ** 2 + p.m2 * v2 ** 2) / 2 };
}

interface Contact {
  time: number;
  x1: number;
  x2: number;
  v1: number;
  v2: number;
}

function edgeTime(x: number, v: number) {
  if (v > 0) return Math.max(0, (RIGHT - x) / v);
  if (v < 0) return Math.max(0, (LEFT - x) / v);
  return Infinity;
}

export function collisionPlan(params: CollisionParams) {
  const { m1, m2, v1, v2, x1, x2, kind } = params;
  if (
    ![m1, m2, v1, v2, x1, x2].every(Number.isFinite) ||
    m1 <= 0 ||
    m2 <= 0 ||
    x1 < LEFT ||
    x2 > RIGHT ||
    x2 - x1 < CART_LENGTH - 1e-12 ||
    (kind !== 'elastic' && kind !== 'inelastic')
  )
    throw new RangeError('Invalid collision parameters');

  const p = { ...params };
  const before = collisionTotals(p, v1, v2);
  const endBefore = Math.min(OBSERVATION_TIME, edgeTime(x1, v1), edgeTime(x2, v2));
  const relativeSpeed = v1 - v2;
  const gap = Math.max(0, x2 - x1 - CART_LENGTH);
  const time = relativeSpeed > 0 ? gap / relativeSpeed : Infinity;
  let contact: Contact | null = null;
  let end = endBefore;
  if (time <= endBefore) {
    const centerVelocity = before.momentum / (m1 + m2);
    // Elastic impact reverses relative velocity in the center-of-mass frame.
    const elasticity = kind === 'elastic' ? 1 : 0;
    contact = {
      time,
      x1: x1 + v1 * time,
      x2: x2 + v2 * time,
      v1: centerVelocity - elasticity * (v1 - centerVelocity),
      v2: centerVelocity - elasticity * (v2 - centerVelocity),
    };
    end = Math.min(
      OBSERVATION_TIME,
      time + edgeTime(contact.x1, contact.v1),
      time + edgeTime(contact.x2, contact.v2),
    );
  }
  return { params: p, before, contact, end };
}

export type CollisionPlan = ReturnType<typeof collisionPlan>;

export function collisionState(plan: CollisionPlan, time: number) {
  if (!Number.isFinite(time)) throw new RangeError('Invalid observation time');
  const t = Math.max(0, Math.min(time, plan.end));
  const { params, contact } = plan;
  if (contact && t >= contact.time) {
    const elapsed = t - contact.time;
    return {
      x1: contact.x1 + contact.v1 * elapsed,
      x2: contact.x2 + contact.v2 * elapsed,
      v1: contact.v1,
      v2: contact.v2,
      collided: true,
    };
  }
  return {
    x1: params.x1 + params.v1 * t,
    x2: params.x2 + params.v2 * t,
    v1: params.v1,
    v2: params.v2,
    collided: false,
  };
}
