import type { Challenge, Measurement } from '../challenges/config.ts';
import { challengeType, challengeTypeLabels, predictionBeforeRun } from '../challenges/config.ts';
import Icon from './Icon';

interface Props {
  challenge: Challenge;
  available: Challenge[];
  onSelect: (id: Challenge['id']) => void;
  prediction: string;
  onPrediction: (value: string) => void;
  predictionLocked: boolean;
  result: { ok: boolean; actual: Measurement } | null;
  hintCount: number;
  onHint: () => void;
  onCheck: () => void;
  onRetry: () => void;
  canCheck: boolean;
  actual: number;
  baseline: number;
  concealed: boolean;
  progressMessage: string;
  classifications: (number | undefined)[];
  onClassify: (index: number, value: number | undefined) => void;
}

const valueText = (value: number, unit = '') =>
  `${Number(value.toFixed(3))}${unit ? ` ${unit}` : ''}`;

export default function ChallengePanel(p: Props) {
  const c = p.challenge;
  const type = challengeType(c);
  const hints = [c.hint, ...(c.extraHints ?? [])];
  const goal = c.goalDisplay ?? valueText(c.target, c.unit);
  const result = p.result;
  const answer = c.answer;
  const chooseBeforeRun = predictionBeforeRun(c);
  const predictedValue = ['predict', 'collision-predict', 'secret'].includes(c.id);
  const targetText =
    result &&
    (predictedValue
      ? valueText(result.actual.value, c.unit)
      : c.hideResonancePeak
        ? valueText(c.target, c.unit)
        : goal);
  return (
    <section className="challenge-card card">
      <div className="challenge-top">
        <span className="eyebrow">
          <Icon name="target" size={16} /> {challengeTypeLabels[type]}
        </span>
        <div className="challenge-selector" aria-label="Chọn thử thách">
          {p.available.map((item, i) => (
            <button
              key={item.id}
              className={c.id === item.id ? 'selected' : ''}
              aria-pressed={c.id === item.id}
              title={item.title}
              onClick={() => p.onSelect(item.id)}
            >
              Thử thách {i + 1}
            </button>
          ))}
        </div>
      </div>
      <div className="challenge-content">
        <div>
          <h2>{c.title}</h2>
          <p>{c.description}</p>
        </div>
        <div className="challenge-goal">
          <span>{c.goalLabel ?? 'MỤC TIÊU'}</span>
          <strong>{goal}</strong>
        </div>
      </div>
      {answer && (
        <div className="prediction-row">
          <label htmlFor="challenge-answer">{answer.label}</label>
          {answer.choices ? (
            <select
              id="challenge-answer"
              value={p.prediction}
              onChange={(e) => p.onPrediction(e.target.value)}
              disabled={p.predictionLocked}
            >
              <option value="">{chooseBeforeRun ? 'Chọn trước khi chạy…' : 'Chọn đáp án…'}</option>
              {answer.choices.map((choice) => (
                <option key={choice.value} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>
          ) : (
            <div className="prediction-input">
              <input
                id="challenge-answer"
                type="number"
                min={answer.min ?? 0.01}
                max="10000"
                step="0.01"
                placeholder="Nhập kết quả"
                value={p.prediction}
                disabled={p.predictionLocked}
                onChange={(e) => p.onPrediction(e.target.value)}
              />
              <span>{answer.unit}</span>
            </div>
          )}
        </div>
      )}
      {c.classification && (
        <fieldset
          className={`work-classifications${c.id === 'work-signs' ? '' : ' scenario-classifications'}`}
          disabled={result !== null}
        >
          <legend>Chọn đáp án cho từng tình huống</legend>
          {c.classification.map(({ label, choices }, index) => (
            <label key={label}>
              {label}
              <select
                value={p.classifications[index] ?? ''}
                onChange={(e) =>
                  p.onClassify(index, e.target.value === '' ? undefined : Number(e.target.value))
                }
              >
                <option value="">Chọn đáp án…</option>
                {choices.map((choice) => (
                  <option key={choice.value} value={choice.value}>
                    {choice.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </fieldset>
      )}
      {c.id === 'mass' && (
        <div className="comparison">
          <span>Trước: m₁ = 0,50 kg · T₁ = {p.baseline.toFixed(3)} s</span>
          <Icon name="arrow" size={16} />
          <span>
            {p.concealed
              ? 'Sau: T₂ = ?'
              : `Sau: T₂ = ${p.actual.toFixed(3)} s · T₂/T₁ = ${(p.actual / p.baseline).toFixed(2)}`}
          </span>
        </div>
      )}
      <div className="challenge-actions">
        <button className="primary-button small" onClick={p.onCheck} disabled={!p.canCheck}>
          <Icon name="check" size={16} /> Kiểm tra kết quả
        </button>
        <button
          className="text-button"
          onClick={p.onHint}
          aria-controls="challenge-hints"
          aria-expanded={p.hintCount > 0}
        >
          <Icon name="spark" size={16} />
          {p.hintCount === hints.length
            ? 'Ẩn gợi ý'
            : p.hintCount
              ? `Mở gợi ý ${p.hintCount + 1}`
              : 'Xem gợi ý'}
        </button>
        <button className="text-button retry" onClick={p.onRetry}>
          <Icon name="reset" size={15} /> Thử lại
        </button>
      </div>
      {!result && (
        <p className="challenge-progress" role="status">
          {p.progressMessage}
        </p>
      )}
      <div id="challenge-hints">
        {hints.slice(0, p.hintCount).map((hint, index) => (
          <p className="hint-box" key={hint}>
            <strong>Gợi ý {index + 1}. </strong>
            {hint}
          </p>
        ))}
      </div>
      {result && (
        <div className={`challenge-result ${result.ok ? 'success' : 'try-again'}`} role="status">
          <strong>{result.ok ? 'Hoàn thành!' : 'Chưa đạt mục tiêu.'}</strong>
          <span>
            Mục tiêu {targetText} ·{' '}
            {predictedValue
              ? `Bạn nhập ${p.prediction} ${c.unit ?? ''}`
              : `Kết quả ${valueText(result.actual.value, c.unit)}`}
            {c.directionTarget &&
              (result.actual.angle == null
                ? ' · hướng không xác định'
                : ` · ${valueText(result.actual.angle, '°')}`)}
          </span>
          <span>{c.explanation}</span>
          {!result.ok && <span>Dùng gợi ý hoặc chọn Thử lại để kiểm chứng lần nữa.</span>}
        </div>
      )}
    </section>
  );
}
