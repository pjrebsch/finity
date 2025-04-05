import type { Initialized as _Initialized } from '@ghostry/finity-core';
import * as Core from '@ghostry/finity-core';
import * as React from 'react';
import type { Config } from './Types';
import _useEffect from './useEffect';
import _useRender from './useRender';

export type * from '@ghostry/finity-core';

export interface Initialized extends _Initialized {
  useRender: ReturnType<typeof _useRender>;
}

export const initialize = (config: Config): Initialized => {
  const api = Core.initialize({
    useState: <T>(initial: () => T) => {
      const [value, set] = React.useState(initial);

      const getter: Core.Getter<T> = () => value;
      const setter: Core.Setter<T> = <U extends T>(value: U) => {
        set(value);
        return value;
      };

      return [getter, setter];
    },
  });

  const useEffect = _useEffect(config);
  const useRender = _useRender(config);

  return {
    ...api,
    useEffect,
    useRender,
  };
};
