import Stringifier from 'postcss/lib/stringifier';

export default class ScssStringifier extends Stringifier {

    comment(node) {
        let left  = this.raw(node, 'left',  'commentLeft');
        let right = this.raw(node, 'right', 'commentRight');

        if ( node.raws.inline ) {
            this.builder('//' + left + node.text + right, node);
        } else {
            this.builder('/*' + left + node.text + right + '*/', node);
        }
    }

    decl(node, semicolon) {
        // Starting as with a usual declaration
        let between = this.raw(node, 'between', 'colon');
        let string  = node.prop + between + this.rawValue(node, 'value');

        if (node.important) {
            string += node.raws.important || ' !important';
        }

        if (node.isNested) {
            // If it's nested, go all block-ish
            this.builder(string + '{', node, 'start');

            let after;
            if (node.nodes && node.nodes.length) {
                this.body(node);
                after = this.raw(node, 'after');
            } else {
                after = this.raw(node, 'after', 'emptyBody');
            }

            if (after) this.builder(after);
            this.builder('}', node, 'end');
        } else {
            // if not - finish as a usual declaration
            if (semicolon) string += ';';
            this.builder(string, node);
        }
    }

}
