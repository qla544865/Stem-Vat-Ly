export interface TorqueParams {
  F1: number;
  d1: number;
  F2: number;
  d2: number;
}

export const HALF_BAR_LENGTH = 3; // m on either side of the pivot.
export const TORQUE_TOLERANCE = 0.1; // N·m; numerical/learning tolerance, not friction.
export const torqueDefaults: TorqueParams = { F1: 20, d1: 1, F2: 10, d2: 1 };

export function torqueState(p: TorqueParams) {
  if (
    ![p.F1, p.F2, p.d1, p.d2].every(Number.isFinite) ||
    p.F1 < 0 ||
    p.F2 < 0 ||
    p.d1 < 0 ||
    p.d2 < 0 ||
    p.d1 > HALF_BAR_LENGTH ||
    p.d2 > HALF_BAR_LENGTH
  ) {
    throw new RangeError('Lực phải không âm; cánh tay đòn nằm trong khoảng 0–3 m.');
  }
  const M1 = p.F1 * p.d1;
  const M2 = p.F2 * p.d2;
  const net = M1 - M2; // Counterclockwise is positive; both applied forces point down.
  const balanced = Math.abs(net) <= TORQUE_TOLERANCE + 1e-9;
  return {
    M1,
    M2,
    net,
    balanced,
    direction: balanced ? 'balanced' : net > 0 ? 'ccw' : 'cw',
  } as const;
}
