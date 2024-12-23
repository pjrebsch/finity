import {
  defineTransitionalState,
  type DefinedTransitionalState,
} from './defineTransitionalState';
import type {
  TransitionalStateByKind as _TransitionalStateByKind,
  TransitionalStateUnion as _TransitionalStateUnion,
} from './States';
import type { Config, Prettify } from './Types';
import _useEffect from './useEffect';
import _useState from './useState';
import _useStrictlyTransitionalState from './useStrictlyTransitionalState';
import _useTransitionalState from './useTransitionalState';

export * from './ExhaustiveSwitch';

export type * from './defineTransitionalState';
export type * from './States';
export type * from './Types';
export type * from './useState';
export type * from './useStrictlyTransitionalState';
export type * from './useTransitionalState';

export type TransitionalState<
  T extends DefinedTransitionalState<any, any, any>,
> = T extends DefinedTransitionalState<infer K, infer S, infer X>
  ? Prettify<_TransitionalStateUnion<K, S, X>>
  : never;

export type TransitionalStates<
  T extends DefinedTransitionalState<any, any, any>,
> = T extends DefinedTransitionalState<infer K, infer S, infer X>
  ? Prettify<_TransitionalStateByKind<K, S, X>>
  : never;

export interface Initialized {
  defineTransitionalState: typeof defineTransitionalState;
  useState: ReturnType<typeof _useState>;
  useTransitionalState: ReturnType<typeof _useTransitionalState>;
  useStrictlyTransitionalState: ReturnType<
    typeof _useStrictlyTransitionalState
  >;
  useEffect: ReturnType<typeof _useEffect>;
}

export const initialize = (config: Config): Initialized => {
  const useState = _useState(config);
  const useTransitionalState = _useTransitionalState(config, useState);
  const useStrictlyTransitionalState = _useStrictlyTransitionalState(
    config,
    useTransitionalState,
  );
  const useEffect = _useEffect(config);

  return {
    defineTransitionalState,
    useState,
    useTransitionalState,
    useStrictlyTransitionalState,
    useEffect,
  };
};
