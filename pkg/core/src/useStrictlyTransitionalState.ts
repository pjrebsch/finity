import type { DefinedTransitionalState } from './defineTransitionalState';
import type {
  FiniteStateUnion,
  StateDefinition,
  TransitionsDefinition,
} from './States';
import type { Config, Getter } from './Types';
import {
  default as _useTransitionalState,
  type UseTransitionalState,
} from './useTransitionalState';

export type UsingStrictlyTransitionalState<
  T extends DefinedTransitionalState<any, any, any>,
> = T extends DefinedTransitionalState<infer K, infer S, infer X>
  ? UseStrictlyTransitionalState<K, S, X>
  : never;

export interface UseStrictlyTransitionalState<
  K extends string,
  S extends StateDefinition<K>,
  X extends Record<K, NoInfer<K>[]>,
> extends Omit<UseTransitionalState<K, S, X>, 'set' | 'update'> {}

export type UseStrictlyTransitionalStateHook = <
  K extends string,
  S extends StateDefinition<K>,
  X extends TransitionsDefinition<K>,
>(
  State: DefinedTransitionalState<K, S, X>,
  initial: NoInfer<Getter<FiniteStateUnion<K, S>>>,
) => UseStrictlyTransitionalState<K, S, X>;

export default (
  _config: Config,
  useTransitionalState: ReturnType<typeof _useTransitionalState>,
): UseStrictlyTransitionalStateHook => {
  return <
    K extends string,
    S extends StateDefinition<K>,
    X extends TransitionsDefinition<K>,
  >(
    State: DefinedTransitionalState<K, S, X>,
    initial: NoInfer<Getter<FiniteStateUnion<K, S>>>,
  ): UseStrictlyTransitionalState<K, S, X> => {
    const { set, update, ...state } = useTransitionalState(State, initial);

    return { ...state };
  };
};
