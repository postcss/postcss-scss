import Container from 'postcss/lib/container';

class NestedDeclaration extends Container {

    constructor(defaults) {
        super(defaults);
        this.type     = 'decl';
        this.isNested = true;
        if ( !this.nodes ) this.nodes = [];
    }

}

export default NestedDeclaration;
