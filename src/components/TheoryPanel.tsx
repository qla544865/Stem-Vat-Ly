import type { ReactNode } from 'react';
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
import type { Oscillator } from '../simulations/oscillator/physics.ts';
import { averagePower, efficiencyState, forceState } from '../simulations/interactive/physics.ts';
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
  oscillator:
    'Lò xo tuyến tính, cản nhớt theo vận tốc, chuyển động ngang. Mỗi lần chạy bắt đầu từ x₀ với v₀ = 0.',
  forces:
    'Hai lực đồng quy tại O. Ox hướng sang phải, Oy hướng lên. Góc dương ngược chiều kim đồng hồ từ Ox.',
  power:
    'Hai máy thực hiện cùng công A. Dùng công suất trung bình trong khoảng thời gian hoàn thành công.',
  efficiency:
    'Công đầu vào bằng công có ích cộng công hao phí. Các thanh dùng chung thang đo theo J.',
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
  oscillator:
    'So sánh ω₀ với vị trí đỉnh khi tăng lực cản. Lực cản lớn ảnh hưởng thế nào đến đáp ứng?',
  forces: 'Thử đặt hai lực bằng nhau rồi thay đổi góc giữa chúng. Khi nào hợp lực triệt tiêu?',
  power: 'Giữ công không đổi rồi giảm thời gian nâng xuống một nửa. Công suất thay đổi thế nào?',
  efficiency: 'Giữ công có ích cố định rồi tăng công đầu vào. Phần hao phí thay đổi thế nào?',
};

export function readouts(
  config: SimulationConfig,
  time: number,
  concealed: boolean,
  collision?: CollisionPlan,
  oscillation?: ReturnType<Oscillator['state']>,
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
      const stats = [
        item('Li độ', 'x', s.x, 'm', 'teal'),
        item('Vận tốc', 'v', s.v, 'm/s', 'gold'),
        item('Gia tốc', 'a', s.a, 'm/s²', 'blue'),
        item('Chu kỳ', 'T', s.T, 's', 'purple'),
      ];
      if (concealed) stats[3].value = '—';
      return stats;
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
        item('Độ cao hiện tại', 'h', s.height, 'm', 'blue', 2),
        item('Tốc độ dọc dốc', 'v', s.speed, 'm/s', 'gold', 2),
        item('Gia tốc dọc dốc', 'a', s.acceleration, 'm/s²', 'teal', 2),
      ];
    }
    case 'oscillator': {
      const s = oscillation!;
      return [
        item('Li độ', 'x', s.x, 'm', 'teal'),
        item('Vận tốc', 'v', s.v, 'm/s', 'gold'),
        item('Cơ năng', 'E', s.energy, 'J', 'blue'),
        item('Hệ số cản', 'b', config.params.b, 'N·s/m', 'purple', 1),
      ];
    }
    case 'forces': {
      const s = forceState(config.params);
      const angle = item('Hướng hợp lực', 'α', s.angle ?? 0, '°', 'purple', 1);
      if (s.angle === null) {
        angle.value = '—';
        angle.unit = '';
      }
      return [
        item('Thành phần ngang', 'Rₓ', s.x, 'N', 'blue', 2),
        item('Thành phần đứng', 'Rᵧ', s.y, 'N', 'gold', 2),
        item('Độ lớn hợp lực', 'R', s.magnitude, 'N', 'teal', 2),
        angle,
      ];
    }
    case 'power': {
      const { work, t1, t2 } = config.params;
      return [
        item('Công suất máy A', 'P₁', averagePower(work, t1), 'W', 'teal', 2),
        item('Công suất máy B', 'P₂', averagePower(work, t2), 'W', 'blue', 2),
      ];
    }
    case 'efficiency': {
      const s = efficiencyState(config.params);
      return [
        item('Hiệu suất', 'H', s.percent, '%', 'teal', 2),
        item('Công hao phí', 'Aₕ', s.lost, 'J', 'gold', 0),
      ];
    }
  }
}

export default function TheoryPanel({
  config: c,
  time,
  oscillator,
  hideResonancePeak,
}: {
  config: SimulationConfig;
  time: number;
  oscillator?: Oscillator;
  hideResonancePeak?: boolean;
}) {
  let formula: ReactNode = '';
  let explanation = '';
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
      formula = (
        <>
          W = W<sub>đ</sub> + W<sub>t</sub> = ½mv<sup>2</sup> + mgh
        </>
      );
      explanation =
        'Phản lực vuông góc với chuyển động nên công của phản lực bằng 0. Thế năng giảm đúng bằng phần động năng tăng.';
      equations = [
        'a = g sin β',
        's = ½at² · L = h₀/sin β',
        `t đến chân dốc = ${format(s.end)} s`,
        'v tại chân dốc = √(2gh₀)',
        `W = mgh₀ = ${format(s.initial, 2)} J`,
        'h là độ cao hiện tại so với chân dốc, h₀ là độ cao ban đầu.',
      ];
      break;
    }
    case 'oscillator': {
      const { mode, b, m, k, omega } = c.params;
      const { omega0 } = oscillator!;
      formula = mode === 'damped' ? 'mx″ + bx′ + kx = 0' : 'mx″ + bx′ + kx = F₀ cos(Ωt)';
      explanation =
        mode === 'damped'
          ? b === 0
            ? 'Hệ dao động tự do với cơ năng không đổi vì lực đàn hồi là lực duy nhất theo phương chuyển động.'
            : 'Lực cản ngược chiều vận tốc và làm giảm cơ năng. Chuyển động qua lại chỉ xảy ra dưới ngưỡng tắt dần tới hạn.'
          : b > 0
            ? 'Li độ thực gồm thành phần quá độ do điều kiện đầu và thành phần xác lập do lực kích thích. Quá độ suy giảm theo thời gian.'
            : Math.abs(omega - omega0) < 1e-9
              ? 'Trong mô hình không cản tại Ω = ω₀, biên độ tăng theo thời gian và không có biên độ xác lập hữu hạn.'
              : 'Khi b = 0, thành phần dao động tự do tồn tại cùng thành phần cưỡng bức. Hệ không tiến tới một đáp ứng xác lập duy nhất.';
      equations = [
        `ω₀ = √(k/m) = ${format(omega0)} rad/s`,
        `b tới hạn = 2√(mk) = ${format(2 * Math.sqrt(m * k))} N·s/m`,
        'Fđh = −kx · Fc = −bv · E = ½mv² + ½kx²',
      ];
      if (mode !== 'damped' && omega === 0)
        equations.push('Tại Ω = 0, lực kích thích không đổi và vị trí cân bằng dịch tới F₀/k.');
      if (mode === 'damped' && oscillator!.regime === 'under')
        equations.push('ωd = √(k/m − (b/2m)²) · A(t) = x₀√(1 + (b/2mωd)²) e⁻ᵇᵗ⁄²ᵐ');
      if (mode !== 'damped' && b > 0) equations.push('X(Ω) = F₀ / √((k − mΩ²)² + (bΩ)²)');
      if (mode === 'resonance' && !hideResonancePeak)
        equations.push('Ω đỉnh = √(k/m − b²/(2m²)) khi biểu thức dưới căn dương.');
      break;
    }
    case 'forces': {
      const s = forceState(c.params);
      formula = 'R⃗ = F⃗₁ + F⃗₂';
      explanation =
        s.angle === null
          ? 'Hai lực cân bằng. Hợp lực bằng 0 nên hướng không xác định.'
          : 'Hợp lực là đường chéo hình bình hành. Cộng các thành phần có dấu trên mỗi trục để tìm độ lớn và hướng.';
      equations = [
        `F₁ₓ = ${format(s.first.x, 2)} N · F₁ᵧ = ${format(s.first.y, 2)} N`,
        `F₂ₓ = ${format(s.second.x, 2)} N · F₂ᵧ = ${format(s.second.y, 2)} N`,
        'Rₓ = F₁ₓ + F₂ₓ · Rᵧ = F₁ᵧ + F₂ᵧ',
        'R = √(Rₓ² + Rᵧ²) · α = atan2(Rᵧ, Rₓ)',
      ];
      break;
    }
    case 'power': {
      const { work, t1, t2 } = c.params;
      formula = 'P = A/t';
      explanation =
        'Công suất trung bình cho biết lượng công thực hiện trong một đơn vị thời gian. Với cùng công A, máy hoàn thành nhanh hơn có công suất lớn hơn.';
      equations = [
        `A₁ = A₂ = ${work} J`,
        `P₁ = ${work} J / ${t1} s = ${format(averagePower(work, t1), 2)} W`,
        `P₂ = ${work} J / ${t2} s = ${format(averagePower(work, t2), 2)} W`,
        '1 W = 1 J/s · t > 0',
      ];
      break;
    }
    case 'efficiency': {
      const { input, useful } = c.params;
      formula = 'H = (Aᵢ / Aᵥ) × 100%';
      explanation =
        'Một phần công đầu vào nâng vật, phần còn lại hao phí. Mô hình lý tưởng đạt 100% khi công hao phí bằng 0.';
      equations = [
        `Aₕ = Aᵥ − Aᵢ = ${input} J − ${useful} J = ${input - useful} J`,
        '0 ≤ Aᵢ ≤ Aᵥ · Aᵥ > 0',
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
