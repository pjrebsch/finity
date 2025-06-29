import type { DefinedTransitionalState } from './defineTransitionalState';
import { InvalidTransitionError } from './InvalidTransitionError';
import type {
  FiniteStateUnion,
  StateDefinition,
  TransitionalStateUnion,
  TransitionsDefinition,
} from './States';
import { type Config, type Getter } from './Types';
import type { UseState, UseStateHook } from './useState';

export type UsingTransitionalState<
  T extends DefinedTransitionalState<any, any, any>,
> = T extends DefinedTransitionalState<infer K, infer S, infer X>
  ? UseTransitionalState<K, S, X>
  : never;

export type UseTransitionalStateHook = <
  K extends string,
  S extends StateDefinition<K>,
  X extends TransitionsDefinition<K>,
>(
  State: DefinedTransitionalState<K, S, X>,
  initial: NoInfer<Getter<FiniteStateUnion<K, S>>>,
) => UseTransitionalState<K, S, X>;

export interface UseTransitionalState<
  K extends string,
  S extends StateDefinition<K>,
  X extends TransitionsDefinition<K>,
> extends UseState<FiniteStateUnion<K, S>> {
  value(): TransitionalStateUnion<K, S, X>;
}

export default (config: Config, useState: UseStateHook) => {
  return <
    K extends string,
    S extends StateDefinition<K>,
    X extends TransitionsDefinition<K>,
  >(
    State: DefinedTransitionalState<K, S, X>,
    initial: NoInfer<Getter<FiniteStateUnion<K, S>>>,
  ): UseTransitionalState<K, S, X> => {
    type State = FiniteStateUnion<K, S>;

    const state = useState<State>(initial);

    type Value = UseTransitionalState<K, S, X>['value'];
    const value: Value = () =>
      ({
        ...state.value(),
        transition: (to: Exclude<State, Function>): void => {
          const currentKind = state.value().kind;
          const futureKind = to.kind;

          if (State.transitions[currentKind].includes(futureKind)) {
            state.set(to);
          } else {
            config.onInvalidTransition?.(
              new InvalidTransitionError({
                name: State.name,
                from: state.value(),
                to,
              }),
            );
          }
        },
      } as unknown as ReturnType<Value>);

    return {
      ...state,
      value,
    };
  };
};
