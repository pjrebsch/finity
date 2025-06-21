/**
 * Useful to communicate the intent to do nothing in a callback.
 */
export const noop = (): void => {};

/**
 * Useful in the `default` case of a switch that returns `void` to ensure that
 * the switch has exhausted all possible states.
 */
export const never = (never: never): never => {
  throw new Error('Impossible code branch reached!', never);
};
