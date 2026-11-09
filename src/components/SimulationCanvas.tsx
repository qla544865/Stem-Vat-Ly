import { useCallback, useEffect, useRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import type { DisplayOptions, SimulationConfig } from '../simulations/catalog.ts';
import type { SubscribeFrame } from '../simulations/useSimulation.ts';
import { catalog, isDynamic } from '../simulations/catalog.ts';
import { drawSpring } from '../simulations/spring/renderer.ts';
import { drawHooke } from '../simulations/spring/hookeRenderer.ts';
import { drawTorque } from '../simulations/torque/renderer.ts';
import { drawCircular } from '../simulations/circular/renderer.ts';
import { drawProjectile } from '../simulations/projectile/renderer.ts';
import { drawCollision } from '../simulations/collision/renderer.ts';
import type { CollisionPlan } from '../simulations/collision/physics.ts';
import { drawEnergy, drawWork } from '../simulations/energy/renderer.ts';

interface Props {
  config: SimulationConfig;
  display: DisplayOptions;
  getTime: () => number;
  subscribe: SubscribeFrame;
  secret: boolean;
  target?: number;
  revealRange: boolean;
  collision?: CollisionPlan;
}

export default function SimulationCanvas(props: Props) {
  const { config, display, getTime, secret, target, revealRange, collision } = props;
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const t = getTime();
      switch (config.kind) {
        case 'hooke':
          drawHooke(ctx, width, height, config.params, display.annotations, secret);
          break;
        case 'spring':
          drawSpring(
            ctx,
            width,
            height,
            config.params,
            t,
            display.velocity,
            display.acceleration,
            display.annotations,
          );
          break;
        case 'torque':
          drawTorque(ctx, width, height, config.params, display.annotations);
          break;
        case 'circular':
          drawCircular(ctx, width, height, config.params, t, display);
          break;
        case 'projectile':
          drawProjectile(
            ctx,
            width,
            height,
            config.params,
            t,
            display.velocity,
            target,
            revealRange,
          );
          break;
        case 'collision':
          if (collision)
            drawCollision(ctx, width, height, collision, t, display.velocity, display.annotations);
          break;
        case 'work':
          drawWork(ctx, width, height, config.params, display.annotations);
          break;
        case 'energy':
          drawEnergy(ctx, width, height, config.params, t, display.velocity, display.annotations);
          break;
      }
    },
    [config, display, getTime, secret, target, revealRange, collision],
  );
  return (
    <CanvasSurface
      draw={draw}
      subscribe={props.subscribe}
      aria-label={`${isDynamic(config.kind) ? 'Mô phỏng' : 'Minh họa'} ${catalog[config.kind].title}. Các giá trị vật lý được hiển thị ngay bên dưới.`}
    />
  );
}

interface CanvasProps extends ComponentPropsWithoutRef<'canvas'> {
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
  subscribe: SubscribeFrame;
}

export function CanvasSurface({ draw, subscribe, ...canvasProps }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const latest = useRef(draw);
  latest.current = draw;
  const render = useRef(() => {});

  useEffect(() => {
    const canvas = canvasRef.current!;
    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      latest.current(ctx, width, height);
    };
    render.current = draw;
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    draw();
    return () => observer.disconnect();
  }, []);

  useEffect(() => subscribe(() => render.current()), [subscribe]);
  useEffect(() => render.current(), [draw]);
  return <canvas ref={canvasRef} className="simulation-canvas" role="img" {...canvasProps} />;
}
