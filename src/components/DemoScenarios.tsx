import { useState } from 'react';
import type { LabRoute } from '../simulations/catalog.ts';
import { demoScenarios } from '../simulations/scenarios.ts';
import type { DemoScenario } from '../simulations/scenarios.ts';

export default function DemoScenarios({
  model,
  onLoad,
  onDefaults,
}: {
  model: LabRoute;
  onLoad: (scenario: DemoScenario) => void;
  onDefaults: () => void;
}) {
  const scenarios = demoScenarios.filter((s) => s.model === model);
  const [id, setId] = useState(scenarios[0]?.id ?? '');
  const [loaded, setLoaded] = useState(false);
  const scenario = scenarios.find((s) => s.id === id);
  if (!scenario) return null;
  return (
    <details className="demo-scenarios card">
      <summary>Demo mẫu · {scenarios.length} tình huống</summary>
      <label>
        Tình huống{' '}
        <select
          value={id}
          onChange={(event) => {
            setId(event.target.value);
            setLoaded(false);
          }}
        >
          {scenarios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <p>
        <strong>{scenario.objective}</strong> {scenario.guidance}
      </p>
      <p>
        Nạp demo sẽ dừng lượt chạy/đo hiện tại và đưa thời gian về 0. Giữ các kết quả thực hành đã
        ghi.
      </p>
      <div className="demo-actions">
        <button
          className="lab-presentation-button"
          onClick={() => {
            onLoad(scenario);
            setLoaded(true);
          }}
        >
          Nạp demo
        </button>
        <button
          className="text-button"
          onClick={() => {
            onDefaults();
            setLoaded(false);
          }}
        >
          Cấu hình mặc định
        </button>
        <span role="status">
          {loaded ? 'Đã nạp · Bấm Bắt đầu hoặc Đo 10 dao động để chạy.' : ''}
        </span>
      </div>
    </details>
  );
}
