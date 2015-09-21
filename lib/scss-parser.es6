import AtRule  from 'postcss/lib/at-rule';
import Comment from 'postcss/lib/comment';
import Parser  from 'postcss/lib/parser';

import scssTokenizer from './scss-tokenize';

export default class ScssParser extends Parser {

    tokenize() {
        this.tokens = scssTokenizer(this.input);
    }

    comment(token) {
        if ( token[6] === 'inline' ) {
            let node = new Comment();
            this.init(node, token[2], token[3]);
            node.raws.inline = true;
            node.source.end  = { line: token[4], column: token[5] };

            let text = token[1].slice(2);
            if ( /^\s*$/.test(text) ) {
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
            super(token);
        }
    }

    atrule(token) {
        let node  = new AtRule();
        node.name = token[1].slice(1);
        if ( node.name === '' ) {
            this.unnamedAtrule(node, token);
        }
        this.init(node, token[2], token[3]);

        let last   = false;
        let open   = false;
        let params = [];

        this.pos += 1;
        while ( this.pos < this.tokens.length ) {
            token = this.tokens[this.pos];

            if ( token[0] === ';' ) {
                node.source.end = { line: token[2], column: token[3] };
                this.semicolon = true;
                break;
            } else if ( token[0] === '{' ) {
                open = true;
                break;
            } else if ( token[0] === '}') {
                this.end(token);
                break;
            } else {
                params.push(token);
            }

            this.pos += 1;
        }
        if ( this.pos === this.tokens.length ) {
            last = true;
        }

        node.raws.between = this.spacesFromEnd(params);
        if ( params.length ) {
            node.raws.afterName = this.spacesFromStart(params);
            this.raw(node, 'params', params);
            if ( last ) {
                token = params[params.length - 1];
                node.source.end  = { line: token[4], column: token[5] };
                this.spaces      = node.raws.between;
                node.raws.between = '';
            }
        } else {
            node.raws.afterName = '';
            node.params    = '';
        }

        if ( open ) {
            node.nodes  = [];
            this.current = node;
        }
    }

}
