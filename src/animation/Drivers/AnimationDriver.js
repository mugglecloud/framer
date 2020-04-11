/**
 * @internal
 */
export class AnimationDriver {
    constructor(animator, updateCallback, finishedCallback) {
        this.animator = animator;
        this.updateCallback = updateCallback;
        this.finishedCallback = finishedCallback;
        this.update = (frame, elapsed) => {
            if (this.animator.isFinished()) {
                this.finish();
            }
            else {
                const value = this.animator.next(elapsed);
                this.updateCallback(value);
            }
        };
        if (!this.animator.isReady()) {
            // tslint:disable-next-line:no-console
            console.warn("AnimationDriver initialized with animator that isn't ready");
        }
    }
    finish() {
        if (this.finishedCallback) {
            this.finishedCallback(this.animator.isFinished());
        }
    }
    isFinished() {
        return this.animator.isFinished();
    }
}
