import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  canCheckChallenge,
  challengeModel,
  challenges,
  predictionBeforeRun,
  validateChallenge,
  workSignScore,
} from '../src/challenges/config.ts';
import type { AttemptEvidence, ChallengeId } from '../src/challenges/config.ts';
import {
  areaFromHash,
  areaPath,
  challengeFromHash,
  challengePath,
  modelFromHash,
  modelPath,
} from '../src/navigation.ts';
import {
  catalog,
  defaultConfig,
  getParameters,
  isDynamic,
  modelsIn,
  parameterSpecs,
  updateParameter,
} from '../src/simulations/catalog.ts';
import type { Model } from '../src/simulations/catalog.ts';
import {
  CART_LENGTH,
  collisionDefaults,
  collisionPlan,
  collisionState,
  collisionTotals,
  TRACK_LENGTH,
} from '../src/simulations/collision/physics.ts';
import { energyDefaults, energyState, workState } from '../src/simulations/energy/physics.ts';
import { SimulationClock } from '../src/simulations/clock.ts';

const near = (actual: number, expected: number) =>
  assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} vs ${expected}`);
const base = { ...collisionDefaults, v1: 2, v2: 0 };

describe('Va chạm một chiều', () => {
  it('xe cùng khối lượng trao đổi vận tốc và giữ động lượng, động năng khi đàn hồi', () => {
    const plan = collisionPlan(base);
    const { contact, before } = plan;
    assert.ok(contact);
    near(contact.time, (base.x2 - base.x1 - CART_LENGTH) / 2);
    near(contact.v1, 0);
    near(contact.v2, 2);
    const after = collisionTotals(base, contact.v1, contact.v2);
    near(before.momentum, after.momentum);
    near(before.kinetic, after.kinetic);
  });

  it('va chạm mềm giữ khoảng cách tiếp xúc và làm giảm động năng', () => {
    const p = { ...base, kind: 'inelastic' } as const;
    const plan = collisionPlan(p);
    assert.ok(plan.contact);
    near(plan.contact.v1, 1);
    near(plan.contact.v2, 1);
    const after = collisionTotals(p, plan.contact.v1, plan.contact.v2);
    near(after.momentum, plan.before.momentum);
    near(plan.before.kinetic - after.kinetic, 1);
    for (const time of [plan.contact.time, plan.contact.time + 0.1, plan.end, plan.end + 1]) {
      const s = collisionState(plan, time);
      near(s.x2 - s.x1, CART_LENGTH);
      near(s.v1, s.v2);
    }
  });

  it('va chạm đối đầu với chênh khối lượng lớn bảo toàn đúng các đại lượng', () => {
    for (const kind of ['elastic', 'inelastic'] as const) {
      const p = { ...base, m1: 0.1, m2: 5, v1: 10, v2: -8, kind };
      const plan = collisionPlan(p);
      assert.ok(plan.contact);
      const after = collisionTotals(p, plan.contact.v1, plan.contact.v2);
      near(after.momentum, plan.before.momentum);
      if (kind === 'elastic') near(after.kinetic, plan.before.kinetic);
      else assert.ok(after.kinetic < plan.before.kinetic);
    }
  });

  it('hai xe đuổi nhau gặp đúng tại mép, kể cả khi bỏ qua nhiều frame', () => {
    const p = { ...base, v1: 6, v2: 2 };
    const plan = collisionPlan(p);
    assert.ok(plan.contact);
    const t = plan.contact.time;
    assert.equal(collisionState(plan, t - 0.1).collided, false);
    const at = collisionState(plan, t);
    assert.equal(at.collided, true);
    near(at.x2 - at.x1, CART_LENGTH);
    near(collisionState(plan, t + 0.5).x2, at.x2 + at.v2 * 0.5);
    assert.ok(collisionState(plan, t + 0.5).x2 - collisionState(plan, t + 0.5).x1 > CART_LENGTH);
  });

  it('xe đi xa nhau, cùng vận tốc hoặc gặp ngoài thời gian quan sát đều không đổi vận tốc', () => {
    for (const [v1, v2] of [
      [-2, 2],
      [1, 1],
      [0.1, 0],
      [0, 0],
    ]) {
      const plan = collisionPlan({ ...base, v1, v2 });
      assert.equal(plan.contact, null);
      const last = collisionState(plan, 100);
      assert.deepEqual([last.v1, last.v2, last.collided], [v1, v2, false]);
    }
  });

  it('cụm đứng yên sau va chạm và xe chạm biên ray không bật lại', () => {
    const still = collisionPlan({ ...base, v1: 2, v2: -1, m2: 2, kind: 'inelastic' });
    assert.ok(still.contact);
    assert.deepEqual(collisionState(still, still.contact.time), collisionState(still, 100));
    const edge = collisionPlan(base);
    const last = collisionState(edge, 100);
    near(last.x2 + CART_LENGTH / 2, TRACK_LENGTH);
    near(last.v2, 2);
    assert.deepEqual(last, collisionState(edge, edge.end));
  });

  it('pause, resume, reset và tốc độ dùng cùng thời điểm tiếp xúc giải tích', () => {
    const plan = collisionPlan(base);
    assert.ok(plan.contact);
    const clock = new SimulationClock();
    clock.tick(0, 1, plan.end);
    for (let i = 100; i <= 2500; i += 100) clock.tick(i, 1, plan.end);
    clock.suspend();
    assert.equal(collisionState(plan, clock.tick(20_000, 2, plan.end)).collided, false);
    assert.equal(collisionState(plan, clock.tick(20_240, 2, plan.end)).collided, true);
    clock.reset();
    assert.equal(collisionState(plan, clock.time).collided, false);
    near(plan.contact.time, 2.9);
  });

  it('từ chối khối lượng, thời gian, xe chồng nhau và tọa độ sai', () => {
    for (const values of [
      { m1: 0 },
      { v2: NaN },
      { x1: base.x2 - 0.2 },
      { x1: -1 },
      { x2: TRACK_LENGTH },
    ]) {
      assert.throws(() => collisionPlan({ ...base, ...values }), RangeError);
    }
    assert.throws(() => collisionState(collisionPlan(base), Infinity), RangeError);
  });
});

describe('Công và bảo toàn cơ năng', () => {
  it('10 N trên 5 m ở góc 0°, 90°, 180° cho 50 J, 0 J, −50 J', () => {
    for (const [alpha, value, sign] of [
      [0, 50, 1],
      [Math.PI / 2, 0, 0],
      [Math.PI, -50, -1],
    ]) {
      const s = workState({ force: 10, displacement: 5, alpha });
      near(s.work, value);
      assert.equal(s.sign, sign);
    }
    assert.equal(workState({ force: 0, displacement: 5, alpha: Math.PI }).work, 0);
    assert.equal(workState({ force: 10, displacement: 0, alpha: Math.PI }).work, 0);
  });

  it('vật 1 kg thả từ 5 m có 50 J và tới chân dốc ở 10 m/s', () => {
    const p = { ...energyDefaults, h: 5 };
    const start = energyState(p, 0);
    assert.deepEqual([start.kinetic, start.potential, start.total], [0, 50, 50]);
    const last = energyState(p, start.end + 100);
    near(last.t, start.end);
    near(last.distance, start.length);
    assert.deepEqual(
      [last.height, last.potential, last.speed, last.kinetic, last.total],
      [0, 0, 10, 50, 50],
    );
  });

  it('giữ cơ năng suốt hành trình và tốc độ cuối độc lập với m và β', () => {
    const times = new Set<number>();
    for (const m of [0.1, 1, 4])
      for (const beta of [Math.PI / 12, Math.PI / 3]) {
        const p = { ...energyDefaults, h: 5, m, beta };
        const start = energyState(p, 0);
        times.add(start.end);
        for (const fraction of [0, 0.1, 0.25, 0.5, 0.75, 1]) {
          const s = energyState(p, start.end * fraction);
          near(s.total, m * p.g * p.h);
          near(s.speed ** 2, 2 * p.g * (p.h - s.height));
        }
        near(energyState(p, start.end).speed, 10);
      }
    assert.equal(times.size, 2);
  });

  it('từ chối lực âm, góc ngoài miền, độ cao 0 và dốc nằm ngang', () => {
    assert.throws(() => workState({ force: -1, displacement: 1, alpha: 0 }), RangeError);
    assert.throws(() => workState({ force: 1, displacement: 1, alpha: 2 * Math.PI }), RangeError);
    assert.throws(() => energyState({ ...energyDefaults, h: 0 }, 0), RangeError);
    assert.throws(() => energyState({ ...energyDefaults, beta: 0 }, 0), RangeError);
    assert.throws(() => energyState(energyDefaults, NaN), RangeError);
  });
});

const challenge = (id: ChallengeId) => challenges.find((c) => c.id === id)!;
const empty: AttemptEvidence = {
  interacted: false,
  hasRun: false,
  time: 0,
  completed: false,
  nonzeroForce: false,
};
const after = { ...empty, hasRun: true, time: 3, collided: true, completed: true };

describe('Challenge và phân loại Phase 2D', () => {
  it('ba bài va chạm cần tiếp xúc, có đáp án đúng và sai', () => {
    for (const id of ['collision-predict', 'collision-stop', 'collision-conserve'] as const) {
      const c = challenge(id);
      assert.equal(canCheckChallenge(c, { ...after, answer: 1, collided: false }), false);
      assert.equal(canCheckChallenge(c, { ...after, answer: 1, completed: false }), true);
    }
    const predict = challenge('collision-predict');
    assert.equal(predictionBeforeRun(predict), true);
    assert.equal(canCheckChallenge(predict, after), false);
    assert.equal(validateChallenge(predict, -2 / 3, -0.67), true);
    assert.equal(validateChallenge(predict, -2 / 3, 0.67), false);
    const stop = challenge('collision-stop');
    assert.equal(validateChallenge(stop, 0.05), true);
    assert.equal(validateChallenge(stop, -0.06), false);
    const conserve = challenge('collision-conserve');
    assert.equal(validateChallenge(conserve, 0, 1), true);
    assert.equal(validateChallenge(conserve, 0, 2), false);
  });

  it('bài Công cần thay tham số hoặc chọn đủ ba dấu, không cần Play', () => {
    const target = challenge('work-target');
    assert.equal(canCheckChallenge(target, empty), false);
    assert.equal(canCheckChallenge(target, { ...empty, interacted: true }), true);
    assert.equal(
      validateChallenge(target, workState({ force: 20, displacement: 5, alpha: 0 }).work),
      true,
    );
    assert.equal(validateChallenge(target, -100), false);
    const signs = challenge('work-signs');
    assert.equal(canCheckChallenge(signs, empty), false);
    assert.equal(canCheckChallenge(signs, { ...empty, classified: true }), true);
    assert.equal(validateChallenge(signs, workSignScore([1, 0, -1])), true);
    assert.equal(validateChallenge(signs, workSignScore([1, -1, 0])), false);
  });

  it('hai bài cơ năng chờ tới chân dốc và dự đoán phải có trước khi kiểm tra', () => {
    for (const id of ['energy-height', 'energy-predict'] as const) {
      const c = challenge(id);
      assert.equal(canCheckChallenge(c, { ...after, completed: false, answer: 1 }), false);
      assert.equal(canCheckChallenge(c, { ...after, answer: 1 }), true);
    }
    const predict = challenge('energy-predict');
    assert.equal(predictionBeforeRun(predict), true);
    assert.equal(canCheckChallenge(predict, after), false);
    assert.equal(validateChallenge(predict, 0, 1), true);
    assert.equal(validateChallenge(predict, 0, 3), false);
    assert.equal(validateChallenge(challenge('energy-height'), 10), true);
    assert.equal(validateChallenge(challenge('energy-height'), 9.9), false);
  });

  it('catalog phân loại ba minh họa tĩnh, sáu thí nghiệm và giữ các hash cũ', () => {
    assert.deepEqual(modelsIn('theory'), ['hooke', 'torque', 'work']);
    assert.equal(modelsIn('experiments').length, 6);
    assert.equal(isDynamic('work'), false);
    assert.equal(isDynamic('pendulum'), true);
    assert.equal(modelFromHash('#/spring'), 'hooke');
    assert.equal(modelFromHash('#/spring/oscillation'), 'spring');
    assert.deepEqual(Object.keys(catalog).sort(), Object.keys(modelPath).sort());
    assert.equal(areaFromHash(areaPath.theory), 'theory');
    assert.equal(areaFromHash(areaPath.challenges), 'challenges');
  });

  it('15 thử thách có deep link duy nhất và chưa bài nào đủ điều kiện lúc mở', () => {
    assert.equal(challenges.length, 15);
    assert.equal(new Set(challenges.map(({ id }) => id)).size, 15);
    for (const c of challenges) {
      assert.equal(challengeFromHash(challengePath(c.id)), c);
      assert.equal(modelFromHash(challengePath(c.id)), challengeModel(c));
      assert.equal(canCheckChallenge(c, empty), false);
    }
    assert.equal(modelFromHash('#/challenges/unknown'), null);
  });

  it('biên slider mới luôn hợp lệ và các góc UI đổi sang radian', () => {
    for (const model of ['collision', 'work', 'energy'] as const satisfies readonly Model[]) {
      for (const spec of parameterSpecs[model])
        for (const value of [spec.min, spec.max]) {
          const config = updateParameter(defaultConfig(model), spec.key, value);
          near(getParameters(config).find(({ key }) => key === spec.key)!.value, value);
          if (config.kind === 'collision')
            assert.ok(Number.isFinite(collisionPlan(config.params).end));
          if (config.kind === 'energy')
            assert.ok(Number.isFinite(energyState(config.params, 0).end));
          if (config.kind === 'work') assert.ok(Number.isFinite(workState(config.params).work));
        }
    }
  });
});
