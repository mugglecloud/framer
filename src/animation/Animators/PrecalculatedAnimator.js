export const Defaults = {
    delta: 1 / 60,
    maxValues: 10000,
};
/**
 * @internal
 * @deprecated
 */
export class PrecalculatedAnimator {
    constructor(options) {
        this.currentTime = 0;
        this.options = Object.assign(Object.assign({}, Defaults), options);
        this.animator = options.animator;
    }
    preCalculate() {
        if (!this.animator.isReady()) {
            return;
        }
        const { delta } = this.options;
        this.values = [];
        while (!this.animator.isFinished() && this.values.length < this.options.maxValues) {
            let value = this.animator.next(this.options.delta);
            if (typeof value === "object" && value) {
                const object = value;
                const copy = Object.assign({}, object);
                value = copy;
            }
            this.values.push(value);
        }
        this.totalTime = this.values.length * delta;
    }
    indexForTime(time) {
        return Math.max(0, Math.min(this.values.length - 1, Math.round(this.values.length * (time / this.totalTime)) - 1));
    }
    setFrom(value) {
        this.animator.setFrom(value);
        this.preCalculate();
    }
    setTo(end) {
        this.animator.setTo(end);
        this.preCalculate();
    }
    isReady() {
        return this.values !== undefined && this.values.length > 0 && this.totalTime > 0;
    }
    next(delta) {
        this.currentTime += delta;
        const index = this.indexForTime(this.currentTime);
        return this.values[index];
    }
    isFinished() {
        return this.totalTime === 0 || this.currentTime >= this.totalTime;
    }
    get endValue() {
        this.preCalculate();
        const index = this.indexForTime(this.totalTime);
        return this.values.length > 0 ? this.values[index] : this.animator.next(0);
    }
}
