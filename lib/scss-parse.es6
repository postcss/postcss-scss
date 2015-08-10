import Input from 'postcss/lib/input';

import ScssParser from './scss-parser';

export default function scssParse(scss, opts) {
    let input = new Input(scss, opts);

    let parser = new ScssParser(input);
    parser.tokenize();
    parser.loop();

    return parser.root;
}
