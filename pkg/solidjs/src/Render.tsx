/**
 * https://github.com/solidjs/solid/discussions/1527
 */

import type { Getter } from '@ghostry/finity-core';
import { For, Match, Switch, type JSX } from 'solid-js';

export function Render<S extends { kind: string }>(props: {
  state: Getter<S>;
  cases: [string[], (state: S) => JSX.Element][];
}): JSX.Element {
  return (
    <Switch>
      <For each={props.cases}>
        {([kinds, render]) => (
          <Match
            when={kinds.includes(props.state().kind)}
            children={render(props.state())}
          />
        )}
      </For>
    </Switch>
  );
}
