export interface ForceParams {
  F1: number;
  angle1: number;
  F2: number;
  angle2: number;
}
export interface PowerParams {
  work: number;
  t1: number;
  t2: number;
}
export interface EfficiencyParams {
  input: number;
  useful: number;
}

export const forceMax = 30;
export const workMax = 600;
export const inputMax = 1000;
export const forceDefaults: ForceParams = { F1: 12, angle1: 0, F2: 8, angle2: Math.PI / 2 };
export const powerDefaults: PowerParams = { work: 300, t1: 12, t2: 20 };
export const efficiencyDefaults: EfficiencyParams = { input: 400, useful: 240 };

const degrees = (radians: number) => (radians * 180) / Math.PI;
const normalize = (angle: number) => ((angle % 360) + 360) % 360;
export const angularError = (actual: number, target: number) =>
  Math.abs(normalize(actual - target + 180) - 180);

export function forceState(p: ForceParams) {
  if (![p.F1, p.F2, p.angle1, p.angle2].every(Number.isFinite) || p.F1 < 0 || p.F2 < 0)
    throw new RangeError('Độ lớn lực hoặc góc không hợp lệ');
  const first = { x: p.F1 * Math.cos(p.angle1), y: p.F1 * Math.sin(p.angle1) };
  const second = { x: p.F2 * Math.cos(p.angle2), y: p.F2 * Math.sin(p.angle2) };
  const x = first.x + second.x;
  const y = first.y + second.y;
  const magnitude = Math.hypot(x, y);
  if (!Number.isFinite(magnitude)) throw new RangeError('Độ lớn hợp lực vượt miền số hữu hạn');
  if (magnitude <= 1e-9) return { first, second, x: 0, y: 0, magnitude: 0, angle: null };
  return { first, second, x, y, magnitude, angle: normalize(degrees(Math.atan2(y, x))) };
}

export function averagePower(work: number, time: number) {
  if (!Number.isFinite(work) || !Number.isFinite(time) || work < 0 || time <= 0)
    throw new RangeError('Công và thời gian không hợp lệ');
  const value = work / time;
  if (!Number.isFinite(value)) throw new RangeError('Công suất vượt miền số hữu hạn');
  return value;
}

export function efficiencyState({ input, useful }: EfficiencyParams) {
  if (
    !Number.isFinite(input) ||
    !Number.isFinite(useful) ||
    input <= 0 ||
    useful < 0 ||
    useful > input
  )
    throw new RangeError('Công có ích phải nằm trong khoảng từ 0 đến công đầu vào');
  return { lost: input - useful, percent: (useful / input) * 100 };
}
