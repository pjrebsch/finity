import { renderHook } from '@testing-library/react';
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
  const { result } = renderHook(() =>
    useTransitionalState(State, () => ({ kind: 'Loading' } as const)),
  );

  const { result: fragment } = renderHook(() =>
    useRender(result.current.value)
      .case(['Loading', 'Ready', 'Errored'], (s) => s.kind)
      .use(),
  );

  expect(fragment.current).toBe('Loading');
});
