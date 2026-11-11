import { arrow, ink, label, line, teal } from '../drawing.ts';
import { efficiencyState, forceMax, forceState, inputMax, workMax } from './physics.ts';
import type { EfficiencyParams, ForceParams, PowerParams } from './physics.ts';

const blue = '#2678ad';
const gold = '#a56725';

export function drawForces(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: ForceParams,
  components: boolean,
  annotations: boolean,
) {
  const f = forceState(params);
  const ox = w / 2;
  const oy = h * 0.55;
  const span = Math.min(w * 0.42, h * 0.32);
  const scale = span / (2 * forceMax);
  const px = (x: number) => ox + x * scale;
  const py = (y: number) => oy - y * scale;
  arrow(ctx, ox - span - 12, oy, 2 * span + 24, 0, '#78958b');
  arrow(ctx, ox, oy + span + 12, 0, -2 * span - 24, '#78958b');
  line(ctx, px(f.first.x), py(f.first.y), px(f.x), py(f.y), gold, [5, 4]);
  line(ctx, px(f.second.x), py(f.second.y), px(f.x), py(f.y), blue, [5, 4]);
  if (components) {
    for (const [vector, color] of [
      [f.first, blue],
      [f.second, gold],
      [f, teal],
    ] as const) {
      line(ctx, px(vector.x), oy, px(vector.x), py(vector.y), color, [2, 4]);
      line(ctx, ox, py(vector.y), px(vector.x), py(vector.y), color, [2, 4]);
    }
  }
  arrow(ctx, ox, oy, f.first.x * scale, -f.first.y * scale, blue);
  arrow(ctx, ox, oy, f.second.x * scale, -f.second.y * scale, gold);
  arrow(ctx, ox, oy, f.x * scale, -f.y * scale, teal);
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(ox, oy, 3, 0, 2 * Math.PI);
  ctx.fill();
  if (annotations) {
    label(ctx, 'O', ox - 12, oy + 15);
    label(ctx, 'x', ox + span + 18, oy + 14);
    label(ctx, 'y', ox + 12, oy - span - 10);
    label(ctx, 'F₁', ox - 56, h - 16, blue);
    label(ctx, 'F₂', ox, h - 16, gold);
    label(ctx, 'R', ox + 56, h - 16, teal);
  }
}

function drawBars(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  rows: {
    label: string;
    value: number;
    text: string;
    color: string;
  }[],
  maximum: number,
  start: number,
) {
  const left = 22;
  const width = w - 44;
  rows.forEach((row, i) => {
    const y = h * start + i * 52;
    label(ctx, row.label, left, y - 7, ink, 'left');
    label(ctx, row.text, w - left, y - 7, ink, 'right');
    ctx.fillStyle = '#e0ebe3';
    ctx.fillRect(left, y, width, 14);
    ctx.fillStyle = row.color;
    ctx.fillRect(left, y, (width * row.value) / maximum, 14);
  });
}

export function drawPower(ctx: CanvasRenderingContext2D, w: number, h: number, p: PowerParams) {
  drawBars(
    ctx,
    w,
    h,
    [
      { label: 'Công của máy A', value: p.work, text: `${p.work} J`, color: teal },
      { label: 'Công của máy B', value: p.work, text: `${p.work} J`, color: blue },
    ],
    workMax,
    0.23,
  );
  drawBars(
    ctx,
    w,
    h,
    [
      { label: 'Thời gian máy A', value: p.t1, text: `${p.t1} s`, color: teal },
      { label: 'Thời gian máy B', value: p.t2, text: `${p.t2} s`, color: blue },
    ],
    Math.max(p.t1, p.t2),
    0.63,
  );
}

export function drawEfficiency(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: EfficiencyParams,
) {
  const { lost } = efficiencyState(p);
  drawBars(
    ctx,
    w,
    h,
    [
      { label: 'Công đầu vào', value: p.input, text: `${p.input} J`, color: blue },
      { label: 'Công có ích', value: p.useful, text: `${p.useful} J`, color: teal },
      { label: 'Công hao phí', value: lost, text: `${lost} J`, color: gold },
    ],
    inputMax,
    0.31,
  );
}
