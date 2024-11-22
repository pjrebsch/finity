export type Getter<T> = {
  (): T;
};

export type Setter<T> = {
  <U extends T>(value: (prev: T) => U): U;
  <U extends T>(value: Exclude<U, Function>): U;
};

export type InitialValue<T> = Exclude<T, Function> | Getter<T>;

export interface Config {
  useState: <T>(initial: () => T) => [Getter<T>, Setter<T>];
}

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
