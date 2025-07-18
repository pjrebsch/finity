import { renderHook } from '@testing-library/react';
import { expect, test } from 'vitest';
import { initialize } from '.';

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
  const { result, rerender } = renderHook(() =>
    finity.useTransitionalState(State, () => ({ kind: 'Loading' } as const)),
  );

  expect(result.current.value().kind).toEqual('Loading');

  renderHook(() =>
    finity
      .useEffect(result.current.value)
      .case(['Loading'], async (s) => {
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
