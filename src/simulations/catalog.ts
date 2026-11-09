import { springDefaults } from './spring/physics.ts';
import type { SpringParams } from './spring/physics.ts';
import { hookeDefaults } from './spring/hooke.ts';
import type { HookeParams } from './spring/hooke.ts';
import { torqueDefaults } from './torque/physics.ts';
import type { TorqueParams } from './torque/physics.ts';
import { circularDefaults } from './circular/physics.ts';
import type { CircularParams } from './circular/physics.ts';
import { projectileDefaults } from './projectile/physics.ts';
import type { ProjectileParams } from './projectile/physics.ts';
import { collisionDefaults } from './collision/physics.ts';
import type { CollisionParams } from './collision/physics.ts';
import { energyDefaults, workDefaults } from './energy/physics.ts';
import type { EnergyParams, WorkParams } from './energy/physics.ts';
import type { IconName } from '../components/Icon.tsx';

export type Model =
  'hooke' | 'spring' | 'torque' | 'circular' | 'projectile' | 'collision' | 'work' | 'energy';
export type LabRoute = Model | 'pendulum';
export type Category = 'theory' | 'experiments';
export type SimulationConfig =
  | { kind: 'hooke'; params: HookeParams }
  | { kind: 'spring'; params: SpringParams }
  | { kind: 'torque'; params: TorqueParams }
  | { kind: 'circular'; params: CircularParams }
  | { kind: 'projectile'; params: ProjectileParams }
  | { kind: 'collision'; params: CollisionParams }
  | { kind: 'work'; params: WorkParams }
  | { kind: 'energy'; params: EnergyParams };

export interface DisplayOptions {
  velocity: boolean;
  acceleration: boolean;
  annotations: boolean;
}
export interface Parameter {
  key: string;
  label: string;
  symbol: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  digits: number;
  value: number;
}

export const categoryLabels: Record<Category, string> = {
  theory: 'Lý thuyết',
  experiments: 'Thí nghiệm',
};
export const staticDescription = 'Minh họa tương tác, thay đổi thông số để quan sát kết quả';

export const catalog: Record<
  LabRoute,
  {
    category: Category;
    title: string;
    subject: string;
    icon: IconName;
    description: string;
    tags: string[];
  }
> = {
  hooke: {
    category: 'theory',
    title: 'Định luật Hooke',
    subject: 'ĐÀN HỒI & CÂN BẰNG',
    icon: 'spring',
    description: 'Quan sát độ giãn và độ nén của lò xo dưới tác dụng của ngoại lực.',
    tags: ['F = kΔl', 'Cân bằng tĩnh'],
  },
  spring: {
    category: 'experiments',
    title: 'Dao động điều hòa của lò xo',
    subject: 'ĐÀN HỒI & DAO ĐỘNG',
    icon: 'spring',
    description: 'Thay đổi biên độ, pha và khối lượng để theo dõi li độ, vận tốc và gia tốc.',
    tags: ['Chu kỳ', 'Đồ thị x, v, a'],
  },
  torque: {
    category: 'theory',
    title: 'Moment lực và cân bằng',
    subject: 'CÂN BẰNG VẬT RẮN',
    icon: 'torque',
    description: 'Đặt lực lên hai phía của điểm tựa. Tự tìm ra điều kiện để thanh cân bằng.',
    tags: ['Cánh tay đòn', 'Quy tắc moment'],
  },
  circular: {
    category: 'experiments',
    title: 'Chuyển động tròn',
    subject: 'CHUYỂN ĐỘNG & HÌNH CHIẾU',
    icon: 'circular',
    description:
      'Theo dấu một vòng quay. Nhìn thấy dao động điều hòa từ hình chiếu của chuyển động tròn.',
    tags: ['Vector hướng tâm', 'Hình chiếu đồng bộ'],
  },
  pendulum: {
    category: 'experiments',
    title: 'Con lắc đơn',
    subject: 'ĐO ĐẠC & DAO ĐỘNG',
    icon: 'pendulum',
    description: 'Thả con lắc, đo 10 dao động và tìm xem chu kỳ phụ thuộc vào những yếu tố nào.',
    tags: ['Ba bài thực hành', 'Đồ thị T²–l'],
  },
  projectile: {
    category: 'experiments',
    title: 'Chuyển động ném ngang',
    subject: 'CHUYỂN ĐỘNG NÉM',
    icon: 'projectile',
    description: 'Tiếp tục khám phá quỹ đạo parabol và dự đoán tầm xa từ một độ cao xác định.',
    tags: ['Ném ngang', 'Quỹ đạo parabol'],
  },
  collision: {
    category: 'experiments',
    title: 'Động lượng và va chạm',
    subject: 'CHUYỂN ĐỘNG MỘT CHIỀU',
    icon: 'collision',
    description:
      'Cho hai xe gặp nhau trên đường ray và so sánh động lượng, động năng trước và sau va chạm.',
    tags: ['Va chạm đàn hồi', 'Va chạm mềm'],
  },
  work: {
    category: 'theory',
    title: 'Công của lực',
    subject: 'LỰC & ĐỘ DỜI',
    icon: 'work',
    description: 'Đổi độ lớn, độ dời và góc của lực để tìm khi nào công dương, âm hoặc bằng 0.',
    tags: ['A = Fs cos α', 'Dấu của công'],
  },
  energy: {
    category: 'experiments',
    title: 'Bảo toàn cơ năng',
    subject: 'MẶT PHẲNG NGHIÊNG',
    icon: 'energy',
    description: 'Thả vật từ đỉnh dốc và quan sát thế năng chuyển thành động năng.',
    tags: ['Động năng', 'Thế năng'],
  },
};
export const modelsIn = (category: Category) =>
  (Object.keys(catalog) as LabRoute[]).filter((model) => catalog[model].category === category);
export const isDynamic = (model: LabRoute) => catalog[model].category === 'experiments';

export function defaultConfig(model: Model): SimulationConfig {
  switch (model) {
    case 'hooke':
      return { kind: model, params: { ...hookeDefaults } };
    case 'spring':
      return { kind: model, params: { ...springDefaults } };
    case 'torque':
      return { kind: model, params: { ...torqueDefaults } };
    case 'circular':
      return { kind: model, params: { ...circularDefaults } };
    case 'projectile':
      return { kind: model, params: { ...projectileDefaults } };
    case 'collision':
      return { kind: model, params: { ...collisionDefaults } };
    case 'work':
      return { kind: model, params: { ...workDefaults } };
    case 'energy':
      return { kind: model, params: { ...energyDefaults } };
  }
}

type ParameterSpec = Omit<Parameter, 'value'> & { radians?: true };
const mass: ParameterSpec = {
  key: 'm',
  label: 'Khối lượng',
  symbol: 'm',
  unit: 'kg',
  min: 0.1,
  max: 4,
  step: 0.05,
  digits: 2,
};
const phase: ParameterSpec = {
  key: 'phi',
  label: 'Pha ban đầu',
  symbol: 'φ',
  unit: '°',
  min: -180,
  max: 180,
  step: 15,
  digits: 0,
  radians: true,
};
const gravity: ParameterSpec = {
  key: 'g',
  label: 'Gia tốc trọng trường',
  symbol: 'g',
  unit: 'm/s²',
  min: 1.6,
  max: 20,
  step: 0.01,
  digits: 2,
};
export const parameterSpecs: Record<Model, ParameterSpec[]> = {
  hooke: [
    {
      key: 'k',
      label: 'Độ cứng lò xo',
      symbol: 'k',
      unit: 'N/m',
      min: 40,
      max: 200,
      step: 5,
      digits: 0,
    },
    {
      key: 'externalForce',
      label: 'Ngoại lực',
      symbol: 'F',
      unit: 'N',
      min: -12,
      max: 12,
      step: 0.5,
      digits: 1,
    },
  ],
  spring: [
    mass,
    {
      key: 'k',
      label: 'Độ cứng lò xo',
      symbol: 'k',
      unit: 'N/m',
      min: 5,
      max: 80,
      step: 0.5,
      digits: 1,
    },
    {
      key: 'A',
      label: 'Biên độ',
      symbol: 'A',
      unit: 'm',
      min: 0.05,
      max: 0.6,
      step: 0.01,
      digits: 2,
    },
    phase,
  ],
  torque: [
    {
      key: 'F1',
      label: 'Lực bên trái',
      symbol: 'F₁',
      unit: 'N',
      min: 0,
      max: 50,
      step: 1,
      digits: 0,
    },
    {
      key: 'd1',
      label: 'Cánh tay đòn trái',
      symbol: 'd₁',
      unit: 'm',
      min: 0,
      max: 3,
      step: 0.05,
      digits: 2,
    },
    {
      key: 'F2',
      label: 'Lực bên phải',
      symbol: 'F₂',
      unit: 'N',
      min: 0,
      max: 50,
      step: 1,
      digits: 0,
    },
    {
      key: 'd2',
      label: 'Cánh tay đòn phải',
      symbol: 'd₂',
      unit: 'm',
      min: 0,
      max: 3,
      step: 0.05,
      digits: 2,
    },
  ],
  circular: [
    { key: 'r', label: 'Bán kính', symbol: 'r', unit: 'm', min: 0.2, max: 3, step: 0.1, digits: 1 },
    mass,
    {
      key: 'omega',
      label: 'Tốc độ góc',
      symbol: 'ω',
      unit: 'rad/s',
      min: 0.25,
      max: 6,
      step: 0.05,
      digits: 2,
    },
    phase,
  ],
  projectile: [
    {
      key: 'h',
      label: 'Độ cao ban đầu',
      symbol: 'h',
      unit: 'm',
      min: 2,
      max: 50,
      step: 1,
      digits: 0,
    },
    {
      key: 'v0',
      label: 'Vận tốc ném ngang',
      symbol: 'v₀',
      unit: 'm/s',
      min: 1,
      max: 25,
      step: 0.1,
      digits: 1,
    },
    gravity,
  ],
  collision: [
    { ...mass, key: 'm1', label: 'Khối lượng xe A', symbol: 'm₁', max: 5 },
    { ...mass, key: 'm2', label: 'Khối lượng xe B', symbol: 'm₂', max: 5 },
    {
      key: 'v1',
      label: 'Vận tốc ban đầu xe A',
      symbol: 'v₁',
      unit: 'm/s',
      min: -10,
      max: 10,
      step: 0.1,
      digits: 1,
    },
    {
      key: 'v2',
      label: 'Vận tốc ban đầu xe B',
      symbol: 'v₂',
      unit: 'm/s',
      min: -10,
      max: 10,
      step: 0.1,
      digits: 1,
    },
    {
      key: 'x1',
      label: 'Vị trí tâm xe A',
      symbol: 'x₁',
      unit: 'm',
      min: 2,
      max: 8,
      step: 0.1,
      digits: 1,
    },
    {
      key: 'x2',
      label: 'Vị trí tâm xe B',
      symbol: 'x₂',
      unit: 'm',
      min: 12,
      max: 18,
      step: 0.1,
      digits: 1,
    },
  ],
  work: [
    {
      key: 'force',
      label: 'Độ lớn lực',
      symbol: 'F',
      unit: 'N',
      min: 0,
      max: 100,
      step: 1,
      digits: 0,
    },
    {
      key: 'displacement',
      label: 'Độ dời',
      symbol: 's',
      unit: 'm',
      min: 0,
      max: 20,
      step: 0.5,
      digits: 1,
    },
    {
      key: 'alpha',
      label: 'Góc giữa lực và độ dời',
      symbol: 'α',
      unit: '°',
      min: 0,
      max: 180,
      step: 1,
      digits: 0,
      radians: true,
    },
  ],
  energy: [
    mass,
    {
      key: 'h',
      label: 'Độ cao ban đầu',
      symbol: 'h₀',
      unit: 'm',
      min: 0.5,
      max: 12,
      step: 0.1,
      digits: 1,
    },
    {
      key: 'beta',
      label: 'Góc nghiêng',
      symbol: 'β',
      unit: '°',
      min: 15,
      max: 65,
      step: 1,
      digits: 0,
      radians: true,
    },
    gravity,
  ],
};

export function getParameters(config: SimulationConfig, hidden: string[] = []): Parameter[] {
  const values = config.params as unknown as Record<string, number>;
  return parameterSpecs[config.kind]
    .filter((p) => !hidden.includes(p.key))
    .map(({ radians, ...p }) => ({
      ...p,
      value: radians ? ((values[p.key] ?? 0) * 180) / Math.PI : values[p.key],
    }));
}

export function updateParameter(
  config: SimulationConfig,
  key: string,
  input: number,
): SimulationConfig {
  const spec = parameterSpecs[config.kind].find((p) => p.key === key);
  if (!spec || !Number.isFinite(input)) return config;
  const bounded = Math.min(spec.max, Math.max(spec.min, input));
  const value = spec.radians ? (bounded * Math.PI) / 180 : bounded;
  const next = { ...config };
  next.params = { ...config.params, [key]: value };
  return next;
}
