/**
 * @internal
 */
export class Integrator {
    constructor(accelerationFunction) {
        this.accelerationForState = accelerationFunction;
    }
    integrateState(state, dt) {
        let a, b, c, d, dvdt, dxdt;
        a = this.evaluateState(state);
        b = this.evaluateStateWithDerivative(state, dt * 0.5, a);
        c = this.evaluateStateWithDerivative(state, dt * 0.5, b);
        d = this.evaluateStateWithDerivative(state, dt, c);
        dxdt = (1.0 / 6.0) * (a.dx + 2.0 * (b.dx + c.dx) + d.dx);
        dvdt = (1.0 / 6.0) * (a.dv + 2.0 * (b.dv + c.dv) + d.dv);
        state.x = state.x + dxdt * dt;
        state.v = state.v + dvdt * dt;
        return state;
    }
    evaluateState(initialState) {
        const dv = this.accelerationForState(initialState);
        return { dx: initialState.v, dv: dv };
    }
    evaluateStateWithDerivative(initialState, dt, derivative) {
        let output, state;
        state = {
            x: initialState.x + derivative.dx * dt,
            v: initialState.v + derivative.dv * dt,
        };
        output = {
            dx: state.v,
            dv: this.accelerationForState(state),
        };
        return output;
    }
}
