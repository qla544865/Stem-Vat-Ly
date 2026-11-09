import type { SimulationConfig } from '../simulations/catalog.ts';
import { springState } from '../simulations/spring/physics.ts';
import { hookeState } from '../simulations/spring/hooke.ts';
import { torqueState } from '../simulations/torque/physics.ts';
import { circularState } from '../simulations/circular/physics.ts';
import { projectileState } from '../simulations/projectile/physics.ts';
import {
  collisionPlan,
  collisionState,
  collisionTotals,
} from '../simulations/collision/physics.ts';
import type { CollisionPlan } from '../simulations/collision/physics.ts';
import { energyState, workState } from '../simulations/energy/physics.ts';
import Icon from './Icon';

export const format = (value: number, digits = 3) =>
  (Math.abs(value) < 0.5 * 10 ** -digits ? 0 : value).toFixed(digits);
export const assumptions = {
  hooke: 'Lò xo lý tưởng, cân bằng tĩnh trong giới hạn đàn hồi ±0,30 m. Chiều dài tự nhiên 1 m.',
  spring: 'Mặt phẳng ngang không ma sát; bỏ qua lực cản và khối lượng lò xo.',
  torque: 'Thanh lý tưởng bỏ qua trọng lượng; trục O cố định có phản lực. Chỉ xét cân bằng tĩnh.',
  circular: 'Chuyển động tròn đều ngược chiều kim đồng hồ; trục x sang phải, y hướng lên.',
  projectile: 'Gia tốc trọng trường không đổi; bỏ qua sức cản không khí. Trục y hướng xuống.',
  collision:
    'Ray ngang không ma sát. Chiều dương sang phải. Quan sát tối đa 10 s hoặc đến khi một xe chạm biên ray.',
  work: 'Lực không đổi trên độ dời đã cho. Chỉ tính công của lực đang xét, với chiều độ dời sang phải.',
  energy: 'Vật thả từ nghỉ, dốc cố định, bỏ qua lực cản và ma sát. Mốc thế năng ở chân dốc.',
};
export const learningTips = {
  hooke: 'Giữ nguyên ngoại lực, tăng độ cứng. Độ biến dạng của lò xo thay đổi thế nào?',
  spring: 'Thử tăng khối lượng lên 4 lần và quan sát chu kỳ. Thay biên độ có làm chu kỳ đổi không?',
  torque: 'Một lực nhỏ có thể cân bằng một lực lớn nếu cánh tay đòn thay đổi như thế nào?',
  circular:
    'Theo dõi chấm tròn và hình chiếu: khi nào hình chiếu ở biên, khi nào qua vị trí cân bằng?',
  projectile: 'Thử tăng gấp đôi vận tốc ngang. Thời gian rơi và tầm xa thay đổi thế nào?',
  collision: 'Đổi từ va chạm đàn hồi sang va chạm mềm. Đại lượng nào vẫn giữ nguyên?',
  work: 'Thử góc 90°, rồi đổi sang góc tù. Dấu của công thay đổi thế nào?',
  energy: 'Giữ nguyên độ cao và đổi góc dốc. So sánh thời gian trượt và vận tốc ở chân dốc.',
};

export function readouts(
  config: SimulationConfig,
  time: number,
  concealed: boolean,
  collision?: CollisionPlan,
) {
  const item = (
    label: string,
    symbol: string,
    value: number,
    unit: string,
    color: string,
    digits = 3,
  ) => ({ label, symbol, value: format(value, digits), unit, color });
  switch (config.kind) {
    case 'hooke': {
      const s = hookeState(config.params);
      return [
        item('Ngoại lực', 'F', s.externalForce, 'N', 'gold', 1),
        item('Lực đàn hồi', 'Fđh', s.elasticForce, 'N', 'blue', 1),
        item('Độ biến dạng', 'Δl', s.deformation, 'm', 'teal'),
        item('Chiều dài', 'l', s.length, 'm', 'purple'),
      ];
    }
    case 'spring': {
      const s = springState(config.params, time);
      return [
        item('Li độ', 'x', s.x, 'm', 'teal'),
        item('Vận tốc', 'v', s.v, 'm/s', 'gold'),
        item('Gia tốc', 'a', s.a, 'm/s²', 'blue'),
        item('Chu kỳ', 'T', s.T, 's', 'purple'),
      ];
    }
    case 'torque': {
      const s = torqueState(config.params);
      return [
        item('Moment trái ↶', 'M₁', s.M1, 'N·m', 'teal', 2),
        item('Moment phải ↷', 'M₂', s.M2, 'N·m', 'gold', 2),
        item('Chênh lệch có dấu', 'ΣM', s.net, 'N·m', 'blue', 2),
      ];
    }
    case 'circular': {
      const s = circularState(config.params, time);
      return [
        item('Tốc độ dài', 'v', s.speed, 'm/s', 'gold'),
        item('Gia tốc hướng tâm', 'aₕₜ', s.acceleration, 'm/s²', 'blue'),
        item('Lực hướng tâm', 'Fₕₜ', s.force, 'N', 'teal'),
        item('Chu kỳ', 'T', s.T, 's', 'purple'),
      ];
    }
    case 'projectile': {
      const s = projectileState(config.params, time);
      const stats = [
        item('Vị trí ngang', 'x', s.x, 'm', 'teal', 2),
        item('Vận tốc ngang', 'vₓ', s.vx, 'm/s', 'gold', 2),
        item('Vận tốc đứng', 'vᵧ', s.vy, 'm/s', 'blue', 2),
        item('Tầm xa', 'L', s.range, 'm', 'purple', 2),
      ];
      if (concealed) stats[3].value = '—';
      return stats;
    }
    case 'collision': {
      const { v1, v2 } = collisionState(collision ?? collisionPlan(config.params), time);
      const totals = collisionTotals(config.params, v1, v2);
      return [
        item('Vận tốc A', 'v₁', v1, 'm/s', 'teal', 2),
        item('Vận tốc B', 'v₂', v2, 'm/s', 'blue', 2),
        item('Tổng động lượng', 'P', totals.momentum, 'kg·m/s', 'purple', 2),
        item('Tổng động năng', 'Eₖ', totals.kinetic, 'J', 'gold', 2),
      ];
    }
    case 'work': {
      const s = workState(config.params);
      return [
        item('Thành phần theo độ dời', 'F∥', s.parallel, 'N', 'blue', 2),
        item('Công của lực', 'A', s.work, 'J', 'teal', 2),
      ];
    }
    case 'energy': {
      const s = energyState(config.params, time);
      return [
        item('Độ cao hiện tại', 'y', s.height, 'm', 'blue', 2),
        item('Tốc độ dọc dốc', 'v', s.speed, 'm/s', 'gold', 2),
        item('Gia tốc dọc dốc', 'a', s.acceleration, 'm/s²', 'teal', 2),
      ];
    }
  }
}

export default function TheoryPanel({
  config: c,
  time,
}: {
  config: SimulationConfig;
  time: number;
}) {
  let formula = '',
    explanation = '';
  let equations: string[] = [];
  switch (c.kind) {
    case 'hooke': {
      const s = hookeState(c.params);
      formula = 'F = kΔl';
      explanation =
        'Cùng một lực, lò xo càng cứng thì biến dạng càng ít. Lực đàn hồi và ngoại lực cân bằng nhau, có cùng độ lớn và ngược chiều.';
      equations = [
        'F ngoại = kΔl',
        'F đàn hồi = −kΔl',
        `l = l₀ + Δl = ${format(s.length)} m`,
        'l₀ = 1 m · Δl ∈ [−0,30; +0,30] m',
      ];
      break;
    }
    case 'spring': {
      const s = springState(c.params, time);
      formula = 'T = 2π√(m/k)';
      explanation =
        'Chu kỳ phụ thuộc khối lượng và độ cứng, không phụ thuộc biên độ. Vận tốc lớn nhất ở vị trí cân bằng; gia tốc luôn hướng về đó.';
      equations = [
        `ω = √(k/m) = ${format(s.omega)} rad/s`,
        `f = 1/T = ${format(s.frequency)} Hz`,
        `φ = ${format(c.params.phi ?? 0)} rad`,
        'x = A cos(ωt + φ)',
        'v = −Aω sin(ωt + φ)',
        'a = −ω²x',
        `F = −kx = ${format(s.F)} N`,
        `E = ½kA² = ${format(s.E)} J`,
        `Động năng: ${format(s.kinetic)} J`,
        `Thế năng: ${format(s.potential)} J`,
      ];
      break;
    }
    case 'torque': {
      const s = torqueState(c.params);
      formula = 'F₁d₁ = F₂d₂';
      explanation =
        'Cánh tay đòn là khoảng cách vuông góc từ trục đến giá của lực. Hai lực hướng xuống ở hai phía O gây xu hướng quay ngược nhau.';
      equations = [
        `M₁ = F₁d₁ = ${format(s.M1, 2)} N·m`,
        `M₂ = F₂d₂ = ${format(s.M2, 2)} N·m`,
        `ΣM = M₁ − M₂ = ${format(s.net, 2)} N·m`,
        'Quy ước ngược chiều kim đồng hồ là dương.',
        'Cân bằng khi |ΣM| ≤ 0,10 N·m.',
        'Phản lực tại O cân bằng tổng hai lực hướng xuống.',
      ];
      break;
    }
    case 'circular': {
      const s = circularState(c.params, time);
      formula = 'x = r cos(ωt + φ)';
      explanation =
        'Vận tốc tiếp tuyến với quỹ đạo; gia tốc và lực hướng vào tâm. Hình chiếu trên trục x là dao động điều hòa với biên độ A = r.';
      equations = [
        `θ = ωt + φ = ${format(s.theta)} rad`,
        `x hình chiếu = ${format(s.projection)} m`,
        `y vật quay = ${format(s.y)} m`,
        'x = r cos θ · y = r sin θ',
        `v = ωr = ${format(s.speed)} m/s`,
        `aₕₜ = ω²r = ${format(s.acceleration)} m/s²`,
        `Fₕₜ = mω²r = ${format(s.force)} N`,
        `T = 2π/ω = ${format(s.T)} s`,
        'Hai khung cùng chiều dương x sang phải.',
      ];
      break;
    }
    case 'projectile': {
      const s = projectileState(c.params, time);
      formula = 'L = v₀√(2h/g)';
      explanation =
        'Chuyển động ngang đều kết hợp với rơi tự do tạo nên quỹ đạo parabol. Thời gian rơi không phụ thuộc vận tốc ngang.';
      equations = [
        'x = v₀t · y = ½gt²',
        'vₓ = v₀ · vᵧ = gt',
        `y hiện tại = ${format(s.y, 2)} m`,
        `t rơi = √(2h/g) = ${format(s.fallTime)} s`,
        'Gốc O tại vị trí ném, y hướng xuống.',
      ];
      break;
    }
    case 'collision':
      formula = 'P = m₁v₁ + m₂v₂';
      explanation =
        'Tổng động lượng có dấu được bảo toàn khi không có ngoại lực dọc ray. Động năng giữ nguyên ở va chạm đàn hồi và giảm ở va chạm mềm khi hai xe có vận tốc khác nhau.';
      equations = [
        'p₁ = m₁v₁ · p₂ = m₂v₂',
        'Eₖ = ½m₁v₁² + ½m₂v₂²',
        'Đàn hồi · v₁′ − v₂′ = −(v₁ − v₂)',
        'Va chạm mềm · v₁′ = v₂′ = P/(m₁ + m₂)',
      ];
      break;
    case 'work': {
      const s = workState(c.params);
      formula = 'A = Fs cos α';
      explanation =
        'Chỉ thành phần lực dọc theo độ dời sinh công. Với lực và độ dời khác 0, góc nhọn cho công dương, góc tù cho công âm và góc vuông cho công bằng 0.';
      equations = [
        `F∥ = F cos α = ${format(s.parallel, 2)} N`,
        `A = F∥s = ${format(s.work, 2)} J`,
        'Nếu F hoặc s bằng 0 thì công bằng 0.',
      ];
      break;
    }
    case 'energy': {
      const s = energyState(c.params, time);
      formula = 'E = ½mv² + mgy';
      explanation =
        'Phản lực vuông góc với chuyển động nên công của phản lực bằng 0. Thế năng giảm đúng bằng phần động năng tăng.';
      equations = [
        'a = g sin β',
        's = ½at² · L = h/sin β',
        `t đến chân dốc = ${format(s.end)} s`,
        'v tại chân dốc = √(2gh)',
        `E = mgh = ${format(s.initial, 2)} J`,
      ];
      break;
    }
  }
  return (
    <section className="formula-card">
      <div className="formula-heading">
        <Icon name="book" size={18} />
        <h2>Hiểu điều đang diễn ra</h2>
      </div>
      <p>{explanation}</p>
      <div className="main-formula">{formula}</div>
      <details open>
        <summary>
          Công thức & đại lượng
          <Icon name="chevron" size={13} />
        </summary>
        <div className="formula-details">
          {equations.map((equation) => (
            <p key={equation.split('=')[0]}>{equation}</p>
          ))}
        </div>
      </details>
    </section>
  );
}
