import ScssStringifier from './scss-stringifier';

export default function scssStringify(node, builder) {
    let str = new ScssStringifier(builder);
    str.stringify(node);
}
