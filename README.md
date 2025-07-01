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

There are 3 official variants of this package.

### Officially Supported Frameworks

For React apps, install [`@ghostry/finity-reactjs`](https://www.npmjs.com/package/@ghostry/finity-reactjs).

For Solid apps, install [`@ghostry/finity-solidjs`](https://www.npmjs.com/package/@ghostry/finity-solidjs).

These are intended to work out-of-the-box for those frameworks using their built-in reactivity features.

### Other Frameworks

For other frameworks, you can implement a custom integration using [`@ghostry/finity-core`](https://www.npmjs.com/package/@ghostry/finity-core).

Or submit an issue to request support be added.

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

While the types prevent transition functions from being called with invalid states, the consuming application's code can still perform invalid transitions. This config makes it possible to report such occurrences.

> [!NOTE]
> Performing an invalid transition will _not_ throw an error—it will simply call this configured function.

The configured function receives an `InvalidTransitionError` with the following notable properties:

- `reason`: indicates the type of invalid transition (`"stale"` or `"disallowed"`)
- `state`:
  - `name`: the name of the state if assigned
  - `from`: the state at the time of attempted transition
  - `to`: the state to which transition was attempted
- `tick`:
  - `current`: the state's monotonic counter value when the transition was attempted
  - `bound`: the monotonic counter value that was required for the transition to be valid
- `message`: a default error message with basic details
- `stack`: a stack trace if the JS runtime supports it

```ts
const finity = initialize({
  onInvalidTransition: ({ message, stack }) => {
    console.warn(message, stack);
  },
});
```

#### Examples of invalid transitions

Given the following allowed transitions:

```ts
finity
  .defineTransitionalState<{
    /* ... */
  }>()
  .transitions({
    A: ['B', 'C'],
    B: ['C'],
    C: [],
    D: [],
  });
```

Overriding the types can lead to an invalid state transition:

```ts
finity.useEffect(state.value).case(['A'], ({ transition }) => {
  /**
   * This is simply a disallowed transition which will trigger the
   * configured `onInvalidTransition` function at runtime
   */
  transition({ kind: 'D' } as any);
});
```

Transitioning after the first transition:

```ts
finity.useEffect(state.value).case(['A'], ({ transition }) => {
  /**
   * Valid transition from A -> B
   */
  transition({ kind: 'B' });

  /**
   * According to the types, this is a valid transition from A -> C, but
   * the state will have already transitioned to B, so this transition
   * will not occur and will trigger `onInvalidTransition`
   */
  transition({ kind: 'C' });
});
```

Similarly, the application may have a race condition. The winner of
the race will determine the transition, the loser(s) will each trigger
the `onInvalidTransition` function:

```ts
finity.useEffect(state.value).case(['A'], ({ transition }) => {
  setTimeout(() => transition({ kind: 'B' }), Math.random() * 100);
  setTimeout(() => transition({ kind: 'C' }), Math.random() * 100);
});
```

_If a stale transition is made to a disallowed state, the `reason` will be `"stale"`, not `"disallowed"`._

## FAQ

### Should I use `useStrictlyTransitionalState` or `useTransitionalState`?

Prefer using the `useStrictlyTransitionalState` hook because it prevents the state from being set arbitrarily. In other words, any state change must be the result of a permitted transition.

The `useTransitionalState` hook exposes the `transition` function on each state, but allows setting the state arbitrarily using methods on `state`, such as `state.set()`.

### Do I need `useRender`?

The `useRender` function can be replaced with a native `switch` statement for the majority of users.

However, if you are using SolidJS or some other framework where the `JSX.Element` type includes `undefined`, then a `switch` statement will not guarantee exhaustiveness, as any unhandled state will result in implicitly returning `undefined`, which TypeScript will accept as a valid render value.

If that applies to your application, then you will need to use `useRender` or some other approach for ensuring case exhaustivity.

Note: the `useRender` function is not available in the `@ghostry/finity-core` package because it's implementation is entirely subject to a frontend framework.
