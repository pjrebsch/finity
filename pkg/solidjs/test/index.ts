import { testEffect } from '@solidjs/testing-library';
import { createEffect } from 'solid-js';

export { initialize } from '@ghostry/finity-solidjs';

export const testEffectInStages = async (
  toStages: (done: () => void) => (() => void)[],
) =>
  testEffect((done) => {
    const stages = toStages(done);
    let run = 0;

    createEffect(() => {
      const stage = stages[run];
      run++;
      if (stage) stage();
    });
  });
