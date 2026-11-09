export interface CircularParams {
  r: number;
  m: number;
  omega: number;
  phi: number; // rad; degrees are used only by the control panel.
}

export const circularDefaults: CircularParams = { r: 1.5, m: 1, omega: 2, phi: 0 };

export function circularState(p: CircularParams, time: number) {
  if (
    ![p.r, p.m, p.omega, p.phi, time].every(Number.isFinite) ||
    p.r <= 0 ||
    p.m <= 0 ||
    p.omega <= 0 ||
    time < 0
  ) {
    throw new RangeError('r, m, ω phải dương; pha và thời gian phải hữu hạn.');
  }
  const theta = p.omega * time + p.phi;
  const x = p.r * Math.cos(theta);
  const y = p.r * Math.sin(theta);
  const speed = p.omega * p.r;
  const acceleration = p.omega * p.omega * p.r;
  return {
    theta,
    angle: ((theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI),
    x,
    y,
    vx: -speed * Math.sin(theta),
    vy: speed * Math.cos(theta),
    ax: -p.omega * p.omega * x,
    ay: -p.omega * p.omega * y,
    speed,
    acceleration,
    force: p.m * acceleration,
    T: (2 * Math.PI) / p.omega,
    projection: x,
    projectionVelocity: -speed * Math.sin(theta),
  };
}
