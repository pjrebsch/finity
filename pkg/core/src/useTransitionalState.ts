import type { DefinedTransitionalState } from './defineTransitionalState';
import { InvalidTransitionError, type Reason } from './InvalidTransitionError';
import type {
  FiniteStateUnion,
  StateDefinition,
  TransitionalStateUnion,
  TransitionsDefinition,
} from './States';
import { type Config, type FundamentalState, type Getter } from './Types';
import useClock from './useClock';
import type { UseState, UseStateHook } from './useState';

/**
 * Returns the transitional state type from a defined transitional state.
 */
export type UsingTransitionalState<
  T extends DefinedTransitionalState<any, any, any>,
> = T extends DefinedTransitionalState<infer K, infer S, infer X>
  ? UseTransitionalState<K, S, X>
  : never;

export interface UseTransitionalState<
  K extends string,
  S extends StateDefinition<K>,
  X extends TransitionsDefinition<K>,
> extends UseState<FiniteStateUnion<K, S>> {
  value(): TransitionalStateUnion<K, S, X>;
}

export type UseTransitionalStateHook = <
  K extends string,
  S extends StateDefinition<K>,
  X extends TransitionsDefinition<K>,
>(
  State: DefinedTransitionalState<K, S, X>,
  initial: NoInfer<Getter<FiniteStateUnion<K, S>>>,
) => UseTransitionalState<K, S, X>;

export default (
  config: Config,
  useState: UseStateHook,
): UseTransitionalStateHook => {
  return <
    K extends string,
    S extends StateDefinition<K>,
    X extends TransitionsDefinition<K>,
  >(
    State: DefinedTransitionalState<K, S, X>,
    initial: NoInfer<Getter<FiniteStateUnion<K, S>>>,
  ): UseTransitionalState<K, S, X> => {
    type $State = FiniteStateUnion<K, S>;
    type $Use = UseTransitionalState<K, S, X>;

    type $Set = $Use['set'];
    type $Update = $Use['update'];
    type $Value = $Use['value'];

    const state = useState<$State>(initial);
    const clock = useClock(useState);

    const set: $Set = (...args: Parameters<$Set>): ReturnType<$Set> => {
      clock.advance();
      return state.set(...args);
    };

    const update: $Update = (
      ...args: Parameters<$Update>
    ): ReturnType<$Update> => {
      clock.advance();
      return state.update(...args);
    };

    const value: $Value = () => {
      /**
       * When the transition function is created, it should be bound
       * to a particular tick of the clock, so that the transition
       * function has no effect if the state has since been updated.
       */
      const boundTick = clock.current();

      const invalidTransition = (
        reason: Reason,
        to: FundamentalState,
      ): void => {
        config.onInvalidTransition?.(
          new InvalidTransitionError({
            reason,
            state: {
              name: State.name,
              from: state.value(),
              to,
            },
            tick: {
              current: clock.current(),
              bound: boundTick,
            },
          }),
        );
      };

      return {
        ...state.value(),
        transition: (to: Exclude<$State, Function>): void => {
          if (clock.current() !== boundTick) {
            return invalidTransition('stale', to);
          }

          const currentKind = state.value().kind;
          const futureKind = to.kind;

          if (!State.transitions[currentKind].includes(futureKind)) {
            return invalidTransition('disallowed', to);
          }

          set(to);
        },
      } as unknown as ReturnType<$Value>;
    };

    return { set, update, value };
  };
};
