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
  onInvalidTransition?: (info: {
    from: { kind: string };
    to: { kind: string };
  }) => void;
}

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
