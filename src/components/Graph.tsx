import { useEffect, useMemo, useRef, useState } from 'react';
import type { SimulationConfig } from '../simulations/catalog.ts';
import type { SubscribeFrame } from '../simulations/useSimulation.ts';
import { springState } from '../simulations/spring/physics.ts';
import { hookeState } from '../simulations/spring/hooke.ts';
import { circularState } from '../simulations/circular/physics.ts';
import { projectileState } from '../simulations/projectile/physics.ts';
import { torqueState } from '../simulations/torque/physics.ts';

type Quantity = 'x' | 'v' | 'a';
interface Props {
  config: SimulationConfig;
  time: number;
  subscribe: SubscribeFrame;
  concealed: boolean;
  secret: boolean;
}
const tick = (value: number) =>
  Math.abs(value) < 1e-8 ? '0' : value.toFixed(Math.abs(value) >= 100 ? 0 : 2);

export default function Graph(p: Props) {
  const [quantity, setQuantity] = useState<Quantity>('x');
  const marker = useRef<SVGCircleElement>(null);
  const cursor = useRef<SVGLineElement>(null);
  const c = p.config;
  let duration = 1;
  if (c.kind === 'spring') duration = springState(c.params, 0).T * 2;
  if (c.kind === 'circular') duration = circularState(c.params, 0).T * 2;
  if (c.kind === 'projectile') duration = projectileState(c.params, 0).fallTime;
  const start = c.kind === 'projectile' ? 0 : Math.floor(p.time / duration) * duration;

  const plot = useMemo(() => {
    let title = '',
      unit = '',
      max = 1,
      min = -1;
    let sample = (time: number) => time;
    if (c.kind === 'spring') {
      const s = springState(c.params, 0);
      max = c.params.A * (quantity === 'x' ? 1 : quantity === 'v' ? s.omega : s.omega ** 2);
      title = quantity === 'x' ? 'Li độ x(t)' : quantity === 'v' ? 'Vận tốc v(t)' : 'Gia tốc a(t)';
      unit = quantity === 'x' ? 'x (m)' : quantity === 'v' ? 'v (m/s)' : 'a (m/s²)';
      sample = (time) => springState(c.params, time)[quantity];
      max = Math.max(max * 1.15, 0.001);
      min = -max;
    } else if (c.kind === 'circular') {
      title = 'Li độ hình chiếu x(t)';
      unit = 'x (m)';
      max = c.params.r * 1.15;
      min = -max;
      sample = (time) => circularState(c.params, time).projection;
    } else if (c.kind === 'projectile') {
      title = 'Độ dịch chuyển đứng y(t)';
      unit = 'y (m)';
      max = c.params.h * 1.1;
      min = 0;
      sample = (time) => projectileState(c.params, time).y;
    }
    const px = (time: number) => 72 + Math.max(0, Math.min(1, (time - start) / duration)) * 630;
    const py = (value: number) => 186 - ((value - min) / (max - min)) * 144;
    const path = Array.from({ length: 241 }, (_, i) => {
      const time = start + (duration * i) / 240;
      return `${i ? 'L' : 'M'}${px(time).toFixed(2)},${py(sample(time)).toFixed(2)}`;
    }).join(' ');
    return { title, unit, max, min, px, py, path, sample };
  }, [c, quantity, duration, start]);

  useEffect(
    () =>
      p.subscribe((time) => {
        const x = plot.px(time);
        marker.current?.setAttribute('cx', String(x));
        marker.current?.setAttribute('cy', String(plot.py(plot.sample(time))));
        cursor.current?.setAttribute('x1', String(x));
        cursor.current?.setAttribute('x2', String(x));
      }),
    [p.subscribe, plot],
  );

  if (c.kind === 'torque') {
    const s = torqueState(c.params),
      maximum = Math.max(25, s.M1, s.M2) * 1.1;
    return (
      <section className="graph-card card">
        <div className="graph-heading">
          <h2>So sánh moment lực</h2>
          <span className="legend">Đơn vị N·m</span>
        </div>
        <svg
          className="graph torque-graph"
          viewBox="0 0 760 240"
          role="img"
          aria-label={`Moment trái ${s.M1} N·m, moment phải ${s.M2} N·m`}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <line x1={100 + i * 137.5} y1="30" x2={100 + i * 137.5} y2="179" stroke="#e8eee6" />
              <text x={100 + i * 137.5} y="205" textAnchor="middle">
                {tick((maximum * i) / 4)}
              </text>
            </g>
          ))}
          {[
            { value: s.M1, label: 'M₁ ↶', y: 64, color: '#0b8f82' },
            { value: s.M2, label: 'M₂ ↷', y: 128, color: '#d59a3e' },
          ].map((bar) => (
            <g key={bar.label}>
              <text x="78" y={bar.y + 19} textAnchor="end">
                {bar.label}
              </text>
              <rect
                x="100"
                y={bar.y}
                width={(bar.value / maximum) * 550}
                height="29"
                rx="5"
                fill={bar.color}
              />
              <text x={112 + (bar.value / maximum) * 550} y={bar.y + 19}>
                {tick(bar.value)}
              </text>
            </g>
          ))}
        </svg>
        <p className="graph-caption">
          M₁: ngược chiều kim đồng hồ · M₂: theo chiều kim đồng hồ. Cân bằng khi |M₁ − M₂| ≤ 0,10
          N·m.
        </p>
      </section>
    );
  }
  if (c.kind === 'hooke') {
    const s = hookeState(c.params),
      maxDeformation = 12 / c.params.k;
    const px = (x: number) => 72 + ((x + maxDeformation) / (2 * maxDeformation)) * 630;
    const py = (f: number) => 186 - ((f + 12) / 24) * 144;
    return (
      <section className="graph-card card">
        <div className="graph-heading">
          <h2>Ngoại lực & độ biến dạng</h2>
          <span className="legend">
            <i />F = kΔl
          </span>
        </div>
        {p.secret && Math.abs(c.params.externalForce) < 1e-9 ? (
          <div className="graph-concealed">
            F = 0 và Δl = 0 chưa đủ để xác định k. Hãy tạo một phép đo khác 0.
          </div>
        ) : (
          <svg
            className="graph"
            viewBox="0 0 760 240"
            role="img"
            aria-label="Đồ thị ngoại lực F theo độ biến dạng delta l, đường thẳng qua gốc tọa độ"
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i}>
                <line x1="72" y1={42 + i * 36} x2="702" y2={42 + i * 36} stroke="#e9eee7" />
                <line x1={72 + i * 157.5} y1="42" x2={72 + i * 157.5} y2="186" stroke="#e9eee7" />
                <text x="60" y={46 + i * 36} textAnchor="end">
                  {12 - i * 6}
                </text>
                <text x={72 + i * 157.5} y="211" textAnchor="middle">
                  {tick(-maxDeformation + (maxDeformation * i) / 2)}
                </text>
              </g>
            ))}
            <text x="18" y="22">
              F (N)
            </text>
            <text x="682" y="235">
              Δl (m)
            </text>
            <line x1="72" y1={py(0)} x2="702" y2={py(0)} stroke="#bccfc0" />
            <line x1={px(0)} y1="42" x2={px(0)} y2="186" stroke="#bccfc0" />
            <line
              x1={px(-maxDeformation)}
              y1={py(-12)}
              x2={px(maxDeformation)}
              y2={py(12)}
              stroke="#0b8f82"
              strokeWidth="2.5"
            />
            <circle
              cx={px(s.deformation)}
              cy={py(c.params.externalForce)}
              r="6"
              fill="#d59a3e"
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        )}
        <p className="graph-caption">
          Điểm vàng là phép đo hiện tại. Lực nén và độ nén mang dấu âm.
        </p>
      </section>
    );
  }
  return (
    <section className="graph-card card">
      <div className="graph-heading">
        <h2>{plot.title}</h2>
        {c.kind === 'spring' ? (
          <div className="graph-tabs" aria-label="Chọn đại lượng đồ thị">
            {(['x', 'v', 'a'] as const).map((q) => (
              <button
                key={q}
                className={quantity === q ? 'active' : ''}
                aria-pressed={quantity === q}
                onClick={() => setQuantity(q)}
              >
                {q}(t)
              </button>
            ))}
          </div>
        ) : (
          <span className="legend">
            <i />
            {c.kind === 'circular' ? 'Hình chiếu' : 'Độ dịch chuyển'}
          </span>
        )}
      </div>
      {p.concealed ? (
        <div className="graph-concealed">
          Nhập dự đoán và chạy đến khi chạm đất để quan sát kết quả.
        </div>
      ) : (
        <svg
          className="graph"
          viewBox="0 0 760 240"
          role="img"
          aria-label={`Đồ thị ${plot.title} theo thời gian, đơn vị ${plot.unit}`}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <line x1="72" y1={42 + i * 36} x2="702" y2={42 + i * 36} stroke="#e9eee7" />
              <line x1={72 + i * 157.5} y1="42" x2={72 + i * 157.5} y2="186" stroke="#e9eee7" />
              <text x="60" y={46 + i * 36} textAnchor="end">
                {tick(plot.max - ((plot.max - plot.min) * i) / 4)}
              </text>
              <text x={72 + i * 157.5} y="213" textAnchor="middle">
                {tick(start + (duration * i) / 4)}
              </text>
            </g>
          ))}
          <text x="12" y="22">
            {plot.unit}
          </text>
          <text x="699" y="235">
            t (s)
          </text>
          <path d={plot.path} stroke="#0b8f82" strokeWidth="2.5" fill="none" />
          <line
            ref={cursor}
            x1={plot.px(p.time)}
            x2={plot.px(p.time)}
            y1="36"
            y2="186"
            stroke="#a2c9c0"
            strokeDasharray="4 4"
          />
          <circle
            ref={marker}
            cx={plot.px(p.time)}
            cy={plot.py(plot.sample(p.time))}
            r="5"
            fill="#0b8f82"
            stroke="white"
            strokeWidth="2"
          />
        </svg>
      )}
      <p className="graph-caption">
        {c.kind === 'circular'
          ? 'x(t) = r cos(ωt + φ) · Biên độ A = r · Cùng đồng hồ với mô phỏng.'
          : c.kind === 'spring'
            ? 'Chọn x(t), v(t) hoặc a(t). Chấm tròn chỉ thời điểm hiện tại.'
            : 'Gốc tọa độ tại vị trí ném, chiều dương y hướng xuống.'}
      </p>
    </section>
  );
}
