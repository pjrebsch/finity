import type { Getter, IsUnique, UnhandledStates } from './Types';

export type ExhaustiveSwitch<
  R,
  S extends { kind: string },
  C extends S['kind'],
> = {
  /**
   * @param kinds - The `kind` of states that will be handled in this case.
   * If the list contains duplicates, a type error will be raised:
   * ```txt
   * Argument of type 'string[]' is not assignable to parameter of type 'never'.
   * ```
   */
  case: <const G extends Exclude<S['kind'], C>[]>(
    kinds: IsUnique<[...G]> extends true ? [...G] : never,
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
