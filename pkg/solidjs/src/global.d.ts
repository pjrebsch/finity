/**
 * By default, the server build of SolidJS is used when importing `solid-js` which
 * means that reactivity features aren't available.
 * @see https://github.com/solidjs/solid/discussions/425#discussioncomment-686291
 *
 * This issue causes tests to fail with timeouts.
 *
 * To work around this, we need to import the client build of SolidJS by its `dist` path,
 * both in tests and in the source code being tested.  The import is mapped in
 * `tsconfig.json`, but that causes the package's types to not be found.
 *
 * Thus this declaration exists to allow importing the correct build without losing
 * the types.
 */
declare module '$/solid-js' {
  export * from 'solid-js';
}
