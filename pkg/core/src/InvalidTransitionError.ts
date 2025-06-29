interface FundamentalState {
  kind: string;
}

interface StateInfo {
  name: string | undefined;
  from: FundamentalState;
  to: FundamentalState;
}

export class InvalidTransitionError extends Error {
  constructor(public readonly state: StateInfo) {
    const message = [
      '[finity] Invalid state transition',
      state.name ? `of "${state.name}"` : ``,
      `from "${state.from.kind}" to "${state.to.kind}"`,
    ].join(' ');

    super(message);
  }
}
