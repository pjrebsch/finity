import type {
  DefinedFiniteTransitionalState,
  EffectByState,
  FiniteStateUnion,
  MapByState,
  StateDefinition,
  Transitional,
  TransitionsDefinition,
} from './States';
import type { Config, Getter } from './Types';
import { default as _useState, type UseState } from './useState';

export type TransitionalState<T> = T extends DefinedFiniteTransitionalState<
  infer K,
  infer S,
  infer X
>
  ? UseTransitionalState<K, S, X>
  : never;

export interface UseTransitionalState<
  K extends string,
  S extends StateDefinition<K>,
  X extends TransitionsDefinition<K>,
> extends UseState<FiniteStateUnion<K, S>> {
  transitional(): Transitional<K, S, X>;
  effect(byState: EffectByState<K, S, X>): void;
  map<R>(byState: MapByState<K, S, R>): R;
}

export default (config: Config, useState: ReturnType<typeof _useState>) => {
  return <
    K extends string,
    S extends StateDefinition<K>,
    X extends TransitionsDefinition<K>,
  >(
    State: DefinedFiniteTransitionalState<K, S, X>,
    initial: NoInfer<Getter<FiniteStateUnion<K, S>>>,
  ): UseTransitionalState<K, S, X> => {
    type State = FiniteStateUnion<K, S>;

    const state = useState<State>(initial);

    type Transitional = UseTransitionalState<K, S, X>['transitional'];

    const transitional: Transitional = () =>
      ({
        ...state.value(),
        transition: (to: Exclude<State, Function>): void => {
          const currentKind = state.value().kind;
          const futureKind = to.kind;

          if (State.transitions[currentKind].includes(futureKind)) {
            state.set(to);
          } else {
            /**
             * The types should never allow this to occur.
             */
            console.error('[finity] Invalid state transition!');
          }
        },
      } as unknown as ReturnType<Transitional>);

    type Effect = UseTransitionalState<K, S, X>['effect'];

    const effect: Effect = (byState: EffectByState<K, S, X>) => {
      const s = transitional();
      const e = byState[s.kind];
      e(s);
    };

    type Map = UseTransitionalState<K, S, X>['map'];

    const map: Map = <R>(byState: MapByState<K, S, R>): R => {
      const s = state.value();
      const k = s.kind;
      const m = byState[k];
      return m(s);
    };

    return {
      ...state,
      transitional,
      effect,
      map,
    };
  };
};
