import type { UseStateHook } from './useState';

interface UseClock {
  current: () => number;
  advance: () => number;
}

export default (useState: UseStateHook): UseClock => {
  const clock = useState<number>(0);

  /**
   * To have immediate updates to the clock, the current tick needs
   * to be in a standard variable instead of state because React
   * does not update the visible value of state after a change.
   *
   * @see https://react.dev/reference/react/useState#ive-updated-the-state-but-logging-gives-me-the-old-value
   */
  let tick = clock.value();

  return {
    current: () => {
      return tick;
    },
    advance: () => {
      tick++;
      return clock.set(tick);
    },
  };
};
