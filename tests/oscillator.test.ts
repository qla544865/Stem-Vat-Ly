import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SimulationClock } from '../src/simulations/clock.ts';
import {
  createOscillator,
  oscillatorDefaults,
  oscillatorLimits,
} from '../src/simulations/oscillator/physics.ts';
import type { OscillatorParams } from '../src/simulations/oscillator/physics.ts';

const model = (p: Partial<OscillatorParams> = {}) =>
  createOscillator({ ...oscillatorDefaults, ...p });
const near = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≠ ${expected}`);

test('dao động tự do lý tưởng giữ cơ năng và khớp nghiệm điều hòa', () => {
  const ideal = model({ b: 0, force: 0 });
  assert.equal(ideal.regime, 'ideal');
  for (let t = 0; t < 10; t += 0.01) {
    const state = ideal.state(t);
    near(state.x, 0.35 * Math.cos(4 * t));
    near(state.v, -1.4 * Math.sin(4 * t));
    near(state.energy, ideal.state(0).energy);
    assert.equal(state.drivingForce, 0);
  }
});

test('tắt dần phân loại đúng, đường bao hợp lệ và cơ năng không tăng', () => {
  for (const [b, regime] of [
    [1, 'under'],
    [8, 'critical'],
    [20, 'over'],
  ] as const) {
    const oscillator = model({ b });
    assert.equal(oscillator.regime, regime);
    let previous = Infinity;
    for (let t = 0; t < 10; t += 0.01) {
      const s = oscillator.state(t);
      assert.ok(s.energy <= previous + 1e-13);
      previous = s.energy;
      if (regime === 'under') assert.ok(Math.abs(s.x) <= s.envelope! + 1e-12);
      else assert.equal(s.envelope, null);
    }
  }
  near(model({ b: 8 }).state(1).x, 0.35 * 5 * Math.exp(-4));
  near(model({ b: 8 + 1e-7 }).state(1).x, model({ b: 8 - 1e-7 }).state(1).x, 1e-8);
});

test('biên độ xác lập, trạng thái đầu và đỉnh li độ dùng đúng công thức', () => {
  const driven = model({ mode: 'resonance', b: 2, omega: 3 });
  near(driven.omega0, 4);
  near(driven.peak!, Math.sqrt(14));
  near(driven.response(3)!, 2 / Math.hypot(7, 6));
  assert.ok(driven.response(driven.peak!)! > driven.response(driven.omega0)!);
  near(driven.state(0).x, 0.35);
  near(driven.state(0).v, 0);
  assert.notEqual(driven.state(0).x, driven.state(0).steadyX);
  near(driven.state(20).x, driven.state(20).steadyX!);
  assert.equal(model({ b: Math.sqrt(32) }).peak, null);
  assert.equal(model({ b: 10 }).peak, null);
});

test('cưỡng bức không cản tại và gần tần số riêng có nghiệm hữu hạn ở mọi mốc quan sát', () => {
  for (const t of [0, 0.3, 2, 14, 60]) {
    const oscillator = model({ mode: 'driven', b: 0, omega: 4 });
    assert.equal(oscillator.amplitude, null);
    assert.equal(oscillator.response(4), null);
    near(oscillator.state(t).x, 0.35 * Math.cos(4 * t) + (t * Math.sin(4 * t)) / 4);
    near(oscillator.state(t).v, -1.15 * Math.sin(4 * t) + t * Math.cos(4 * t));
    near(
      model({ mode: 'driven', b: 1e-12, omega: 4 - 1e-12 }).state(t).x,
      oscillator.state(t).x,
      1e-8,
    );
  }
});

test('nghiệm cưỡng bức thỏa phương trình và điều kiện đầu ở các biên slider', () => {
  for (const m of oscillatorLimits.m)
    for (const k of oscillatorLimits.k)
      for (const b of [0, 0.1, 40])
        for (const omega of [0, Math.sqrt(k / m), 12]) {
          const oscillator = model({ m, k, b, omega, mode: 'driven', force: 8, x0: 0.6 });
          near(oscillator.state(0).x, 0.6);
          near(oscillator.state(0).v, 0);
          for (const t of [0.1, 1, 10, 60]) {
            const s = oscillator.state(t);
            assert.ok(Object.values(s).every((value) => value === null || Number.isFinite(value)));
            const h = 1e-5;
            const before = oscillator.state(t - h);
            const after = oscillator.state(t + h);
            near((after.x - before.x) / (2 * h), s.v, 1e-5);
            near(
              (after.v - before.v) / (2 * h),
              (s.elasticForce + s.dampingForce + s.drivingForce) / m,
              1e-4,
            );
          }
        }
  for (const invalid of [{ m: 0 }, { k: 0 }, { b: -1 }, { omega: Infinity }, { force: NaN }])
    assert.throws(() => model(invalid), RangeError);
  assert.throws(() => model({ mode: 'resonance', b: 0 }), RangeError);
  assert.throws(() => model({ mode: 'driven', force: 0 }), RangeError);
  assert.throws(() => model().state(NaN), RangeError);
});

test('đổi tốc độ, tạm dừng và gián đoạn không làm lệch pha lực tại cùng t', () => {
  const oscillator = model({ mode: 'driven' });
  for (const speed of [0.5, 1, 2]) {
    const clock = new SimulationClock();
    clock.tick(0, speed, 2);
    for (let ms = 20; ms <= 1000 / speed; ms += 20) clock.tick(ms, speed, 2);
    const before = oscillator.state(clock.time);
    clock.suspend();
    clock.tick(30000, speed, 2);
    assert.deepEqual(oscillator.state(clock.time), before);
    for (let ms = 20; ms <= 1100 / speed; ms += 20) clock.tick(30000 + ms, speed, 2);
    assert.deepEqual(oscillator.state(clock.time), oscillator.state(2));
  }
});
