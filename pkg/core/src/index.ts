import {
  defineTransitionalState,
  type DefinedTransitionalState,
} from './defineTransitionalState';
import type {
  TransitionalStateByKind as $TransitionalStateByKind,
  TransitionalStateUnion as $TransitionalStateUnion,
} from './States';
import type { Config, Prettify } from './Types';
import $useEffect from './useEffect';
import $useState from './useState';
import $useStrictlyTransitionalState from './useStrictlyTransitionalState';
import $useTransitionalState from './useTransitionalState';

export * from './ExhaustiveSwitch';
export * from './Utils';

export type * from './defineTransitionalState';
export type * from './States';
export type * from './Types';
export type * from './useState';
export type * from './useStrictlyTransitionalState';
export type * from './useTransitionalState';

export type TransitionalState<
  T extends DefinedTransitionalState<any, any, any>,
> = T extends DefinedTransitionalState<infer K, infer S, infer X>
  ? Prettify<$TransitionalStateUnion<K, S, X>>
  : never;

export type TransitionalStates<
  T extends DefinedTransitionalState<any, any, any>,
> = T extends DefinedTransitionalState<infer K, infer S, infer X>
  ? Prettify<$TransitionalStateByKind<K, S, X>>
  : never;

export interface Initialized {
  defineTransitionalState: typeof defineTransitionalState;
  useState: ReturnType<typeof $useState>;
  useTransitionalState: ReturnType<typeof $useTransitionalState>;
  useStrictlyTransitionalState: ReturnType<
    typeof $useStrictlyTransitionalState
  >;
  useEffect: ReturnType<typeof $useEffect>;
}

export const initialize = (config: Config): Initialized => {
  const useState = $useState(config);
  const useTransitionalState = $useTransitionalState(config, useState);
  const useStrictlyTransitionalState = $useStrictlyTransitionalState(
    config,
    useTransitionalState,
  );
  const useEffect = $useEffect(config);

  return {
    defineTransitionalState,
    useState,
    useTransitionalState,
    useStrictlyTransitionalState,
    useEffect,
  };
};
