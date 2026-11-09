import { useCallback, useRef } from 'react';
import type { PointerEvent } from 'react';
import { CanvasSurface } from '../../components/SimulationCanvas';
import SimulationControls from '../../components/SimulationControls';
import type { useSimulation } from '../useSimulation.ts';
import { MEASUREMENT_CYCLES } from './experiment.ts';
import type { PendulumRun } from './experiment.ts';
import { nonlinearPeriod, smallAnglePeriod, toDegrees } from './physics.ts';
import { drawPendulum, pendulumLayout } from './renderer.ts';

interface Props {
  run: PendulumRun;
  sim: ReturnType<typeof useSimulation>;
  speed: number;
  onSpeed: (speed: number) => void;
  onPlay: () => void;
  onReset: () => void;
  onAngle?: (theta: number) => void;
  annotations: boolean;
  presenting: boolean;
}

export default function PendulumSimulation({
  run,
  sim,
  onAngle,
  annotations,
  presenting,
  ...p
}: Props) {
  const pointer = useRef<number | null>(null);
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) =>
      drawPendulum(ctx, width, height, run.params, run.state, annotations, presenting),
    [run, annotations, presenting],
  );

  function pointerPosition(event: PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      layout: pendulumLayout(rect.width, rect.height, run.params.l, run.state.theta),
    };
  }

  function chooseAngle(event: PointerEvent<HTMLCanvasElement>) {
    const { x, y, layout } = pointerPosition(event);
    onAngle?.(Math.atan2(x - layout.x, y - layout.y));
  }

  function startDrag(event: PointerEvent<HTMLCanvasElement>) {
    if (!onAngle || event.button !== 0 || pointer.current !== null) return;
    const { x, y, layout } = pointerPosition(event);
    if (Math.hypot(x - layout.bobX, y - layout.bobY) > layout.bobRadius + 14) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointer.current = event.pointerId;
    chooseAngle(event);
  }

  const completed = run.t10 !== null;
  const time = run.time;
  const values = [
    ['Góc hiện tại', 'θ', toDegrees(run.state.theta).toFixed(1), '°'],
    ['Vận tốc góc', 'ω', run.state.omega.toFixed(2), 'rad/s'],
    ['Gần đúng góc nhỏ', 'T₀', smallAnglePeriod(run.params).toFixed(4), 's'],
    ['Mô hình phi tuyến', 'T', nonlinearPeriod(run.params).toFixed(4), 's'],
    [
      'Dao động toàn phần',
      'N',
      String(run.cycles),
      run.measuring ? `/ ${MEASUREMENT_CYCLES}` : 'chu kỳ',
    ],
  ];

  return (
    <>
      <section className="simulation-card card pendulum-stage">
        <div className="simulation-heading">
          <div>
            <span className="live-dot" />
            <h2>Con lắc đơn</h2>
          </div>
          <span className={`status-badge ${sim.running ? 'running' : ''}`} role="status">
            <span />
            {sim.running
              ? run.measuring
                ? 'Đang đo'
                : 'Đang dao động'
              : completed
                ? 'Đã đo đủ 10 chu kỳ'
                : time > 0
                  ? 'Đã tạm dừng'
                  : 'Sẵn sàng thả'}
          </span>
        </div>
        <div className="canvas-wrap">
          <div className="canvas-label">
            {onAngle ? 'KÉO QUẢ NẶNG ĐỂ CHỌN GÓC' : 'GÓC THẢ CỐ ĐỊNH'}
          </div>
          <span className="time-label" aria-label="Thời gian mô phỏng">
            t = <strong>{time.toFixed(3)}</strong> s
          </span>
          <CanvasSurface
            className={`simulation-canvas${onAngle ? ' pendulum-draggable' : ''}`}
            aria-label="Mô phỏng con lắc đơn. Góc và vận tốc góc được hiển thị bên dưới."
            draw={draw}
            subscribe={sim.subscribe}
            onPointerDown={startDrag}
            onPointerMove={(event) => {
              if (pointer.current === event.pointerId) chooseAngle(event);
            }}
            onPointerUp={(event) => {
              if (pointer.current !== event.pointerId) return;
              pointer.current = null;
              if (!onAngle) return;
              chooseAngle(event);
              sim.setRunning(true);
            }}
            onLostPointerCapture={(event) => {
              if (pointer.current === event.pointerId) pointer.current = null;
            }}
          />
        </div>
        <SimulationControls
          running={sim.running}
          time={time}
          completed={completed}
          ready
          speed={p.speed}
          onPlay={() => {
            if (pointer.current === null) p.onPlay();
          }}
          onReset={() => {
            pointer.current = null;
            p.onReset();
          }}
          onSpeed={p.onSpeed}
        />
      </section>
      <section className="stats-grid pendulum-stats" aria-label="Đại lượng vật lý của con lắc">
        {values.map(([name, symbol, value, unit]) => (
          <div className="stat-card card" key={symbol}>
            <div>
              <span>{name}</span>
              <i>{symbol}</i>
            </div>
            <strong>
              {value}
              <small>{unit}</small>
            </strong>
          </div>
        ))}
      </section>
    </>
  );
}
