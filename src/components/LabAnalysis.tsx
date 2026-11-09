import { collisionTotals } from '../simulations/collision/physics.ts';
import type { CollisionPlan } from '../simulations/collision/physics.ts';
import type { energyState } from '../simulations/energy/physics.ts';
import { format } from './TheoryPanel';

const collisionRows = [
  ['v1', 'Vận tốc xe A', 'm/s'],
  ['v2', 'Vận tốc xe B', 'm/s'],
  ['p1', 'Động lượng xe A', 'kg·m/s'],
  ['p2', 'Động lượng xe B', 'kg·m/s'],
  ['momentum', 'Tổng động lượng', 'kg·m/s'],
  ['kinetic', 'Tổng động năng', 'J'],
] as const;

export function CollisionAnalysis({ plan, time }: { plan: CollisionPlan; time: number }) {
  const { before, contact, params } = plan;
  const after =
    contact && time >= contact.time ? collisionTotals(params, contact.v1, contact.v2) : null;
  return (
    <section className="graph-card card collision-analysis">
      <h2>Trước và sau va chạm</h2>
      <p className="analysis-note">
        {after && contact
          ? `Tiếp xúc tại t = ${format(contact.time)} s.`
          : time >= plan.end
            ? 'Không xảy ra va chạm trong khoảng quan sát.'
            : 'Cột Sau cập nhật khi hai xe tiếp xúc.'}
      </p>
      <table className="analysis-table" aria-label="Động lượng và động năng trước và sau va chạm">
        <thead>
          <tr>
            <th scope="col">Đại lượng</th>
            <th scope="col">Trước</th>
            <th scope="col">Sau</th>
          </tr>
        </thead>
        <tbody>
          {collisionRows.map(([key, label, unit]) => (
            <tr key={key}>
              <th scope="row">
                {label} <small>({unit})</small>
              </th>
              <td>{format(before[key])}</td>
              <td>{after ? format(after[key]) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {after && (
        <p className="analysis-note">
          ΔP = {format(after.momentum - before.momentum)} kg·m/s · ΔEₖ ={' '}
          {format(after.kinetic - before.kinetic)} J.
          {params.kind === 'inelastic' &&
            ' Phần động năng giảm chuyển hóa sang các dạng năng lượng khác.'}
        </p>
      )}
    </section>
  );
}

export function EnergyBars({ state }: { state: ReturnType<typeof energyState> }) {
  const bars = [
    ['Động năng', 'Eₖ', state.kinetic, '#b7762d'],
    ['Thế năng', 'Eₚ', state.potential, '#426da4'],
    ['Cơ năng', 'E', state.total, '#087f73'],
  ] as const;
  return (
    <section className="graph-card card energy-analysis" aria-label="Biểu đồ năng lượng">
      <h2>Sự chuyển hóa cơ năng</h2>
      <div className="energy-bars">
        {bars.map(([label, symbol, value, color]) => (
          <div className="energy-bar" key={symbol}>
            <span>
              {label} · {symbol}
            </span>
            <strong>{format(value, 2)} J</strong>
            <div className="energy-track" aria-hidden="true">
              <span
                style={{
                  width: `${Math.min(100, (value / state.initial) * 100)}%`,
                  background: color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="analysis-note">
        Cùng thang đo 0–{format(state.initial, 2)} J, lấy chân dốc làm mốc thế năng.
      </p>
    </section>
  );
}
