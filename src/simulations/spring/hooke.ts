export interface HookeParams {
  k: number;
  externalForce: number;
}

export const NATURAL_LENGTH = 1; // m; displayed as a reference, not an adjustable parameter.
export const MAX_DEFORMATION = 0.3; // m; the ideal elastic range used in this lab.
export const hookeDefaults: HookeParams = { k: 100, externalForce: 10 };

export function hookeState(p: HookeParams) {
  if (![p.k, p.externalForce].every(Number.isFinite) || p.k <= 0) {
    throw new RangeError('Độ cứng phải dương; ngoại lực phải hữu hạn.');
  }
  const deformation = p.externalForce / p.k;
  if (Math.abs(deformation) > MAX_DEFORMATION + 1e-9) {
    throw new RangeError('Độ biến dạng vượt giới hạn đàn hồi của mô hình (±0,30 m).');
  }
  return {
    deformation,
    length: NATURAL_LENGTH + deformation,
    naturalLength: NATURAL_LENGTH,
    elasticForce: -p.externalForce,
    externalForce: p.externalForce,
  };
}
