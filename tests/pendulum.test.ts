import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SimulationClock } from '../src/simulations/clock.ts';
import { modelFromHash, modelPath } from '../src/navigation.ts';
import {
  angularAcceleration,
  initialPendulumState,
  nonlinearPeriod,
  pendulumDefaults,
  pendulumEnergy,
  pendulumLimits,
  smallAnglePeriod,
  toRadians,
} from '../src/simulations/pendulum/physics.ts';
import type { PendulumParams } from '../src/simulations/pendulum/physics.ts';
import {
  emptyResults,
  fitLength,
  investigations,
  lengthMeasurements,
  MEASUREMENT_CYCLES,
  PendulumRun,
  recordTrial,
  trialParams,
} from '../src/simulations/pendulum/experiment.ts';

const near = (actual: number, expected: number, tolerance: number) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} vs ${expected} (±${tolerance})`);

function measure(params: PendulumParams) {
  const run = new PendulumRun(params, true);
  run.advanceTo(90);
  assert.equal(run.cycles, 10);
  assert.ok(run.t10 !== null);
  return run.t10 / 10;
}

describe('Vật lý con lắc đơn', () => {
  it('góc 1° tại l = 1 m cho T ≈ 2,007 s và khớp nghiệm phi tuyến', () => {
    const params = { ...pendulumDefaults, l: 1, alpha0: toRadians(1) };
    near(smallAnglePeriod(params), 2.007, 0.001);
    near(measure(params), smallAnglePeriod(params), 0.00005);
    near(measure(params), nonlinearPeriod(params), 1e-7);
  });

  it('khối lượng không ảnh hưởng, T tỉ lệ với √l và nghịch với √g', () => {
    const base = measure(pendulumDefaults);
    assert.equal(measure({ ...pendulumDefaults, m: 0.15 }), base);
    near(measure({ ...pendulumDefaults, l: 1.5 }) / base, Math.sqrt(3), 1e-6);
    near(measure({ ...pendulumDefaults, g: 19.6 }) / base, 1 / Math.sqrt(2), 1e-6);
  });

  it('góc 60° cho chu kỳ dài hơn gần đúng góc nhỏ khoảng 7,3%', () => {
    const params = { ...pendulumDefaults, alpha0: toRadians(60) };
    const measured = measure(params);
    near(measured, nonlinearPeriod(params), 1e-6);
    near(measured / smallAnglePeriod(params), 1.07318, 0.00001);
  });

  it('RK4 giữ cơ năng ở biên miền tham số và hai phía thả trong 100 chu kỳ', () => {
    for (const l of [pendulumLimits.l.min, pendulumLimits.l.max]) {
      for (const g of [pendulumLimits.g.min, pendulumLimits.g.max]) {
        for (const alpha0 of [pendulumLimits.alpha0.min, -pendulumLimits.alpha0.max]) {
          const params = { ...pendulumDefaults, l, g, alpha0 };
          const run = new PendulumRun(params);
          const period = nonlinearPeriod(params);
          const energy = pendulumEnergy(params, run.state);
          for (let i = 1; i <= 400; i++) {
            run.advanceTo((i * period) / 4);
            near(pendulumEnergy(params, run.state) / energy, 1, 2e-6);
          }
          near(measure(params), period, 1e-6);
        }
      }
    }
  });

  it('vận tốc bằng 0 ở biên, gia tốc luôn hướng về cân bằng', () => {
    const run = new PendulumRun(pendulumDefaults);
    const period = nonlinearPeriod(run.params);
    assert.equal(run.state.omega, 0);
    assert.ok(angularAcceleration(run.params, run.state.theta) < 0);
    run.advanceTo(period / 2);
    near(run.state.theta, -run.params.alpha0, 0.00002);
    near(run.state.omega, 0, 0.008);
    assert.ok(angularAcceleration(run.params, run.state.theta) > 0);
    assert.equal(Math.abs(angularAcceleration(run.params, 0)), 0);
  });

  it('từ chối dữ liệu ngoài giới hạn và không hữu hạn', () => {
    for (const overrides of [
      { l: 0 },
      { m: 0.3 },
      { g: Infinity },
      { alpha0: 0 },
      { alpha0: NaN },
      { alpha0: toRadians(61) },
    ]) {
      assert.throws(() => initialPendulumState({ ...pendulumDefaults, ...overrides }), RangeError);
    }
  });
});

describe('Đo và ghi số liệu con lắc đơn', () => {
  it('chỉ đếm lần trở về biên thả, không đếm vị trí cân bằng hoặc biên đối diện', () => {
    const run = new PendulumRun({ ...pendulumDefaults, alpha0: -pendulumDefaults.alpha0 }, true);
    const period = nonlinearPeriod(run.params);
    for (const [factor, cycles] of [
      [0, 0],
      [0.26, 0],
      [0.51, 0],
      [0.76, 0],
      [1.01, 1],
      [1.5, 1],
      [9.99, 9],
      [10.01, 10],
    ]) {
      run.advanceTo(factor * period);
      assert.equal(run.cycles, cycles);
      if (cycles < 10) assert.equal(run.t10, null);
    }
    const stopped = run.t10;
    assert.ok(stopped !== null);
    near(stopped, 10 * period, 1e-5);
    assert.equal(run.state.omega, 0);
    assert.equal(run.advanceTo(100), stopped);
    assert.equal(run.time, stopped);
    assert.equal(run.cycles, MEASUREMENT_CYCLES);
  });

  it('giữ t₁₀ khi thay đổi FPS, tốc độ, Pause/Resume và gián đoạn', () => {
    function play(fps: number, speed: number) {
      const clock = new SimulationClock();
      const run = new PendulumRun(pendulumDefaults, true);
      const interval = 1000 / fps;
      let timestamp = 0;
      clock.tick(timestamp, speed);
      while (clock.time < 2) run.advanceTo(clock.tick((timestamp += interval), speed));
      const pausedTime = clock.time;
      const pausedState = run.state;
      clock.suspend();
      run.advanceTo(clock.tick((timestamp += 3000), speed));
      run.advanceTo(clock.tick((timestamp += 500), speed));
      assert.equal(clock.time, pausedTime);
      assert.equal(run.state, pausedState);
      for (let i = 0; run.t10 === null && i < 10000; i++) {
        run.advanceTo(clock.tick((timestamp += interval), speed));
      }
      assert.ok(run.t10 !== null);
      return run.t10;
    }
    assert.equal(play(30, 0.5), play(144, 2));
    assert.equal(play(60, 1), play(144, 2));
  });

  it('reset hoặc đổi thông số khởi tạo phép đo mới và chặn ghi kết quả cũ/sớm', () => {
    const results = emptyResults();
    const run = new PendulumRun(trialParams('length', 40), true);
    run.advanceTo(2);
    assert.equal(recordTrial(results, 'length', 40, run), results);
    const reset = new PendulumRun(run.params);
    assert.equal(reset.cycles, 0);
    assert.equal(reset.time, 0);
    assert.equal(reset.t10, null);
    assert.deepEqual(reset.state, { theta: run.params.alpha0, omega: 0 });
    run.advanceTo(90);
    assert.equal(recordTrial(results, 'length', 50, run), results);
    assert.equal(recordTrial(results, 'length', 40, run).length[40], run.t10);
  });

  it('cấu hình phiếu thực hành có đủ mốc và chỉ thay đổi biến khảo sát', () => {
    assert.deepEqual(investigations.amplitude.values, [3, 6, 9, 18]);
    assert.deepEqual(investigations.mass.values, [50, 100, 150]);
    assert.deepEqual(investigations.length.values, [40, 50, 60]);
    assert.deepEqual(trialParams('amplitude', 18), {
      ...pendulumDefaults,
      alpha0: Math.asin(18 / 50),
    });
    assert.deepEqual(trialParams('mass', 150), { ...pendulumDefaults, m: 0.15 });
    assert.deepEqual(trialParams('length', 60), { ...pendulumDefaults, l: 0.6 });
    assert.throws(() => trialParams('amplitude', 19), RangeError);
  });

  it('bình phương chu kỳ và fit T²–l qua gốc dùng chiều dài SI', () => {
    const t10 = (meters: number) => 10 * 2 * Math.PI * Math.sqrt(meters / 9.8);
    const results = { 40: t10(0.4), 50: t10(0.5), 60: t10(0.6) };
    const point = lengthMeasurements(results)[0];
    assert.equal(point.meters, 0.4);
    near(point.squared, (results[40] / 10) ** 2, 1e-12);
    near(point.squared / 40, (4 * Math.PI ** 2) / 980, 1e-12);
    const fit = fitLength(results);
    assert.ok(fit);
    near(fit.slope, (4 * Math.PI ** 2) / 9.8, 1e-12);
    near(fit.g, 9.8, 1e-12);
    assert.equal(fitLength({}), null);
    assert.equal(fitLength({ 40: 0, 50: t10(0.5), 60: Infinity }), null);
  });
});

it('mở con lắc từ hash route mới và giữ alias của lò xo', () => {
  assert.equal(modelPath.pendulum, '#/pendulum');
  assert.equal(modelFromHash('#/pendulum'), 'pendulum');
  assert.equal(modelFromHash('#/spring'), 'hooke');
});
