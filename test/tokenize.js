import tokenize from '../lib/scss-tokenize';

import Input from 'postcss/lib/input';
import test  from 'ava';

function run(t, css, tokens) {
    t.deepEqual(tokenize(new Input(css)), tokens);
}

test('tokenizes inline comments', t => {
    run(t, '// a\n', [ ['comment', '// a', 1, 1, 1, 4, 'inline'],
                       ['space', '\n'] ]);
});

test('tokenizes inline comments with any new line', t => {
    run(t, '// a\r\n', [ ['comment', '// a', 1, 1, 1, 4, 'inline'],
                         ['space', '\r\n'] ]);
});

test('tokenizes inline comments in end of file', t => {
    run(t, '// a', [ ['comment', '// a', 1, 1, 1, 4, 'inline'] ]);
});

test('tokenizes interpolation', t => {
    run(t, '#{a\nb}', [ ['word', '#{a\nb}', 1, 1, 2, 2] ]);
});

test('tokenizes recursively interpolations', t => {
    run(t, '#{#{#{}}}', [ ['word', '#{#{#{}}}', 1, 1, 1, 9] ]);
});
