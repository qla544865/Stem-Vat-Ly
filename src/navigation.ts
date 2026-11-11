import type { Category, LabRoute } from './simulations/catalog.ts';
import { categoryLabels } from './simulations/catalog.ts';
import { challengeModel, challenges } from './challenges/config.ts';
import type { ChallengeId } from './challenges/config.ts';

export const modelPath: Record<LabRoute, string> = {
  hooke: '#/spring/hooke',
  spring: '#/spring/oscillation',
  torque: '#/torque',
  circular: '#/circular',
  projectile: '#/projectile',
  pendulum: '#/pendulum',
  collision: '#/collision',
  work: '#/work',
  energy: '#/energy',
  oscillator: '#/oscillator',
  forces: '#/forces',
  power: '#/power',
  efficiency: '#/efficiency',
};

export type Area = Category | 'challenges';
export const areaLabels: Record<Area, string> = { ...categoryLabels, challenges: 'Challenge Lab' };
export const areaPath: Record<Area, string> = {
  theory: '#/theory',
  experiments: '#/experiments',
  challenges: '#/challenges',
};
export const challengePath = (id: ChallengeId) => `${areaPath.challenges}/${id}`;

export function challengeFromHash(hash: string) {
  if (!hash.startsWith(`${areaPath.challenges}/`)) return undefined;
  return challenges.find(({ id }) => challengePath(id) === hash);
}

export function areaFromHash(hash: string): Area {
  if (hash === areaPath.theory) return 'theory';
  if (hash === areaPath.challenges) return 'challenges';
  return 'experiments';
}

export function modelFromHash(hash: string): LabRoute | null {
  if (hash === '#/spring') return 'hooke';
  const challenge = challengeFromHash(hash);
  if (challenge) return challengeModel(challenge);
  return (
    (Object.entries(modelPath).find(([, path]) => path === hash)?.[0] as LabRoute | undefined) ??
    null
  );
}
