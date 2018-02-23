const cases = require('postcss-parser-tests');

const parse = require('../lib/scss-parse');

cases.each( (name, css, json) => {
    it('parses ' + name, () => {
        let parsed = cases.jsonify(parse(css, { from: name }));
        expect(parsed).toEqual(json);
    });
});

it('parses nested rules', () => {
    let root = parse('a { b {} }');
    expect(root.first.first.selector).toEqual('b');
});

it('parses at-rules inside rules', () => {
    let root = parse('a { @media {} }');
    expect(root.first.first.name).toEqual('media');
});

it('parses variables', () => {
    let root = parse('$var: 1;');
    expect(root.first.prop).toEqual('$var');
    expect(root.first.value).toEqual('1');
});

it('parses inline comments', () => {
    let root = parse('\n// a \n/* b */');
    expect(root.nodes.length).toEqual(2);
    expect(root.first.text).toEqual('a');
    expect(root.first.raws).toEqual({
        before: '\n',
        left:   ' ',
        right:  ' ',
        inline: true,
        text:   'a'
    });
    expect(root.last.text).toEqual('b');
});

it('parses empty inline comments', () => {
    let root = parse('//\n// ');
    expect(root.first.text).toEqual('');
    expect(root.first.raws).toEqual({
        before: '',
        left:   '',
        right:  '',
        inline: true
    });
    expect(root.last.text).toEqual('');
    expect(root.last.raws).toEqual({
        before: '\n',
        left:   ' ',
        right:  '',
        inline: true
    });
});

it('parses inline comments inside selector', () => {
    let root = parse('a\n// c/**/\nb { }');
    expect(root.first.raws.selector.scss).toEqual('a\n// c/**/\nb');
    expect(root.first.raws.selector.raw).toEqual('a\n/* c*//**//**/\nb');
});

it('does not parse comments inside brakets', () => {
    let root = parse('a { cursor: url(http://ya.ru) }');
    expect(root.first.first.value).toEqual('url(http://ya.ru)');
});

it('parses interpolation', () => {
    let root = parse('#{$selector}:hover { #{$prop}-size: #{$color} }');
    expect(root.first.selector).toEqual('#{$selector}:hover');
    expect(root.first.first.prop).toEqual('#{$prop}-size');
    expect(root.first.first.value).toEqual('#{$color}');
});

it('parses interpolation inside word', () => {
    let root = parse('.#{class} {}');
    expect(root.first.selector).toEqual('.#{class}');
});

it('parses non-interpolation', () => {
    let root = parse('\\#{ color: black }');
    expect(root.first.selector).toEqual('\\#');
});

it('parses interpolation inside interpolation', () => {
    let root = parse('$column: #{"#{&}__column"};');
    expect(root.first.value).toEqual('#{"#{&}__column"}');
});

it('parses interpolation right after at-rule', () => {
    let root = parse('@media#{$var} { }');
    expect(root.first.params).toEqual('#{$var}');
});

it('parses interpolation in url()', () => {
    let root = parse('image: url(#{get(path)}.png)');
    expect(root.first.value).toEqual('url(#{get(path)}.png)');
});

it('parses text in rules', () => {
    let root = parse('a { margin:text { left: 10px; }}');
    expect(root.first.first.selector).toEqual('margin:text');
    expect(root.first.first.first.prop).toEqual('left');
});

it('parses semicolon in rules', () => {
    let root = parse('a { test(a: 1) { left: 10px; }}');
    expect(root.first.first.selector).toEqual('test(a: 1)');
    expect(root.first.first.first.prop).toEqual('left');
});

it('parsers prefixed pseudo in rules', () => {
    let root = parse('input:-moz-focusring { left: 1px }');
    expect(root.first.selector).toEqual('input:-moz-focusring');
    expect(root.first.first.prop).toEqual('left');
});

it('parses nested props as rule', () => {
    let root = parse('a { margin: { left: 10px; }}');
    expect(root.first.first.selector).toEqual('margin:');
    expect(root.first.first.first.prop).toEqual('left');
});

it('parses nested props with value', () => {
    let root = parse('a { margin: 0 { left: 10px; }}');

    expect(root.first.first.prop).toEqual('margin');
    expect(root.first.first.value).toEqual('0');
    expect(root.first.first.raws.between).toEqual(': ');

    expect(root.first.first.first.prop).toEqual('left');
    expect(root.first.first.first.value).toEqual('10px');
});

it('parses nested props with space-less digit', () => {
    let root = parse('a { margin:0 { left: 10px; }}');
    expect(root.first.first.prop).toEqual('margin');
    expect(root.first.first.value).toEqual('0');
    expect(root.first.first.first.prop).toEqual('left');
});

it('parses nested props with new line as rule', () => {
    let root = parse('a { \n margin  \n:0 { left: 10px; }}');
    expect(root.first.first.selector).toEqual('margin  \n:0');
});

it('parses nested props with important', () => {
    let root = parse('a { margin: 0!important { left: 10px; }}');
    expect(root.first.first.prop).toEqual('margin');
    expect(root.first.first.value).toEqual('0');
    expect(root.first.first.important).toBeTruthy();
});

it('parses nested props with important', () => {
    let root = parse('&:#{$var} {}');
    expect(root.first.selector).toEqual('&:#{$var}');
});

it('parses nested props with important', () => {
    let root = parse('a {\n//a/*b*/c\n}');
    expect(root.toString()).toEqual('a {\n/*a*//*b*//*c*/\n}');
});
