import Comment from 'postcss/lib/comment';
import Parser  from 'postcss/lib/parser';

import scssTokenizer from './scss-tokenize';
import DeclarationNested from './declaration-nested';

export default class ScssParser extends Parser {

    tokenize() {
        this.tokens = scssTokenizer(this.input);
    }

    rule(tokens) {
        const tokensCommentless = [];

        let colonIndex = null;
        let isSpaceAfterColon = null;
        let value = null;

        // Strip comments (and join adjacent spaces) so that they don't mess
        // the checking
        for (let i = 0; i < tokens.length; i++) {
            const type = tokens[i][0];
            const lastTokenCommentless =
                tokensCommentless[tokensCommentless.length - 1];
            if (type === 'comment') {
                continue;
            } else if (type === 'space' && lastTokenCommentless &&
                lastTokenCommentless[0] === 'space'
           ) {
                lastTokenCommentless[1] += tokens[i][1];
            } else {
                tokensCommentless.push(tokens[i]);
            }
        }
        // removing the last `{`
        tokensCommentless.pop();

        if (tokensCommentless[1] && tokensCommentless[1][0] === ':') {
            colonIndex = 1;
        } else if (tokensCommentless[2] && tokensCommentless[2][0] === ':') {
            colonIndex = 2;
        }
        if (colonIndex) {
            isSpaceAfterColon = tokensCommentless[colonIndex + 1] &&
                tokensCommentless[colonIndex + 1][0] === 'space';
            value = isSpaceAfterColon ?
                tokensCommentless[colonIndex + 2] &&
                    tokensCommentless[colonIndex + 2][1] :
                tokensCommentless[colonIndex + 1] &&
                    tokensCommentless[colonIndex + 1][1];
        }

        // If the conditions for compiling it as a nested prop (and not
        // a selector as with `a :before`) are right
        if (colonIndex &&
            (value === null || isSpaceAfterColon ||
            /[0-9.$]/.test(value[0]))
       ) {
            tokens.pop();
            // This code chunk is basically an almost exact copy of PostCSS'
            // Parser.decl(), except `DeclarationNested` is used instead of
            // `Declaration`, no ; is needed, and the very last part
            let node = new DeclarationNested();
            this.init(node);

            let last = tokens[tokens.length - 1];
            if (last[4]) {
                node.source.end = { line: last[4], column: last[5] };
            } else {
                node.source.end = { line: last[2], column: last[3] };
            }

            while (tokens[0][0] !== 'word') {
                node.raws.before += tokens.shift()[1];
            }
            node.source.start = { line: tokens[0][2], column: tokens[0][3] };

            node.prop = '';
            while (tokens.length) {
                let type = tokens[0][0];
                if (type === ':' || type === 'space' || type === 'comment') {
                    break;
                }
                node.prop += tokens.shift()[1];
            }

            node.raws.between = '';

            let token;
            while (tokens.length) {
                token = tokens.shift();

                if (token[0] === ':') {
                    node.raws.between += token[1];
                    break;
                } else {
                    node.raws.between += token[1];
                }
            }

            if (node.prop[0] === '_' || node.prop[0] === '*') {
                node.raws.before += node.prop[0];
                node.prop = node.prop.slice(1);
            }
            node.raws.between += this.spacesFromStart(tokens);
            this.precheckMissedSemicolon(tokens);

            for (let i = tokens.length - 1; i > 0; i--) {
                token = tokens[i];
                if (token[1] === '!important') {
                    node.important = true;
                    let string = this.stringFrom(tokens, i);
                    string = this.spacesFromEnd(tokens) + string;
                    if (string !== ' !important') {
                        node.raws.important = string;
                    }
                    break;

                } else if (token[1] === 'important') {
                    let cache = tokens.slice(0);
                    let str   = '';
                    for (let j = i; j > 0; j--) {
                        let type = cache[j][0];
                        if (str.trim().indexOf('!') === 0 &&
                            type !== 'space'
                        ) {
                            break;
                        }
                        str = cache.pop()[1] + str;
                    }
                    if (str.trim().indexOf('!') === 0) {
                        node.important = true;
                        node.raws.important = str;
                        tokens = cache;
                    }
                }

                if (token[0] !== 'space' && token[0] !== 'comment') {
                    break;
                }
            }

            this.raw(node, 'value', tokens);

            if (node.value.indexOf(':') !== -1) {
                this.checkMissedSemicolon(tokens);
            }

            // Giving it a "nested" flag
            node.raws.isNestedProp = true;
            node.isNested = true;
            // So that the following decls got inside this one
            this.current = node;
        } else {
            // Otherwise it's a usual ruleset
            super.rule(tokens);
        }
    }

    comment(token) {
        if (token[6] === 'inline') {
            let node = new Comment();
            this.init(node, token[2], token[3]);
            node.raws.inline = true;
            node.source.end  = { line: token[4], column: token[5] };

            let text = token[1].slice(2);
            if (/^\s*$/.test(text)) {
                node.text       = '';
                node.raws.left  = text;
                node.raws.right = '';
            } else {
                let match = text.match(/^(\s*)([^]*[^\s])(\s*)$/);
                node.text       = match[2];
                node.raws.left  = match[1];
                node.raws.right = match[3];
            }
        } else {
            super.comment(token);
        }
    }

}
