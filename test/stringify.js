import stringify from '../lib/scss-stringify';
import parse     from '../lib/scss-parse';

import cases from 'postcss-parser-tests';
import test  from 'ava';

cases.each( (name, css) => {
    if ( name === 'bom.css' ) return;

    test('stringifies ' + name, t => {
        let root   = parse(css);
        let result = '';
        stringify(root, i => {
            result += i;
        });
        t.deepEqual(result, css);
    });
});

test('stringifies inline comment', t => {
    let root   = parse('// comment\na {}');
    let result = '';
    stringify(root, i => {
        result += i;
    });
    t.deepEqual(result, '// comment\na {}');
});

test('stringifies inline comment in the end of file', t => {
    let root   = parse('// comment');
    let result = '';
    stringify(root, i => {
        result += i;
    });
    t.deepEqual(result, '// comment');
});
