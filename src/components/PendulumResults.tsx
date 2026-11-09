import { useState } from 'react';
import {
  fitLength,
  investigationIds,
  investigations,
  lengthMeasurements,
  MEASUREMENT_CYCLES,
  trialParams,
} from '../simulations/pendulum/experiment.ts';
import type { Investigation, Results } from '../simulations/pendulum/experiment.ts';
import { pendulumDefaults, smallAnglePeriod, toDegrees } from '../simulations/pendulum/physics.ts';

const format = (value: number | undefined, digits: number) =>
  value?.toLocaleString('vi-VN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }) ?? '—';

export function PendulumTable({
  id,
  data,
  selected,
}: {
  id: Investigation;
  data: Results[Investigation];
  selected?: number;
}) {
  const amplitude = id === 'amplitude';
  const length = id === 'length';
  const heading = amplitude ? 'A (cm)' : length ? 'l (cm)' : 'm (g)';
  return (
    <div className="pendulum-table-wrap">
      <table
        className="pendulum-table"
        aria-label={`Kết quả ${investigations[id].shortTitle.toLowerCase()}`}
      >
        <thead>
          <tr>
            <th scope="col">{heading}</th>
            {amplitude && (
              <>
                <th scope="col">sin |α₀|</th>
                <th scope="col">|α₀| (°)</th>
              </>
            )}
            <th scope="col">t₁₀ (s)</th>
            <th scope="col">T (s)</th>
            {length && (
              <>
                <th scope="col">T² (s²)</th>
                <th scope="col">T²/l (s²/cm)</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {investigations[id].values.map((value) => {
            const t10 = data[value];
            const period = t10 === undefined ? undefined : t10 / MEASUREMENT_CYCLES;
            const squared = period === undefined ? undefined : period ** 2;
            const angle = amplitude ? trialParams(id, value).alpha0 : 0;
            return (
              <tr key={value} className={selected === value ? 'selected' : undefined}>
                <th scope="row">{value}</th>
                {amplitude && (
                  <>
                    <td>{format(Math.sin(angle), 2)}</td>
                    <td>{format(toDegrees(angle), 2)}</td>
                  </>
                )}
                <td>{format(t10, 4)}</td>
                <td>{format(period, 4)}</td>
                {length && (
                  <>
                    <td>{format(squared, 4)}</td>
                    <td>{format(squared === undefined ? undefined : squared / value, 5)}</td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface PlotProps {
  title: string;
  xLabel: string;
  yLabel: string;
  xTicks: number[];
  yRange: [number, number];
  points: { x: number; y: number }[];
  theory?: (x: number) => number;
  fit?: (x: number) => number;
}

function MeasurementGraph({
  title,
  xLabel,
  yLabel,
  xTicks,
  yRange,
  points,
  theory,
  fit,
}: PlotProps) {
  const xMin = xTicks[0];
  const xMax = xTicks[xTicks.length - 1];
  const [yMin, yMax] = yRange;
  const px = (x: number) => 64 + (420 * (x - xMin)) / (xMax - xMin);
  const py = (y: number) => 178 - (145 * (y - yMin)) / (yMax - yMin);
  const line = (fn: (x: number) => number) =>
    Array.from({ length: 65 }, (_, i) => {
      const x = xMin + ((xMax - xMin) * i) / 64;
      return `${px(x)},${py(fn(x))}`;
    }).join(' ');

  return (
    <figure className="pendulum-plot">
      <figcaption>{title}</figcaption>
      <svg
        viewBox="0 0 508 226"
        role="img"
        aria-label={`${title}. Trục ngang ${xLabel}. Trục dọc ${yLabel}. ${points.length} điểm đo.`}
      >
        {[0, 1, 2, 3, 4].map((i) => {
          const y = yMin + ((yMax - yMin) * i) / 4;
          return (
            <g key={i}>
              <line x1="64" x2="484" y1={py(y)} y2={py(y)} stroke="#dce9e1" />
              <text x="57" y={py(y) + 4} textAnchor="end">
                {format(y, yMin > 0 ? 4 : 2)}
              </text>
            </g>
          );
        })}
        {xTicks.map((x) => (
          <g key={x}>
            <line x1={px(x)} x2={px(x)} y1="33" y2="178" stroke="#dce9e1" />
            <text x={px(x)} y="198" textAnchor="middle">
              {format(x, Number.isInteger(x) ? 0 : 1)}
            </text>
          </g>
        ))}
        <path d="M64 33v145h420" fill="none" stroke="#85a397" />
        <text x="11" y="18">
          {yLabel}
        </text>
        <text x="484" y="221" textAnchor="end">
          {xLabel}
        </text>
        {fit && <polyline points={line(fit)} fill="none" stroke="#2570a1" strokeWidth="2.5" />}
        {theory && (
          <polyline
            points={line(theory)}
            fill="none"
            stroke="#986321"
            strokeWidth="2"
            strokeDasharray="6 5"
          />
        )}
        {!fit && points.length > 1 && (
          <polyline
            points={points.map(({ x, y }) => `${px(x)},${py(y)}`).join(' ')}
            fill="none"
            stroke="#087f73"
            strokeWidth="2"
          />
        )}
        {points.map(({ x, y }) => (
          <circle
            key={x}
            cx={px(x)}
            cy={py(y)}
            r="5"
            fill="#087f73"
            stroke="white"
            strokeWidth="1.5"
          >
            <title>{`${xLabel} = ${x} · ${yLabel} = ${format(y, 5)}`}</title>
          </circle>
        ))}
        {points.length === 0 && (
          <text x="274" y="101" textAnchor="middle" className="pendulum-plot-empty">
            Chưa ghi điểm đo
          </text>
        )}
      </svg>
      <div className="pendulum-legend">
        <span>
          <i /> Điểm đo
        </span>
        {fit && (
          <span>
            <i className="fit" /> Fit qua gốc
          </span>
        )}
        {theory && (
          <span>
            <i className="theory" /> Lý thuyết góc nhỏ
          </span>
        )}
      </div>
    </figure>
  );
}

function PeriodGraph({ id, data }: { id: 'amplitude' | 'mass'; data: Results[Investigation] }) {
  const { values, shortTitle } = investigations[id];
  const reference = smallAnglePeriod(pendulumDefaults);
  const points = values.flatMap((x) =>
    data[x] === undefined ? [] : [{ x, y: data[x]! / MEASUREMENT_CYCLES }],
  );
  const periods = points.map((p) => p.y);
  const low = Math.min(reference, ...periods);
  const high = Math.max(reference, ...periods);
  const padding = Math.max(0.002, (high - low) * 0.2);
  return (
    <MeasurementGraph
      title={`T theo ${shortTitle.toLowerCase()}`}
      xLabel={id === 'amplitude' ? 'A (cm)' : 'm (g)'}
      yLabel="T (s)"
      xTicks={values}
      yRange={[low - padding, high + padding]}
      points={points}
    />
  );
}

export function Conclusion({
  id,
  data,
  note,
}: {
  id: Investigation;
  data: Results[Investigation];
  note: string;
}) {
  const { values, comparison, conclusion } = investigations[id];
  const complete = values.every((value) => data[value] !== undefined);
  return (
    <div className="pendulum-conclusion">
      <p>{comparison}</p>
      {note && (
        <p className="pendulum-observation">
          <strong>Nhận xét của bạn</strong> {note}
        </p>
      )}
      {complete ? (
        <details>
          <summary>Hiển thị gợi ý kết luận</summary>
          <p>{conclusion}</p>
        </details>
      ) : (
        <p className="pendulum-muted">Ghi đủ các mốc để mở gợi ý kết luận.</p>
      )}
    </div>
  );
}

interface Props {
  results: Results;
  notes: Record<Investigation, string>;
  onReset: () => void;
}

export default function PendulumResults({ results, notes, onReset }: Props) {
  const [theory, setTheory] = useState(true);
  const fit = fitLength(results.length);
  const length = lengthMeasurements(results.length);
  const count = investigationIds.reduce((total, id) => total + Object.keys(results[id]).length, 0);
  const total = investigationIds.reduce((sum, id) => sum + investigations[id].values.length, 0);
  const lengthPlots = ([false, true] as const).map((squared) => {
    const power = squared ? 2 : 1;
    const points = length.map((p) => ({ x: p.meters, y: squared ? p.squared : p.period }));
    const model = (l: number) => smallAnglePeriod({ ...pendulumDefaults, l }) ** power;
    const bestFit = squared && fit ? (l: number) => fit.slope * l : undefined;
    const max = Math.max(model(0.6), bestFit?.(0.6) ?? 0, ...points.map((p) => p.y));
    return (
      <MeasurementGraph
        key={power}
        title={squared ? 'T² theo chiều dài' : 'T theo chiều dài'}
        xLabel="l (m)"
        yLabel={squared ? 'T² (s²)' : 'T (s)'}
        xTicks={[0, 0.2, 0.4, 0.5, 0.6]}
        yRange={[0, max * 1.09]}
        points={points}
        theory={theory ? model : undefined}
        fit={bestFit}
      />
    );
  });

  return (
    <section className="pendulum-results" aria-labelledby="pendulum-results-heading">
      <div className="pendulum-results-heading">
        <div>
          <span className="eyebrow">
            SỔ TAY THÍ NGHIỆM · {count}/{total} MỐC ĐÃ GHI
          </span>
          <h2 id="pendulum-results-heading">Kết quả & đồ thị</h2>
        </div>
        <button className="defaults-button" onClick={onReset} disabled={count === 0}>
          Xóa toàn bộ kết quả
        </button>
      </div>
      <div className="pendulum-results-grid">
        {investigationIds.map((id, index) => (
          <section
            className={`card pendulum-results-card${id === 'length' ? ' pendulum-length-results' : ''}`}
            key={id}
          >
            <span className="eyebrow">KHẢO SÁT 0{index + 1}</span>
            <h3>{investigations[id].title}</h3>
            <PendulumTable id={id} data={results[id]} />
            {id === 'length' ? (
              <>
                <label className="pendulum-theory-toggle">
                  <input
                    type="checkbox"
                    checked={theory}
                    onChange={(event) => setTheory(event.target.checked)}
                  />{' '}
                  Hiện đường lý thuyết góc nhỏ
                </label>
                <div className="pendulum-length-plots">{lengthPlots}</div>
                <div className="pendulum-fit">
                  <h4>Suy ra gia tốc trọng trường</h4>
                  {fit ? (
                    <p>
                      <strong>g ≈ {format(fit.g, 3)} m/s²</strong>
                      <span>b = {format(fit.slope, 5)} s²/m</span>
                    </p>
                  ) : (
                    <p>Ghi ít nhất hai chiều dài để tính hệ số góc và g.</p>
                  )}
                  <small>
                    Fit T² = b·l qua gốc với l tính bằng mét, rồi tính g = 4π²/b. Góc thả 5° làm kết
                    quả phi tuyến lệch nhẹ so với gần đúng góc nhỏ.
                  </small>
                </div>
              </>
            ) : (
              <PeriodGraph id={id} data={results[id]} />
            )}
            <Conclusion id={id} data={results[id]} note={notes[id]} />
          </section>
        ))}
      </div>
    </section>
  );
}
