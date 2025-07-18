import * as Core from '@ghostry/finity-core';
import { createSignal } from 'solid-js';
import type { Config } from './Types.ts';
import $useEffect from './useEffect.ts';
import $useRender from './useRender.ts';

/**
 * Initialization of the library returns these set of functions.
 */
export interface Initialized extends Core.Initialized {
  /**
   * A component hook to render JSX based on the current state.
   */
  useRender: ReturnType<typeof $useRender>;
}

/**
 * Initializes an instance of the usable library API for SolidJS according
 * to the provided configuration.
 */
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
