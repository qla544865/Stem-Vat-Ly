import type { CSSProperties } from 'react';
export type IconName =
  | 'flask'
  | 'spring'
  | 'projectile'
  | 'torque'
  | 'circular'
  | 'pendulum'
  | 'screen'
  | 'back'
  | 'home'
  | 'play'
  | 'pause'
  | 'reset'
  | 'arrow'
  | 'sliders'
  | 'info'
  | 'spark'
  | 'check'
  | 'chevron'
  | 'target'
  | 'book';
const paths: Record<IconName, string> = {
  flask: 'M9 3h6M10 3v7l-5 8a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-8V3M8 15h8',
  spring: 'M3 6v12M3 12h3l2-6 3 12 3-12 3 12 2-6h2',
  projectile: 'M3 4h4M5 4v16h16M5 5c8 0 13 5 15 13M16 17l4 1 1-4',
  torque: 'M3 10h18M12 10l-4 10h8l-4-10ZM5 4v9m-2-2 2 2 2-2M19 4v9m-2-2 2 2 2-2',
  circular: 'M20 12a8 8 0 1 1-8-8M15 4h5v5M12 12l6-6M13 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0',
  pendulum: 'M7 3h10M12 3l5 10M12 5v11M5 16a10 10 0 0 0 14 2M20 15a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  screen: 'M3 4h18v13H3zM12 17v3m-4 1h8',
  back: 'M19 12H5m6-6-6 6 6 6',
  home: 'm3 10 9-7 9 7M5 9v12h14V9M9 21v-8h6v8',
  play: 'm9 5 11 7-11 7V5Z',
  pause: 'M8 5v14M16 5v14',
  reset: 'M3 10a9 9 0 1 1 2 8M3 4v6h6',
  arrow: 'M5 12h14m-5-5 5 5-5 5',
  sliders: 'M4 7h7m4 0h5M4 17h3m4 0h9M11 4v6M7 14v6',
  info: 'M12 11v6M12 7h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  spark: 'm12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z',
  check: 'm5 12 4 4L19 6',
  chevron: 'm9 5 7 7-7 7',
  target:
    'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0M13 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0',
  book: 'M12 5v16M12 5C8 2 4 3 3 4v15c3-1 6-1 9 2 3-3 6-3 9-2V4c-3-1-6-1-9 1',
};
export default function Icon({
  name,
  size = 20,
  style,
}: {
  name: IconName;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      <path d={paths[name]} />
    </svg>
  );
}
