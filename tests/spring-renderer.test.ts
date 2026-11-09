import { it } from 'node:test';
import assert from 'node:assert/strict';
import { drawSpring } from '../src/simulations/spring/renderer.ts';
import { springState } from '../src/simulations/spring/physics.ts';

// Observe the velocity arrow actually sent to Canvas, including its direction.
function drawnVelocity(time: number, width = 800, amplitude = 0.6) {
  let path: number[][] = [],
    length = 0;
  const noop = () => {};
  const context = {
    strokeStyle: '',
    lineWidth: 1,
    beginPath() {
      path = [];
    },
    moveTo(x: number, y: number) {
      path.push([x, y]);
    },
    lineTo(x: number, y: number) {
      path.push([x, y]);
    },
    stroke() {
      if (this.strokeStyle === '#e5a148') length = path[1][0] - path[0][0];
    },
    createLinearGradient() {
      return { addColorStop: noop };
    },
    setLineDash: noop,
    fillRect: noop,
    roundRect: noop,
    fill: noop,
    fillText: noop,
    closePath: noop,
  };
  drawSpring(
    context as unknown as CanvasRenderingContext2D,
    width,
    335,
    { m: 0.1, k: 80, A: amplitude },
    time,
    true,
  );
  return length;
}

it('vector tăng liên tục từ biên đến VTCB, giảm về biên, đổi hướng đúng, kể cả vận tốc lớn', () => {
  const { T } = springState({ m: 0.1, k: 80, A: 0.6 }, 0);
  for (const width of [320, 800]) {
    const peak = Math.abs(drawnVelocity(T / 4, width));
    assert.ok(peak > 0);
    assert.equal(drawnVelocity(0, width), 0);
    let previous = 0;
    for (let i = 1; i <= 12; i++) {
      const length = drawnVelocity((T * i) / 48, width);
      assert.ok(length < 0, 'đi từ biên dương đến VTCB phải hướng sang trái');
      assert.ok(Math.abs(length) > previous, 'không được bão hòa trước VTCB');
      assert.ok(Math.abs(Math.abs(length) / peak - Math.sin((Math.PI * i) / 24)) < 1e-9);
      previous = Math.abs(length);
    }
    for (let i = 13; i < 24; i++) {
      const length = Math.abs(drawnVelocity((T * i) / 48, width));
      assert.ok(length < previous, 'từ VTCB đến biên phải ngắn dần');
      previous = length;
    }
    assert.equal(drawnVelocity(T / 2, width), 0);
    assert.ok(
      Math.abs(drawnVelocity((T * 3) / 4, width) - peak) < 1e-9,
      'qua VTCB chiều ngược lại phải hướng sang phải',
    );
  }
});

it('biên độ bằng 0 không vẽ vector vận tốc', () => {
  assert.equal(drawnVelocity(1, 800, 0), 0);
});
