const EMA_INSTANT_WEIGHT = 0.8;
const EMA_SMOOTH_WEIGHT = 1 - EMA_INSTANT_WEIGHT;
const MS_PER_S = 1000;

export class VelocityTracker {
  private initialized = false;
  private lastTime = 0;
  private lastY = 0;
  private velocity = 0;

  /**
   * 현재 속도를 반환(px/s). 양수 = 아래 방향.
   */
  getVelocity(): number {
    return this.velocity;
  }

  reset(): void {
    this.initialized = false;
    this.lastTime = 0;
    this.lastY = 0;
    this.velocity = 0;
  }

  /**
   * 새 데이터 포인트를 기록.
   * @param y - 현재 Y 위치(px)
   * @param time - 현재 시각(ms, performance.now() 기준)
   */
  track(y: number, time: number): void {
    if (!this.initialized) {
      this.lastY = y;
      this.lastTime = time;
      this.initialized = true;
      return;
    }

    const dt = time - this.lastTime;
    if (dt > 0) {
      const instantVelocity = ((y - this.lastY) / dt) * MS_PER_S;
      this.velocity =
        instantVelocity * EMA_INSTANT_WEIGHT +
        this.velocity * EMA_SMOOTH_WEIGHT;
      this.lastY = y;
      this.lastTime = time;
    }
  }
}
