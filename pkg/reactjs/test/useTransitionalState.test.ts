import { InvalidTransitionError } from '@ghostry/finity-core';
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

describe('transitioning to a disallowed state', () => {
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
    it('receives the transition context', () => {
      let $error: InvalidTransitionError | undefined;

      const finity = initialize({
        onInvalidTransition: (error) => {
          $error = error;
        },
      });

      const State = finity
        .defineTransitionalState<{
          A: {};
          B: {};
        }>('ab')
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

      expect($error).toBeInstanceOf(InvalidTransitionError);
      expect($error?.reason).toBe('disallowed');
      expect($error?.state.name).toStrictEqual('ab');
      expect($error?.state.from).toMatchObject({ kind: 'B' });
      expect($error?.state.to).toMatchObject({ kind: 'A' });
      expect($error?.tick.current).toBe(0);
      expect($error?.tick.bound).toBe(0);
      expect($error?.message).toBeTypeOf('string');
      expect($error?.stack).toBeTypeOf('string');
    });
  });
});

describe('transitioning after state already updated', () => {
  const State = finity
    .defineTransitionalState<{
      A: {};
      B: {};
      C: {};
    }>('abc')
    .transitions({
      A: ['B', 'C'],
      B: ['C'],
      C: [],
    });

  describe('using `set`', () => {
    it('does not transition', async () => {
      const { result, rerender } = renderHook(() =>
        finity.useTransitionalState(State, () => ({ kind: 'A' })),
      );

      const s1 = result.current.value();
      expect(s1.kind).toEqual('A');
      if (s1.kind !== 'A') return;

      result.current.set({ kind: 'B' });

      rerender();

      s1.transition({ kind: 'C' });

      rerender();

      const { transition, ...s } = result.current.value();
      expect(s).toEqual({ kind: 'B' });
    });
  });

  describe('using `update`', () => {
    it('does not transition', async () => {
      const { result, rerender } = renderHook(() =>
        finity.useTransitionalState(State, () => ({ kind: 'A' })),
      );

      const s1 = result.current.value();
      expect(s1.kind).toEqual('A');
      if (s1.kind !== 'A') return;

      result.current.update(() => ({ kind: 'B' }));

      rerender();

      s1.transition({ kind: 'C' });

      rerender();

      const { transition, ...s } = result.current.value();
      expect(s).toEqual({ kind: 'B' });
    });
  });

  describe('using the same transition function', () => {
    it('does not transition', async () => {
      const { result, rerender } = renderHook(() =>
        finity.useTransitionalState(State, () => ({ kind: 'A' })),
      );

      const s1 = result.current.value();
      expect(s1.kind).toEqual('A');
      if (s1.kind !== 'A') return;

      s1.transition({ kind: 'B' });

      rerender();

      s1.transition({ kind: 'C' });

      rerender();

      const { transition, ...s } = result.current.value();
      expect(s).toEqual({ kind: 'B' });
    });
  });
});
