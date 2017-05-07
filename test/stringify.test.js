const cases = require('postcss-parser-tests');

const stringify = require('../lib/scss-stringify');
const parse     = require('../lib/scss-parse');

cases.each( (name, css) => {
    if ( name === 'bom.css' ) return;

    it('stringifies ' + name, () => {
        let root   = parse(css);
        let result = '';
        stringify(root, i => {
            result += i;
        });
        expect(result).toEqual(css);
    });
});

it('stringifies inline comment', () => {
    let root   = parse('// comment\na {}');
    let result = '';
    stringify(root, i => {
        result += i;
    });
    expect(result).toEqual('// comment\na {}');
});

it('stringifies inline comment with comments inside', () => {
    let root   = parse('// a/*b*/c\na {}');
    let result = '';
    stringify(root, i => {
        result += i;
    });
    expect(result).toEqual('// a/*b*/c\na {}');
});

it('stringifies inline comment in the end of file', () => {
    let root   = parse('// comment');
    let result = '';
    stringify(root, i => {
        result += i;
    });
    expect(result).toEqual('// comment');
});

it('stringifies rule with usual props', () => {
    let root   = parse('a { color: red; text-align: justify ; }');
    let result = '';
    stringify(root, i => {
        result += i;
    });
    expect(result).toEqual('a { color: red; text-align: justify ; }');
});

it('stringifies nested props', () => {
    let root   = parse('a { \n margin : 0!important { left: 10px; }}');
    let result = '';
    stringify(root, i => {
        result += i;
    });
    expect(result).toEqual('a { \n margin : 0!important { left: 10px; }}');
});

it('stringifies nested props with more newlines', () => {
    let root = parse('a { \n margin : 0 !important \n { \n left: 10px; } \n}');
    let result = '';
    stringify(root, i => {
        result += i;
    });
    expect(result).toEqual(
        'a { \n margin : 0 !important \n { \n left: 10px; } \n}');
});
