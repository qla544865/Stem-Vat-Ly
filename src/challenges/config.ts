import type { SpringParams } from '../simulations/spring/physics.ts';
import type { ProjectileParams } from '../simulations/projectile/physics.ts';
import type { HookeParams } from '../simulations/spring/hooke.ts';
import type { TorqueParams } from '../simulations/torque/physics.ts';
import type { CircularParams } from '../simulations/circular/physics.ts';
import type { Model } from '../simulations/catalog.ts';
import { collisionDefaults } from '../simulations/collision/physics.ts';
import type { CollisionParams } from '../simulations/collision/physics.ts';
import { energyDefaults, workDefaults, workState } from '../simulations/energy/physics.ts';
import type { EnergyParams, WorkParams } from '../simulations/energy/physics.ts';

export type Experiment =
  'spring' | 'projectile' | 'torque' | 'circular' | 'collision' | 'work' | 'energy';
export type ChallengeId =
  | 'period'
  | 'mass'
  | 'target'
  | 'predict'
  | 'secret'
  | 'balance'
  | 'centripetal'
  | 'projection'
  | 'collision-predict'
  | 'collision-stop'
  | 'collision-conserve'
  | 'work-target'
  | 'work-signs'
  | 'energy-height'
  | 'energy-predict';
export interface Challenge {
  id: ChallengeId;
  experiment: Experiment;
  model?: Model;
  title: string;
  description: string;
  hint: string;
  explanation: string;
  editable: string[];
  initial:
    | SpringParams
    | ProjectileParams
    | HookeParams
    | TorqueParams
    | CircularParams
    | CollisionParams
    | WorkParams
    | EnergyParams;
  target: number;
  tolerance: number;
  goalLabel?: string;
  goalDisplay?: string;
  answer?: {
    label: string;
    unit?: string;
    min?: number;
    choices?: { value: string; label: string }[];
  };
}

export const workAngles = [30, 90, 150];

export function workSignScore(answers: readonly (number | undefined)[]) {
  return workAngles.filter(
    (angle, index) =>
      workState({ force: 10, displacement: 5, alpha: (angle * Math.PI) / 180 }).sign ===
      answers[index],
  ).length;
}
export const challenges: Challenge[] = [
  {
    id: 'secret',
    experiment: 'spring',
    model: 'hooke',
    title: 'Độ cứng bí mật',
    description:
      'Độ cứng của lò xo đã được ẩn. Thay đổi ngoại lực khác 0, quan sát độ biến dạng rồi nhập giá trị k suy ra. Sai số cho phép: ±5%.',
    hint: 'Ở cân bằng tĩnh, F = kΔl nên k = F/Δl. Với lực nén, F và Δl đều âm nên k vẫn dương. Phép đo F = 0 không xác định được k.',
    explanation: 'Độ cứng là tỉ số F/Δl của một phép đo khác 0, cũng là hệ số góc của đồ thị F–Δl.',
    editable: ['externalForce'],
    initial: { k: 80, externalForce: 0 },
    target: 80,
    tolerance: 4,
    goalLabel: 'SUY LUẬN TỪ PHÉP ĐO',
    goalDisplay: 'k = ?',
    answer: { label: 'Độ cứng dự đoán', unit: 'N/m' },
  },
  {
    id: 'period',
    experiment: 'spring',
    title: 'Đạt chu kỳ mục tiêu',
    description:
      'Điều chỉnh khối lượng và độ cứng để chu kỳ đạt 2,00 s, với sai lệch tối đa 0,05 s. Chạy mô phỏng rồi kiểm tra.',
    hint: 'T = 2π√(m/k). Tăng m làm chu kỳ tăng; tăng k làm chu kỳ giảm. Thử m = 1 kg và k gần 10 N/m.',
    explanation:
      'Chu kỳ phụ thuộc vào tỉ số m/k, không phụ thuộc biên độ. Có nhiều cặp m và k cùng tạo ra chu kỳ 2 giây.',
    editable: ['m', 'k'],
    initial: { m: 1, k: 20, A: 0.3 },
    target: 2,
    tolerance: 0.05,
  },
  {
    id: 'mass',
    experiment: 'spring',
    title: 'Khối lượng & chu kỳ',
    description:
      'Nếu khối lượng tăng 4 lần và độ cứng giữ nguyên, chu kỳ thay đổi thế nào? Chọn dự đoán, tăng m từ 0,50 lên 2,00 kg rồi chạy để kiểm chứng.',
    hint: 'Chu kỳ tỉ lệ với căn bậc hai của khối lượng. Hãy tính √4.',
    explanation: 'T₂/T₁ = √(m₂/m₁) = √4 = 2. Khối lượng tăng 4 lần thì chu kỳ tăng 2 lần.',
    editable: ['m'],
    initial: { m: 0.5, k: 20, A: 0.3 },
    target: 2,
    tolerance: 0.001,
  },
  {
    id: 'balance',
    experiment: 'torque',
    title: 'Cân bằng thanh',
    description:
      'Bên trái: 20 N cách O một khoảng 1 m. Bên phải: 10 N. Điều chỉnh cánh tay đòn bên phải để thanh cân bằng moment. Dung sai: ±0,10 N·m.',
    hint: 'Cần F₁d₁ = F₂d₂. Chia moment bên trái cho lực bên phải để tìm d₂.',
    explanation: 'd₂ = 2 m: 20 × 1 = 10 × 2 = 20 N·m. Hai moment ngược chiều triệt tiêu nhau.',
    editable: ['d2'],
    initial: { F1: 20, d1: 1, F2: 10, d2: 0.8 },
    target: 0,
    tolerance: 0.1,
    goalLabel: 'ĐIỀU KIỆN CÂN BẰNG',
    goalDisplay: 'M₁ = M₂',
  },
  {
    id: 'centripetal',
    experiment: 'circular',
    title: 'Gia tốc hướng tâm',
    description:
      'Điều chỉnh bán kính và tốc độ góc để gia tốc hướng tâm đạt 18 m/s². Chạy mô phỏng rồi kiểm tra. Dung sai: ±0,20 m/s².',
    hint: 'aₕₜ = ω²r. Thử r = 2 m, rồi tính ω = √(18/2).',
    explanation:
      'Với r = 2 m và ω = 3 rad/s, aₕₜ = 3² × 2 = 18 m/s². Gia tốc hướng vào tâm, không làm đổi độ lớn vận tốc.',
    editable: ['r', 'omega'],
    initial: { r: 1.5, m: 1, omega: 2, phi: 0 },
    target: 18,
    tolerance: 0.2,
    goalLabel: 'GIA TỐC MỤC TIÊU',
    goalDisplay: '18 m/s²',
  },
  {
    id: 'projection',
    experiment: 'circular',
    title: 'Dự đoán hình chiếu',
    description:
      'Vật bắt đầu tại góc 0°, quay ngược chiều kim đồng hồ. Trục x hướng sang phải. Dự đoán li độ hình chiếu sau ¼ chu kỳ, rồi chạy đến mốc đó để kiểm chứng.',
    hint: 'Sau ¼ chu kỳ, góc quét là π/2 rad = 90°. Thay vào x = r cos θ.',
    explanation:
      'Sau T/4, θ = π/2 và x = r cos(π/2) = 0. Vật quay ở phía trên tâm, còn hình chiếu đi qua vị trí cân bằng.',
    editable: [],
    initial: { r: 2, m: 1, omega: 2, phi: 0 },
    target: 0,
    tolerance: 1e-8,
    goalLabel: 'MỐC KIỂM CHỨNG',
    goalDisplay: 't = T/4',
    answer: {
      label: 'Li độ sau ¼ chu kỳ',
      choices: [
        { value: '1', label: 'x = +r (biên phải)' },
        { value: '0', label: 'x = 0 (vị trí cân bằng)' },
        { value: '-1', label: 'x = −r (biên trái)' },
        { value: '.5', label: 'x = r/2' },
      ],
    },
  },
  {
    id: 'target',
    experiment: 'projectile',
    title: 'Bắn trúng mục tiêu',
    description:
      'Mục tiêu cách bệ phóng 18,00 m. Chỉ điều chỉnh vận tốc ngang để vật rơi cách mục tiêu không quá 0,50 m. Chạy đến khi vật chạm đất.',
    hint: 'Thời gian rơi chỉ phụ thuộc h và g. Tính t = √(2h/g), sau đó v₀ = 18/t.',
    explanation:
      'Với độ cao cố định, thời gian rơi không đổi. Tầm xa tỉ lệ thuận với vận tốc ném ngang.',
    editable: ['v0'],
    initial: { h: 20, v0: 6, g: 9.81 },
    target: 18,
    tolerance: 0.5,
  },
  {
    id: 'predict',
    experiment: 'projectile',
    title: 'Dự đoán tầm xa',
    description:
      'Với h = 20 m, v₀ = 8 m/s và g = 9,81 m/s², vật sẽ rơi cách bệ phóng bao xa? Nhập dự đoán trước khi chạy. Sai lệch cho phép: 0,50 m.',
    hint: 'Tính thời gian rơi t = √(2h/g), rồi nhân với v₀ để tìm L.',
    explanation:
      'L = v₀√(2h/g) ≈ 16,15 m. Chuyển động ngang đều và chuyển động rơi tự do xảy ra đồng thời.',
    editable: [],
    initial: { h: 20, v0: 8, g: 9.81 },
    target: 8 * Math.sqrt(40 / 9.81),
    tolerance: 0.5,
  },
  {
    id: 'collision-predict',
    experiment: 'collision',
    title: 'Dự đoán vận tốc sau va chạm',
    description:
      'Xe A (1 kg) chạy sang phải với 2 m/s, xe B (2 kg) đứng yên. Dự đoán vận tốc có dấu của A sau va chạm đàn hồi rồi chạy để kiểm chứng.',
    hint: 'Dùng cả bảo toàn động lượng và điều kiện vận tốc tương đối đảo chiều sau va chạm đàn hồi.',
    explanation:
      'Xe A bật lại với v₁′ = −2/3 m/s. Xe B đi sang phải và tổng động lượng của hai xe giữ nguyên.',
    editable: [],
    initial: { ...collisionDefaults, m2: 2, v1: 2, v2: 0 },
    target: -2 / 3,
    tolerance: 0.05,
    goalLabel: 'DỰ ĐOÁN CÓ DẤU',
    goalDisplay: 'v₁′ = ?',
    answer: { label: 'Vận tốc xe A sau va chạm', unit: 'm/s', min: -100 },
  },
  {
    id: 'collision-stop',
    experiment: 'collision',
    title: 'Hai xe cùng đứng yên',
    description:
      'Chỉnh vận tốc hai xe chạy ngược chiều sao cho chúng dính lại và đứng yên sau va chạm mềm.',
    hint: 'Để vận tốc chung bằng 0, hai động lượng ban đầu phải cùng độ lớn và ngược dấu.',
    explanation:
      'Ở va chạm mềm, (m₁ + m₂)v′ = m₁v₁ + m₂v₂. Tổng động lượng bằng 0 cho vận tốc chung bằng 0.',
    editable: ['v1', 'v2'],
    initial: { ...collisionDefaults, m2: 2, kind: 'inelastic' },
    target: 0,
    tolerance: 0.05,
    goalLabel: 'SAU VA CHẠM MỀM',
    goalDisplay: '|v′| ≤ 0,05 m/s',
  },
  {
    id: 'collision-conserve',
    experiment: 'collision',
    title: 'Đại lượng nào được bảo toàn?',
    description:
      'Dự đoán đại lượng được bảo toàn khi hai xe này va chạm mềm, rồi quan sát bảng trước và sau.',
    hint: 'Hệ hai xe không chịu ngoại lực theo phương ngang. Hai xe dính lại sau va chạm.',
    explanation:
      'Tổng động lượng được bảo toàn. Động năng giảm và chuyển hóa sang các dạng năng lượng khác.',
    editable: [],
    initial: { ...collisionDefaults, kind: 'inelastic' },
    target: 0,
    tolerance: 1e-8,
    goalLabel: 'VA CHẠM MỀM',
    goalDisplay: 'So sánh trước / sau',
    answer: {
      label: 'Đại lượng được bảo toàn',
      choices: [
        { value: '1', label: 'Tổng động lượng' },
        { value: '2', label: 'Tổng động năng' },
        { value: '3', label: 'Vận tốc từng xe' },
      ],
    },
  },
  {
    id: 'work-target',
    experiment: 'work',
    title: 'Tạo công 100 J',
    description: 'Điều chỉnh lực, độ dời và góc để lực thực hiện công dương 100 J.',
    hint: 'Khi lực cùng hướng độ dời, cos α = 1. Bạn cũng có thể tìm một nghiệm với góc nhọn.',
    explanation:
      'Công chỉ phụ thuộc vào thành phần lực theo hướng độ dời. Ví dụ 20 N cùng hướng độ dời 5 m cho 100 J.',
    editable: ['force', 'displacement', 'alpha'],
    initial: { ...workDefaults },
    target: 100,
    tolerance: 0.5,
    goalLabel: 'CÔNG MỤC TIÊU',
    goalDisplay: '100 J',
  },
  {
    id: 'work-signs',
    experiment: 'work',
    title: 'Phân loại công của lực',
    description:
      'Cùng một lực 10 N và độ dời 5 m. Hãy xác định dấu của công trong cả ba tình huống.',
    hint: 'So sánh từng góc với 90°. Với F và s dương, dấu của công theo dấu của cos α.',
    explanation: 'Góc 30° cho công dương, 90° cho công bằng 0 và 150° cho công âm.',
    editable: [],
    initial: { ...workDefaults },
    target: workAngles.length,
    tolerance: 0,
    goalLabel: 'BA TÌNH HUỐNG',
    goalDisplay: '30° · 90° · 150°',
  },
  {
    id: 'energy-height',
    experiment: 'energy',
    title: 'Tìm độ cao để đạt 10 m/s',
    description:
      'Chỉnh độ cao thả vật để vận tốc tại chân dốc đạt 10 m/s. Dốc không ma sát và g = 10 m/s².',
    hint: 'Đặt mgh₀ = ½mv² tại chân dốc và giải theo độ cao ban đầu h₀.',
    explanation:
      'Độ cao 5 m cho v = √(2gh₀) = 10 m/s. Khối lượng và góc dốc không đổi kết quả này.',
    editable: ['h'],
    initial: { ...energyDefaults },
    target: 10,
    tolerance: 0.05,
    goalLabel: 'VẬN TỐC CHÂN DỐC',
    goalDisplay: '10 m/s',
  },
  {
    id: 'energy-predict',
    experiment: 'energy',
    title: 'Dự đoán sự chuyển hóa cơ năng',
    description:
      'Chọn cách động năng, thế năng và tổng cơ năng biến đổi khi vật trượt xuống dốc không ma sát. Sau đó chạy để kiểm chứng.',
    hint: 'Vật thấp dần và nhanh dần. Trọng lực làm thế năng chuyển hóa thành động năng.',
    explanation: 'Động năng tăng, thế năng giảm cùng lượng và tổng cơ năng giữ nguyên.',
    editable: [],
    initial: { ...energyDefaults, h: 5 },
    target: 0,
    tolerance: 1e-8,
    goalLabel: 'DỰ ĐOÁN NĂNG LƯỢNG',
    goalDisplay: 'W',
    answer: {
      label: 'Dự đoán của bạn',
      choices: [
        { value: '1', label: 'Động năng tăng, thế năng giảm, cơ năng không đổi' },
        { value: '2', label: 'Động năng và thế năng đều không đổi' },
        { value: '3', label: 'Động năng tăng và cơ năng cũng tăng' },
      ],
    },
  },
];

export function validateChallenge(c: Challenge, actual: number, prediction?: number) {
  if (!Number.isFinite(actual)) return false;
  const within = (difference: number) => Math.abs(difference) <= c.tolerance + 1e-9;
  if (c.id === 'mass')
    return Number.isFinite(prediction) && prediction === 2 && within(actual - c.target);
  if (c.id === 'predict' || c.id === 'secret' || c.id === 'collision-predict')
    return Number.isFinite(prediction) && within(prediction! - actual);
  if (c.id === 'projection') return prediction === 0 && within(actual - c.target);
  if (c.id === 'collision-conserve' || c.id === 'energy-predict')
    return prediction === 1 && within(actual - c.target);
  return within(actual - c.target);
}

export const challengeModel = (c: Challenge): Model => c.model ?? c.experiment;
export const predictionBeforeRun = (c: Challenge) =>
  [
    'mass',
    'predict',
    'projection',
    'collision-predict',
    'collision-conserve',
    'energy-predict',
  ].includes(c.id);

export interface AttemptEvidence {
  interacted: boolean;
  hasRun: boolean;
  time: number;
  completed: boolean;
  nonzeroForce: boolean;
  answer?: number;
  collided?: boolean;
  classified?: boolean;
}

export function canCheckChallenge(c: Challenge, e: AttemptEvidence) {
  const answered = Number.isFinite(e.answer);
  if (c.id === 'secret') return e.interacted && e.nonzeroForce && answered && e.answer! > 0;
  if (c.id === 'balance') return e.interacted;
  if (c.id === 'work-target') return e.interacted;
  if (c.id === 'work-signs') return e.classified === true;
  if (!e.hasRun || e.time <= 0) return false;
  if (predictionBeforeRun(c) && !answered) return false;
  if (c.experiment === 'collision') return e.collided === true;
  if (c.experiment === 'energy' || ['target', 'predict', 'projection'].includes(c.id))
    return e.completed;
  return true;
}
