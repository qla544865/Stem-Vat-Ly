import { useEffect, useState } from 'react';
import Home from './components/Home';
import LabWorkspace from './components/LabWorkspace';
import PendulumLab from './components/PendulumLab';
import Icon from './components/Icon';
import {
  areaFromHash,
  areaLabels,
  areaPath,
  challengeFromHash,
  modelFromHash,
} from './navigation.ts';
import type { Area } from './navigation.ts';
import { catalog } from './simulations/catalog.ts';
import { emptyPendulumNotebook } from './simulations/pendulum/experiment.ts';

export default function App() {
  const [hash, setHash] = useState(() => window.location.hash);
  const model = modelFromHash(hash);
  const challenge = challengeFromHash(hash);
  const area = challenge ? 'challenges' : model ? catalog[model].category : areaFromHash(hash);
  const [pendulumNotebook, setPendulumNotebook] = useState(emptyPendulumNotebook);
  useEffect(() => {
    const navigate = () => {
      setHash(window.location.hash);
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('hashchange', navigate);
    return () => window.removeEventListener('hashchange', navigate);
  }, []);

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <a href="#/" className="brand" aria-label="PhyLab trang chính">
            <span className="brand-mark">
              <Icon name="flask" size={25} />
            </span>
            <span>
              Phy<span className="brand-lab">Lab</span>
            </span>
          </a>
          <span className="brand-divider" />
          <span className="brand-description">STEM VẬT LÝ 11C5</span>
          <nav className="header-sections" aria-label="Khu vực học tập">
            {(Object.keys(areaLabels) as Area[]).map((item) => (
              <a
                key={item}
                href={areaPath[item]}
                aria-current={area === item ? (model ? 'location' : 'page') : undefined}
              >
                {areaLabels[item]}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <main className={`workspace ${model ? 'lab-workspace' : 'home-workspace'}`}>
        {model === 'pendulum' ? (
          <PendulumLab notebook={pendulumNotebook} setNotebook={setPendulumNotebook} />
        ) : model ? (
          <LabWorkspace key={model} model={model} challenge={challenge} />
        ) : (
          <Home area={area} />
        )}
        <footer>
          <span className="footer-brand">
            PhyLab<span> / </span>Không gian nhỏ. Khám phá lớn.
          </span>
          <span>Mô hình lý tưởng · Dành cho học tập</span>
        </footer>
      </main>
    </>
  );
}
