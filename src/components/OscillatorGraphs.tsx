import { useEffect, useMemo, useRef } from 'react';
import type { Oscillator, OscillatorParams } from '../simulations/oscillator/physics.ts';
import { oscillatorLimits } from '../simulations/oscillator/physics.ts';
import type { SubscribeFrame } from '../simulations/useSimulation.ts';

type Point = { x: number; y: number };
type Trace = { points: Point[]; color: string; dash?: string };
type Reference = { x: number; color: string; label: string };
const teal = '#0b8f82';
const purple = '#8856ad';
const blue = '#2678ad';
const gold = '#a56725';
const tick = (value: number) => Number(value.toPrecision(3)).toString();

function Plot({
  traces,
  marker,
  subscribe,
  references = [],
  xLabel,
  yLabel,
}: {
  traces: Trace[];
  marker?: { at: (t: number) => Point; time: number };
  subscribe?: SubscribeFrame;
  references?: Reference[];
  xLabel: string;
  yLabel: string;
}) {
  const dot = useRef<SVGCircleElement>(null);
  const chart = useMemo(() => {
    const points = traces.flatMap((trace) => trace.points);
    const first = points[0].x;
    const last = points.at(-1)!.x;
    const min = Math.min(0, ...points.map((p) => p.y));
    const max = Math.max(min + 0.001, ...points.map((p) => p.y));
    const px = (x: number) =>
      78 + ((Math.min(last, Math.max(first, x)) - first) / (last - first)) * 620;
    const py = (y: number) => 192 - ((Math.min(max, Math.max(min, y)) - min) / (max - min)) * 150;
    const paths = traces.map(({ points, ...style }) => ({
      ...style,
      d: points
        .map(({ x, y }, i) => `${i ? 'L' : 'M'}${px(x).toFixed(2)},${py(y).toFixed(2)}`)
        .join(' '),
    }));
    return { first, last, min, max, px, py, paths };
  }, [traces]);
  const sample = marker?.at;
  useEffect(() => {
    if (!subscribe || !sample) return;
    return subscribe((time) => {
      const value = sample(time);
      dot.current?.setAttribute('cx', String(chart.px(value.x)));
      dot.current?.setAttribute('cy', String(chart.py(value.y)));
    });
  }, [chart, sample, subscribe]);
  const point = marker?.at(marker.time);

  return (
    <svg
      className="graph phase3-graph"
      viewBox="0 0 760 245"
      role="img"
      aria-label={`${yLabel} theo ${xLabel}`}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const x = chart.first + ((chart.last - chart.first) * i) / 4;
        const y = chart.min + ((chart.max - chart.min) * i) / 4;
        return (
          <g key={i}>
            <line x1="78" x2="698" y1={chart.py(y)} y2={chart.py(y)} stroke="#dce8df" />
            <line x1={chart.px(x)} x2={chart.px(x)} y1="42" y2="192" stroke="#dce8df" />
            <text x="68" y={chart.py(y) + 5} textAnchor="end">
              {tick(y)}
            </text>
            <text x={chart.px(x)} y="215" textAnchor="middle">
              {tick(x)}
            </text>
          </g>
        );
      })}
      <text x="16" y="25">
        {yLabel}
      </text>
      <text x="698" y="239" textAnchor="end">
        {xLabel}
      </text>
      {references.map(({ x, color, label }, i) => (
        <line
          key={label}
          x1={chart.px(x)}
          x2={chart.px(x)}
          y1="39"
          y2="192"
          stroke={color}
          strokeWidth="2"
          strokeDasharray={i % 2 ? '2 4' : '7 4'}
        >
          <title>{label}</title>
        </line>
      ))}
      {chart.paths.map(({ color, dash, d }, i) => (
        <path
          key={i}
          d={d}
          stroke={color}
          strokeDasharray={dash}
          strokeWidth={dash ? 2 : 2.5}
          fill="none"
        />
      ))}
      {point && (
        <circle
          ref={dot}
          cx={chart.px(point.x)}
          cy={chart.py(point.y)}
          r="5"
          fill={gold}
          stroke="white"
          strokeWidth="2"
        />
      )}
    </svg>
  );
}

function ResonanceCurve({
  oscillator,
  params,
}: {
  oscillator: Oscillator;
  params: OscillatorParams;
}) {
  const plot = useMemo(() => {
    const { omega0, peak, amplitude, response } = oscillator;
    const max = oscillatorLimits.omega[1];
    const frequencies = new Set(Array.from({ length: 301 }, (_, i) => (max * i) / 300));
    for (const frequency of [omega0, params.omega, peak])
      if (frequency !== null) frequencies.add(frequency);
    if (peak !== null) {
      // Sample the narrow region around the peak as well as the full slider range.
      const halfWidth = params.b / (2 * params.m);
      for (let i = -16; i <= 16; i++) {
        const f = peak + (i * halfWidth) / 4;
        if (f > 0 && f < max) frequencies.add(f);
      }
    }
    const references = [
      { x: omega0, color: blue, label: `ω₀ = ${tick(omega0)} rad/s` },
      ...(peak === null ? [] : [{ x: peak, color: purple, label: `Ω đỉnh = ${tick(peak)} rad/s` }]),
      { x: params.omega, color: gold, label: `Ω đang chọn = ${tick(params.omega)} rad/s` },
    ];
    const traces = [
      {
        color: teal,
        points: [...frequencies].sort((a, b) => a - b).map((x) => ({ x, y: response(x)! })),
      },
    ];
    return { references, traces, at: () => ({ x: params.omega, y: amplitude! }) };
  }, [oscillator, params]);
  return (
    <section className="graph-card card">
      <div className="graph-heading">
        <h2>Đáp ứng xác lập X(Ω)</h2>
      </div>
      <Plot
        traces={plot.traces}
        references={plot.references}
        marker={{ time: 0, at: plot.at }}
        xLabel="Ω (rad/s)"
        yLabel="X (m)"
      />
      <div className="vector-legend response-markers">
        {plot.references.map((r) => (
          <span key={r.label}>
            <i style={{ background: r.color }} />
            {r.label}
          </span>
        ))}
      </div>
      <p className="graph-caption">
        {oscillator.peak === null && 'Không có đỉnh tại Ω > 0. '}Quét lý thuyết với b &gt; 0, giữ m,
        k, b và F₀ cố định.
      </p>
    </section>
  );
}

export default function OscillatorGraphs({
  oscillator,
  params,
  time,
  end,
  subscribe,
  hideScan,
}: {
  oscillator: Oscillator;
  params: OscillatorParams;
  time: number;
  end: number;
  subscribe: SubscribeFrame;
  hideScan: boolean;
}) {
  const start = Math.floor(Math.min(time, end - 0.001) / 10) * 10;
  const stop = Math.min(start + 10, end);
  const plot = useMemo(() => {
    const samples = Array.from({ length: 361 }, (_, i) => {
      const x = start + ((stop - start) * i) / 360;
      return { x, state: oscillator.state(x) };
    });
    const series = (
      pick: (s: ReturnType<Oscillator['state']>) => number,
      color: string,
      dash?: string,
    ) => ({
      color,
      dash,
      points: samples.map(({ x, state }) => ({ x, y: pick(state) })),
    });
    const displacement = [series((s) => s.x, teal)];
    if (params.mode === 'damped' && oscillator.regime === 'under')
      displacement.push(
        series((s) => s.envelope!, purple, '5 4'),
        series((s) => -s.envelope!, purple, '5 4'),
      );
    if (oscillator.amplitude !== null) displacement.push(series((s) => s.steadyX!, blue, '5 4'));
    return {
      displacement,
      energy: params.mode === 'damped' ? [series((s) => s.energy, gold)] : null,
      positionAt: (t: number) => ({ x: t, y: oscillator.state(t).x }),
      energyAt: (t: number) => ({ x: t, y: oscillator.state(t).energy }),
    };
  }, [oscillator, params.mode, start, stop]);
  return (
    <>
      <section className="graph-card card">
        <div className="graph-heading">
          <h2>Li độ x(t)</h2>
        </div>
        <Plot
          traces={plot.displacement}
          marker={{ at: plot.positionAt, time }}
          subscribe={subscribe}
          xLabel="t (s)"
          yLabel="x (m)"
        />
        <p className="graph-caption">
          Nét liền là li độ thực.{' '}
          {oscillator.amplitude !== null
            ? 'Nét đứt là thành phần xác lập. Hiệu giữa hai đường là thành phần quá độ.'
            : params.mode === 'damped' && oscillator.regime === 'under'
              ? 'Hai nét đứt là đường bao ±A₀e⁻ᵇᵗ⁄²ᵐ.'
              : 'Chấm vàng chỉ thời điểm hiện tại.'}
        </p>
      </section>
      {plot.energy && (
        <section className="graph-card card">
          <div className="graph-heading">
            <h2>Cơ năng E(t)</h2>
          </div>
          <Plot
            traces={plot.energy}
            marker={{ at: plot.energyAt, time }}
            subscribe={subscribe}
            xLabel="t (s)"
            yLabel="E (J)"
          />
          <p className="graph-caption">
            Cơ năng giảm theo tốc độ dE/dt = −bv². Với b = 0, cơ năng giữ nguyên.
          </p>
        </section>
      )}
      {params.mode === 'resonance' &&
        (hideScan ? (
          <section className="graph-card card graph-concealed">
            Đường quét và vị trí đỉnh xuất hiện sau khi kiểm tra. Dùng số đo X tại từng Ω để so
            sánh.
          </section>
        ) : (
          <ResonanceCurve oscillator={oscillator} params={params} />
        ))}
    </>
  );
}
