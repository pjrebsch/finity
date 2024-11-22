import type { Getter } from '@ghostry/finity-core';
import {
  ExhaustiveSwitchInstance,
  type ExhaustiveSwitch,
} from './ExhaustiveSwitch';
import type { Config } from './Types';

type MapSwitch<
  R,
  S extends { kind: string },
  C extends S['kind'],
> = ExhaustiveSwitch<R, S, C>;

export default (_config: Config) =>
  <S extends { kind: string }>(state: Getter<S>) =>
  <R>(): MapSwitch<R, S, never> => {
    return new ExhaustiveSwitchInstance(state, []) as unknown as MapSwitch<
      R,
      S,
      never
    >;
  };
