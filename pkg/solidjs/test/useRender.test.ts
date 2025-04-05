import { render, renderHook } from '@solidjs/testing-library';
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

test('rendering based on the state', async () => {
  const { result: state } = renderHook(finity.useTransitionalState, {
    initialProps: [State, () => ({ kind: 'Loading' } as const)],
  });

  const { asFragment } = render(() =>
    finity
      .useRender(state.value)
      .case(['Loading', 'Ready', 'Errored'], (s) => s.kind)
      .use(),
  );

  expect(asFragment()).toBe('Loading');
});
