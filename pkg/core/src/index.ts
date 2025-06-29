import {
  defineTransitionalState,
  type DefinedTransitionalState,
} from './defineTransitionalState.ts';
import {
  ExhaustiveSwitchInstance,
  type ExhaustiveSwitch,
} from './ExhaustiveSwitch.ts';
import { InvalidTransitionError } from './InvalidTransitionError.ts';
import type {
  TransitionalStateByKind as $TransitionalStateByKind,
  TransitionalStateUnion as $TransitionalStateUnion,
} from './States.ts';
import type { Config, Prettify } from './Types.ts';
import $useEffect from './useEffect.ts';
import $useState from './useState.ts';
import $useStrictlyTransitionalState from './useStrictlyTransitionalState.ts';
import $useTransitionalState from './useTransitionalState.ts';

export { never, noop } from './Utils.ts';
export {
  ExhaustiveSwitchInstance,
  InvalidTransitionError,
  type ExhaustiveSwitch,
};

export type * from './defineTransitionalState.ts';
export type * from './States.ts';
export type * from './Types.ts';
export type * from './useState.ts';
export type * from './useStrictlyTransitionalState.ts';
export type * from './useTransitionalState.ts';

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
