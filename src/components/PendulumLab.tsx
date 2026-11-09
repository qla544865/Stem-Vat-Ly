import { useCallback, useRef, useState } from 'react';
import { modelPath } from '../navigation.ts';
import { groups } from '../simulations/catalog.ts';
import type { Dispatch, SetStateAction } from 'react';
import type { DisplayOptions, Parameter } from '../simulations/catalog.ts';
import { useSimulation } from '../simulations/useSimulation.ts';
import {
  emptyResults,
  investigationIds,
  investigations,
  MEASUREMENT_CYCLES,
  PendulumRun,
  recordTrial,
  trialParams,
} from '../simulations/pendulum/experiment.ts';
import type { Investigation, PendulumNotebook } from '../simulations/pendulum/experiment.ts';
import {
  pendulumDefaults,
  pendulumLimits,
  toDegrees,
  toRadians,
} from '../simulations/pendulum/physics.ts';
import type { PendulumParams } from '../simulations/pendulum/physics.ts';
import PendulumSimulation from '../simulations/pendulum/PendulumSimulation';
import PendulumResults, { Conclusion, PendulumTable } from './PendulumResults';
import ControlPanel from './ControlPanel';
import Icon from './Icon';

const views = { sandbox: 'Sandbox', practice: 'Thực hành', results: 'Kết quả & đồ thị' } as const;
type View = keyof typeof views;
type SimulationView = Exclude<View, 'results'>;
const viewIds = Object.keys(views) as View[];

const sliders = [
  {
    key: 'l',
    label: 'Chiều dài dây',
    symbol: 'l',
    unit: 'cm',
    step: 1,
    digits: 0,
    toUI: (n: number) => 100 * n,
    toSI: (n: number) => n / 100,
  },
  {
    key: 'm',
    label: 'Khối lượng',
    symbol: 'm',
    unit: 'g',
    step: 1,
    digits: 0,
    toUI: (n: number) => 1000 * n,
    toSI: (n: number) => n / 1000,
  },
  {
    key: 'alpha0',
    label: 'Biên độ góc',
    symbol: 'α₀',
    unit: '°',
    step: 0.1,
    digits: 1,
    toUI: (n: number) => toDegrees(Math.abs(n)),
    toSI: toRadians,
  },
  {
    key: 'g',
    label: 'Gia tốc trọng trường',
    symbol: 'g',
    unit: 'm/s²',
    step: 0.1,
    digits: 1,
    toUI: (n: number) => n,
    toSI: (n: number) => n,
  },
] as const;

function sandboxParameters(params: PendulumParams): Parameter[] {
  return sliders.map(({ key, toUI, toSI: _toSI, ...info }) => ({
    ...info,
    key,
    min: Number(toUI(pendulumLimits[key].min).toFixed(info.digits)),
    max: Number(toUI(pendulumLimits[key].max).toFixed(info.digits)),
    value: Number(toUI(params[key]).toFixed(info.digits)),
  }));
}

interface Props {
  notebook: PendulumNotebook;
  setNotebook: Dispatch<SetStateAction<PendulumNotebook>>;
}

export default function PendulumLab({
  notebook: { results, predictions, notes },
  setNotebook,
}: Props) {
  const [view, setView] = useState<View>('sandbox');
  const [simulationView, setSimulationView] = useState<SimulationView>('sandbox');
  const [presenting, setPresenting] = useState(false);
  const [sandbox, setSandbox] = useState(pendulumDefaults);
  const [display, setDisplay] = useState<DisplayOptions>({
    velocity: false,
    acceleration: false,
    annotations: true,
  });
  const [trial, setTrial] = useState<{ id: Investigation; value: number; side: number }>({
    id: 'amplitude',
    value: investigations.amplitude.values[0],
    side: 1,
  });
  const [run, setRun] = useState(() => new PendulumRun(pendulumDefaults));
  const runRef = useRef(run);
  const [speed, setSpeed] = useState(1);
  const advance = useCallback((time: number) => runRef.current.advanceTo(time), []);
  const sim = useSimulation(speed, Infinity, advance);
  const { id, value: selected } = trial;
  const investigation = investigations[id];
  const saved = run.t10 !== null && results[id][selected] === run.t10;
  const practiceView = view === 'practice';

  function replaceRun(params: PendulumParams, measuring = false) {
    const next = new PendulumRun(params, measuring);
    runRef.current = next;
    setRun(next);
    sim.reset();
  }

  function openView(next: View) {
    if (next === view) return;
    setView(next);
    if (presenting) window.scrollTo({ top: 0, behavior: 'instant' });
    if (next === 'results') sim.setRunning(false);
    else if (next !== simulationView) {
      setSimulationView(next);
      replaceRun(next === 'sandbox' ? sandbox : practiceParams(id, selected, trial.side));
    }
  }

  function updateSandbox(params: PendulumParams) {
    setSandbox(params);
    replaceRun(params);
  }

  function changeSlider(key: string, value: number) {
    const slider = sliders.find((item) => item.key === key);
    if (!slider || !Number.isFinite(value)) return;
    const { min, max } = pendulumLimits[slider.key];
    const sign = key === 'alpha0' ? Math.sign(sandbox.alpha0) : 1;
    updateSandbox({ ...sandbox, [key]: sign * Math.max(min, Math.min(max, slider.toSI(value))) });
  }

  function selectTrial(next: Investigation, value: number, side = 1) {
    setTrial({ id: next, value, side });
    replaceRun(practiceParams(next, value, side));
  }

  function changeAngle(theta: number) {
    const { min, max } = pendulumLimits.alpha0;
    const side = theta < 0 ? -1 : 1;
    const angle = Math.min(max, Math.abs(theta));
    if (!practiceView) {
      const rounded = toRadians(Math.round(toDegrees(angle) * 10) / 10);
      updateSandbox({ ...sandbox, alpha0: side * Math.max(min, rounded) });
    } else if (id === 'amplitude') {
      const offset = 100 * run.params.l * Math.sin(angle);
      const values = investigations.amplitude.values;
      const nearest = values.reduce((best, value) =>
        Math.abs(value - offset) < Math.abs(best - offset) ? value : best,
      );
      selectTrial(id, nearest, side);
    }
  }

  function startMeasurement() {
    replaceRun(practiceParams(id, selected, trial.side), true);
    sim.setRunning(true);
  }

  function togglePlay() {
    if (sim.running) sim.setRunning(false);
    else {
      if (run.t10 !== null) replaceRun(run.params);
      sim.setRunning(true);
    }
  }

  function clearResults(only?: Investigation) {
    const count = only
      ? Object.keys(results[only]).length
      : investigationIds.reduce((total, key) => total + Object.keys(results[key]).length, 0);
    if (count > 1 && !window.confirm(`Xóa ${count} kết quả đã ghi?`)) return;
    setNotebook((old) => ({
      ...old,
      results: only ? { ...old.results, [only]: {} } : emptyResults(),
    }));
  }

  function updateNotebookText(field: 'predictions' | 'notes', value: string) {
    setNotebook((old) => ({ ...old, [field]: { ...old[field], [id]: value } }));
  }

  return (
    <div className={`pendulum-lab${presenting ? ' pendulum-presenting' : ''}`}>
      <div className="pendulum-title">
        <div>
          <a className="back-link pendulum-secondary" href="#/">
            <Icon name="back" size={16} /> Chọn thí nghiệm khác
          </a>
          <h1>
            Con lắc đơn<span>.</span>
          </h1>
          <p className="pendulum-secondary">
            Khảo sát thực nghiệm các định luật dao động của con lắc đơn.
          </p>
        </div>
        <button
          className="pendulum-presentation-button"
          aria-pressed={presenting}
          onClick={() => setPresenting(!presenting)}
        >
          <Icon name="screen" size={18} /> {presenting ? 'Thoát trình chiếu' : 'Trình chiếu'}
        </button>
      </div>

      <nav className="lab-navigation pendulum-nav" aria-label="Chế độ con lắc đơn">
        <div className="mode-switch">
          {viewIds.map((next) => (
            <button
              key={next}
              className={next === view ? 'active' : ''}
              aria-pressed={next === view}
              onClick={() => openView(next)}
            >
              {views[next]}
            </button>
          ))}
        </div>
        <select
          className="lab-quick-select pendulum-secondary"
          aria-label="Chọn nhóm thí nghiệm"
          value="pendulum"
          onChange={(event) => {
            const next = groups.find((group) => group.id === event.target.value);
            if (next) window.location.hash = modelPath[next.model];
          }}
        >
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.title}
            </option>
          ))}
        </select>
      </nav>

      {view === 'results' ? (
        <PendulumResults results={results} notes={notes} onReset={() => clearResults()} />
      ) : (
        <>
          <div className="lab-grid pendulum-grid">
            <div className="pendulum-main">
              <PendulumSimulation
                run={run}
                sim={sim}
                speed={speed}
                onSpeed={setSpeed}
                onPlay={togglePlay}
                onReset={() => replaceRun(run.params)}
                onAngle={!practiceView || id === 'amplitude' ? changeAngle : undefined}
                annotations={practiceView || display.annotations}
                presenting={presenting}
              />
            </div>
            {practiceView ? (
              <aside className="card pendulum-panel" aria-label="Phiếu thực hành">
                <span className="eyebrow">PHIẾU THỰC HÀNH</span>
                <h2>{investigation.title}</h2>
                <label className="pendulum-field">
                  Bài khảo sát
                  <select
                    value={id}
                    onChange={(event) => {
                      const next = event.target.value as Investigation;
                      selectTrial(next, investigations[next].values[0]);
                    }}
                  >
                    {investigationIds.map((key, index) => (
                      <option key={key} value={key}>
                        {index + 1}. {investigations[key].shortTitle}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="pendulum-field pendulum-secondary">
                  Dự đoán
                  <span>{investigation.question}</span>
                  <textarea
                    rows={2}
                    value={predictions[id]}
                    onChange={(event) => updateNotebookText('predictions', event.target.value)}
                    placeholder="Viết dự đoán trước khi đo"
                  />
                </label>
                <div className="pendulum-fixed">
                  <strong>Giữ cố định</strong> {investigation.fixed}
                </div>
                <label className="pendulum-field">
                  {investigation.variable}
                  <select
                    value={selected}
                    onChange={(event) => selectTrial(id, Number(event.target.value))}
                  >
                    {investigation.values.map((value) => (
                      <option key={value} value={value}>
                        {value} {investigation.unit}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="pendulum-muted pendulum-secondary">
                  {investigation.guidance} Mỗi lần đo bắt đầu từ biên thả, với vận tốc bằng 0.
                </p>
                <div className="pendulum-stopwatch">
                  <div>
                    <span>ĐỒNG HỒ 10 DAO ĐỘNG</span>
                    <strong>{run.measuring ? run.time.toFixed(3) : '—'} s</strong>
                  </div>
                  <progress
                    aria-label="Số dao động đã đo"
                    value={run.measuring ? run.cycles : 0}
                    max={MEASUREMENT_CYCLES}
                  />
                  <p role="status">
                    {run.t10 === null
                      ? `${run.measuring ? run.cycles : 0} / ${MEASUREMENT_CYCLES} dao động`
                      : `T đo = ${(run.t10 / MEASUREMENT_CYCLES).toFixed(4)} s${saved ? ' · Đã ghi vào bảng' : ''}`}
                  </p>
                </div>
                <div className="pendulum-actions">
                  <button className="primary-button" onClick={startMeasurement}>
                    {run.measuring && run.t10 === null ? 'Đo lại từ đầu' : 'Đo 10 dao động'}
                  </button>
                  <button
                    className="pendulum-secondary-button"
                    disabled={run.t10 === null || saved}
                    onClick={() =>
                      setNotebook((old) => ({
                        ...old,
                        results: recordTrial(old.results, id, selected, run),
                      }))
                    }
                  >
                    Ghi kết quả
                  </button>
                </div>
              </aside>
            ) : (
              <ControlPanel
                model="pendulum"
                parameters={sandboxParameters(sandbox)}
                onChange={changeSlider}
                onDefaults={() => updateSandbox(pendulumDefaults)}
                display={display}
                onDisplay={(key, value) => setDisplay({ ...display, [key]: value })}
                predictionLocked={false}
                note="Kéo quả nặng sang trái hoặc phải. Dây giữ nguyên chiều dài và vật được thả từ trạng thái nghỉ."
              />
            )}
          </div>
          {practiceView ? (
            <section
              className="card pendulum-results-card pendulum-practice-table"
              aria-label="Bảng ghi thực hành"
            >
              <div className="pendulum-results-heading">
                <h2>Bảng ghi thực hành</h2>
                <button
                  className="defaults-button"
                  disabled={!Object.keys(results[id]).length}
                  onClick={() => clearResults(id)}
                >
                  Xóa kết quả bài này
                </button>
              </div>
              <PendulumTable id={id} data={results[id]} selected={selected} />
              <label className="pendulum-field pendulum-secondary">
                Nhận xét
                <textarea
                  rows={2}
                  placeholder="Bạn quan sát thấy gì từ số liệu?"
                  value={notes[id]}
                  onChange={(event) => updateNotebookText('notes', event.target.value)}
                />
              </label>
              <Conclusion id={id} data={results[id]} note="" />
            </section>
          ) : (
            <details className="card pendulum-model pendulum-secondary">
              <summary>Mô hình và cách đọc chu kỳ</summary>
              <p>
                Vật nặng là chất điểm, chuyển động trong một mặt phẳng. Dây nhẹ, không dãn. Trọng
                trường đều và bỏ qua lực cản. Góc dương về bên phải.
              </p>
              <p>
                Phương trình θ″ + (g/l) sin θ = 0 cho chu kỳ phi tuyến T. Công thức T₀ = 2π√(l/g)
                gần đúng khi góc thả nhỏ. Trong Thực hành, T đo = t₁₀/10.
              </p>
            </details>
          )}
        </>
      )}
    </div>
  );
}

function practiceParams(id: Investigation, value: number, side: number) {
  const params = trialParams(id, value);
  return { ...params, alpha0: params.alpha0 * side };
}
