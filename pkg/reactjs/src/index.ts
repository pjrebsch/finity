import type { Initialized as _Initialized } from '@ghostry/finity-core';
import * as Core from '@ghostry/finity-core';
import { useState } from 'react';
import type { Config } from './Types';
import _useEffect from './useEffect';
import _useRender from './useRender';

export type * from '@ghostry/finity-core';

export interface Initialized extends _Initialized {
  useRender: ReturnType<typeof _useRender>;
}

export const initialize = (config: Config): Initialized => {
  const api = Core.initialize({
    useState,
  });

  const useEffect = _useEffect(config);
  const useRender = _useRender(config);

  return {
    ...api,
    useEffect,
    useRender,
  };
};