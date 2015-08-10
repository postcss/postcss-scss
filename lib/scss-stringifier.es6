import Stringifier from 'postcss/lib/stringifier';

export default class ScssStringifier extends Stringifier {

    comment(node) {
        let left  = this.style(node, 'left',  'commentLeft');
        let right = this.style(node, 'right', 'commentRight');

        if ( node.raw.inline ) {
            this.builder('//' + left + node.text + right, node);
        } else {
            this.builder('/*' + left + node.text + right + '*/', node);
        }
    }

}
