export interface PendulumParams {
  l: number;
  m: number;
  alpha0: number;
  g: number;
}

export interface PendulumState {
  theta: number;
  omega: number;
}

export const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
export const toDegrees = (radians: number) => (radians * 180) / Math.PI;
export const PENDULUM_STEP = 1 / 240;

export const pendulumLimits = {
  l: { min: 0.2, max: 1.5 },
  m: { min: 0.02, max: 0.2 },
  alpha0: { min: toRadians(1), max: toRadians(60) },
  g: { min: 1.6, max: 20 },
};
export const pendulumDefaults: PendulumParams = { l: 0.5, m: 0.05, alpha0: toRadians(5), g: 9.8 };

export function initialPendulumState(params: PendulumParams): PendulumState {
  for (const key of ['l', 'm', 'alpha0', 'g'] as const) {
    const { min, max } = pendulumLimits[key];
    const value = key === 'alpha0' ? Math.abs(params[key]) : params[key];
    if (!Number.isFinite(value) || value < min || value > max) {
      throw new RangeError(`Pendulum parameter ${key} is out of range`);
    }
  }
  return { theta: params.alpha0, omega: 0 };
}

export const angularAcceleration = (p: PendulumParams, theta: number) =>
  -(p.g / p.l) * Math.sin(theta);

export const pendulumEnergy = (p: PendulumParams, { theta, omega }: PendulumState) =>
  (p.m * (p.l * omega) ** 2) / 2 + 2 * p.m * p.g * p.l * Math.sin(theta / 2) ** 2;

export const smallAnglePeriod = (p: PendulumParams) => 2 * Math.PI * Math.sqrt(p.l / p.g);

export function nonlinearPeriod(p: PendulumParams) {
  // T = 4√(l/g) K(sin(|α₀|/2)). The AGM converges quadratically on this angle range.
  let arithmetic = 1;
  let geometric = Math.cos(p.alpha0 / 2);
  while (arithmetic - geometric > Number.EPSILON) {
    const mean = (arithmetic + geometric) / 2;
    geometric = Math.sqrt(arithmetic * geometric);
    arithmetic = mean;
  }
  return smallAnglePeriod(p) / arithmetic;
}

export function stepPendulum(
  p: PendulumParams,
  { theta, omega }: PendulumState,
  dt = PENDULUM_STEP,
) {
  const k1Theta = omega;
  const k1Omega = angularAcceleration(p, theta);
  const k2Theta = omega + (dt / 2) * k1Omega;
  const k2Omega = angularAcceleration(p, theta + (dt / 2) * k1Theta);
  const k3Theta = omega + (dt / 2) * k2Omega;
  const k3Omega = angularAcceleration(p, theta + (dt / 2) * k2Theta);
  const k4Theta = omega + dt * k3Omega;
  const k4Omega = angularAcceleration(p, theta + dt * k3Theta);
  return {
    theta: theta + (dt / 6) * (k1Theta + 2 * k2Theta + 2 * k3Theta + k4Theta),
    omega: omega + (dt / 6) * (k1Omega + 2 * k2Omega + 2 * k3Omega + k4Omega),
  };
}
