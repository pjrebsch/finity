import { renderHook } from '@solidjs/testing-library';
import { expect, test } from 'vitest';
import { initialize, testEffectInStages } from '.';

const finity = initialize({});

const State = finity
  .defineTransitionalState<{
    Loading: {};
    Ready: { resource: number };
    Errored: { error: Error };
  }>('MyState')
  .transitions({
    Loading: ['Ready', 'Errored'],
    Ready: [],
    Errored: [],
  });

test('transitioning the state', async () => {
  const { result: state } = renderHook(finity.useTransitionalState, {
    initialProps: [State, () => ({ kind: 'Loading' } as const)],
  });

  await testEffectInStages((done) => [
    () => {
      const s = state.value();
      expect(s.kind).toEqual('Loading');

      if (s.kind !== 'Loading') return;
      s.transition({ kind: 'Ready', resource: 123 });
    },
    () => {
      const { transition, ...s } = state.value();
      expect(s).toEqual({ kind: 'Ready', resource: 123 });
      done();
    },
  ]);
});
