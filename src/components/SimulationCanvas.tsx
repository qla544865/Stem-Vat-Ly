import { useCallback, useEffect, useMemo, useRef } from 'react';
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
import type { Oscillator } from '../simulations/oscillator/physics.ts';
import { oscillatorObservationTime } from '../simulations/oscillator/physics.ts';
import { drawOscillator } from '../simulations/oscillator/renderer.ts';
import { drawEfficiency, drawForces, drawPower } from '../simulations/interactive/renderer.ts';

interface Props {
  config: SimulationConfig;
  display: DisplayOptions;
  getTime: () => number;
  subscribe: SubscribeFrame;
  secret: boolean;
  target?: number;
  revealRange: boolean;
  collision?: CollisionPlan;
  oscillator?: Oscillator;
  observationEnd?: number;
}

export default function SimulationCanvas(props: Props) {
  const {
    config,
    display,
    getTime,
    secret,
    target,
    revealRange,
    collision,
    oscillator,
    observationEnd,
  } = props;
  const oscillatorExtent = useMemo(() => {
    if (!oscillator) return 1;
    let extent = 0.15;
    const end = observationEnd ?? oscillatorObservationTime;
    for (let i = 0; i <= 720; i++)
      extent = Math.max(extent, Math.abs(oscillator.state((end * i) / 720).x));
    return extent * 1.1;
  }, [oscillator, observationEnd]);
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
        case 'oscillator':
          if (oscillator)
            drawOscillator(
              ctx,
              width,
              height,
              oscillator.state(t),
              oscillatorExtent,
              display.annotations,
            );
          break;
        case 'forces':
          drawForces(
            ctx,
            width,
            height,
            config.params,
            Boolean(display.components),
            display.annotations,
          );
          break;
        case 'power':
          drawPower(ctx, width, height, config.params);
          break;
        case 'efficiency':
          drawEfficiency(ctx, width, height, config.params);
          break;
      }
    },
    [
      config,
      display,
      getTime,
      secret,
      target,
      revealRange,
      collision,
      oscillator,
      oscillatorExtent,
    ],
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
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let { width, height } = canvas.getBoundingClientRect();
    const draw = () => {
      if (!width || !height) return;
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      latest.current(ctx, width, height);
    };
    render.current = draw;
    const observer = new ResizeObserver(([entry]) => {
      ({ width, height } = entry.contentRect);
      draw();
    });
    observer.observe(canvas);
    draw();
    return () => {
      observer.disconnect();
      render.current = () => {};
    };
  }, []);

  useEffect(() => subscribe(() => render.current()), [subscribe]);
  useEffect(() => render.current(), [draw]);
  return <canvas ref={canvasRef} className="simulation-canvas" role="img" {...canvasProps} />;
}
