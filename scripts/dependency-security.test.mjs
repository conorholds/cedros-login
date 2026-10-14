import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

// Exercise the resolved packages, not just manifest versions or audit labels.
for (const directory of ['ui', 'react-native']) {
  const require = createRequire(new URL(`../${directory}/package.json`, import.meta.url));
  const braces = createRequire(require.resolve('micromatch'))('braces');
  const shellQuote = createRequire(require.resolve('react-devtools-core'))('shell-quote');

  test(`${directory}: ordinary brace expansion preserves matching semantics`, () => {
    assert.deepEqual(braces.expand('src/{foo,bar}.{js,ts}'), [
      'src/foo.js', 'src/foo.ts', 'src/bar.js', 'src/bar.ts',
    ]);
    assert.deepEqual(braces.expand('{a,{b,c}}'), ['a', 'b', 'c']);
    assert.deepEqual(braces.expand('{1..3}'), ['1', '2', '3']);
  });

  test(`${directory}: deeply nested patterns fail at the guard before stack exhaustion`, () => {
    for (const [open, close] of [['{', '}'], ['(', ')']]) {
      const pattern = open.repeat(3500) + 'a' + close.repeat(3500);
      for (const options of [{}, { expand: true }, { maxDepth: Infinity }, { maxDepth: 10000 }]) {
        assert.throws(() => braces(pattern, options), error => (
          error instanceof SyntaxError && /exceeds max depth/.test(error.message)
        ));
      }
    }
  });

  test(`${directory}: caller-supplied deep ASTs cannot bypass walker guards`, () => {
    for (const method of ['compile', 'expand', 'stringify']) {
      let node = { type: 'text', value: 'a' };
      for (let i = 0; i < 1000; i++) node = { type: 'brace', nodes: [node] };
      const ast = { type: 'root', nodes: [node] };
      assert.throws(() => braces[method](ast), error => (
        error instanceof RangeError && /exceeds max depth/.test(error.message)
      ));
    }
  });

  test(`${directory}: safe shell arguments round-trip without becoming syntax`, () => {
    const args = ['printf', '%s', 'a b; $HOME'];
    assert.deepEqual(shellQuote.parse(shellQuote.quote(args)), args);
  });

  test(`${directory}: comment-following line terminators are rejected`, () => {
    for (const terminator of ['\n', '\r', '\u2028', '\u2029']) {
      assert.throws(() => shellQuote.quote([
        'echo', 'ok', { comment: 'x' }, `a${terminator}id;#`,
      ]), TypeError);
    }
  });
}
