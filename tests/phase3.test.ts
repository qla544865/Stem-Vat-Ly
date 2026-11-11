import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  angularError,
  averagePower,
  efficiencyState,
  forceState,
} from '../src/simulations/interactive/physics.ts';
import { createOscillator } from '../src/simulations/oscillator/physics.ts';
import {
  canCheckChallenge,
  challenges,
  challengeType,
  classificationScore,
  validateChallenge,
} from '../src/challenges/config.ts';
import type { AttemptEvidence, ChallengeId } from '../src/challenges/config.ts';
import { defaultConfig, getParameters, updateParameter } from '../src/simulations/catalog.ts';
import type { SimulationConfig } from '../src/simulations/catalog.ts';
import { challengeFromHash, challengePath, modelFromHash } from '../src/navigation.ts';

const near = (actual: number, expected: number) => assert.ok(Math.abs(actual - expected) < 1e-9);
const rad = (deg: number) => (deg * Math.PI) / 180;

test('hợp lực cùng chiều, ngược chiều, vuông góc và triệt tiêu', () => {
  const p = { F1: 3, F2: 4, angle1: 0, angle2: 0 };
  assert.equal(forceState(p).magnitude, 7);
  assert.equal(forceState({ ...p, angle2: Math.PI }).magnitude, 1);
  assert.equal(forceState({ ...p, angle2: Math.PI }).angle, 180);
  const perpendicular = forceState({ ...p, angle2: Math.PI / 2 });
  near(perpendicular.magnitude, 5);
  near(perpendicular.x, 3);
  near(perpendicular.y, 4);
  const zero = forceState({ ...p, F2: 3, angle2: Math.PI });
  assert.equal(zero.magnitude, 0);
  assert.equal(zero.angle, null);
});

test('góc hợp lực đúng ở các góc phần tư và sai số góc đi qua 0°', () => {
  for (const angle of [0, 45, 90, 135, 225, 315, 359, 360]) {
    const s = forceState({ F1: 10, F2: 3, angle1: rad(angle), angle2: rad(angle) });
    assert.ok(angularError(s.angle!, angle) < 1e-9);
  }
  assert.equal(angularError(359, 1), 2);
  assert.equal(angularError(1, 359), 2);
  assert.throws(() => forceState({ F1: -1, F2: 3, angle1: 0, angle2: 0 }), RangeError);
});

test('công suất trung bình và kiểm tra miền thời gian, công', () => {
  assert.equal(averagePower(100, 10), 10);
  assert.equal(averagePower(0, 10), 0);
  for (const [work, t] of [
    [100, 0],
    [100, -1],
    [-100, 10],
    [NaN, 10],
    [100, Infinity],
    [100, Number.MIN_VALUE],
  ])
    assert.throws(() => averagePower(work, t), RangeError);
});

test('hiệu suất giữ cân bằng công và chặn đầu vào ngoài miền', () => {
  assert.deepEqual(efficiencyState({ input: 100, useful: 80 }), { percent: 80, lost: 20 });
  assert.deepEqual(efficiencyState({ input: 100, useful: 100 }), { percent: 100, lost: 0 });
  assert.deepEqual(efficiencyState({ input: 100, useful: 0 }), { percent: 0, lost: 100 });
  for (const [input, useful] of [
    [0, 0],
    [100, 120],
    [100, -1],
    [Infinity, 10],
    [100, NaN],
  ])
    assert.throws(() => efficiencyState({ input, useful }), RangeError);
});

test('catalog giữ miền phụ thuộc của slider hiệu suất và quét cộng hưởng', () => {
  const initial = defaultConfig('efficiency');
  const lowerInput = updateParameter(initial, 'input', 100);
  assert.deepEqual(lowerInput.params, { input: 100, useful: 100 });
  assert.equal(getParameters(lowerInput).find(({ key }) => key === 'useful')!.max, 100);
  assert.deepEqual(updateParameter(lowerInput, 'useful', 1000).params, lowerInput.params);
  const damped = defaultConfig('oscillator');
  if (damped.kind !== 'oscillator') assert.fail();
  assert.equal(
    getParameters(damped).some(({ key }) => key === 'omega'),
    false,
  );
  const scan = { ...damped, params: { ...damped.params, mode: 'resonance' as const } };
  const bounded = updateParameter(scan, 'b', 0);
  if (bounded.kind !== 'oscillator') assert.fail();
  assert.equal(bounded.params.b, 0.1);
  assert.ok(createOscillator(bounded.params).response(bounded.params.omega)! > 0);
  const p = updateParameter(defaultConfig('forces'), 'angle2', 270);
  if (p.kind !== 'forces') assert.fail();
  near(p.params.angle2, (3 * Math.PI) / 2);
});

const empty: AttemptEvidence = {
  interacted: false,
  hasRun: false,
  time: 0,
  completed: false,
  nonzeroForce: false,
};
const adjusted = { ...empty, interacted: true };
const challenge = (id: ChallengeId) => challenges.find((c) => c.id === id)!;
const evaluate = (id: ChallengeId, config: SimulationConfig, time = 0) => {
  const c = challenge(id);
  const measurement = c.measure!(config, time);
  return (
    measurement !== null && validateChallenge(c, measurement.value, undefined, measurement.angle)
  );
};

test('Challenge tắt dần chờ đúng mốc, kiểm tra đường bao và loại trường hợp không dao động', () => {
  const id = 'damping-envelope';
  const c = challenge(id);
  const config = { kind: 'oscillator', params: c.initial } as SimulationConfig;
  assert.equal(canCheckChallenge(c, adjusted), false);
  assert.equal(
    canCheckChallenge(c, { ...adjusted, hasRun: true, time: 4.99, completed: false }),
    false,
  );
  const after = { ...adjusted, hasRun: true, time: 5, completed: true };
  assert.equal(canCheckChallenge(c, after), true);
  assert.equal(canCheckChallenge(c, { ...after, measurementAvailable: false }), false);
  assert.equal(evaluate(id, config, 5), false);
  assert.equal(evaluate(id, updateParameter(config, 'b', 1), 5), true);
  for (const b of [0, 8, 9]) assert.equal(evaluate(id, updateParameter(config, 'b', b), 5), false);
  assert.equal(validateChallenge(c, 0.05), false);
});

test('Challenge cộng hưởng chấm theo đỉnh li độ, có nghiệm trên lưới và cần chỉnh trước', () => {
  const id = 'resonance-frequency';
  const c = challenge(id);
  const config = { kind: 'oscillator', params: c.initial } as SimulationConfig;
  assert.equal(c.hideResonancePeak, true);
  assert.equal(canCheckChallenge(c, empty), false);
  assert.equal(canCheckChallenge(c, adjusted), true);
  assert.equal(evaluate(id, updateParameter(config, 'omega', 3.75)), true);
  assert.equal(evaluate(id, updateParameter(config, 'omega', 4)), false);
});

test('Challenge phân loại cần đủ ba dự đoán và chấm theo từng tình huống', () => {
  const c = challenge('oscillation-phenomena');
  assert.equal(challengeType(c), 'prediction');
  assert.equal(canCheckChallenge(c, empty), false);
  assert.equal(canCheckChallenge(c, { ...empty, classified: true }), true);
  assert.equal(validateChallenge(c, classificationScore(c.classification!, [2, 1, 3])), true);
  assert.equal(validateChallenge(c, classificationScore(c.classification!, [3, 2, 1])), false);
  assert.equal(validateChallenge(c, classificationScore(c.classification!, [2, 1])), false);
});

test('Challenge hợp lực chấm cả độ lớn và hướng, bỏ qua hướng nếu mục tiêu bằng 0', () => {
  const id = 'force-resultant';
  const c = challenge(id);
  const config = { kind: 'forces', params: c.initial } as SimulationConfig;
  assert.equal(evaluate(id, config), false);
  const correct = updateParameter(updateParameter(config, 'F2', 12.5), 'angle2', 72);
  assert.equal(evaluate(id, correct), true);
  assert.equal(evaluate(id, updateParameter(correct, 'angle2', 288)), false);
  assert.equal(validateChallenge(c, 20, undefined, null), false);
  assert.equal(
    validateChallenge({ ...c, directionTarget: { angle: 0, tolerance: 2 } }, 20, undefined, 359),
    true,
  );
  assert.equal(validateChallenge({ ...c, target: 0 }, 0, undefined, null), true);
});

test('Challenge công suất và hiệu suất có nghiệm trong miền, từ chối sai số lớn', () => {
  const power = defaultConfig('power');
  const efficiency = defaultConfig('efficiency');
  assert.equal(evaluate('power-time', updateParameter(power, 't1', 7.5)), true);
  assert.equal(evaluate('power-time', updateParameter(power, 't1', 8)), false);
  assert.equal(evaluate('efficiency-target', updateParameter(efficiency, 'useful', 300)), true);
  assert.equal(evaluate('efficiency-target', updateParameter(efficiency, 'useful', 310)), false);
});

test('các bài mới có gợi ý theo cấp, hash hợp lệ và không đủ điều kiện lúc mở', () => {
  for (const [id, model] of [
    ['damping-envelope', 'oscillator'],
    ['resonance-frequency', 'oscillator'],
    ['oscillation-phenomena', 'oscillator'],
    ['force-resultant', 'forces'],
    ['power-time', 'power'],
    ['efficiency-target', 'efficiency'],
  ] as const) {
    const c = challenge(id);
    assert.equal(c.extraHints?.length, 2);
    assert.equal(challengeFromHash(challengePath(id)), c);
    assert.equal(modelFromHash(challengePath(id)), model);
    assert.equal(canCheckChallenge(c, empty), false);
  }
  assert.equal(challengeType(challenge('secret')), 'investigation');
  assert.equal(modelFromHash('#/oscillator?m=0'), null);
  assert.equal(modelFromHash('#/challenges/__proto__'), null);
});
