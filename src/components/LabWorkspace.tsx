import { useState } from 'react';
import type { Challenge } from '../challenges/config.ts';
import {
  canCheckChallenge,
  challengeModel,
  challenges,
  predictionBeforeRun,
  validateChallenge,
} from '../challenges/config.ts';
import type { DisplayOptions, Model, SimulationConfig } from '../simulations/catalog.ts';
import {
  defaultConfig,
  getParameters,
  groupFor,
  groups,
  isDynamic,
  modelTitles,
  updateParameter,
} from '../simulations/catalog.ts';
import { modelPath } from '../navigation.ts';
import { springState } from '../simulations/spring/physics.ts';
import { circularState } from '../simulations/circular/physics.ts';
import { projectileState } from '../simulations/projectile/physics.ts';
import { torqueState } from '../simulations/torque/physics.ts';
import { useSimulation } from '../simulations/useSimulation.ts';
import SimulationCanvas from './SimulationCanvas';
import SimulationControls from './SimulationControls';
import ControlPanel from './ControlPanel';
import ChallengePanel from './ChallengePanel';
import Graph from './Graph';
import TheoryPanel, { assumptions, format, learningTips, readouts } from './TheoryPanel';
import Icon from './Icon';

function initialChallengeConfig(c: Challenge): SimulationConfig {
  const defaults = defaultConfig(challengeModel(c));
  // Each trusted definition selects the same model as its initial parameter object.
  return { ...defaults, params: { ...defaults.params, ...c.initial } } as SimulationConfig;
}

export default function LabWorkspace({ model }: { model: Model }) {
  const [config, setConfig] = useState(() => defaultConfig(model));
  const [mode, setMode] = useState<'sandbox' | 'challenge'>('sandbox');
  const [speed, setSpeed] = useState(1);
  const [display, setDisplay] = useState<DisplayOptions>({
    velocity: model === 'circular',
    acceleration: model === 'circular',
    annotations: true,
  });
  const available = challenges.filter((c) => challengeModel(c) === model);
  const [challengeId, setChallengeId] = useState(available[0].id);
  const challenge = available.find((c) => c.id === challengeId)!;
  const [prediction, setPrediction] = useState('');
  const [hasRun, setHasRun] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);
  const [hint, setHint] = useState(false);
  const inChallenge = mode === 'challenge';
  const dynamic = isDynamic(model);
  const secret = inChallenge && challenge.id === 'secret';
  const group = groups.find((group) => group.id === groupFor(model))!;
  let end = Infinity;
  if (config.kind === 'projectile') end = projectileState(config.params, 0).fallTime;
  if (inChallenge && challenge.id === 'projection' && config.kind === 'circular')
    end = circularState(config.params, 0).T / 4;
  const sim = useSimulation(speed, end);
  const completed = Number.isFinite(end) && sim.time >= end;
  const numberAnswer = prediction.trim() === '' ? undefined : Number(prediction);
  const validAnswer =
    Number.isFinite(numberAnswer) &&
    (challenge.id !== 'secret' || numberAnswer! > 0) &&
    (challenge.id !== 'predict' || numberAnswer! >= 0);
  const needsPrediction = inChallenge && predictionBeforeRun(challenge);
  const ready = !needsPrediction || validAnswer;
  const concealed = inChallenge && challenge.id === 'predict' && !completed;
  const baseline = springState({ m: 0.5, k: 20, A: 0.3 }, 0).T;
  const nonzeroForce = config.kind === 'hooke' && Math.abs(config.params.externalForce) > 1e-9;
  const canCheck = canCheckChallenge(challenge, {
    interacted,
    hasRun,
    time: sim.time,
    completed,
    nonzeroForce,
    answer: validAnswer ? numberAnswer : undefined,
  });
  const stats = readouts(config, sim.time, concealed);
  let actual = 0;
  switch (config.kind) {
    case 'hooke':
      actual = config.params.k;
      break;
    case 'spring':
      actual = springState(config.params, sim.time).T;
      break;
    case 'torque':
      actual = torqueState(config.params).net;
      break;
    case 'circular': {
      const s = circularState(config.params, sim.time);
      actual = challenge.id === 'projection' ? s.projection : s.acceleration;
      break;
    }
    case 'projectile':
      actual = projectileState(config.params, sim.time).range;
      break;
  }

  function clearAttempt() {
    sim.reset();
    setHasRun(false);
    setInteracted(false);
    setResult(null);
  }
  function loadChallenge(c: Challenge) {
    if (challengeModel(c) !== model) return;
    clearAttempt();
    setConfig(initialChallengeConfig(c));
    setChallengeId(c.id);
    setPrediction('');
    setHint(false);
  }
  function selectMode(next: typeof mode) {
    if (mode === next) return;
    setMode(next);
    if (next === 'challenge') loadChallenge(available[0]);
    else {
      clearAttempt();
      setConfig(defaultConfig(model));
      setPrediction('');
      setHint(false);
    }
  }
  function changeParameter(key: string, value: number) {
    if (!Number.isFinite(value) || (inChallenge && !challenge.editable.includes(key)) || !ready)
      return;
    clearAttempt();
    setConfig((previous) => updateParameter(previous, key, value));
    setInteracted(true);
  }
  function restoreDefaults() {
    if (inChallenge) loadChallenge(challenge);
    else {
      clearAttempt();
      setConfig(defaultConfig(model));
    }
  }
  function togglePlay() {
    if (!ready || !dynamic) return;
    if (sim.running) {
      sim.setRunning(false);
      return;
    }
    if (completed) sim.reset();
    setHasRun(true);
    setResult(null);
    sim.setRunning(true);
  }
  function check() {
    if (!canCheck) return;
    const measured = challenge.id === 'mass' ? actual / baseline : actual;
    setResult(validateChallenge(challenge, measured, validAnswer ? numberAnswer : undefined));
    sim.setRunning(false);
  }
  let status = dynamic
    ? sim.running
      ? 'Đang mô phỏng'
      : completed
        ? model === 'projectile'
          ? 'Đã chạm đất'
          : 'Đã đến mốc T/4'
        : sim.time > 0
          ? 'Đã tạm dừng'
          : 'Sẵn sàng khám phá'
    : 'Cân bằng tĩnh';
  if (config.kind === 'torque') {
    const s = torqueState(config.params);
    status = s.balanced
      ? 'Cân bằng moment'
      : s.direction === 'ccw'
        ? 'Xu hướng quay ↶'
        : 'Xu hướng quay ↷';
  }
  let progressMessage = canCheck
    ? 'Đã đủ điều kiện. Bấm Kiểm tra kết quả để đối chiếu.'
    : 'Chạy mô phỏng rồi kiểm tra kết quả.';
  if (secret && !nonzeroForce)
    progressMessage =
      'Thay đổi ngoại lực khác 0 để tạo phép đo có ý nghĩa. F = 0 không xác định được k.';
  else if (secret && !validAnswer)
    progressMessage = 'Quan sát F và Δl, rồi nhập giá trị độ cứng bạn suy ra.';
  else if (challenge.id === 'balance' && !interacted)
    progressMessage = 'Điều chỉnh cánh tay đòn bên phải rồi kiểm tra.';
  else if (needsPrediction && !validAnswer)
    progressMessage = 'Chọn hoặc nhập dự đoán trước khi chạy mô phỏng.';
  else if (hasRun && Number.isFinite(end) && !completed)
    progressMessage =
      model === 'projectile'
        ? 'Chờ vật chạm đất để kiểm tra.'
        : 'Mô phỏng sẽ tự dừng chính xác tại T/4.';

  return (
    <>
      <div className="breadcrumb">
        <a href="#/">
          <Icon name="home" size={15} />
          Phòng thí nghiệm
        </a>
        <Icon name="chevron" size={12} />
        <strong>{group.title}</strong>
      </div>
      <div className="page-heading lab-page-heading">
        <div>
          <a className="back-link" href="#/">
            <Icon name="back" size={16} />
            Chọn thí nghiệm khác
          </a>
          <h1>
            {group.title}
            <span>.</span>
          </h1>
          <p>
            {model === 'hooke' || model === 'spring'
              ? 'Từ một lực kéo, đến quy luật của những dao động.'
              : group.description}
          </p>
        </div>
        <span className="class-badge">
          <span className="class-dot" />
          VẬT LÝ THPT<span className="class-level">10 — 11</span>
        </span>
      </div>
      <nav className="lab-navigation" aria-label="Thí nghiệm và chế độ">
        <div className="lab-study-navigation">
          {group.id === 'spring' ? (
            <div className="study-tabs" aria-label="Nội dung lò xo">
              <a
                className={model === 'hooke' ? 'active' : ''}
                href={modelPath.hooke}
                aria-current={model === 'hooke' ? 'page' : undefined}
              >
                Định luật Hooke
              </a>
              <a
                className={model === 'spring' ? 'active' : ''}
                href={modelPath.spring}
                aria-current={model === 'spring' ? 'page' : undefined}
              >
                Dao động điều hòa
              </a>
            </div>
          ) : (
            <span className="current-study">
              <Icon name={group.icon} size={21} />
              {modelTitles[model]}
            </span>
          )}
          <select
            className="lab-quick-select"
            aria-label="Chọn nhóm thí nghiệm"
            value={group.id}
            onChange={(e) => {
              const next = groups.find((g) => g.id === e.target.value)!;
              window.location.hash = modelPath[next.model];
            }}
          >
            <option value="spring">Lò xo và dao động</option>
            <option value="torque">Moment lực</option>
            <option value="circular">Chuyển động tròn</option>
            <option value="projectile">Ném ngang</option>
            <option value="pendulum">Con lắc đơn</option>
          </select>
        </div>
        <div className="mode-switch" aria-label="Chế độ">
          <button
            className={mode === 'sandbox' ? 'active' : ''}
            onClick={() => selectMode('sandbox')}
            aria-pressed={mode === 'sandbox'}
          >
            <Icon name="flask" size={16} />
            Sandbox
          </button>
          <button
            className={mode === 'challenge' ? 'active' : ''}
            onClick={() => selectMode('challenge')}
            aria-pressed={mode === 'challenge'}
          >
            <Icon name="target" size={16} />
            Challenge Lab
          </button>
        </div>
      </nav>
      {inChallenge && (
        <ChallengePanel
          challenge={challenge}
          available={available}
          onSelect={(id) => loadChallenge(available.find((c) => c.id === id)!)}
          prediction={prediction}
          onPrediction={(value) => {
            setPrediction(value);
            setResult(null);
          }}
          hasRun={hasRun}
          result={result}
          hint={hint}
          onHint={() => setHint(!hint)}
          onCheck={check}
          onRetry={() => loadChallenge(challenge)}
          canCheck={canCheck}
          actual={actual}
          baseline={baseline}
          progressMessage={progressMessage}
        />
      )}
      <div className="lab-grid">
        <div className="main-column">
          <section className="simulation-card card">
            <div className="simulation-heading">
              <div>
                <span className="live-dot" />
                <h2>{modelTitles[model]}</h2>
                <span className="dimension-label">{dynamic ? '2D' : 'TĨNH'}</span>
              </div>
              <span className={`status-badge ${sim.running ? 'running' : ''}`} role="status">
                <span />
                {status}
              </span>
            </div>
            <div className="canvas-wrap">
              {model !== 'circular' && (
                <div className="canvas-label">
                  {model === 'torque'
                    ? 'HAI LỰC HƯỚNG XUỐNG · TRỤC CỐ ĐỊNH O'
                    : model === 'projectile'
                      ? 'NÉM NGANG TỪ ĐỘ CAO h'
                      : 'HỆ LÒ XO NẰM NGANG'}
                </div>
              )}
              {dynamic && (
                <span className="time-label">
                  t = <strong>{format(sim.time, 2)}</strong> s
                </span>
              )}
              <SimulationCanvas
                config={config}
                display={display}
                getTime={sim.getTime}
                subscribe={sim.subscribe}
                secret={secret}
                target={inChallenge && challenge.id === 'target' ? challenge.target : undefined}
                revealRange={!concealed}
              />
            </div>
            {dynamic ? (
              <SimulationControls
                running={sim.running}
                time={sim.time}
                completed={completed}
                ready={ready}
                speed={speed}
                onPlay={togglePlay}
                onReset={clearAttempt}
                onSpeed={setSpeed}
              />
            ) : (
              <div className="static-controls">
                <Icon name="sliders" size={17} />
                <span>Mô hình tĩnh · Điều chỉnh thông số để quan sát ngay.</span>
                <button className="text-button" onClick={restoreDefaults}>
                  <Icon name="reset" size={15} />
                  Đặt lại
                </button>
              </div>
            )}
            {needsPrediction && !ready && (
              <p className="prediction-reminder">
                Chọn hoặc nhập dự đoán ở bảng thử thách để bắt đầu.
              </p>
            )}
            {model === 'circular' && (
              <div className="vector-legend">
                <span>
                  <i className="gold-dot" />v tiếp tuyến
                </span>
                <span>
                  <i className="blue-dot" />a hướng tâm
                </span>
                <span>Độ dài vector được scale để quan sát.</span>
              </div>
            )}
          </section>
          <section
            className={`stats-grid stats-count-${stats.length}`}
            aria-label="Đại lượng vật lý hiện tại"
          >
            {stats.map((stat) => (
              <div className={`stat-card card ${stat.color}`} key={stat.symbol}>
                <div>
                  <span>{stat.label}</span>
                  <i>{stat.symbol}</i>
                </div>
                <strong>
                  {stat.value}
                  <small>{stat.unit}</small>
                </strong>
              </div>
            ))}
          </section>
          {config.kind === 'circular' && (
            <div className="projection-readout">
              <span>
                Góc hiện tại{' '}
                <strong>{format(circularState(config.params, sim.time).angle, 2)} rad</strong>
              </span>
              <span>
                Li độ hình chiếu{' '}
                <strong>{format(circularState(config.params, sim.time).projection)} m</strong>
              </span>
            </div>
          )}
          {config.kind === 'spring' && (
            <div className="projection-readout">
              <span>
                Tần số <strong>{format(springState(config.params, sim.time).frequency)} Hz</strong>
              </span>
              <span>
                Tần số góc{' '}
                <strong>{format(springState(config.params, sim.time).omega)} rad/s</strong>
              </span>
            </div>
          )}
          <Graph
            config={config}
            time={sim.time}
            subscribe={sim.subscribe}
            concealed={concealed}
            secret={secret}
          />
          <TheoryPanel config={config} time={sim.time} />
        </div>
        <div className="side-column">
          <ControlPanel
            model={model}
            parameters={getParameters(config, secret ? ['k'] : [])}
            editable={inChallenge ? challenge.editable : undefined}
            onChange={changeParameter}
            onDefaults={restoreDefaults}
            display={display}
            onDisplay={(key, value) => setDisplay((old) => ({ ...old, [key]: value }))}
            predictionLocked={!ready}
            note={assumptions[model]}
          />
          {secret && (
            <div className="secret-note">
              <Icon name="info" size={20} />
              <p>
                Độ cứng được giữ cố định và ẩn ở mọi bảng. Hãy suy luận từ một ngoại lực khác 0 và
                độ biến dạng tương ứng.
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="learning-tip">
        <span className="tip-icon">
          <Icon name="spark" size={20} />
        </span>
        <p>
          <strong>
            {inChallenge ? 'Học bằng cách kiểm chứng.' : 'Tò mò một chút, hiểu thêm một điều.'}
          </strong>{' '}
          {learningTips[model]}
        </p>
        {!inChallenge && (
          <button className="text-button" onClick={() => selectMode('challenge')}>
            Thử thách bản thân
            <Icon name="arrow" size={16} />
          </button>
        )}
      </div>
    </>
  );
}
