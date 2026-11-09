import { useCallback, useEffect, useRef, useState } from 'react';
import { SimulationClock } from './clock.ts';

export type FrameListener = (time: number) => void;
export type SubscribeFrame = (listener: FrameListener) => () => void;

export function useSimulation(
  speed: number,
  end = Infinity,
  advance?: (time: number) => number | null,
) {
  const clock = useRef(new SimulationClock());
  const listeners = useRef(new Set<FrameListener>());
  const [time, setTime] = useState(0);
  const [running, setRunningState] = useState(false);
  const subscribe = useCallback<SubscribeFrame>((listener) => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);
  const getTime = useCallback(() => clock.current.time, []);
  const notify = useCallback((value: number) => {
    listeners.current.forEach((listener) => listener(value));
  }, []);
  const setRunning = useCallback((value: boolean) => {
    clock.current.suspend();
    setTime(clock.current.time);
    setRunningState(value);
  }, []);
  const reset = useCallback(() => {
    clock.current.reset();
    setTime(0);
    setRunningState(false);
    notify(0);
  }, [notify]);
  useEffect(() => {
    clock.current.suspend();
    if (!running) return;
    let frame = 0;
    let lastUiUpdate = -Infinity;
    const animate = (timestamp: number) => {
      frame = 0;
      if (document.hidden) {
        clock.current.suspend();
        return;
      }
      let next = clock.current.tick(timestamp, speed, end);
      // A numerical model can stop at an event between clock ticks.
      const stopAt = advance?.(next);
      if (stopAt != null) next = clock.current.time = stopAt;
      notify(next);
      if (stopAt != null || next >= end) {
        setTime(next);
        setRunningState(false);
        return;
      }
      // Canvas and SVG markers run at display refresh rate; readouts need 10 Hz.
      if (timestamp - lastUiUpdate >= 100) {
        setTime(next);
        lastUiUpdate = timestamp;
      }
      frame = requestAnimationFrame(animate);
    };
    const visibility = () => {
      cancelAnimationFrame(frame);
      clock.current.suspend();
      if (!document.hidden) frame = requestAnimationFrame(animate);
    };
    document.addEventListener('visibilitychange', visibility);
    if (!document.hidden) frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', visibility);
      clock.current.suspend();
    };
  }, [running, speed, end, advance, notify]);
  return { time, getTime, subscribe, running, setRunning, reset };
}
