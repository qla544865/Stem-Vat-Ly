import type { CSSProperties, ReactNode } from 'react';
import type { DisplayOptions, Model, Parameter } from '../simulations/catalog.ts';
import { isDynamic } from '../simulations/catalog.ts';
import Icon from './Icon';

interface Props {
  model: Model | 'pendulum';
  parameters: Parameter[];
  editable?: string[];
  onChange: (key: string, value: number) => void;
  onDefaults: () => void;
  display: DisplayOptions;
  onDisplay: (key: keyof DisplayOptions, value: boolean) => void;
  predictionLocked: boolean;
  note: string;
  children?: ReactNode;
}

export default function ControlPanel(p: Props) {
  const toggles: { key: keyof DisplayOptions; label: string }[] = [];
  if (['spring', 'circular', 'projectile', 'collision', 'energy'].includes(p.model))
    toggles.push({ key: 'velocity', label: 'Vector vận tốc' });
  if (['spring', 'circular'].includes(p.model))
    toggles.push({
      key: 'acceleration',
      label: p.model === 'circular' ? 'Vector gia tốc hướng tâm' : 'Vector gia tốc',
    });
  toggles.push({ key: 'annotations', label: 'Chú thích mô phỏng' });

  return (
    <aside className="control-card card">
      <div className="panel-heading">
        <span className="heading-icon">
          <Icon name="sliders" size={18} />
        </span>
        <h2>{isDynamic(p.model) ? 'Thông số thí nghiệm' : 'Thông số minh họa'}</h2>
      </div>
      <p className="panel-description">Thay đổi một chút. Khám phá nhiều hơn.</p>
      {p.children}
      <div className="parameters">
        {p.parameters.map((parameter) => {
          const disabled =
            p.predictionLocked || (p.editable !== undefined && !p.editable.includes(parameter.key));
          return (
            <div className={`parameter ${disabled ? 'parameter-locked' : ''}`} key={parameter.key}>
              <label htmlFor={`param-${parameter.key}`}>
                <span>
                  {parameter.label} <i>{parameter.symbol}</i>
                </span>
                {disabled && <span className="fixed-label">Cố định</span>}
              </label>
              <div className="parameter-value">
                <strong>{parameter.value.toFixed(parameter.digits)}</strong>
                <span>{parameter.unit}</span>
              </div>
              <input
                id={`param-${parameter.key}`}
                type="range"
                min={parameter.min}
                max={parameter.max}
                step={parameter.step}
                value={parameter.value}
                disabled={disabled}
                onChange={(e) => p.onChange(parameter.key, Number(e.target.value))}
                style={
                  {
                    '--fill': `${((parameter.value - parameter.min) / (parameter.max - parameter.min)) * 100}%`,
                  } as CSSProperties
                }
                aria-valuetext={`${parameter.value} ${parameter.unit}`}
              />
              <div className="range-labels">
                <span>
                  {parameter.min} {parameter.unit}
                </span>
                <span>
                  {parameter.max} {parameter.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <button className="defaults-button" onClick={p.onDefaults}>
        <Icon name="reset" size={15} />
        Khôi phục thông số
      </button>
      <div className="display-options">
        <span>HIỂN THỊ</span>
        {toggles.map((toggle) => (
          <label className="switch-row" key={toggle.key}>
            {toggle.label}
            <input
              type="checkbox"
              checked={p.display[toggle.key]}
              onChange={(e) => p.onDisplay(toggle.key, e.target.checked)}
            />
            <span className="switch" aria-hidden="true" />
          </label>
        ))}
      </div>
      <div className="control-note">
        <Icon name="info" size={17} />
        <p>{p.note}</p>
      </div>
    </aside>
  );
}
