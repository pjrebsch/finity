import * as Core from '@ghostry/finity-core';
import * as React from 'react';
import type { Config } from './Types';
import $useEffect from './useEffect';
import $useRender from './useRender';

export type * from '@ghostry/finity-core';

export interface Initialized extends Core.Initialized {
  useRender: ReturnType<typeof $useRender>;
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

  const useEffect = $useEffect(config);
  const useRender = $useRender(config);

  return {
    ...api,
    useEffect,
    useRender,
  };
};
