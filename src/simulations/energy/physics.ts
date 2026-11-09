export interface WorkParams {
  force: number;
  displacement: number;
  alpha: number; // rad
}

export const workDefaults: WorkParams = { force: 20, displacement: 5, alpha: Math.PI / 3 };

export function workState({ force, displacement, alpha }: WorkParams) {
  if (
    ![force, displacement, alpha].every(Number.isFinite) ||
    force < 0 ||
    displacement < 0 ||
    alpha < 0 ||
    alpha > Math.PI
  ) {
    throw new RangeError('Invalid work parameters');
  }
  const cosine = Math.cos(alpha);
  const parallel = force === 0 || Math.abs(cosine) < 1e-12 ? 0 : force * cosine;
  const work = displacement === 0 ? 0 : parallel * displacement;
  return { parallel, work, sign: Math.sign(work) };
}

export interface EnergyParams {
  m: number;
  h: number;
  beta: number; // rad
  g: number;
}

export const energyDefaults: EnergyParams = { m: 1, h: 3, beta: Math.PI / 6, g: 10 };

export function energyState({ m, h, beta, g }: EnergyParams, time: number) {
  if (
    ![m, h, beta, g, time].every(Number.isFinite) ||
    m <= 0 ||
    h <= 0 ||
    g <= 0 ||
    beta <= 0 ||
    beta >= Math.PI / 2
  ) {
    throw new RangeError('Invalid incline parameters');
  }
  const sine = Math.sin(beta);
  const length = h / sine;
  const acceleration = g * sine;
  const end = Math.sqrt((2 * length) / acceleration);
  const t = Math.max(0, Math.min(time, end));
  const distance = t === end ? length : (acceleration * t ** 2) / 2;
  const height = t === end ? 0 : Math.max(0, h - distance * sine);
  const speed = t === end ? Math.sqrt(2 * g * h) : acceleration * t;
  const kinetic = (m * speed ** 2) / 2;
  const potential = m * g * height;
  return {
    t,
    end,
    length,
    acceleration,
    distance,
    height,
    speed,
    kinetic,
    potential,
    total: kinetic + potential,
    initial: m * g * h,
  };
}
