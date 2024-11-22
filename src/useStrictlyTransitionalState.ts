import type {
  DefinedFiniteTransitionalState,
  FiniteStateUnion,
  StateDefinition,
  TransitionsDefinition,
} from './States';
import type { Config, Getter } from './Types';
import {
  default as _useTransitionalState,
  type UseTransitionalState,
} from './useTransitionalState';

export type StrictlyTransitionalState<T> =
  T extends DefinedFiniteTransitionalState<infer K, infer S, infer X>
    ? UseStrictlyTransitionalState<K, S, X>
    : never;

export interface UseStrictlyTransitionalState<
  K extends string,
  S extends StateDefinition<K>,
  X extends Record<K, NoInfer<K>[]>,
> extends Omit<UseTransitionalState<K, S, X>, 'set' | 'update' | 'reset'> {}

export default (
  config: Config,
  useTransitionalState: ReturnType<typeof _useTransitionalState>,
) => {
  return <
    K extends string,
    S extends StateDefinition<K>,
    X extends TransitionsDefinition<K>,
  >(
    State: DefinedFiniteTransitionalState<K, S, X>,
    initial: NoInfer<Getter<FiniteStateUnion<K, S>>>,
  ): UseStrictlyTransitionalState<K, S, X> => {
    const { set, update, reset, ...state } = useTransitionalState(
      State,
      initial,
    );

    return { ...state } as unknown as UseStrictlyTransitionalState<K, S, X>;
  };
};
