import { type JSX } from '$/solid-js';
import {
  ExhaustiveSwitchInstance,
  type ExhaustiveSwitch,
  type Getter,
} from '@ghostry/finity-core';
import { Render } from './Render';
import type { Config } from './Types';

type RenderSwitch<
  S extends { kind: string },
  C extends S['kind'],
> = ExhaustiveSwitch<JSX.Element, S, C>;

class RenderSwitchInstance<
  S extends { kind: string },
> extends ExhaustiveSwitchInstance<JSX.Element, S> {
  public use = (): JSX.Element => {
    return Render({ state: this.state, cases: this.cases });
  };
}

export default (_config: Config) =>
  <S extends { kind: string }>(state: Getter<S>): RenderSwitch<S, never> => {
    return new RenderSwitchInstance(state, []) as unknown as RenderSwitch<
      S,
      never
    >;
  };
