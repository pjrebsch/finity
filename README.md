# finity

Finite state management with exhaustiveness and transition enforcement for TypeScript.

## Example

An example of the high-level states modeling user sign-in:

```tsx
const State = defineTransitionalState<{
  Anonymous: {};
  SigningIn: { username: string; password: string };
  BadCredentials: { username: string; password: string };
  Authenticated: { username: string };
  SigningOut: {};
}>().transitions({
  Anonymous: ['SigningIn'],
  SigningIn: ['Authenticated', 'BadCredentials'],
  BadCredentials: ['SigningIn', 'Anonymous'],
  Authenticated: ['SigningOut'],
  SigningOut: ['Anonymous'],
});

type State = UsingStrictlyTransitionalState<typeof State>;
type States = TransitionalStates<typeof State>;

function SignIn() {
  const state = useStrictlyTransitionalState(State, () => ({
    kind: 'Anonymous',
  }));

  useEffect(state.value)
    .case(['Anonymous', 'BadCredentials', 'Authenticated'], noop)
    .case(['SigningIn'], ({ username, password, transition }) => {
      api
        .signIn()
        .then(() => transition({ kind: 'Authenticated', username }))
        .catch(() =>
          transition({ kind: 'BadCredentials', username, password }),
        );
    })
    .case(['SigningOut'], ({ transition }) => {
      api.signOut().then(() => transition({ kind: 'Anonymous' }));
    })
    .use();

  return useRender(state.value)
    .case(['Anonymous', 'BadCredentials'], (state) => (
      <>
        <Message state={state} />
        <Form
          username={state.username}
          password={state.password}
          onSubmit={(credentials) =>
            state.transition({ kind: 'SigningIn', ...credentials })
          }
        />
      </>
    ))
    .case(['Authenticated'], (state) => <App state={state} />)
    .case(['SigningIn', 'SigningOut'], () => <Loading />)
    .use();
}

function Message(props: {
  state: States['Anonymous'] | States['BadCredentials'];
}) {
  return useRender(() => props.state)
    .case(['Anonymous'], () => <></>)
    .case([
      'BadCredentials',
      ({ username }) => <div>Invalid password for {username}.</div>,
    ])
    .use();
}
```

## Installation

There are 3 official variants of this package available from https://npmjs.com

For React and Solid applications, install [`@ghostry/finity-reactjs`](https://www.npmjs.com/package/@ghostry/finity-reactjs) or [`@ghostry/finity-solidjs`](https://www.npmjs.com/package/@ghostry/finity-solidjs) directly. These are intended to work out-of-the-box for those frameworks using their built-in reactivity features.

For other frameworks, you can implement a custom integration using [`@ghostry/finity-core`](https://www.npmjs.com/package/@ghostry/finity-core).

## Guide

Regardless of the variant that you use, the library requires initialization. Consider creating a dedicated module for this, such as at `src/finity.ts`.

> [!TIP]
> This gives you an opportunity to rename or alias any of the library's functions or types if you desire.

```ts
import { initialize } from '@ghostry/finity-solidjs';

export const {
  defineTransitionalState,
  useTransitionalState,
  useStrictlyTransitionalState,
  useState,
  useEffect,
  useRender,
} = initialize({});

export type * from '@ghostry/finity-solidjs';
```

In an application component, define the relevant states and their allowed transitions.

```ts
import * as finity from 'src/finity';

const State = finity
  .defineTransitionalState<{
    Loading: {};
    Ready: { resource: Resource };
    Errored: { error: Error };
  }>('MyState')
  .transitions({
    Loading: ['Ready', 'Errored'],
    Ready: [],
    Errored: [],
  });
```

Here we have 3 states defined by the type argument: `Loading`, `Ready`, `Errored`.

For each of those states, we declare the interface they should have. In addition to what we declare, each state will have a `kind` property with the literal state name.

The call to `defineTransitionalState` also takes an optional argument to name the state, to assist in any future debug logging.

Next, we declare which states each state is allowed to transition to. An empty array makes the state terminal (it cannot transition to any other state).

Within a component, we can use our defined state with the `useStrictlyTransitionalState` or `useTransitionalState` hook, providing its initial value:

```ts
const state = finity.useStrictlyTransitionalState(State, () => ({
  kind: 'Loading',
}));
```

For the `Loading` state, we will want to fetch the resource. We can do this with the `useEffect` hook:

```ts
finity
  .useEffect(state.value)
  .case(['Loading'], ({ transition }) => {
    api
      .getTheResource()
      .then((resource) => transition({ kind: 'Ready', resource }))
      .catch((error) => transition({ kind: 'Errored', error }));
  })
  .case(['Ready', 'Errored'], noop)
  .use();
```

This is modeled similarly to a native `switch` statement. The `use` call at the end of the chain is where exhaustiveness checking takes place. If you omitted any of the states in the calls to `case`, then you will get a type error listing out the missing states:

```
This expression is not callable.
  Type 'UnhandledStates<"Errored">' has no call signatures.
```

## Configuration

Library initialization takes a configuration object with these optional properties.

### `onInvalidTransition`

While the types prevent transition functions from being called with invalid states, race conditions in the consuming application's code make it possible for transitions to be called for a state after that state has already transitioned. This represents a bug in the consuming application's code and this config makes it possible to report those occurrences.

_An invalid transition will only be detected in this way if whatever the current state is does not allow transition to the next state (this will be improved with [#7](https://github.com/pjrebsch/finity/issues/7))._

The configured function receives an object with the current state at the time of transition (`from`) and the state to which transition was attempted (`to`).

```ts
const finity = initialize({
  onInvalidTransition: ({ from, to }) => {
    console.warn(
      `Invalid state transition from "${from.kind}" to "${to.kind}"`,
    );
  },
});
```

Here's a demonstration of how an invalid transition could be triggered:

```ts
finity
  .defineTransitionalState<{
    /* ... */
  }>()
  .transitions({
    A: ['B', 'C'],
    B: [],
    C: [],
  });
```

```ts
finity.useEffect(state.value).case(['A'], ({ transition }) => {
  /**
   * Valid transition from A -> B
   */
  transition({ kind: 'B' });

  /**
   * Valid transition from A -> C according to the types, but the state
   * will have already transitioned to B which doesn't allow transition to
   * C, so this an invalid transition at runtime which will invoke the
   * `onInvalidTransition` configured function
   */
  setTimeout(() => transition({ kind: 'C' }), 1000);
});
```

## FAQ

### Should I use `useStrictlyTransitionalState` or `useTransitionalState`?

Prefer using the `useStrictlyTransitionalState` hook because it prevents the state from being set arbitrarily. In other words, any state change must be the result of a permitted transition.

The `useTransitionalState` hook exposes the `transition` function on each state, but allows setting the state arbitrarily using methods on `state`, such as `state.set()`.

### Do I need `useRender`?

The `useRender` function can be replaced with a native `switch` statement for the majority of users.

However, if you are using SolidJS or some other framework where the `JSX.Element` type includes `undefined`, then a `switch` statement will not guarantee exhaustiveness, as any unhandled state will result in implicitly returning `undefined`, which TypeScript will accept as a valid render value.

If that applies to your application, then you will need to use `useRender` or some other approach for ensuring case exhaustivity.

Note: the `useRender` function is not available in the `@ghostry/finity-core` package because it's implementation is entirely subject to a frontend framework.
