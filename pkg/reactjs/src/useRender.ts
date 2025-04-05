import {
  ExhaustiveSwitchInstance,
  type ExhaustiveSwitch,
  type Getter,
} from '@ghostry/finity-core';
import * as React from 'react';
import type { Config } from './Types';

type RenderSwitch<
  S extends { kind: string },
  C extends S['kind'],
> = ExhaustiveSwitch<React.ReactNode, S, C>;

class RenderSwitchInstance<
  S extends { kind: string },
> extends ExhaustiveSwitchInstance<React.ReactNode, S> {
  public use = (): React.ReactNode => {
    const s = this.state();
    const found = React.useMemo(
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
