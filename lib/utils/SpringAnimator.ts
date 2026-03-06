const MAX_FRAME_DELTA_S = 0.064; // ~4프레임 상한 (탭 전환 등 대형 dt 방어)
const MS_PER_S = 1000;
const POSITION_PRECISION = 0.5; // px
const VELOCITY_PRECISION = 5; // px/s

type SpringConfig = {
  damping: number;
  mass: number;
  onUpdate: (position: number) => void;
  stiffness: number;
};

export class SpringAnimator {
  private damping: number;
  private mass: number;
  private onComplete: (() => void) | null = null;
  private onUpdate: (position: number) => void;
  private position = 0;
  private rafId: null | number = null;
  private stiffness: number;
  private target = 0;
  private velocity = 0;

  constructor({ damping, mass, onUpdate, stiffness }: SpringConfig) {
    this.stiffness = stiffness;
    this.damping = damping;
    this.mass = mass;
    this.onUpdate = onUpdate;
  }

  /**
   * 스프링 애니메이션을 시작. 실행 중이면 취소 후 재시작.
   * @param target - 목표 Y 위치 (px)
   * @param initialVelocity - 초기 속도 (px/s). 드래그 종료 시 전달.
   * @param onComplete - 애니메이션 완료 콜백
   */
  animateTo(
    target: number,
    initialVelocity = 0,
    onComplete?: () => void,
  ): void {
    this.cancel();
    this.target = target;
    this.velocity = initialVelocity;
    this.onComplete = onComplete ?? null;
    this.tick(null);
  }

  cancel(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.onComplete = null;
  }

  getPosition(): number {
    return this.position;
  }

  /**
   * 드래그 중 위치를 동기화. 물리 계산 없이 즉시 반영.
   * @param position - 현재 Y 위치 (px)
   */
  setPosition(position: number): void {
    this.position = position;
  }

  private tick(prevTime: null | number): void {
    this.rafId = requestAnimationFrame((time) => {
      this.rafId = null;

      if (prevTime !== null) {
        const dt = Math.min((time - prevTime) / MS_PER_S, MAX_FRAME_DELTA_S);
        const displacement = this.position - this.target;
        const force =
          -this.stiffness * displacement - this.damping * this.velocity;
        const acceleration = force / this.mass;

        this.velocity += acceleration * dt;
        this.position += this.velocity * dt;
      }

      const isSettled =
        Math.abs(this.position - this.target) < POSITION_PRECISION &&
        Math.abs(this.velocity) < VELOCITY_PRECISION;

      if (isSettled) {
        this.position = this.target;
        this.velocity = 0;
        this.onUpdate(this.position);
        const cb = this.onComplete;
        this.onComplete = null;
        cb?.();
        return;
      }

      this.onUpdate(this.position);
      this.tick(time);
    });
  }
}
