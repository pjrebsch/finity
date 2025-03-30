import { renderHook } from '@solidjs/testing-library';
import { expect, test } from 'vitest';
import { testEffectInStages } from '.';
import { initialize } from '../src';

export const {
  defineTransitionalState,
  useTransitionalState,
  useStrictlyTransitionalState,
  useState,
  useEffect,
  useRender,
} = initialize({});

const State = defineTransitionalState<{
  Loading: {};
  Ready: { resource: number };
  Errored: { error: Error };
}>('MyState').transitions({
  Loading: ['Ready', 'Errored'],
  Ready: [],
  Errored: [],
});

test('transitioning the state', async () => {
  const { result: state } = renderHook(useTransitionalState, {
    initialProps: [State, () => ({ kind: 'Loading' } as const)],
  });

  await testEffectInStages((done) => [
    () => {
      const s = state.value();
      expect(s.kind).toEqual('Loading');

      useEffect(state.value)
        .case(['Loading'], (s) => {
          s.transition({ kind: 'Ready', resource: 123 });
        })
        .case(['Ready', 'Errored'], (s) => {
          throw `Unexpected state: ${s.kind}`;
        })
        .use();
    },
    () => {
      const { transition, ...s } = state.value();
      expect(s).toEqual({ kind: 'Ready', resource: 123 });
      done();
    },
  ]);
});
