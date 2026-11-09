import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { springState } from '../src/simulations/spring/physics.ts';
import { projectileState } from '../src/simulations/projectile/physics.ts';
import { SimulationClock } from '../src/simulations/clock.ts';
import { challenges, validateChallenge } from '../src/challenges/config.ts';

const near = (a: number, b: number, epsilon = 1e-9) =>
  assert.ok(Math.abs(a - b) < epsilon, `${a} ≠ ${b}`);
describe('Con lắc lò xo', () => {
  for (const [m, k] of [
    [0.1, 80],
    [1, 20],
    [4, 5],
    [2, 40],
  ]) {
    it(`chu kỳ và năng lượng với m=${m}, k=${k}`, () => {
      const p = { m, k, A: 0.3 },
        initial = springState(p, 0);
      near(initial.T, 2 * Math.PI * Math.sqrt(m / k));
      near(springState(p, initial.T).x, p.A);
      near(springState(p, initial.T / 4).x, 0);
      near(springState(p, initial.T / 2).x, -p.A);
      for (const t of [0, 0.1, 2, 17]) {
        const s = springState(p, t);
        near(s.kinetic + s.potential, s.E);
        near(s.F, m * s.a);
      }
    });
  }
  it('khối lượng tăng 4 lần thì chu kỳ tăng 2 lần', () =>
    near(
      springState({ m: 2, k: 20, A: 0.3 }, 0).T / springState({ m: 0.5, k: 20, A: 0.3 }, 0).T,
      2,
    ));
  it('từ chối đầu vào không hợp lệ', () => {
    for (const p of [
      { m: 0, k: 20, A: 0.3 },
      { m: 1, k: -1, A: 0.3 },
      { m: NaN, k: 20, A: 0.3 },
    ])
      assert.throws(() => springState(p, 0), RangeError);
  });
});
describe('Ném ngang', () => {
  for (const [h, v0, g] of [
    [20, 8, 9.81],
    [2, 25, 1.6],
    [50, 1, 20],
  ]) {
    it(`chạm đất chính xác với h=${h}, v₀=${v0}, g=${g}`, () => {
      const p = { h, v0, g },
        initial = projectileState(p, 0),
        end = projectileState(p, 1000);
      near(initial.fallTime, Math.sqrt((2 * h) / g));
      near(initial.range, v0 * initial.fallTime);
      near(end.y, h);
      near(end.x, end.range);
      assert.equal(end.landed, true);
      const middle = projectileState(p, initial.fallTime / 2);
      near(middle.y, h / 4);
      near(middle.vx, v0);
    });
  }
  it('vận tốc tăng 2 lần thì tầm xa tăng 2 lần, thời gian rơi giữ nguyên', () => {
    const first = projectileState({ h: 20, v0: 8, g: 9.81 }, 0),
      second = projectileState({ h: 20, v0: 16, g: 9.81 }, 0);
    near(second.range, first.range * 2);
    near(second.fallTime, first.fallTime);
  });
  it('từ chối h, g không dương và giá trị vô hạn', () => {
    for (const p of [
      { h: 0, v0: 8, g: 9.81 },
      { h: 20, v0: 8, g: 0 },
      { h: 20, v0: Infinity, g: 9.81 },
    ])
      assert.throws(() => projectileState(p, 0), RangeError);
  });
});
describe('Đồng hồ mô phỏng', () => {
  it('không phụ thuộc FPS', () => {
    for (const fps of [30, 60, 144]) {
      const clock = new SimulationClock();
      clock.tick(0, 1);
      for (let frame = 1; frame <= fps * 2; frame++) clock.tick((frame * 1000) / fps, 1);
      near(clock.time, 2);
    }
  });
  it('pause/resume và ẩn tab không cộng khoảng thời gian gián đoạn', () => {
    const clock = new SimulationClock();
    clock.tick(100, 1);
    for (let stamp = 200; stamp <= 1100; stamp += 100) clock.tick(stamp, 1);
    near(clock.time, 1);
    clock.suspend();
    clock.tick(100000, 1);
    near(clock.time, 1);
    for (let stamp = 100100; stamp <= 100500; stamp += 100) clock.tick(stamp, 1);
    near(clock.time, 1.5);
  });
  it('đổi tốc độ, reset và dừng đúng thời gian chạm đất', () => {
    const clock = new SimulationClock();
    clock.tick(0, 1);
    for (let stamp = 100; stamp <= 1000; stamp += 100) clock.tick(stamp, 1);
    clock.suspend();
    clock.tick(1000, 2);
    for (let stamp = 1100; stamp <= 1500; stamp += 100) clock.tick(stamp, 2);
    near(clock.time, 2);
    clock.tick(1700, 2, 2.25);
    near(clock.time, 2.25);
    clock.reset();
    near(clock.time, 0);
    clock.tick(9000, 0.5);
    for (let stamp = 9100; stamp <= 10000; stamp += 100) clock.tick(stamp, 0.5);
    near(clock.time, 0.5);
  });
});
describe('Bốn thử thách', () => {
  const find = (id: string) => challenges.find((c) => c.id === id)!;
  it('chu kỳ mục tiêu và biên dung sai', () => {
    const c = find('period');
    assert.equal(validateChallenge(c, 2), true);
    assert.equal(validateChallenge(c, 1.95), true);
    assert.equal(validateChallenge(c, 2.05), true);
    assert.equal(validateChallenge(c, 2.049), true);
    assert.equal(validateChallenge(c, 2.051), false);
  });
  it('cần dự đoán đúng và thực nghiệm tăng khối lượng 4 lần', () => {
    const c = find('mass');
    assert.equal(validateChallenge(c, 2, 2), true);
    assert.equal(validateChallenge(c, 1, 2), false);
    assert.equal(validateChallenge(c, 2, 4), false);
    assert.equal(validateChallenge(c, 2), false);
  });
  it('mục tiêu ném ngang', () => {
    const c = find('target');
    assert.equal(validateChallenge(c, 18.4), true);
    assert.equal(validateChallenge(c, 18.6), false);
  });
  it('tầm xa dự đoán và đầu vào trống', () => {
    const c = find('predict');
    assert.equal(validateChallenge(c, c.target, 16.15), true);
    assert.equal(validateChallenge(c, c.target, 20), false);
    assert.equal(validateChallenge(c, c.target), false);
    assert.equal(validateChallenge(c, NaN, 16.15), false);
  });
});
