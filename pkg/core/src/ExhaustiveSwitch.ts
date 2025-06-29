import type { Getter, UnhandledStates } from './Types';

export type ExhaustiveSwitch<
  R,
  S extends { kind: string },
  C extends S['kind'],
> = {
  case: <G extends Exclude<S['kind'], C>[]>(
    kinds: G extends never[] ? never : G,
    fn: (state: S extends { kind: G[number] } ? S : never) => R,
  ) => ExhaustiveSwitch<R, S, C | G[number]>;
  use: Exclude<S['kind'], C> extends infer U
    ? [U] extends [never]
      ? () => R
      : UnhandledStates<U>
    : never;
};

export class ExhaustiveSwitchInstance<R, S extends { kind: string }> {
  constructor(
    protected readonly state: Getter<S>,
    protected cases: [string[], (state: S) => R][],
  ) {}

  public case = (kinds: string[], fn: (state: S) => R): typeof this => {
    this.cases = [...this.cases, [kinds, fn]];
    return this;
  };

  public use = (): R => {
    const s = this.state();
    const found = this.cases.find(([kinds, _]) => kinds.includes(s.kind));
    if (found) {
      const [_, fn] = found;
      return fn(s);
    } else {
      throw new Error('[finity] Invalid state switch!');
    }
  };
}
