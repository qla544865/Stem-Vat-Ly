// Time advances in seconds from RAF timestamps, never by a fixed amount per frame.
export class SimulationClock {
  time = 0;
  private last: number | null = null;
  tick(timestamp: number, speed: number, end = Infinity) {
    if (this.last !== null) {
      const elapsed = timestamp - this.last;
      // A long main-thread stall acts like a suspended tab, not a time warp.
      if (elapsed >= 0 && elapsed <= 250)
        this.time = Math.min(end, this.time + (elapsed / 1000) * speed);
    }
    this.last = timestamp;
    return this.time;
  }
  suspend() {
    this.last = null;
  }
  reset() {
    this.time = 0;
    this.suspend();
  }
}
