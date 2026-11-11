import { collisionDefaults } from './collision/physics.ts';
import { energyDefaults } from './energy/physics.ts';
import { oscillatorDefaults } from './oscillator/physics.ts';
import { investigations, trialParams } from './pendulum/experiment.ts';
import type { Investigation } from './pendulum/experiment.ts';
import type { LabRoute, SimulationConfig } from './catalog.ts';
import { pendulumDefaults } from './pendulum/physics.ts';
import type { PendulumParams } from './pendulum/physics.ts';

interface ScenarioInfo {
  id: string;
  name: string;
  objective: string;
  guidance: string;
}
export type DemoScenario = ScenarioInfo &
  (
    | { model: 'pendulum'; params: PendulumParams; practice?: { id: Investigation; value: number } }
    | { model: Exclude<LabRoute, 'pendulum'>; config: SimulationConfig }
  );
const firstLength = investigations.length.values[0];
export const demoScenarios: DemoScenario[] = [
  {
    id: 'pendulum-mass',
    model: 'pendulum',
    name: 'Khối lượng và chu kỳ',
    objective: 'So sánh chu kỳ khi đổi khối lượng.',
    params: { ...pendulumDefaults, l: 0.5, m: 0.05, alpha0: Math.PI / 36 },
    guidance: 'Chạy với 50 g, rồi đổi sang 150 g; giữ l, góc thả và g. So sánh T.',
  },
  {
    id: 'pendulum-length',
    model: 'pendulum',
    name: 'Chiều dài và chu kỳ',
    objective: 'Quan sát T tỉ lệ với căn bậc hai của l ở góc nhỏ.',
    params: { ...pendulumDefaults, l: 0.4, alpha0: Math.PI / 36 },
    guidance: 'Chạy với l = 40 cm rồi đổi thành 90 cm. Dự đoán tỉ số chu kỳ trước khi đọc T.',
  },
  {
    id: 'pendulum-measure',
    model: 'pendulum',
    name: 'Đo 10 dao động',
    objective: 'Đo T và suy ra g từ đồ thị T²–l.',
    params: trialParams('length', firstLength),
    practice: { id: 'length', value: firstLength },
    guidance:
      'Chọn khảo sát chiều dài. Đo 10 dao động và ghi từng mốc, sau đó mở Kết quả & đồ thị. Các hàng đã ghi được giữ; Ghi kết quả tại mốc đã có sẽ cập nhật hàng đó.',
  },
  {
    id: 'collision-elastic',
    model: 'collision',
    name: 'Hai xe đàn hồi',
    objective: 'Hai xe bằng khối lượng trao đổi vận tốc.',
    config: {
      kind: 'collision',
      params: { ...collisionDefaults, m1: 1, m2: 1, v1: 3, v2: -1, kind: 'elastic' },
    },
    guidance:
      'Bấm Bắt đầu, chờ tiếp xúc rồi so sánh vận tốc, tổng động lượng và động năng trước/sau.',
  },
  {
    id: 'collision-soft',
    model: 'collision',
    name: 'Cùng thông số, va chạm mềm',
    objective: 'Động lượng bảo toàn, động năng giảm.',
    config: {
      kind: 'collision',
      params: { ...collisionDefaults, m1: 1, m2: 1, v1: 3, v2: -1, kind: 'inelastic' },
    },
    guidance:
      'Chạy cùng điều kiện với demo đàn hồi. Quan sát hai xe cùng vận tốc sau va chạm và phần động năng chuyển hóa.',
  },
  {
    id: 'energy-slope',
    model: 'energy',
    name: 'Thế năng thành động năng',
    objective: 'Giữ cơ năng trên dốc không ma sát.',
    config: { kind: 'energy', params: { ...energyDefaults, m: 1, h: 5, g: 10 } },
    guidance: 'Chạy từ nghỉ. Theo dõi 50 J chuyển dần sang động năng và tốc độ ở chân dốc.',
  },
  {
    id: 'oscillator-free',
    model: 'oscillator',
    name: 'Dao động tự do',
    objective: 'Đường chuẩn không cản.',
    config: { kind: 'oscillator', params: { ...oscillatorDefaults, mode: 'damped', b: 0 } },
    guidance: 'Chạy rồi so sánh với demo tắt dần; giữ nguyên m, k và li độ đầu.',
  },
  {
    id: 'oscillator-damped',
    model: 'oscillator',
    name: 'Dao động tắt dần',
    objective: 'Quan sát đường bao và cơ năng giảm.',
    config: { kind: 'oscillator', params: { ...oscillatorDefaults, mode: 'damped', b: 1 } },
    guidance: 'Chạy và đối chiếu đường bao với demo tự do. Quan sát E(t).',
  },
  {
    id: 'oscillator-resonance',
    model: 'oscillator',
    name: 'Tìm đỉnh cộng hưởng',
    objective: 'Khảo sát biên độ xác lập theo tần số kích thích.',
    config: {
      kind: 'oscillator',
      params: { ...oscillatorDefaults, mode: 'resonance', b: 1, omega: 3 },
    },
    guidance:
      'Thay Ω gần ω₀ = 4 rad/s và đọc đồ thị X(Ω). Phân biệt đáp ứng quá độ với biên độ xác lập.',
  },
];
