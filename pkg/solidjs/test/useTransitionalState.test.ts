import { renderHook } from '@solidjs/testing-library';
import { createSignal } from 'solid-js';
import { describe, expect, it, test } from 'vitest';
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

test('setting the state', async () => {
  const { result: state } = renderHook(finity.useTransitionalState, {
    initialProps: [State, () => ({ kind: 'Loading' } as const)],
  });

  await testEffectInStages((done) => [
    () => {
      const { transition, ...s } = state.value();
      expect(s).toEqual({ kind: 'Loading' });
      state.set({ kind: 'Ready', resource: 123 });
    },
    () => {
      const { transition, ...s } = state.value();
      expect(s).toEqual({ kind: 'Ready', resource: 123 });
      done();
    },
  ]);
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

describe('transitioning to an invalid state', () => {
  it('does not transition', async () => {
    const { result: state } = renderHook(finity.useStrictlyTransitionalState, {
      initialProps: [State, () => ({ kind: 'Ready', resource: 1 } as const)],
    });

    await testEffectInStages((done) => [
      () => {
        const s1 = state.value();
        expect(s1.kind).toEqual('Ready');

        if (s1.kind !== 'Ready') return;
        s1.transition(
          /* @ts-expect-error */
          { kind: 'Errored', error: new Error('e') },
        );

        const { transition, ...s } = state.value();
        expect(s).toEqual({ kind: 'Ready', resource: 1 });
        done();
      },
    ]);
  });

  describe('with `onInvalidTransition` configured', () => {
    it('receives the current state and attempted transition state', async () => {
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

      const { result: state } = renderHook(
        finity.useStrictlyTransitionalState,
        {
          initialProps: [State, () => ({ kind: 'B' } as const)],
        },
      );

      const [current, trigger] = createSignal(0);

      await testEffectInStages((done) => [
        () => {
          state.value().transition(
            /* @ts-expect-error */
            { kind: 'A' },
          );

          /**
           * Since the transition above isn't expected to change the state,
           * the test times out since the next effect state is never
           * be triggered.  To trigger the next effect stage, a dummy signal
           * is read and written here.
           */
          trigger(current() + 1);
        },
        () => {
          expect($from).toMatchObject({ kind: 'B' });
          expect($to).toMatchObject({ kind: 'A' });
          done();
        },
      ]);
    });
  });
});
