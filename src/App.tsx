import { useEffect, useState } from 'react';
import Home from './components/Home';
import LabWorkspace from './components/LabWorkspace';
import PendulumLab from './components/PendulumLab';
import Icon from './components/Icon';
import { modelFromHash } from './navigation.ts';
import { emptyPendulumNotebook } from './simulations/pendulum/experiment.ts';

export default function App() {
  const [model, setModel] = useState(() => modelFromHash(window.location.hash));
  const [pendulumNotebook, setPendulumNotebook] = useState(emptyPendulumNotebook);
  useEffect(() => {
    const navigate = () => {
      setModel(modelFromHash(window.location.hash));
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
          <a className="header-home-link" href="#/">
            <Icon name="home" size={16} />
            Phòng thí nghiệm
          </a>
          <span className="prototype-badge">
            <span />
            Giai đoạn 02A
          </span>
        </div>
      </header>
      <main className={`workspace ${model ? 'lab-workspace' : 'home-workspace'}`}>
        {model === 'pendulum' ? (
          <PendulumLab notebook={pendulumNotebook} setNotebook={setPendulumNotebook} />
        ) : model ? (
          <LabWorkspace key={model} model={model} />
        ) : (
          <Home />
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
