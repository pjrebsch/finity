import * as Core from '@ghostry/finity-core';
import { createSignal } from 'solid-js';
import type { Config } from './Types.ts';
import $useEffect from './useEffect.ts';
import $useRender from './useRender.ts';

export type * from '@ghostry/finity-core';

export interface Initialized extends Core.Initialized {
  useRender: ReturnType<typeof $useRender>;
}

export const initialize = (config: Config): Initialized => {
  const api = Core.initialize({
    onInvalidTransition: config.onInvalidTransition,
    useState: <T extends {}>(initial: () => T) => createSignal(initial()),
  });

  const useEffect = $useEffect(config);
  const useRender = $useRender(config);

  return {
    ...api,
    useEffect,
    useRender,
  };
};
