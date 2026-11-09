import Icon from './Icon';

interface Props {
  running: boolean;
  time: number;
  completed: boolean;
  ready: boolean;
  speed: number;
  onPlay: () => void;
  onReset: () => void;
  onSpeed: (speed: number) => void;
}
export default function SimulationControls(p: Props) {
  return (
    <div className="playback-controls">
      <div className="playback-buttons">
        <button
          className="primary-button"
          onClick={p.onPlay}
          disabled={!p.ready}
          title={!p.ready ? 'Chọn hoặc nhập dự đoán trước khi chạy' : undefined}
        >
          <Icon name={p.running ? 'pause' : 'play'} size={17} />
          {p.running ? 'Tạm dừng' : p.completed ? 'Chạy lại' : p.time > 0 ? 'Tiếp tục' : 'Bắt đầu'}
        </button>
        <button
          className="icon-button"
          onClick={p.onReset}
          aria-label="Đặt lại mô phỏng"
          title="Đưa thời gian về 0"
        >
          <Icon name="reset" size={18} />
        </button>
      </div>
      <div className="speed-control">
        <span>Tốc độ</span>
        <div>
          {[0.5, 1, 2].map((speed) => (
            <button
              key={speed}
              className={speed === p.speed ? 'active' : ''}
              aria-pressed={speed === p.speed}
              onClick={() => p.onSpeed(speed)}
            >
              {speed}×
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
