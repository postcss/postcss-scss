import tokenize from '../lib/scss-tokenize';

import { expect } from 'chai';
import   Input    from 'postcss/lib/input';

let test = (css, tokens) => {
    expect(tokenize(new Input(css))).to.eql(tokens);
};

describe('SCSS Tokenizer', () => {

    it('tokenize inine comments', () => {
        test('// a\n', [ ['comment', '// a', 1, 1, 1, 4, 'inline'],
                         ['space', '\n'] ]);
    });

    it('tokenize inine comments in end of file', () => {
        test('// a', [ ['comment', '// a', 1, 1, 1, 4, 'inline'] ]);
    });

});
