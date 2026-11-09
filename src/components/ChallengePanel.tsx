import type { Challenge } from '../challenges/config.ts';
import Icon from './Icon';
import { predictionBeforeRun } from '../challenges/config.ts';

interface Props {
  challenge: Challenge;
  available: Challenge[];
  onSelect: (id: Challenge['id']) => void;
  prediction: string;
  onPrediction: (value: string) => void;
  hasRun: boolean;
  result: boolean | null;
  hint: boolean;
  onHint: () => void;
  onCheck: () => void;
  onRetry: () => void;
  canCheck: boolean;
  actual: number;
  baseline: number;
  progressMessage: string;
}
export default function ChallengePanel(p: Props) {
  const c = p.challenge;
  return (
    <section className="challenge-card card">
      <div className="challenge-top">
        <span className="eyebrow">
          <Icon name="target" size={16} /> CHALLENGE LAB
        </span>
        <div className="challenge-selector" aria-label="Chọn thử thách">
          {p.available.map((item, i) => (
            <button
              key={item.id}
              className={c.id === item.id ? 'selected' : ''}
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
          <span>
            {c.goalLabel ??
              (c.id === 'period'
                ? 'CHU KỲ MỤC TIÊU'
                : c.id === 'target'
                  ? 'VỊ TRÍ MỤC TIÊU'
                  : 'THỰC NGHIỆM & KIỂM CHỨNG')}
          </span>
          <strong>
            {c.goalDisplay ??
              (c.id === 'period'
                ? '2,00 s'
                : c.id === 'target'
                  ? '18,00 m'
                  : c.id === 'mass'
                    ? 'm₂ = 4m₁'
                    : 'L = ?')}
          </strong>
        </div>
      </div>
      {c.answer && (
        <div className="prediction-row">
          <label htmlFor="challenge-answer">{c.answer.label}</label>
          {c.answer.choices ? (
            <select
              id="challenge-answer"
              value={p.prediction}
              onChange={(e) => p.onPrediction(e.target.value)}
              disabled={p.hasRun && predictionBeforeRun(c)}
            >
              <option value="">Chọn trước khi chạy…</option>
              {c.answer.choices.map((choice) => (
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
                min="0.01"
                max="10000"
                step="0.01"
                placeholder="Nhập kết quả"
                value={p.prediction}
                onChange={(e) => p.onPrediction(e.target.value)}
              />
              <span>{c.answer.unit}</span>
            </div>
          )}
        </div>
      )}
      {c.id === 'mass' && (
        <div className="prediction-row">
          <label htmlFor="mass-prediction">Dự đoán của bạn</label>
          <select
            id="mass-prediction"
            value={p.prediction}
            onChange={(e) => p.onPrediction(e.target.value)}
            disabled={p.hasRun}
          >
            <option value="">Chọn trước khi chạy…</option>
            <option value="1">Chu kỳ không đổi</option>
            <option value="2">Chu kỳ tăng 2 lần</option>
            <option value="4">Chu kỳ tăng 4 lần</option>
            <option value="0.5">Chu kỳ giảm một nửa</option>
          </select>
        </div>
      )}
      {c.id === 'predict' && (
        <div className="prediction-row">
          <label htmlFor="range-prediction">Tầm xa dự đoán</label>
          <div className="prediction-input">
            <input
              id="range-prediction"
              type="number"
              min="0"
              max="10000"
              step="0.01"
              placeholder="Nhập kết quả"
              value={p.prediction}
              disabled={p.hasRun}
              onChange={(e) => p.onPrediction(e.target.value)}
            />
            <span>m</span>
          </div>
        </div>
      )}
      {c.id === 'mass' && (
        <div className="comparison">
          <span>Trước: m₁ = 0,50 kg · T₁ = {p.baseline.toFixed(3)} s</span>
          <Icon name="arrow" size={16} />
          <span>
            Sau: T₂ = {p.actual.toFixed(3)} s
            {p.hasRun ? ` · T₂/T₁ = ${(p.actual / p.baseline).toFixed(2)}` : ''}
          </span>
        </div>
      )}
      <div className="challenge-actions">
        <button className="primary-button small" onClick={p.onCheck} disabled={!p.canCheck}>
          <Icon name="check" size={16} /> Kiểm tra kết quả
        </button>
        <button className="text-button" onClick={p.onHint} aria-expanded={p.hint}>
          <Icon name="spark" size={16} />
          {p.hint ? 'Ẩn gợi ý' : 'Xem gợi ý'}
        </button>
        <button className="text-button retry" onClick={p.onRetry}>
          <Icon name="reset" size={15} />
          Thử lại
        </button>
      </div>
      {p.result === null && (
        <p className="challenge-progress" role="status">
          {p.progressMessage}
        </p>
      )}
      {p.hint && <p className="hint-box">{c.hint}</p>}
      {p.result !== null && (
        <div className={`challenge-result ${p.result ? 'success' : 'try-again'}`} role="status">
          <strong>
            {p.result
              ? 'Hoàn thành! Bạn đã tìm ra quy luật.'
              : 'Chưa đạt mục tiêu. Hãy thử lại nhé.'}
          </strong>
          <span>
            {c.id === 'secret'
              ? `Độ cứng thực tế: ${p.actual.toFixed(1)} N/m. `
              : c.id === 'balance'
                ? `Chênh lệch moment: ${p.actual.toFixed(2)} N·m. `
                : c.id === 'centripetal'
                  ? `Gia tốc hiện tại: ${p.actual.toFixed(2)} m/s². `
                  : c.id === 'projection'
                    ? `Li độ tại T/4: ${Math.abs(p.actual) < 1e-8 ? '0.000' : p.actual.toFixed(3)} m. `
                    : c.id === 'period'
                      ? `Chu kỳ hiện tại: ${p.actual.toFixed(3)} s. `
                      : c.id === 'target' || c.id === 'predict'
                        ? `Tầm xa thực tế: ${p.actual.toFixed(2)} m. `
                        : ''}
            {c.explanation}
          </span>
        </div>
      )}
    </section>
  );
}
