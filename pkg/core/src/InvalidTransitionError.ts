export interface FundamentalState {
  kind: string;
}

interface StateInfo {
  name: string | undefined;
  from: FundamentalState;
  to: FundamentalState;
}

interface ClockTickInfo {
  current: number;
  bound: number;
}

export type Reason = 'stale' | 'disallowed';

interface InvalidTransitionContext {
  reason: Reason;
  state: StateInfo;
  tick: ClockTickInfo;
}

export class InvalidTransitionError extends Error {
  public readonly reason: Reason;
  public readonly state: StateInfo;
  public readonly tick: ClockTickInfo;

  constructor({ reason, state, tick }: InvalidTransitionContext) {
    const message = [
      `[finity] Invalid (${reason}) state transition`,
      state.name ? `of "${state.name}"` : ``,
      `from "${state.from.kind}"`,
      `to "${state.to.kind}"`,
      reason === 'stale'
        ? `because the transition should have occurred at tick ${tick.bound} but other state changes have advanced the tick to ${tick.current}`
        : ``,
    ].join(' ');

    super(message);

    this.reason = reason;
    this.state = state;
    this.tick = tick;
  }
}
