import { renderHook } from '@testing-library/react';
import { describe, expect, it, test } from 'vitest';
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

test('setting the state', async () => {
  const { result, rerender } = renderHook(() =>
    finity.useTransitionalState(State, () => ({ kind: 'Loading' } as const)),
  );

  const { transition: _t1, ...s1 } = result.current.value();
  expect(s1).toEqual({ kind: 'Loading' });

  result.current.set({ kind: 'Ready', resource: 123 });

  rerender();

  const { transition: _t2, ...s2 } = result.current.value();
  expect(s2).toEqual({ kind: 'Ready', resource: 123 });
});

test('transitioning the state', async () => {
  const { result, rerender } = renderHook(() =>
    finity.useTransitionalState(State, () => ({ kind: 'Loading' } as const)),
  );

  const s1 = result.current.value();
  expect(s1.kind).toEqual('Loading');

  if (s1.kind !== 'Loading') return;
  s1.transition({ kind: 'Ready', resource: 123 });

  rerender();

  const { transition: _t2, ...s2 } = result.current.value();
  expect(s2).toEqual({ kind: 'Ready', resource: 123 });
});

describe('transitioning to an invalid state', () => {
  it('does not transition', () => {
    const { result, rerender } = renderHook(() =>
      finity.useTransitionalState(State, () => ({
        kind: 'Ready',
        resource: 1,
      })),
    );

    const s1 = result.current.value();
    expect(s1.kind).toEqual('Ready');

    if (s1.kind !== 'Ready') return;
    s1.transition(
      /* @ts-expect-error */
      { kind: 'Errored', error: new Error('e') },
    );

    rerender();

    const { transition: _t2, ...s2 } = result.current.value();
    expect(s2).toEqual({ kind: 'Ready', resource: 1 });
  });

  describe('with `onInvalidTransition` configured', () => {
    it('receives the current state and attempted transition state', () => {
      let $from: unknown, $to: unknown;

      const finity = initialize({
        onInvalidTransition: ({ from, to }) => {
          $from = from;
          $to = to;
        },
      });

      const State = finity
        .defineTransitionalState<{
          A: {};
          B: {};
        }>()
        .transitions({
          A: ['B'],
          B: [],
        });

      const { result } = renderHook(() =>
        finity.useTransitionalState(State, () => ({ kind: 'B' })),
      );

      result.current.value().transition(
        /* @ts-expect-error */
        { kind: 'A' },
      );

      expect($from).toMatchObject({ kind: 'B' });
      expect($to).toMatchObject({ kind: 'A' });
    });
  });
});
