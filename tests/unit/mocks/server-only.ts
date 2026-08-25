// Empty shim so `import "server-only"` resolves harmlessly under vitest.
// Next.js's own bundler does the equivalent for real server-side code (the
// package only throws when accidentally bundled into a *client* bundle);
// vitest has no such split, so without this alias every test that
// transitively imports a file with `import "server-only"` fails to resolve
// the import entirely. See vitest.config.ts's resolve.alias.
export {};
