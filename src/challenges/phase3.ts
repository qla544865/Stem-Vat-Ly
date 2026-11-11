import type { Challenge, Classification } from './config.ts';
import { createOscillator, oscillatorDefaults } from '../simulations/oscillator/physics.ts';
import {
  averagePower,
  efficiencyDefaults,
  efficiencyState,
  forceDefaults,
  forceState,
  powerDefaults,
} from '../simulations/interactive/physics.ts';

const scan = { ...oscillatorDefaults, mode: 'resonance' as const, b: 2, omega: 2 };
const peak = createOscillator(scan).peak!;
const phenomena = [
  { value: 1, label: 'Dao động tự do tắt dần' },
  { value: 2, label: 'Dao động cưỡng bức ngoài vùng cộng hưởng' },
  { value: 3, label: 'Cộng hưởng li độ' },
];
const situations: Classification[] = [
  {
    label: 'Ngoại lực tuần hoàn với F₀ = 2 N, Ω = 1,00 rad/s và b = 2 N·s/m.',
    choices: phenomena,
    correct: 2,
  },
  {
    label: 'Kéo lệch vật rồi thả. Có lực cản nhớt, F₀ = 0 và b = 2 N·s/m.',
    choices: phenomena,
    correct: 1,
  },
  {
    label: 'Ngoại lực tuần hoàn với F₀ = 2 N, Ω ≈ 3,74 rad/s và b = 2 N·s/m.',
    choices: phenomena,
    correct: 3,
  },
];

export const phase3Challenges: Challenge[] = [
  {
    id: 'damping-envelope',
    experiment: 'oscillator',
    title: 'Điều chỉnh tắt dần',
    description:
      'Vật 1 kg được thả từ x₀ = 0,35 m với k = 16 N/m. Chỉnh b để sau 5 s đường bao thấp hơn 0,05 m và vật vẫn qua lại vị trí cân bằng. Chạy tới mốc 5 s để đo.',
    initial: { ...oscillatorDefaults, b: 0.2 },
    editable: ['b'],
    observeUntil: 5,
    target: 0.05,
    tolerance: 0,
    rule: 'below',
    goalDisplay: 'A(5 s) < 0,05 m',
    hint: 'Quan sát hai đường bao và kiểm tra xem vật còn đi qua vị trí cân bằng hay không.',
    extraHints: [
      'Đường bao A(t) = A₀e⁻ᵇᵗ⁄²ᵐ với 0 < b < 2√(mk). A₀ phụ thuộc điều kiện thả.',
      'Giữ b trong miền dưới tới hạn. Tăng b từng bước, chạy tới 5 s và đọc A(t).',
    ],
    explanation:
      'Với 0 < b < 2√(mk), A(5 s) = A₀e⁻⁵ᵇ⁄²ᵐ, trong đó A₀ = x₀√(1 + (b/(2mωd))²). Tại hoặc trên tới hạn, tiêu chí đường bao này không áp dụng.',
    unit: 'm',
    measure: (config, time) => {
      if (config.kind !== 'oscillator') return null;
      const oscillator = createOscillator(config.params);
      return oscillator.regime === 'under' ? { value: oscillator.state(time).envelope! } : null;
    },
  },
  {
    id: 'resonance-frequency',
    experiment: 'oscillator',
    title: 'Tìm tần số kích thích',
    description:
      'Thử các giá trị Ω và so sánh biên độ xác lập để tìm đỉnh đáp ứng li độ. Sai lệch tần số cho phép là 0,05 rad/s.',
    initial: scan,
    editable: ['omega'],
    checkWhen: 'adjusted',
    target: peak,
    tolerance: 0.05,
    goalDisplay: 'X gần cực đại',
    unit: 'rad/s',
    hideResonancePeak: true,
    hint: 'Theo dõi số đo biên độ xác lập khi tăng rồi giảm tần số kích thích quanh vùng cho đáp ứng lớn.',
    extraHints: [
      'Với lực cản khác 0, đỉnh li độ dương thỏa Ωđỉnh² = k/m − b²/(2m²), nếu vế phải dương.',
      'Tìm vùng X cao nhất bằng bước lớn. Giảm bước dò và so sánh X ở hai phía của điểm tốt nhất.',
    ],
    explanation:
      'Với b > 0, cực đại của X = F₀/√((k − mΩ²)² + (bΩ)²) xuất hiện tại Ωđỉnh = √(k/m − b²/(2m²)) khi căn thức dương.',
    measure: (config) => (config.kind === 'oscillator' ? { value: config.params.omega } : null),
  },
  {
    id: 'oscillation-phenomena',
    experiment: 'oscillator',
    title: 'Phân biệt hiện tượng',
    type: 'prediction',
    description:
      'Xét cùng hệ m = 1 kg, k = 16 N/m. Dựa vào lực kích thích, lực cản và tần số, chọn hiện tượng đặc trưng cho cả ba tình huống.',
    initial: scan,
    editable: [],
    classification: situations,
    checkWhen: 'classified',
    target: situations.length,
    tolerance: 0,
    goalDisplay: 'Ba tình huống',
    unit: '/ 3',
    hint: 'Trước hết, tìm xem vật còn chịu lực kích thích sau khi thả hay không.',
    extraHints: [
      'Cộng hưởng li độ là trường hợp cưỡng bức gần đỉnh đáp ứng. Đỉnh dương thỏa Ωđỉnh² = k/m − b²/(2m²).',
      'Tính Ωđỉnh từ m, k và b. So sánh tần số kích thích của từng trường hợp có F₀ khác 0 với đỉnh vừa tính.',
    ],
    explanation:
      'Tình huống 1 có ngoại lực tuần hoàn xa đỉnh nên là cưỡng bức ngoài cộng hưởng. Tình huống 2 chỉ còn lực đàn hồi và lực cản nên là tự do tắt dần. Tình huống 3 là cưỡng bức tại đỉnh cộng hưởng li độ.',
  },
  {
    id: 'force-resultant',
    experiment: 'forces',
    title: 'Tạo hợp lực theo hướng yêu cầu',
    description:
      'Lực 1 bằng 12 N và hướng dọc Ox. Chỉnh độ lớn và hướng lực 2 để hợp lực bằng 20 N ở góc 37° so với Ox. Dung sai là 0,5 N và 2°.',
    initial: { ...forceDefaults },
    editable: ['F2', 'angle2'],
    checkWhen: 'adjusted',
    target: 20,
    tolerance: 0.5,
    directionTarget: { angle: 37, tolerance: 2 },
    goalDisplay: '20 N · 37°',
    unit: 'N',
    hint: 'Quan sát hình bình hành và xem lực 2 cần thêm thành phần nào để hợp lực có hướng yêu cầu.',
    extraHints: [
      'Dùng Rₓ = F₁ₓ + F₂ₓ và Rᵧ = F₁ᵧ + F₂ᵧ. Góc của hợp lực được đo ngược chiều kim đồng hồ từ Ox.',
      'Chiếu hợp lực mục tiêu lên Ox, Oy. Trừ thành phần của lực 1 để tìm hai thành phần của lực 2.',
    ],
    explanation:
      'Từ Rₓ và Rᵧ, tính R = √(Rₓ² + Rᵧ²) và α = atan2(Rᵧ, Rₓ). Cả độ lớn và hướng phải nằm trong dung sai.',
    measure: (config) => {
      if (config.kind !== 'forces') return null;
      const { magnitude, angle } = forceState(config.params);
      return { value: magnitude, angle };
    },
  },
  {
    id: 'power-time',
    experiment: 'power',
    title: 'Tìm thời gian nâng',
    description:
      'Máy A cần thực hiện 300 J với công suất trung bình 40 W. Tìm thời gian nâng để công suất sai lệch không quá 0,25 W.',
    initial: { ...powerDefaults },
    editable: ['t1'],
    checkWhen: 'adjusted',
    target: 40,
    tolerance: 0.25,
    goalDisplay: 'P₁ = 40 W',
    unit: 'W',
    hint: 'Hai máy thực hiện cùng lượng công. Quan sát công suất khi thời gian thay đổi.',
    extraHints: [
      'Công suất trung bình P = A/t.',
      'Giải theo t, chọn thời gian gần giá trị tính được và đối chiếu công suất máy A.',
    ],
    explanation: 't = A/P. Thực hiện 300 J ở 40 W cần 7,5 s.',
    measure: (config) =>
      config.kind === 'power'
        ? { value: averagePower(config.params.work, config.params.t1) }
        : null,
  },
  {
    id: 'efficiency-target',
    experiment: 'efficiency',
    title: 'Đạt hiệu suất mục tiêu',
    description:
      'Máy nhận 400 J. Chỉnh công có ích để đạt hiệu suất 75%, sai lệch không quá 0,5 điểm phần trăm.',
    initial: { ...efficiencyDefaults },
    editable: ['useful'],
    checkWhen: 'adjusted',
    target: 75,
    tolerance: 0.5,
    goalDisplay: 'H = 75%',
    unit: '%',
    hint: 'So sánh chiều dài thanh công có ích với thanh công đầu vào.',
    extraHints: [
      'H = (Aᵢ/Aᵥ) × 100%. Công đầu vào bằng tổng công có ích và hao phí.',
      'Đổi hiệu suất mục tiêu sang phân số rồi nhân với công đầu vào.',
    ],
    explanation: 'Với H = 75%, công có ích bằng ¾ của 400 J, tức 300 J. Phần hao phí là 100 J.',
    measure: (config) =>
      config.kind === 'efficiency' ? { value: efficiencyState(config.params).percent } : null,
  },
];
