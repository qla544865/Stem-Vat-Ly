export type OscillationMode = 'damped' | 'driven' | 'resonance';

export interface OscillatorParams {
  mode: OscillationMode;
  m: number;
  k: number;
  b: number;
  x0: number;
  force: number;
  omega: number;
}

export const oscillatorLimits = {
  m: [0.5, 4],
  k: [4, 64],
  b: [0, 40],
  x0: [0.05, 0.6],
  force: [0, 8],
  omega: [0, 12],
} as const;
export const scanDampingMin = 0.1;
export const drivingForceMin = 0.5;
export const oscillatorObservationTime = 30;
export const oscillatorDefaults: OscillatorParams = {
  mode: 'damped',
  m: 1,
  k: 16,
  b: 1,
  x0: 0.35,
  force: 2,
  omega: 3,
};

function validate(p: OscillatorParams) {
  if (!['damped', 'driven', 'resonance'].includes(p.mode))
    throw new RangeError('Chế độ không hợp lệ');
  for (const key of Object.keys(oscillatorLimits) as (keyof typeof oscillatorLimits)[]) {
    const [min, max] = oscillatorLimits[key];
    if (!Number.isFinite(p[key]) || p[key] < min || p[key] > max)
      throw new RangeError(`${key} ngoài miền mô hình`);
  }
  if (p.mode === 'resonance' && p.b < scanDampingMin)
    throw new RangeError('Quét cộng hưởng yêu cầu b ≥ 0,1 N·s/m');
  if (p.mode !== 'damped' && p.force < drivingForceMin)
    throw new RangeError('Cưỡng bức yêu cầu F₀ ≥ 0,5 N');
}

const sinc = (x: number) => (x === 0 ? 1 : Math.sin(x) / x);

// Integral of exp((-gamma + iq)u) from 0 to t. expm1 and cos(qt) − 1
// in half-angle form retain precision near the undamped resonance pole.
function driveIntegral(gamma: number, q: number, t: number) {
  const z = q * t;
  const g = gamma * t;
  if (Math.hypot(g, z) < 1e-5)
    return { re: t * (1 - g / 2 + (g ** 2 - z ** 2) / 6), im: t * z * (1 / 2 - g / 3) };
  const decay = Math.exp(-gamma * t);
  const re = Math.expm1(-gamma * t) - 2 * decay * Math.sin(z / 2) ** 2;
  const im = decay * Math.sin(z);
  const norm = gamma ** 2 + q ** 2;
  return { re: (-gamma * re + q * im) / norm, im: (-gamma * im - q * re) / norm };
}

export function createOscillator(p: OscillatorParams) {
  validate(p);
  const { m, k, b, omega, x0 } = p;
  const drive = p.mode === 'damped' ? 0 : p.force;
  const gamma = b / (2 * m);
  const omega0 = Math.sqrt(k / m);
  const discriminant = (omega0 - gamma) * (omega0 + gamma);
  const rate = Math.sqrt(Math.abs(discriminant));
  const regime: 'ideal' | 'under' | 'critical' | 'over' =
    b === 0
      ? 'ideal'
      : Math.abs(discriminant) <= 1e-12 * (k / m)
        ? 'critical'
        : discriminant > 0
          ? 'under'
          : 'over';
  const peakLimit = Math.sqrt(2 * m * k);
  const peakSquared = ((peakLimit - b) * (peakLimit + b)) / (2 * m ** 2);
  const peak = b > 0 && peakSquared > 0 ? Math.sqrt(peakSquared) : null;
  const detuning = (omega0 - omega) * (omega0 + omega) * m;
  const denominator = Math.hypot(detuning, b * omega);
  const responseAtDrive = b > 0 && drive > 0 && denominator > 0 ? drive / denominator : null;
  const amplitude = Number.isFinite(responseAtDrive) ? responseAtDrive : null;
  const nearPole = drive > 0 && denominator < 1e-3 * k;
  const inPhase = drive === 0 || nearPole ? 0 : (drive / denominator) * (detuning / denominator);
  const quadrature =
    drive === 0 || nearPole ? 0 : (drive / denominator) * ((b * omega) / denominator);

  function response(frequency: number) {
    if (!Number.isFinite(frequency) || frequency < 0 || frequency > oscillatorLimits.omega[1])
      throw new RangeError('Tần số kích thích ngoài miền mô hình');
    if (b === 0 || drive === 0) return null;
    const value =
      drive / Math.hypot((omega0 - frequency) * (omega0 + frequency) * m, b * frequency);
    return Number.isFinite(value) ? value : null;
  }

  function state(t: number) {
    if (!Number.isFinite(t) || t < 0) throw new RangeError('Thời gian không hợp lệ');
    const decay = Math.exp(-gamma * t);
    let c = decay;
    let s = decay * t;
    if (regime === 'under' || regime === 'ideal') {
      c = decay * Math.cos(rate * t);
      s *= sinc(rate * t);
    } else if (regime === 'over') {
      const slow = Math.exp((-(k / m) / (gamma + rate)) * t);
      const difference = -Math.expm1(-2 * rate * t);
      c = slow * (1 - difference / 2);
      s = (slow * difference) / (2 * rate);
    }
    const freeX0 = x0 - inPhase;
    const freeV0 = -omega * quadrature;
    const freeX = freeX0 * c + (freeV0 + gamma * freeX0) * s;
    const freeV = freeV0 * c - (gamma * freeV0 + (k / m) * freeX0) * s;
    const cos = Math.cos(omega * t);
    const sin = Math.sin(omega * t);
    let driveX = inPhase * cos + quadrature * sin;
    let driveV = omega * (quadrature * cos - inPhase * sin);
    if (nearPole) {
      // Zero-initial-state convolution with the impulse response, valid at the pole too.
      const plus = driveIntegral(gamma, rate - omega, t);
      const minus = driveIntegral(gamma, -rate - omega, t);
      const re = plus.re - minus.re;
      const im = plus.im - minus.im;
      driveX = (drive / (2 * m * rate)) * (sin * re + cos * im);
      driveV = (drive / (2 * m * rate)) * (omega * (cos * re - sin * im) + 2 * rate * s);
    }
    const x = freeX + driveX;
    const v = freeV + driveV;
    const elasticForce = -k * x;
    const dampingForce = -b * v;
    const drivingForce = drive === 0 ? 0 : drive * cos;
    return {
      x,
      v,
      elasticForce,
      dampingForce,
      drivingForce,
      energy: (m * v ** 2 + k * x ** 2) / 2,
      envelope:
        drive === 0 && (regime === 'under' || regime === 'ideal')
          ? decay * Math.hypot(x0, (gamma * x0) / rate)
          : null,
      steadyX:
        amplitude === null
          ? null
          : nearPole
            ? amplitude * Math.cos(omega * t - Math.atan2(b * omega, detuning))
            : driveX,
    };
  }

  return { state, response, regime, omega0, peak, amplitude };
}

export type Oscillator = ReturnType<typeof createOscillator>;
