import warnOnce     from 'postcss/lib/warn-once';
import Container    from 'postcss/lib/container';

/**
 * Represents a CSS declaration with nested properties
 * Basically a copy of PostCSS's Declaration, but inherits not form Node, but
 * from Container - to be able to contain other Nodes
 *
 * @extends Container
 *
 * @example
 * const root = postcss.parse('a { margin: 10px { left: 0; } }');
 * const decl = root.first.first;
 * decl.type       //=> 'decl'
 * decl.toString() //=> 'margin: 10px { left: 0; }'
 */
class DeclarationNested extends Container {

    constructor(defaults) {
        super(defaults);
        this.type = 'decl';
        if ( !this.nodes ) this.nodes = [];
    }

    get _value() {
        warnOnce('Node#_value was deprecated. Use Node#raws.value');
        return this.raws.value;
    }

    set _value(val) {
        warnOnce('Node#_value was deprecated. Use Node#raws.value');
        this.raws.value = val;
    }

    get _important() {
        warnOnce('Node#_important was deprecated. Use Node#raws.important');
        return this.raws.important;
    }

    set _important(val) {
        warnOnce('Node#_important was deprecated. Use Node#raws.important');
        this.raws.important = val;
    }

    /**
     * @memberof DeclarationNested#
     * @member {string} prop - the declaration’s property name
     *
     * @example
     * const root = postcss.parse('a { margin: 10px { left: 0; } }');
     * const decl = root.first.first;
     * decl.prop //=> 'margin'
     */

    /**
     * @memberof DeclarationNested#
     * @member {string} value - the declaration’s value
     *
     * @example
     * const root = postcss.parse('a { margin: { left: 0; } }');
     * const decl = root.first.first;
     * decl.value //=> ''
     */

    /**
     * @memberof DeclarationNested#
     * @member {boolean} important - `true` if the declaration
     *                               has an !important annotation.
     *
     * @example
     * const root = postcss.parse('a { margin: 10px !important { left: 0; } }');
     * root.first.first.important //=> true
     * root.first.last.important  //=> undefined
     */

    /**
     * @memberof DeclarationNested#
     * @member {boolean} isNested - `true` if the declaration has nested
     *                            properties.
     *
     * @example
     * const root = postcss.parse('a { margin: 10px { left: 0; } }');
     * root.first.first.nested //=> true
     */

    /**
     * @memberof DeclarationNested#
     * @member {object} raws - Information to generate byte-to-byte equal
     *                         node string as it was in the origin input.
     *
     * Every parser saves its own properties,
     * but the default CSS parser uses:
     *
     * * `before`: the space symbols before the node. It also stores `*`
     *   and `_` symbols before the declaration (IE hack).
     * * `between`: the symbols between the property and value
     *   for declarations, selector and `{` for rules, or last parameter
     *   and `{` for at-rules.
     * * `important`: the content of the important statement,
     *   if it is not just `!important`.
     * * `isNestetProps`: true, if this declaration has nested properties
     *
     * PostCSS cleans declaration from comments and extra spaces,
     * but it stores origin content in raws properties.
     * As such, if you don’t change a declaration’s value,
     * PostCSS will use the raw value with comments.
     *
     * @example
     * const root = postcss.parse('a {\n  color:black\n}')
     * root.first.first.raws //=> { before: '\n  ', between: ':' }
     */

}

export default DeclarationNested;
