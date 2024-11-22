import type { Prettify } from './Types';

export type StateDefinition<K extends string> = {
  [k in K]: Record<string, any>;
};
export type TransitionsDefinition<K extends string> = Record<K, NoInfer<K[]>>;

export type FiniteStateUnion<K extends string, S extends StateDefinition<K>> = {
  [k in K]: { kind: k } & S[k];
}[K];

export type FiniteStateByKind<
  K extends string,
  S extends StateDefinition<K>,
> = {
  [k in K]: Prettify<{ kind: k } & S[k]>;
};

export type FiniteState<
  K extends string,
  S extends StateDefinition<K>,
> = Prettify<{ '*': FiniteStateUnion<K, S> } & FiniteStateByKind<K, S>>;

export type FiniteTransitionalState<
  K extends string,
  S extends StateDefinition<K>,
  X extends TransitionsDefinition<K>,
> = Prettify<
  { '*': FiniteStateUnion<K, S>; '->': X } & FiniteStateByKind<K, S>
>;

export interface DefinedFiniteTransitionalState<
  K extends string,
  _S extends StateDefinition<K>,
  X extends TransitionsDefinition<K>,
> {
  name?: string;
  transitions: X;
}

type DefinedFiniteState<K extends string, S extends StateDefinition<K>> = {
  name?: string;
  transitions: <const X extends TransitionsDefinition<K>>(
    transitions: X & { [k in keyof X]: k extends K ? X[k] : never },
  ) => DefinedFiniteTransitionalState<K, S, X>;
};

export const defineTransitionalState = <
  S extends StateDefinition<string> = never,
>(
  name?: string,
) => {
  type K = Extract<keyof S, string>;

  const defined: DefinedFiniteState<K, S> = {
    name,
    transitions: <const X extends TransitionsDefinition<K>>(
      transitions: X,
    ): DefinedFiniteTransitionalState<K, S, X> => {
      return { name, transitions };
    },
  };

  return defined;
};

export type Transitionable<
  K extends string,
  S extends StateDefinition<K>,
  X extends TransitionsDefinition<K>,
> = {
  [k in K]: { kind: k } & S[k] & {
      transition: (
        to: Exclude<
          X[k] extends never[]
            ? never
            : {
                [R in X[k][number]]: { kind: R } & S[R];
              }[X[k][number]],
          Function
        >,
      ) => void;
    };
};

export type Transitional<
  K extends string,
  S extends StateDefinition<K>,
  X extends TransitionsDefinition<K>,
> = Transitionable<K, S, X>[K];

export type EffectByState<
  K extends string,
  S extends StateDefinition<K>,
  X extends TransitionsDefinition<K>,
> = {
  [k in K]: (state: Transitionable<K, S, X>[k]) => void;
};

export type MapByState<K extends string, S extends StateDefinition<K>, R> = {
  [k in K]: (state: { kind: k } & S[k]) => R;
};

export type TransitionalStates<T> = T extends DefinedFiniteTransitionalState<
  infer K,
  infer S,
  infer X
>
  ? FiniteTransitionalState<K, S, X>
  : never;

export type TransitionableStates<T> = T extends DefinedFiniteTransitionalState<
  infer K,
  infer S,
  infer X
>
  ? Transitionable<K, S, X>
  : never;
