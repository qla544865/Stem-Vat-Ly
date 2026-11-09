import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { hookeState } from '../src/simulations/spring/hooke.ts';
import { springState } from '../src/simulations/spring/physics.ts';
import { torqueState } from '../src/simulations/torque/physics.ts';
import { circularState } from '../src/simulations/circular/physics.ts';
import { SimulationClock } from '../src/simulations/clock.ts';
import { canCheckChallenge, challenges, validateChallenge } from '../src/challenges/config.ts';
import type { AttemptEvidence } from '../src/challenges/config.ts';
import {
  defaultConfig,
  getParameters,
  parameterSpecs,
  updateParameter,
} from '../src/simulations/catalog.ts';
import type { Model } from '../src/simulations/catalog.ts';
import { modelFromHash, modelPath } from '../src/navigation.ts';

const near = (a: number, b: number, epsilon = 1e-9) =>
  assert.ok(Math.abs(a - b) <= epsilon, `${a} ≠ ${b}`);
describe('Hooke tĩnh', () => {
  it('k = 100 N/m, F = 10 N: Δl = 0,1 m; lực đàn hồi ngược chiều', () => {
    const s = hookeState({ k: 100, externalForce: 10 });
    near(s.deformation, 0.1);
    near(s.length, 1.1);
    near(s.elasticForce, -10);
  });
  it('ngoại lực tăng gấp đôi làm biến dạng tăng gấp đôi', () => {
    near(hookeState({ k: 100, externalForce: 20 }).deformation, 0.2);
  });
  it('độ cứng tăng gấp đôi làm biến dạng giảm một nửa', () => {
    near(hookeState({ k: 200, externalForce: 10 }).deformation, 0.05);
  });
  it('nén có dấu âm và F = 0 không làm biến dạng', () => {
    const s = hookeState({ k: 100, externalForce: -10 });
    near(s.deformation, -0.1);
    near(s.length, 0.9);
    near(s.elasticForce, 10);
    near(hookeState({ k: 100, externalForce: 0 }).deformation, 0);
  });
  it('từ chối k không dương, dữ liệu không hữu hạn, biến dạng ngoài giới hạn', () => {
    for (const p of [
      { k: 0, externalForce: 10 },
      { k: 100, externalForce: NaN },
      { k: Infinity, externalForce: 10 },
      { k: 40, externalForce: -13 },
    ])
      assert.throws(() => hookeState(p), RangeError);
  });
});
describe('Dao động có pha', () => {
  const p = { m: 1, k: 4 * Math.PI ** 2, A: 0.3, phi: 0 };
  it('m = 1 kg, k = 4π² N/m: T = 1 s, f = 1 Hz', () => {
    const s = springState(p, 0);
    near(s.T, 1);
    near(s.frequency, 1);
  });
  it('ở biên v = 0, |a| cực đại; tại cân bằng |v| cực đại, a = 0', () => {
    const edge = springState(p, 0),
      center = springState(p, 0.25);
    near(edge.v, 0);
    near(Math.abs(edge.a), p.A * edge.omega ** 2);
    near(center.a, 0);
    near(Math.abs(center.v), p.A * edge.omega);
  });
  it('pha π/2 bắt đầu tại cân bằng và chuyển động theo chiều âm', () => {
    const s = springState({ ...p, phi: Math.PI / 2 }, 0);
    near(s.x, 0);
    assert.ok(s.v < 0);
    near(s.a, 0);
  });
  it('pha không đổi chu kỳ và năng lượng', () => {
    const first = springState(p, 0),
      shifted = springState({ ...p, phi: -Math.PI }, 2.3);
    near(first.T, shifted.T);
    near(first.E, shifted.kinetic + shifted.potential);
    assert.throws(() => springState({ ...p, phi: Infinity }, 0), RangeError);
  });
});
describe('Moment lực tĩnh', () => {
  it('20 × 1 = 10 × 2 = 20 N·m: cân bằng', () => {
    const s = torqueState({ F1: 20, d1: 1, F2: 10, d2: 2 });
    near(s.M1, 20);
    near(s.M2, 20);
    near(s.net, 0);
    assert.equal(s.direction, 'balanced');
  });
  it('nhận diện đúng hai xu hướng quay', () => {
    assert.equal(torqueState({ F1: 20, d1: 1, F2: 10, d2: 1 }).direction, 'ccw');
    assert.equal(torqueState({ F1: 20, d1: 1, F2: 30, d2: 1 }).direction, 'cw');
  });
  it('cánh tay đòn bằng 0 gây moment bằng 0', () => {
    const s = torqueState({ F1: 50, d1: 0, F2: 0, d2: 3 });
    near(s.M1, 0);
    near(s.M2, 0);
    assert.ok(s.balanced);
  });
  it('từ chối khoảng cách âm, vượt thanh, lực âm và dữ liệu không hữu hạn', () => {
    const p = { F1: 20, d1: 1, F2: 10, d2: 2 };
    for (const invalid of [{ d1: -0.1 }, { d2: 3.1 }, { F2: -1 }, { F1: Infinity }, { d1: NaN }])
      assert.throws(() => torqueState({ ...p, ...invalid }), RangeError);
  });
});
describe('Chuyển động tròn và hình chiếu', () => {
  const p = { r: 2, omega: 3, m: 1, phi: 0 };
  it('r = 2, ω = 3, m = 1: v = 6; a = 18; F = 18', () => {
    const s = circularState(p, 0);
    near(s.speed, 6);
    near(s.acceleration, 18);
    near(s.force, 18);
  });
  it('sau T/4 vật ở góc 90°, hình chiếu bằng 0', () => {
    const s = circularState(p, circularState(p, 0).T / 4);
    near(s.angle, Math.PI / 2);
    near(s.x, 0);
    near(s.y, 2);
    near(s.projection, 0);
  });
  it('v tiếp tuyến, a hướng vào tâm, độ lớn không đổi tại mọi pha', () => {
    for (const t of [0, 0.3, 1, 8.4]) {
      const s = circularState(p, t);
      near(s.x * s.vx + s.y * s.vy, 0);
      assert.ok(s.x * s.ax + s.y * s.ay < 0);
      near(Math.hypot(s.vx, s.vy), 6);
      near(Math.hypot(s.ax, s.ay), 18);
    }
  });
  it('hình chiếu trùng với lò xo cùng ω, A = r và pha, tại mọi thời điểm', () => {
    for (const phi of [0, Math.PI / 2, -Math.PI])
      for (const t of [0, 0.1, 1, 10]) {
        const circular = circularState({ ...p, phi }, t);
        const spring = springState({ m: 1, k: 9, A: 2, phi }, t);
        near(circular.projection, spring.x);
        near(circular.projectionVelocity, spring.v);
      }
  });
  it('từ chối r, m, ω không dương và mọi dữ liệu không hữu hạn', () => {
    for (const invalid of [{ r: 0 }, { m: -1 }, { omega: 0 }, { phi: NaN }, { r: Infinity }])
      assert.throws(() => circularState({ ...p, ...invalid }, 0), RangeError);
  });
});
describe('Challenge giai đoạn 1', () => {
  const find = (id: string) => challenges.find((c) => c.id === id)!;
  const empty: AttemptEvidence = {
    interacted: false,
    hasRun: false,
    time: 0,
    completed: false,
    nonzeroForce: false,
  };
  it('không bài nào hoàn thành ngay khi mở', () => {
    for (const c of challenges) assert.equal(canCheckChallenge(c, empty), false, c.id);
  });
  it('độ cứng bí mật: đúng/sai, dung sai ±5%, không chấp nhận phép đo F = 0', () => {
    const c = find('secret');
    assert.equal(validateChallenge(c, 80, 80), true);
    assert.equal(validateChallenge(c, 80, 76), true);
    assert.equal(validateChallenge(c, 80, 84), true);
    assert.equal(validateChallenge(c, 80, 85), false);
    assert.equal(validateChallenge(c, 80), false);
    assert.equal(canCheckChallenge(c, { ...empty, interacted: true, answer: 80 }), false);
    assert.equal(
      canCheckChallenge(c, { ...empty, interacted: true, nonzeroForce: true, answer: 80 }),
      true,
    );
  });
  it('cân bằng thanh: đúng/sai, biên dung sai và cần điều chỉnh trước', () => {
    const c = find('balance');
    assert.equal(validateChallenge(c, 0), true);
    assert.equal(validateChallenge(c, 0.1), true);
    assert.equal(validateChallenge(c, 0.11), false);
    assert.equal(canCheckChallenge(c, { ...empty, interacted: true }), true);
  });
  it('gia tốc hướng tâm: đúng/sai và cần chạy', () => {
    const c = find('centripetal');
    assert.equal(validateChallenge(c, 18), true);
    assert.equal(validateChallenge(c, 17.8), true);
    assert.equal(validateChallenge(c, 17.7), false);
    assert.equal(canCheckChallenge(c, { ...empty, interacted: true }), false);
    assert.equal(canCheckChallenge(c, { ...empty, hasRun: true, time: 0.1 }), true);
  });
  it('dự đoán hình chiếu: khóa kiểm tra trước T/4, đáp án đúng và sai', () => {
    const c = find('projection');
    assert.equal(validateChallenge(c, 1e-16, 0), true);
    assert.equal(validateChallenge(c, 0, 1), false);
    assert.equal(validateChallenge(c, 0), false);
    assert.equal(canCheckChallenge(c, { ...empty, hasRun: true, time: 0.1, answer: 0 }), false);
    assert.equal(
      canCheckChallenge(c, { ...empty, hasRun: true, time: 0.8, answer: 0, completed: true }),
      true,
    );
  });
});
describe('Đồng hồ, thông số và điều hướng', () => {
  it('bỏ qua bước nhảy sau khi main thread bị treo', () => {
    const clock = new SimulationClock();
    clock.tick(0, 1);
    clock.tick(100, 1);
    near(clock.time, 0.1);
    clock.tick(10000, 1);
    near(clock.time, 0.1);
    clock.tick(10100, 1);
    near(clock.time, 0.2);
  });
  it('giữ nguyên thời gian vật lý ở thời điểm kết thúc T/4', () => {
    const clock = new SimulationClock(),
      end = Math.PI / 4;
    clock.tick(0, 2);
    for (let stamp = 100; stamp <= 600; stamp += 100) clock.tick(stamp, 2, end);
    near(clock.time, end);
  });
  it('chỉ đổi độ sang radian tại UI, giữ các đầu vào trong giới hạn', () => {
    const c = updateParameter(defaultConfig('spring'), 'phi', 90);
    if (c.kind !== 'spring') throw new Error('Sai model');
    near(c.params.phi!, Math.PI / 2);
    near(getParameters(c).find((p) => p.key === 'phi')!.value, 90);
    assert.equal(updateParameter(c, 'm', Infinity), c);
    const bounded = updateParameter(c, 'm', -10);
    if (bounded.kind === 'spring') near(bounded.params.m, 0.1);
  });
  it('tất cả biên slider tạo ra trạng thái vật lý hữu hạn', () => {
    for (const model of Object.keys(parameterSpecs) as Model[]) {
      for (const spec of parameterSpecs[model])
        for (const value of [spec.min, spec.max]) {
          const c = updateParameter(defaultConfig(model), spec.key, value);
          const state =
            c.kind === 'hooke'
              ? hookeState(c.params)
              : c.kind === 'spring'
                ? springState(c.params, 0)
                : c.kind === 'circular'
                  ? circularState(c.params, 0)
                  : c.kind === 'torque'
                    ? torqueState(c.params)
                    : null;
          if (state)
            for (const item of Object.values(state))
              if (typeof item === 'number')
                assert.ok(Number.isFinite(item), `${model}/${spec.key}`);
        }
    }
  });
  it('hash routes dùng được với mọi base path, không cần server routing', () => {
    for (const [model, path] of Object.entries(modelPath)) assert.equal(modelFromHash(path), model);
    assert.equal(modelFromHash('#/spring'), 'hooke');
    assert.equal(modelFromHash(''), null);
    assert.equal(modelFromHash('#/unknown'), null);
  });
});
