export interface SpringParams {
  m: number;
  k: number;
  A: number;
  phi?: number;
}
export const springDefaults: SpringParams = { m: 1, k: 20, A: 0.3, phi: 0 };

export function springState(p: SpringParams, time: number) {
  const phi = p.phi ?? 0;
  if (
    ![p.m, p.k, p.A, phi, time].every(Number.isFinite) ||
    p.m <= 0 ||
    p.k <= 0 ||
    p.A < 0 ||
    time < 0
  )
    throw new RangeError('Thông số lò xo không hợp lệ');
  const omega = Math.sqrt(p.k / p.m);
  const phase = omega * time + phi;
  const x = p.A * Math.cos(phase);
  const v = -p.A * omega * Math.sin(phase);
  const potential = 0.5 * p.k * x * x;
  const kinetic = 0.5 * p.m * v * v;
  return {
    omega,
    T: (2 * Math.PI) / omega,
    frequency: omega / (2 * Math.PI),
    x,
    v,
    a: -omega * omega * x,
    F: -p.k * x,
    E: 0.5 * p.k * p.A * p.A,
    potential,
    kinetic,
  };
}
