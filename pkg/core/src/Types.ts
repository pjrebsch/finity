import type { InvalidTransitionError } from './InvalidTransitionError';

export interface UnhandledStates<_Unhandled> {
  _: never;
}

export type Getter<T extends {}> = {
  (): T;
};

export type Setter<T extends {}> = {
  <U extends T>(value: (prev: T) => U): U;
  <U extends T>(value: Exclude<U, Function>): U;
};

export type InitialValue<T extends {}> = Exclude<T, Function> | Getter<T>;

export interface Config {
  useState: <T extends {}>(initial: () => T) => [Getter<T>, Setter<T>];
  onInvalidTransition?: (error: InvalidTransitionError) => void;
}

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

/**
 * @see https://stackoverflow.com/a/69386479/1454953
 */
export type IsUnique<T extends readonly unknown[]> = T extends readonly [
  infer First,
  ...infer Rest,
]
  ? First extends Rest[number]
    ? false
    : IsUnique<Rest>
  : true;
