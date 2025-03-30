import { render, renderHook } from '@solidjs/testing-library';
import { expect, test } from 'vitest';
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

test('rendering based on the state', async () => {
  const { result: state } = renderHook(useTransitionalState, {
    initialProps: [State, () => ({ kind: 'Loading' } as const)],
  });

  const { asFragment } = render(() =>
    useRender(state.value)
      .case(['Loading', 'Ready', 'Errored'], (s) => s.kind)
      .use(),
  );

  expect(asFragment()).toBe('Loading');
});
