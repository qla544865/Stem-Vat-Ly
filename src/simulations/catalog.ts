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
import type { IconName } from '../components/Icon.tsx';

export type Model = 'hooke' | 'spring' | 'torque' | 'circular' | 'projectile';
export type LabRoute = Model | 'pendulum';
export type Group = 'spring' | 'torque' | 'circular' | 'projectile' | 'pendulum';
export type SimulationConfig =
  | { kind: 'hooke'; params: HookeParams }
  | { kind: 'spring'; params: SpringParams }
  | { kind: 'torque'; params: TorqueParams }
  | { kind: 'circular'; params: CircularParams }
  | { kind: 'projectile'; params: ProjectileParams };

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

export const groups: {
  id: Group;
  model: LabRoute;
  title: string;
  subject: string;
  icon: IconName;
  description: string;
  tags: string[];
}[] = [
  {
    id: 'spring',
    model: 'hooke',
    title: 'Lò xo và dao động',
    subject: 'ĐÀN HỒI & DAO ĐỘNG',
    icon: 'spring',
    description: 'Kéo giãn một lò xo. Tìm quy luật của lực đàn hồi và khám phá nhịp điệu dao động.',
    tags: ['Định luật Hooke', 'Dao động điều hòa'],
  },
  {
    id: 'torque',
    model: 'torque',
    title: 'Moment lực và cân bằng',
    subject: 'CÂN BẰNG VẬT RẮN',
    icon: 'torque',
    description: 'Đặt lực lên hai phía của điểm tựa. Tự tìm ra điều kiện để thanh cân bằng.',
    tags: ['Cánh tay đòn', 'Quy tắc moment'],
  },
  {
    id: 'circular',
    model: 'circular',
    title: 'Chuyển động tròn',
    subject: 'CHUYỂN ĐỘNG & HÌNH CHIẾU',
    icon: 'circular',
    description:
      'Theo dấu một vòng quay. Nhìn thấy dao động điều hòa từ hình chiếu của chuyển động tròn.',
    tags: ['Vector hướng tâm', 'Hình chiếu đồng bộ'],
  },
  {
    id: 'pendulum',
    model: 'pendulum',
    title: 'Con lắc đơn',
    subject: 'ĐO ĐẠC & DAO ĐỘNG',
    icon: 'pendulum',
    description: 'Thả con lắc, đo 10 dao động và tìm xem chu kỳ phụ thuộc vào những yếu tố nào.',
    tags: ['Ba bài thực hành', 'Đồ thị T²–l'],
  },
  {
    id: 'projectile',
    model: 'projectile',
    title: 'Chuyển động ném ngang',
    subject: 'THÍ NGHIỆM ĐÃ CÓ',
    icon: 'projectile',
    description: 'Tiếp tục khám phá quỹ đạo parabol và dự đoán tầm xa từ một độ cao xác định.',
    tags: ['Ném ngang', 'Quỹ đạo parabol'],
  },
];
export const modelTitles: Record<Model, string> = {
  hooke: 'Định luật Hooke',
  spring: 'Dao động điều hòa',
  torque: 'Moment lực và cân bằng',
  circular: 'Chuyển động tròn đều',
  projectile: 'Chuyển động ném ngang',
};
export const groupFor = (model: Model): Group => (model === 'hooke' ? 'spring' : model);
export const isDynamic = (model: Model) => model !== 'hooke' && model !== 'torque';

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
  }
}

type ParameterSpec = Omit<Parameter, 'value'>;
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
    {
      key: 'g',
      label: 'Gia tốc trọng trường',
      symbol: 'g',
      unit: 'm/s²',
      min: 1.6,
      max: 20,
      step: 0.01,
      digits: 2,
    },
  ],
};

export function getParameters(config: SimulationConfig, hidden: string[] = []): Parameter[] {
  const values = config.params as unknown as Record<string, number>;
  return parameterSpecs[config.kind]
    .filter((p) => !hidden.includes(p.key))
    .map((p) => ({
      ...p,
      value: p.key === 'phi' ? ((values.phi ?? 0) * 180) / Math.PI : values[p.key],
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
  const value = key === 'phi' ? (bounded * Math.PI) / 180 : bounded;
  switch (config.kind) {
    case 'spring':
      return { ...config, params: { ...config.params, [key]: value } };
    case 'hooke':
      return { ...config, params: { ...config.params, [key]: value } };
    case 'torque':
      return { ...config, params: { ...config.params, [key]: value } };
    case 'circular':
      return { ...config, params: { ...config.params, [key]: value } };
    case 'projectile':
      return { ...config, params: { ...config.params, [key]: value } };
  }
}
