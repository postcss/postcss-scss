# PostCSS SCSS Syntax [![Build Status][ci-img]][ci]

<img align="right" width="95" height="95"
     title="Philosopher’s stone, logo of PostCSS"
     src="http://postcss.github.io/postcss/logo.svg">

A [SCSS] parser for [PostCSS].

*This parser does not compile SCSS.*
It does not apply mixins, math or variables.
It just parses mixins as custom at-rules and variables as properties.
Even PostCSS AST is simplier, that SCSS, so math and interpolation
will be parsed as strings.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://img.shields.io/travis/postcss/postcss-scss.svg
[SCSS]:    http://sass-lang.com/
[ci]:      https://travis-ci.org/postcss/postcss-scss

<a href="https://evilmartians.com/?utm_source=postcss">
<img src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg" alt="Sponsored by Evil Martians" width="236" height="54">
</a>

## Usage

### SCSS Transformations

The main user case of this plugin, apply PostCSS transformations directy
to SCSS sources. For example, you want to lint your SCSS by [Stylelint].
Or you ship themes in SCSS and need to apply [Autoprefixer].

```js
var syntax = require('postcss-scss');
postcss(plugins).process(scss, { syntax: syntax }).then(function (result) {
    result.content // SCSS with transformations
});
```

[Autoprefixer]: https://github.com/postcss/autoprefixer
[Stylelint]:    http://stylelint.io/

### Inline Comments for PostCSS

Other user case for this parser is just enable one line comments
in your PostCSS sources.

```scss
:root {
    // Main theme color
    --color: red;
}
```

For this case, you should use only SCSS input parser
with default CSS output stringifier.

```js
var syntax = require('postcss-scss');
postcss(plugins).process(scss, { parser: syntax }).then(function (result) {
    result.css // CSS with normal comments
});
```
