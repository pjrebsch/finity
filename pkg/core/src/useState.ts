import type { Config, InitialValue } from './Types';

export interface UseState<T> {
  value(): T;
  set(value: Exclude<T, Function>): T;
  update(fn: (prev: T) => Exclude<T, Function>): T;
  reset(): T;
}

export type UseStateHook = <T>(initial: InitialValue<T>) => UseState<T>;

export default (config: Config) => {
  return <T>(initial: InitialValue<T>): UseState<T> => {
    const initialValue = (): Exclude<T, Function> =>
      initial instanceof Function
        ? (initial() as Exclude<T, Function>)
        : initial;

    const [value, setValue] = config.useState<T>(initialValue);

    const set = (value: Exclude<T, Function>): T => setValue(value);

    const update = (fn: (prev: T) => Exclude<T, Function>): T => setValue(fn);

    const reset = () => set(initialValue());

    return {
      value,
      set,
      update,
      reset,
    } as const;
  };
};
