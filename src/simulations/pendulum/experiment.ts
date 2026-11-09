import { initialPendulumState, pendulumDefaults, PENDULUM_STEP, stepPendulum } from './physics.ts';
import type { PendulumParams, PendulumState } from './physics.ts';

export const MEASUREMENT_CYCLES = 10;

export class PendulumRun {
  readonly params: PendulumParams;
  readonly measuring: boolean;
  state: PendulumState;
  cycles = 0;
  t10: number | null = null;
  private steps = 0;

  constructor(params: PendulumParams, measuring = false) {
    this.params = { ...params };
    this.measuring = measuring;
    this.state = initialPendulumState(this.params);
  }

  get time() {
    return this.t10 ?? this.steps * PENDULUM_STEP;
  }

  advanceTo(time: number) {
    const target = Math.floor(time / PENDULUM_STEP);
    const side = Math.sign(this.params.alpha0);
    while (this.steps < target && this.t10 === null) {
      const previous = this.state;
      this.state = stepPendulum(this.params, previous);
      // At the release-side turning point the bob switches from approaching
      // the release side to moving back toward equilibrium. ω = 0 at t = 0
      // cannot pass the strict incoming-velocity check.
      if (
        previous.omega * side > 0 &&
        this.state.omega * side <= 0 &&
        this.state.theta * side > 0
      ) {
        this.cycles++;
        if (this.measuring && this.cycles === MEASUREMENT_CYCLES) {
          const fraction = previous.omega / (previous.omega - this.state.omega);
          this.t10 = (this.steps + fraction) * PENDULUM_STEP;
          this.state = {
            theta: stepPendulum(this.params, previous, PENDULUM_STEP * fraction).theta,
            omega: 0,
          };
        }
      }
      this.steps++;
    }
    return this.t10;
  }
}

export const investigations = {
  amplitude: {
    title: 'Ảnh hưởng của biên độ',
    shortTitle: 'Biên độ',
    values: [3, 6, 9, 18],
    variable: 'Độ lệch ngang A',
    unit: 'cm',
    fixed: 'l = 50 cm · m = 50 g · g = 9,8 m/s²',
    question: 'Bạn dự đoán chu kỳ thay đổi thế nào khi kéo vật ra xa vị trí cân bằng?',
    guidance: 'Chọn bốn độ lệch ngang A và tính độ lớn góc thả theo |α₀| = arcsin(A/l).',
    comparison: 'So sánh ba mốc nhỏ trước, rồi đối chiếu với mốc 18 cm.',
    conclusion:
      'Ở góc nhỏ, chu kỳ thay đổi rất ít theo biên độ. Khi góc thả lớn hơn, chu kỳ của con lắc lý tưởng tăng.',
  },
  mass: {
    title: 'Ảnh hưởng của khối lượng',
    shortTitle: 'Khối lượng',
    values: [50, 100, 150],
    variable: 'Khối lượng m',
    unit: 'g',
    fixed: 'l = 50 cm · |α₀| = 5° · g = 9,8 m/s²',
    question: 'Bạn dự đoán vật nặng hơn sẽ dao động nhanh hơn, chậm hơn hay như cũ?',
    guidance: 'Đo với từng quả nặng 50 g, 100 g và 150 g.',
    comparison: 'Đối chiếu T₅₀, T₁₀₀ và T₁₅₀.',
    conclusion:
      'Các chu kỳ bằng nhau. Trong mô hình con lắc đơn lý tưởng, chu kỳ không phụ thuộc vào khối lượng.',
  },
  length: {
    title: 'Ảnh hưởng của chiều dài',
    shortTitle: 'Chiều dài',
    values: [40, 50, 60],
    variable: 'Chiều dài l',
    unit: 'cm',
    fixed: 'm = 50 g · |α₀| = 5° · g = 9,8 m/s²',
    question: 'Bạn dự đoán chu kỳ phụ thuộc vào chiều dài dây theo quy luật nào?',
    guidance: 'Đo với từng chiều dài 40 cm, 50 cm và 60 cm.',
    comparison: 'So sánh T và tỉ số T²/l giữa các hàng. Mở đồ thị để kiểm tra quan hệ T²–l.',
    conclusion:
      'Dây dài hơn cho chu kỳ lớn hơn. Ở góc nhỏ, T ≈ 2π√(l/g) và T² xấp xỉ tỉ lệ thuận với l.',
  },
};

export type Investigation = keyof typeof investigations;
export const investigationIds = Object.keys(investigations) as Investigation[];
export type Results = Record<Investigation, Partial<Record<number, number>>>;
export const emptyResults = (): Results => ({ amplitude: {}, mass: {}, length: {} });

export interface PendulumNotebook {
  results: Results;
  predictions: Record<Investigation, string>;
  notes: Record<Investigation, string>;
}

export function emptyPendulumNotebook(): PendulumNotebook {
  return {
    results: emptyResults(),
    predictions: { amplitude: '', mass: '', length: '' },
    notes: { amplitude: '', mass: '', length: '' },
  };
}

export function trialParams(id: Investigation, value: number): PendulumParams {
  if (!investigations[id].values.includes(value)) throw new RangeError('Unknown pendulum trial');
  const params = { ...pendulumDefaults };
  if (id === 'amplitude') params.alpha0 = Math.asin(value / (100 * params.l));
  if (id === 'mass') params.m = value / 1000;
  if (id === 'length') params.l = value / 100;
  return params;
}

export function recordTrial(results: Results, id: Investigation, value: number, run: PendulumRun) {
  if (run.t10 === null || run.cycles !== MEASUREMENT_CYCLES) return results;
  const expected = trialParams(id, value);
  const { l, m, alpha0, g } = run.params;
  if (
    l !== expected.l ||
    m !== expected.m ||
    g !== expected.g ||
    Math.abs(alpha0) !== expected.alpha0
  ) {
    return results;
  }
  return { ...results, [id]: { ...results[id], [value]: run.t10 } };
}

export function lengthMeasurements(results: Results['length']) {
  return investigations.length.values.flatMap((cm) => {
    const t10 = results[cm];
    if (t10 === undefined || !Number.isFinite(t10) || t10 <= 0) return [];
    const period = t10 / MEASUREMENT_CYCLES;
    return [{ meters: cm / 100, period, squared: period ** 2 }];
  });
}

export function fitLength(results: Results['length']) {
  const points = lengthMeasurements(results);
  if (points.length < 2) return null;
  const numerator = points.reduce((sum, p) => sum + p.meters * p.squared, 0);
  const denominator = points.reduce((sum, p) => sum + p.meters ** 2, 0);
  const slope = numerator / denominator;
  const g = (4 * Math.PI ** 2) / slope;
  return Number.isFinite(g) && g > 0 ? { slope, g } : null;
}
