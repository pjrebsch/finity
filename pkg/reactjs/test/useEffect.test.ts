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

test('transitioning the state', async () => {
  const { result, rerender } = renderHook(() =>
    useTransitionalState(State, () => ({ kind: 'Loading' } as const)),
  );

  expect(result.current.value().kind).toEqual('Loading');

  renderHook(() =>
    useEffect(result.current.value)
      .case(['Loading'], (s) => {
        s.transition({ kind: 'Ready', resource: 123 });
      })
      .case(['Ready', 'Errored'], (s) => {
        throw `Unexpected state: ${s.kind}`;
      })
      .use(),
  );

  rerender();

  const { transition, ...s } = result.current.value();

  expect(s).toEqual({ kind: 'Ready', resource: 123 });
});
