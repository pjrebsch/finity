import {
  ExhaustiveSwitchInstance,
  type ExhaustiveSwitch,
  type Getter,
} from '@ghostry/finity-core';
import { useMemo, type JSX } from 'react';
import type { Config } from './Types';

type RenderSwitch<
  S extends { kind: string },
  C extends S['kind'],
> = ExhaustiveSwitch<JSX.Element, S, C>;

class RenderSwitchInstance<
  S extends { kind: string },
> extends ExhaustiveSwitchInstance<JSX.Element, S> {
  public use = (): JSX.Element => {
    const s = this.state();
    const found = useMemo(
      () => this.cases.find(([kinds, _]) => kinds.includes(s.kind)),
      [s],
    );
    if (found) {
      const [_, render] = found;
      return render(s);
    } else {
      throw new Error('[finity] Invalid state switch!');
    }
  };
}

export default (_config: Config) =>
  <S extends { kind: string }>(state: Getter<S>): RenderSwitch<S, never> => {
    return new RenderSwitchInstance(state, []) as unknown as RenderSwitch<
      S,
      never
    >;
  };
