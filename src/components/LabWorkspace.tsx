import { useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Challenge } from '../challenges/config.ts';
import {
  canCheckChallenge,
  challengeModel,
  challenges,
  predictionBeforeRun,
  validateChallenge,
  workAngles,
  workSignScore,
} from '../challenges/config.ts';
import type { DisplayOptions, Model, SimulationConfig } from '../simulations/catalog.ts';
import {
  defaultConfig,
  getParameters,
  catalog,
  isDynamic,
  staticDescription,
  updateParameter,
} from '../simulations/catalog.ts';
import { areaLabels, areaPath, challengePath, modelPath } from '../navigation.ts';
import { springState } from '../simulations/spring/physics.ts';
import { circularState } from '../simulations/circular/physics.ts';
import { projectileState } from '../simulations/projectile/physics.ts';
import { torqueState } from '../simulations/torque/physics.ts';
import {
  collisionPlan,
  collisionTotals,
  OBSERVATION_TIME,
} from '../simulations/collision/physics.ts';
import { energyState, workState } from '../simulations/energy/physics.ts';
import { useSimulation } from '../simulations/useSimulation.ts';
import SimulationCanvas from './SimulationCanvas';
import SimulationControls from './SimulationControls';
import ControlPanel from './ControlPanel';
import ChallengePanel from './ChallengePanel';
import Graph from './Graph';
import TheoryPanel, { assumptions, format, learningTips, readouts } from './TheoryPanel';
import Icon from './Icon';
import CatalogSelect from './CatalogSelect';
import { CollisionAnalysis, EnergyBars } from './LabAnalysis';

function initialChallengeConfig(c: Challenge): SimulationConfig {
  const defaults = defaultConfig(challengeModel(c));
  // Each trusted definition selects the same model as its initial parameter object.
  return { ...defaults, params: { ...defaults.params, ...c.initial } } as SimulationConfig;
}

export default function LabWorkspace({
  model,
  challenge,
}: {
  model: Model;
  challenge?: Challenge;
}) {
  const [speed, setSpeed] = useState(1);
  const [display, setDisplay] = useState<DisplayOptions>({
    velocity: model === 'circular' || model === 'collision' || model === 'energy',
    acceleration: model === 'circular',
    annotations: true,
  });
  const [presenting, setPresenting] = useState(false);
  return (
    <div className={presenting ? 'lab-presenting' : undefined}>
      <LabSession
        key={challenge?.id ?? model}
        model={model}
        activeChallenge={challenge}
        speed={speed}
        setSpeed={setSpeed}
        display={display}
        setDisplay={setDisplay}
        presenting={presenting}
        onPresentation={() => setPresenting(!presenting)}
      />
    </div>
  );
}

interface SessionProps {
  model: Model;
  activeChallenge?: Challenge;
  speed: number;
  setSpeed: (speed: number) => void;
  display: DisplayOptions;
  setDisplay: Dispatch<SetStateAction<DisplayOptions>>;
  presenting: boolean;
  onPresentation: () => void;
}

function LabSession({
  model,
  activeChallenge,
  speed,
  setSpeed,
  display,
  setDisplay,
  presenting,
  onPresentation,
}: SessionProps) {
  const available = challenges.filter((c) => challengeModel(c) === model);
  const challenge = activeChallenge ?? available[0];
  const [config, setConfig] = useState(() =>
    activeChallenge ? initialChallengeConfig(activeChallenge) : defaultConfig(model),
  );
  const [prediction, setPrediction] = useState('');
  const [classifications, setClassifications] = useState<(number | undefined)[]>([]);
  const [hasRun, setHasRun] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);
  const [hint, setHint] = useState(false);
  const inChallenge = Boolean(activeChallenge);
  const dynamic = isDynamic(model);
  const secret = inChallenge && challenge.id === 'secret';
  const item = catalog[model];
  const area = inChallenge ? 'challenges' : item.category;
  const collision = useMemo(
    () => (config.kind === 'collision' ? collisionPlan(config.params) : undefined),
    [config],
  );
  let end = Infinity;
  if (config.kind === 'projectile') end = projectileState(config.params, 0).fallTime;
  if (inChallenge && challenge.id === 'projection' && config.kind === 'circular')
    end = circularState(config.params, 0).T / 4;
  if (collision) end = collision.end;
  if (config.kind === 'energy') end = energyState(config.params, 0).end;
  const sim = useSimulation(speed, end);
  const completed = Number.isFinite(end) && sim.time >= end;
  const contact = collision?.contact;
  const collided = Boolean(contact && sim.time >= contact.time);
  const incline = config.kind === 'energy' ? energyState(config.params, sim.time) : undefined;
  const work = config.kind === 'work' ? workState(config.params) : undefined;
  const analysis = collision ? (
    <CollisionAnalysis plan={collision} time={sim.time} />
  ) : incline ? (
    <EnergyBars state={incline} />
  ) : null;
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
    collided,
    classified: workAngles.every((_, index) => classifications[index] !== undefined),
  });
  const stats = readouts(config, sim.time, concealed, collision);
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
    case 'collision':
      if (collision && contact && collided) {
        actual =
          challenge.id === 'collision-conserve'
            ? collisionTotals(collision.params, contact.v1, contact.v2).momentum -
              collision.before.momentum
            : contact.v1;
      }
      break;
    case 'work':
      actual = challenge.id === 'work-signs' ? workSignScore(classifications) : work!.work;
      break;
    case 'energy':
      actual =
        challenge.id === 'energy-predict' ? incline!.total - incline!.initial : incline!.speed;
      break;
  }

  function clearAttempt() {
    sim.reset();
    setHasRun(false);
    setInteracted(false);
    setResult(null);
  }
  function changeParameter(key: string, value: number) {
    if (!Number.isFinite(value) || (inChallenge && !challenge.editable.includes(key)) || !ready)
      return;
    clearAttempt();
    setConfig((previous) => updateParameter(previous, key, value));
    setInteracted(true);
  }
  function restoreDefaults() {
    clearAttempt();
    setConfig(activeChallenge ? initialChallengeConfig(activeChallenge) : defaultConfig(model));
    setPrediction('');
    setClassifications([]);
    setHint(false);
  }
  function changeCollisionKind(kind: string) {
    if (inChallenge || config.kind !== 'collision' || (kind !== 'elastic' && kind !== 'inelastic'))
      return;
    clearAttempt();
    setConfig({ ...config, params: { ...config.params, kind } });
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
          : model === 'energy'
            ? 'Đã tới chân dốc'
            : collision
              ? end === OBSERVATION_TIME
                ? 'Hết thời gian quan sát'
                : 'Đã tới biên quan sát'
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
  if (work) status = work.sign === 0 ? 'Công bằng 0' : work.sign > 0 ? 'Công dương' : 'Công âm';
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
  else if (challenge.id === 'work-target' && !interacted)
    progressMessage = 'Điều chỉnh tham số của lực rồi kiểm tra.';
  else if (challenge.id === 'work-signs' && !canCheck)
    progressMessage = 'Chọn dấu của công ở cả ba tình huống.';
  else if (needsPrediction && !validAnswer)
    progressMessage = 'Chọn hoặc nhập dự đoán trước khi chạy mô phỏng.';
  else if (collision && hasRun && !collided)
    progressMessage = completed
      ? 'Hai xe không va chạm trong khoảng quan sát. Đặt lại hoặc đổi vận tốc.'
      : 'Chờ hai xe tiếp xúc để kiểm tra.';
  else if (hasRun && Number.isFinite(end) && !completed)
    if (!canCheck)
      progressMessage =
        model === 'projectile'
          ? 'Chờ vật chạm đất để kiểm tra.'
          : model === 'energy'
            ? 'Chờ vật tới chân dốc để kiểm tra.'
            : 'Mô phỏng sẽ tự dừng chính xác tại T/4.';

  return (
    <>
      <div className="breadcrumb">
        <a href={areaPath[area]}>
          <Icon name="home" size={15} />
          {areaLabels[area]}
        </a>
        <Icon name="chevron" size={12} />
        <strong>{item.title}</strong>
      </div>
      <div className="page-heading lab-page-heading">
        <div>
          <a className="back-link" href={areaPath[area]}>
            <Icon name="back" size={16} />
            Về {areaLabels[area]}
          </a>
          <h1>
            {item.title}
            <span>.</span>
          </h1>
          <p>{dynamic ? item.description : `${staticDescription}.`}</p>
        </div>
        {dynamic ? (
          <button
            className="lab-presentation-button"
            aria-pressed={presenting}
            onClick={onPresentation}
          >
            <Icon name="screen" size={18} /> {presenting ? 'Thoát trình chiếu' : 'Trình chiếu'}
          </button>
        ) : (
          <span className="class-badge">
            <span className="class-dot" />
            VẬT LÝ THPT<span className="class-level">10 — 11</span>
          </span>
        )}
      </div>
      <nav className="lab-navigation" aria-label="Nội dung và chế độ">
        <div className="lab-study-navigation">
          <span className="current-study">
            <Icon name={item.icon} size={21} />
            {areaLabels[item.category]}
          </span>
          <CatalogSelect model={model} />
        </div>
        <div className="mode-switch" aria-label="Chế độ">
          <button
            className={!inChallenge ? 'active' : ''}
            onClick={() => {
              if (inChallenge) window.location.hash = modelPath[model];
            }}
            aria-pressed={!inChallenge}
          >
            <Icon name={dynamic ? 'flask' : 'book'} size={16} />
            {dynamic ? 'Sandbox' : 'Minh họa'}
          </button>
          <button
            className={inChallenge ? 'active' : ''}
            onClick={() => {
              if (!inChallenge) window.location.hash = challengePath(challenge.id);
            }}
            aria-pressed={inChallenge}
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
          onSelect={(id) => {
            window.location.hash = challengePath(id);
          }}
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
          onRetry={restoreDefaults}
          canCheck={canCheck}
          actual={actual}
          baseline={baseline}
          progressMessage={progressMessage}
          classifications={classifications}
          onClassify={(index, value) => {
            setClassifications((current) => {
              const next = [...current];
              next[index] = value;
              return next;
            });
            setResult(null);
          }}
        />
      )}
      {activeChallenge?.id !== 'work-signs' && (
        <div className="lab-grid">
          <div className="main-column">
            <section className="simulation-card card">
              <div className="simulation-heading">
                <div>
                  <span className="live-dot" />
                  <h2>{item.title}</h2>
                  <span className="dimension-label">
                    {model === 'collision' ? '1D' : dynamic ? '2D' : 'TĨNH'}
                  </span>
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
                        : model === 'collision' && config.kind === 'collision'
                          ? config.params.kind === 'elastic'
                            ? 'VA CHẠM ĐÀN HỒI'
                            : 'VA CHẠM MỀM'
                          : item.subject}
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
                  collision={collision}
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
                  <span>{staticDescription}.</span>
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
                  Tần số{' '}
                  <strong>{format(springState(config.params, sim.time).frequency)} Hz</strong>
                </span>
                <span>
                  Tần số góc{' '}
                  <strong>{format(springState(config.params, sim.time).omega)} rad/s</strong>
                </span>
              </div>
            )}
            {analysis
              ? !presenting && analysis
              : model !== 'work' && (
                  <Graph
                    config={config}
                    time={sim.time}
                    subscribe={sim.subscribe}
                    concealed={concealed}
                    secret={secret}
                  />
                )}
            <TheoryPanel config={config} time={sim.time} />
          </div>
          <div className="side-column">
            {presenting && analysis}
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
            >
              {config.kind === 'collision' && (
                <label className="control-choice">
                  Loại va chạm
                  <select
                    value={config.params.kind}
                    disabled={inChallenge}
                    onChange={(event) => changeCollisionKind(event.target.value)}
                  >
                    <option value="elastic">Đàn hồi hoàn toàn</option>
                    <option value="inelastic">Va chạm mềm</option>
                  </select>
                </label>
              )}
            </ControlPanel>
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
      )}
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
          <button
            className="text-button"
            onClick={() => {
              window.location.hash = challengePath(challenge.id);
            }}
          >
            Thử thách bản thân
            <Icon name="arrow" size={16} />
          </button>
        )}
      </div>
    </>
  );
}
