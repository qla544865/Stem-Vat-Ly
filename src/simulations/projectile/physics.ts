export interface ProjectileParams {
  h: number;
  v0: number;
  g: number;
}
export const projectileDefaults: ProjectileParams = { h: 20, v0: 8, g: 9.81 };

export function projectileState(p: ProjectileParams, time: number) {
  if (
    ![p.h, p.v0, p.g, time].every(Number.isFinite) ||
    p.h <= 0 ||
    p.g <= 0 ||
    p.v0 < 0 ||
    time < 0
  )
    throw new RangeError('Thông số ném ngang không hợp lệ');
  const fallTime = Math.sqrt((2 * p.h) / p.g);
  const t = Math.min(time, fallTime);
  return {
    t,
    fallTime,
    range: p.v0 * fallTime,
    x: p.v0 * t,
    y: Math.min(p.h, 0.5 * p.g * t * t),
    vx: p.v0,
    vy: p.g * t,
    landed: time >= fallTime,
  };
}
