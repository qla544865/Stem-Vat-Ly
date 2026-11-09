import type { LabRoute } from './simulations/catalog.ts';

export const modelPath: Record<LabRoute, string> = {
  hooke: '#/spring/hooke',
  spring: '#/spring/oscillation',
  torque: '#/torque',
  circular: '#/circular',
  projectile: '#/projectile',
  pendulum: '#/pendulum',
};

export function modelFromHash(hash: string): LabRoute | null {
  if (hash === '#/spring') return 'hooke';
  return (
    (Object.entries(modelPath).find(([, path]) => path === hash)?.[0] as LabRoute | undefined) ??
    null
  );
}
