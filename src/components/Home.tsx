import GuidedTour from './GuidedTour';
import { challengeTour } from '../tours/config.ts';
import { catalog, categoryLabels, modelsIn, staticDescription } from '../simulations/catalog.ts';
import type { Category, LabRoute } from '../simulations/catalog.ts';
import { challengeModel, challenges } from '../challenges/config.ts';
import { areaLabels, challengePath, modelPath } from '../navigation.ts';
import type { Area } from '../navigation.ts';
import Icon from './Icon';

function Illustration({ kind }: { kind: LabRoute }) {
  return (
    <svg viewBox="0 0 320 150" fill="none" className="lab-illustration" aria-hidden="true">
      <defs>
        <pattern id={`dots-${kind}`} width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r=".7" fill="#c8d9cb" />
        </pattern>
      </defs>
      <rect width="320" height="150" fill={`url(#dots-${kind})`} />
      {kind === 'spring' || kind === 'hooke' ? (
        <>
          <path
            d="M48 44v65M48 80h22l8-15 12 30 12-30 12 30 12-30 12 30 12-30 12 30 12-30 12 30 8-15h24"
            stroke="#4c9e83"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <rect x="220" y="59" width="40" height="40" rx="7" fill="#0b8f82" />
          <text x="240" y="85" fill="white" textAnchor="middle" fontSize="19" fontFamily="Georgia">
            m
          </text>
          <path d="M37 109h249M206 32v93" stroke="#a3bdac" strokeDasharray="4 4" />
        </>
      ) : kind === 'torque' ? (
        <>
          <path d="M47 66h226" stroke="#72a58d" strokeWidth="9" strokeLinecap="round" />
          <path d="m160 71-17 35h34l-17-35Z" fill="#8ab39b" />
          <path
            d="M92 39v58m-5-7 5 7 5-7M248 39v58m-5-7 5 7 5-7"
            stroke="#0b8f82"
            strokeWidth="2"
          />
          <path d="M160 39H92m68 0h88" stroke="#b3c7b5" />
          <circle cx="160" cy="66" r="4" fill="white" />
          <text x="159" y="129" fill="#7a9b83" textAnchor="middle" fontSize="13">
            F₁d₁ = F₂d₂
          </text>
        </>
      ) : kind === 'pendulum' ? (
        <>
          <path d="M130 22h60m-30 4v104" stroke="#9abca6" strokeDasharray="5 4" />
          <path d="M78 86a102 102 0 0 0 164 0" stroke="#9abca6" strokeWidth="1.5" />
          <path d="m160 26 67 76M160 48a22 22 0 0 0 14-5" stroke="#0b8f82" strokeWidth="2" />
          <circle cx="160" cy="26" r="4" fill="#4c9e83" />
          <circle cx="227" cy="102" r="12" fill="#0b8f82" />
          <text x="183" y="53" fill="#5c806a" fontSize="14">
            θ
          </text>
        </>
      ) : kind === 'circular' ? (
        <>
          <circle cx="102" cy="72" r="43" stroke="#93bba4" strokeWidth="1.5" />
          <path d="M102 72h43M49 72h108M102 125V18M226 117h72" stroke="#bacfbe" />
          <path d="M132 42 258 117" stroke="#9abca6" strokeDasharray="4 4" />
          <path d="M102 72 132 42" stroke="#0b8f82" />
          <circle cx="132" cy="42" r="6" fill="#0b8f82" />
          <circle cx="258" cy="117" r="6" fill="#0b8f82" />
          <path d="M134 39 116 23m0 0 1 7m-1-7 7 1" stroke="#d59a3e" strokeWidth="2" />
          <text x="260" y="77" fill="#7a9b83" textAnchor="middle" fontSize="13">
            x = r cos θ
          </text>
        </>
      ) : (
        <g transform="translate(118 32)" color="#0b8f82">
          <Icon name={catalog[kind].icon} size={84} />
        </g>
      )}
    </svg>
  );
}

const categoryIntro: Record<Area, string> = {
  theory: 'Khám phá công thức và điều kiện cân bằng qua các minh họa tương tác.',
  experiments: 'Điều chỉnh tham số, chạy mô phỏng và quan sát đại lượng vật lý theo thời gian.',
  challenges: 'Vận dụng các mô hình từ Lý thuyết và Thí nghiệm để giải từng nhiệm vụ.',
};

export default function Home({ area }: { area: Area }) {
  return (
    <>
      <section className="home-hero">
        <div className="eyebrow">
          <span className="live-dot" />
          STEM VẬT LÝ 11C5 · Tổ 4 🐧
        </div>
        <h1>
          Vật lý, trong tầm tay<span>.</span>
        </h1>
        <p>
          Một không gian để đặt câu hỏi, tự tay thử nghiệm
          <br className="desktop-break" /> và nhìn thấy những quy luật trong từng chuyển động.
        </p>
        <div className="hero-pills">
          <span>
            <Icon name="flask" size={16} />
            Tự do khám phá
          </span>
          <span>
            <Icon name="target" size={16} />
            Thử thách để thấu hiểu
          </span>
          <span>
            <Icon name="check" size={16} />
            Học tốt Vật Lý
          </span>
        </div>
      </section>
      <section className="home-labs" aria-labelledby="choose-lab">
        <div className="section-heading">
          <div>
            <span className="eyebrow">BẮT ĐẦU TỪ MỘT ĐIỀU TÒ MÒ</span>
            <h2 id="choose-lab">{areaLabels[area]}</h2>
            <p className="area-description">{categoryIntro[area]}</p>
          </div>
        </div>
        {area === 'challenges' && <GuidedTour tour={challengeTour} />}
        {area === 'challenges' ? (
          (Object.keys(categoryLabels) as Category[]).map((category) => (
            <section
              className="challenge-index"
              key={category}
              aria-labelledby={`challenges-${category}`}
            >
              <h3 id={`challenges-${category}`}>{categoryLabels[category]}</h3>
              <div className="challenge-index-grid">
                {challenges
                  .filter((challenge) => catalog[challengeModel(challenge)].category === category)
                  .map((challenge) => {
                    const model = catalog[challengeModel(challenge)];
                    return (
                      <a
                        className="challenge-index-card card"
                        key={challenge.id}
                        href={challengePath(challenge.id)}
                      >
                        <span className="experiment-icon">
                          <Icon name={model.icon} size={20} />
                        </span>
                        <span>
                          <small>{model.title}</small>
                          <strong>{challenge.title}</strong>
                        </span>
                        <Icon name="arrow" size={16} />
                      </a>
                    );
                  })}
              </div>
            </section>
          ))
        ) : (
          <div className="home-lab-grid">
            {modelsIn(area).map((id) => {
              const item = catalog[id];
              return (
                <article className={`home-lab-card card lab-${id}`} key={id}>
                  <div className="home-card-top">
                    <span className="experiment-icon">
                      <Icon name={item.icon} size={22} />
                    </span>
                    <span>{areaLabels[area].toLocaleUpperCase('vi-VN')}</span>
                  </div>
                  <Illustration kind={id} />
                  <div className="home-card-content">
                    <span className="home-subject">{item.subject}</span>
                    <h3>{item.title}</h3>
                    <p>
                      {item.description}
                      {area === 'theory' && (
                        <>
                          <br />
                          {staticDescription}.
                        </>
                      )}
                    </p>
                    <div className="lab-tags">
                      {item.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <a className="open-lab-button" href={modelPath[id]}>
                      {area === 'theory' ? 'Mở minh họa' : 'Mở thí nghiệm'}
                      <Icon name="arrow" size={18} />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
      <section className="home-guide">
        <Icon name="spark" size={22} />
        <div>
          <h2>Không chỉ xem. Hãy tự mình kiểm chứng.</h2>
          <p>
            Vận dụng những gì vừa quan sát trong Lý thuyết hoặc Thí nghiệm để giải một nhiệm vụ
            trong Challenge Lab.
          </p>
        </div>
      </section>
    </>
  );
}
