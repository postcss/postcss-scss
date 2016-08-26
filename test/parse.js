import parse from '../lib/scss-parse';

import cases from 'postcss-parser-tests';
import test  from 'ava';

cases.each( (name, css, json) => {
    test('parses ' + name, t => {
        let parsed = cases.jsonify(parse(css, { from: name }));
        t.deepEqual(parsed, json);
    });
});

test('parses nested rules', t => {
    let root = parse('a { b {} }');
    t.deepEqual(root.first.first.selector, 'b');
});

test('parses at-rules inside rules', t => {
    let root = parse('a { @media {} }');
    t.deepEqual(root.first.first.name, 'media');
});

test('parses variables', t => {
    let root = parse('$var: 1;');
    t.deepEqual(root.first.prop, '$var');
    t.deepEqual(root.first.value, '1');
});

test('parses inline comments', t => {
    let root = parse('\n// a \n/* b */');
    t.deepEqual(root.nodes.length, 2);
    t.deepEqual(root.first.text, 'a');
    t.deepEqual(root.first.raws, {
        before: '\n',
        left:   ' ',
        right:  ' ',
        inline: true
    });
    t.deepEqual(root.last.text, 'b');
});

test('parses empty inline comments', t => {
    let root = parse('//\n// ');
    t.deepEqual(root.first.text, '');
    t.deepEqual(root.first.raws, {
        before: '',
        left:   '',
        right:  '',
        inline: true
    });
    t.deepEqual(root.last.text, '');
    t.deepEqual(root.last.raws, {
        before: '\n',
        left:   ' ',
        right:  '',
        inline: true
    });
});

test('does not parse comments inside brakets', t => {
    let root = parse('a { cursor: url(http://ya.ru) }');
    t.deepEqual(root.first.first.value, 'url(http://ya.ru)');
});

test('parses interpolation', t => {
    let root = parse('#{$selector}:hover { #{$prop}-size: #{$color} }');
    t.deepEqual(root.first.selector, '#{$selector}:hover');
    t.deepEqual(root.first.first.prop, '#{$prop}-size');
    t.deepEqual(root.first.first.value, '#{$color}');
});

test('parses interpolation inside word', t => {
    let root = parse('.#{class} {}');
    t.deepEqual(root.first.selector, '.#{class}');
});

test('parses non-interpolation', t => {
    let root = parse('\\#{ color: black }');
    t.deepEqual(root.first.selector, '\\#');
});

test('parses interpolation inside interpolation', t => {
    let root = parse('$column: #{"#{&}__column"};');
    t.deepEqual(root.first.value, '#{"#{&}__column"}');
});

test('parses interpolation right after at-rule', t => {
    let root = parse('@media#{$var} { }');
    t.deepEqual(root.first.params, '#{$var}');
});

test('parses interpolation in url()', t => {
    let root = parse('image: url(#{get(path)}.png)');
    t.deepEqual(root.first.value, 'url(#{get(path)}.png)');
});

test('parses text in rules', t => {
    let root = parse('a { margin:text { left: 10px; }}');
    t.deepEqual(root.first.first.selector, 'margin:text');
    t.deepEqual(root.first.first.first.prop, 'left');
});

test('parses semicolon in rules', t => {
    let root = parse('a { test(a: 1) { left: 10px; }}');
    t.deepEqual(root.first.first.selector, 'test(a: 1)');
    t.deepEqual(root.first.first.first.prop, 'left');
});

test('parses nested props as rule', t => {
    let root = parse('a { margin: { left: 10px; }}');
    t.deepEqual(root.first.first.selector, 'margin:');
    t.deepEqual(root.first.first.first.prop, 'left');
});

test('parses nested props with value', t => {
    let root = parse('a { margin: 0 { left: 10px; }}');

    t.deepEqual(root.first.first.prop, 'margin');
    t.deepEqual(root.first.first.value, '0');
    t.deepEqual(root.first.first.raws.between, ': ');

    t.deepEqual(root.first.first.first.prop, 'left');
    t.deepEqual(root.first.first.first.value, '10px');
});

test('parses nested props with space-less digit', t => {
    let root = parse('a { margin:0 { left: 10px; }}');
    t.deepEqual(root.first.first.prop, 'margin');
    t.deepEqual(root.first.first.value, '0');
    t.deepEqual(root.first.first.first.prop, 'left');
});

test('parses nested props with new line as rule', t => {
    let root = parse('a { \n margin  \n:0 { left: 10px; }}');
    t.deepEqual(root.first.first.selector, 'margin  \n:0');
});

test('parses nested props with important', t => {
    let root = parse('a { margin: 0!important { left: 10px; }}');
    t.deepEqual(root.first.first.prop, 'margin');
    t.deepEqual(root.first.first.value, '0');
    t.deepEqual(root.first.first.important, true);
});
