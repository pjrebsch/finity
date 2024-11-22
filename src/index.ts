import type { Config } from './Types';
import _useState from './useState';
import _useStrictlyTransitionalState from './useStrictlyTransitionalState';
import _useTransitionalState from './useTransitionalState';

export type * from './States';

export type { UseState } from './useState';

export type {
  TransitionalState,
  UseTransitionalState,
} from './useTransitionalState';

export type {
  StrictlyTransitionalState,
  UseStrictlyTransitionalState,
} from './useStrictlyTransitionalState';

export const initialize = (config: Config) => {
  const useState = _useState(config);
  const useTransitionalState = _useTransitionalState(config, useState);
  const useStrictlyTransitionalState = _useStrictlyTransitionalState(
    config,
    useTransitionalState,
  );

  return {
    useState,
    useTransitionalState,
    useStrictlyTransitionalState,
  } as const;
};
