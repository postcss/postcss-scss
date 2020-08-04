const SINGLE_QUOTE = '\''.charCodeAt(0)
const DOUBLE_QUOTE = '"'.charCodeAt(0)
const BACKSLASH = '\\'.charCodeAt(0)
const SLASH = '/'.charCodeAt(0)
const NEWLINE = '\n'.charCodeAt(0)
const SPACE = ' '.charCodeAt(0)
const FEED = '\f'.charCodeAt(0)
const TAB = '\t'.charCodeAt(0)
const CR = '\r'.charCodeAt(0)
const OPEN_SQUARE = '['.charCodeAt(0)
const CLOSE_SQUARE = ']'.charCodeAt(0)
const OPEN_PARENTHESES = '('.charCodeAt(0)
const CLOSE_PARENTHESES = ')'.charCodeAt(0)
const OPEN_CURLY = '{'.charCodeAt(0)
const CLOSE_CURLY = '}'.charCodeAt(0)
const SEMICOLON = ';'.charCodeAt(0)
const ASTERISK = '*'.charCodeAt(0)
const COLON = ':'.charCodeAt(0)
const AT = '@'.charCodeAt(0)

// SCSS PATCH {
const COMMA = ','.charCodeAt(0)
const HASH = '#'.charCodeAt(0)
// } SCSS PATCH

const RE_AT_END = /[ \n\t\r\f{}()'"\\;/[\]#]/g
const RE_WORD_END = /[ \n\t\r\f(){}:;@!'"\\\][#]|\/(?=\*)/g
const RE_BAD_BRACKET = /.[\\/("'\n]/
const RE_HEX_ESCAPE = /[a-f0-9]/i

const RE_NEW_LINE = /[\r\f\n]/g // SCSS PATCH

// SCSS PATCH function name was changed
module.exports = function scssTokenize (input, options = {}) {
  let css = input.css.valueOf()
  let ignore = options.ignoreErrors

  let code, next, quote, lines, last, content, escape,
    nextLine, nextOffset, escaped, prev, n, currentToken

  let brackets // SCSS PATCH

  let length = css.length
  let offset = -1
  let line = 1
  let pos = 0
  let buffer = []
  let returned = []
  
  function position () {
    return pos
  }
 
  function unclosed (what) {
    throw input.error('Unclosed ' + what, line, pos - offset)
  }

  function endOfFile () {
    return returned.length === 0 && pos >= length
  }

  // SCSS PATCH {
  function interpolation () {
    let deep = 1
    let stringQuote = false
    let stringEscaped = false
    while (deep > 0) {
      next += 1
      if (css.length <= next) unclosed('interpolation')

      code = css.charCodeAt(next)
      n = css.charCodeAt(next + 1)

      if (stringQuote) {
        if (!stringEscaped && code === stringQuote) {
          stringQuote = false
          stringEscaped = false
        } else if (code === BACKSLASH) {
          stringEscaped = !escaped
        } else if (stringEscaped) {
          stringEscaped = false
        }
      } else if (
        code === SINGLE_QUOTE || code === DOUBLE_QUOTE
      ) {
        stringQuote = code
      } else if (code === CLOSE_CURLY) {
        deep -= 1
      } else if (code === HASH && n === OPEN_CURLY) {
        deep += 1
      }
    }
  }
  // } SCSS PATCH

  function nextToken () {
    if (returned.length) return returned.pop()
    if (pos >= length) return

    code = css.charCodeAt(pos)
    if (
      code === NEWLINE || code === FEED ||
      (code === CR && css.charCodeAt(pos + 1) !== NEWLINE)
    ) {
      offset = pos
      line += 1
    }

    switch (code) {
      case NEWLINE:
      case SPACE:
      case TAB:
      case CR:
      case FEED:
        next = pos
        do {
          next += 1
          code = css.charCodeAt(next)
          if (code === NEWLINE) {
            offset = next
            line += 1
          }
        } while (code === SPACE ||
                      code === NEWLINE ||
                      code === TAB ||
                      code === CR ||
                      code === FEED)

        currentToken = ['space', css.slice(pos, next)]
        pos = next - 1
        break

      case OPEN_SQUARE:
        currentToken = ['[', '[', line, pos - offset]
        break

      case CLOSE_SQUARE:
        currentToken = [']', ']', line, pos - offset]
        break

      case OPEN_CURLY:
        currentToken = ['{', '{', line, pos - offset]
        break

      case CLOSE_CURLY:
        currentToken = ['}', '}', line, pos - offset]
        break

        // SCSS PATCH {
      case COMMA:
        currentToken = [
          'word',
          ',',
          line, pos - offset,
          line, pos - offset + 1
        ]
        break
        // } SCSS PATCH

      case COLON:
        currentToken = [':', ':', line, pos - offset]
        break

      case SEMICOLON:
        currentToken = [';', ';', line, pos - offset]
        break

      case OPEN_PARENTHESES:
        prev = buffer.length ? buffer.pop()[1] : ''
        n = css.charCodeAt(pos + 1)

        // SCSS PATCH {
        if (prev === 'url' && n !== SINGLE_QUOTE && n !== DOUBLE_QUOTE) {
          brackets = 1
          escaped = false
          next = pos + 1
          while (next <= css.length - 1) {
            n = css.charCodeAt(next)
            if (n === BACKSLASH) {
              escaped = !escaped
            } else if (n === OPEN_PARENTHESES) {
              brackets += 1
            } else if (n === CLOSE_PARENTHESES) {
              brackets -= 1
              if (brackets === 0) break
            }
            next += 1
          }

          content = css.slice(pos, next + 1)
          lines = content.split('\n')
          last = lines.length - 1

          if (last > 0) {
            nextLine = line + last
            nextOffset = next - lines[last].length
          } else {
            nextLine = line
            nextOffset = offset
          }

          currentToken = ['brackets', content,
            line, pos - offset,
            nextLine, next - nextOffset
          ]

          offset = nextOffset
          line = nextLine
          pos = next
          // } SCSS PATCH
        } else {
          next = css.indexOf(')', pos + 1)
          content = css.slice(pos, next + 1)

          if (next === -1 || RE_BAD_BRACKET.test(content)) {
            currentToken = ['(', '(', line, pos - offset]
          } else {
            currentToken = ['brackets', content,
              line, pos - offset,
              line, next - offset
            ]
            pos = next
          }
        }

        break

      case CLOSE_PARENTHESES:
        currentToken = [')', ')', line, pos - offset]
        break

      case SINGLE_QUOTE:
      case DOUBLE_QUOTE:
        // SCSS PATCH {
        quote = code
        next = pos

        escaped = false
        while (next < length) {
          next++
          if (next === length) unclosed('string')

          code = css.charCodeAt(next)
          n = css.charCodeAt(next + 1)

          if (!escaped && code === quote) {
            break
          } else if (code === BACKSLASH) {
            escaped = !escaped
          } else if (escaped) {
            escaped = false
          } else if (code === HASH && n === OPEN_CURLY) {
            interpolation()
          }
        }
        // } SCSS PATCH

        content = css.slice(pos, next + 1)
        lines = content.split('\n')
        last = lines.length - 1

        if (last > 0) {
          nextLine = line + last
          nextOffset = next - lines[last].length
        } else {
          nextLine = line
          nextOffset = offset
        }

        currentToken = ['string', css.slice(pos, next + 1),
          line, pos - offset,
          nextLine, next - nextOffset
        ]

        offset = nextOffset
        line = nextLine
        pos = next
        break

      case AT:
        RE_AT_END.lastIndex = pos + 1
        RE_AT_END.test(css)
        if (RE_AT_END.lastIndex === 0) {
          next = css.length - 1
        } else {
          next = RE_AT_END.lastIndex - 2
        }

        currentToken = ['at-word', css.slice(pos, next + 1),
          line, pos - offset,
          line, next - offset
        ]

        pos = next
        break

      case BACKSLASH:
        next = pos
        escape = true
        while (css.charCodeAt(next + 1) === BACKSLASH) {
          next += 1
          escape = !escape
        }
        code = css.charCodeAt(next + 1)
        if (escape && (code !== SLASH &&
                            code !== SPACE &&
                            code !== NEWLINE &&
                            code !== TAB &&
                            code !== CR &&
                            code !== FEED)) {
          next += 1
          if (RE_HEX_ESCAPE.test(css.charAt(next))) {
            while (RE_HEX_ESCAPE.test(css.charAt(next + 1))) {
              next += 1
            }
            if (css.charCodeAt(next + 1) === SPACE) {
              next += 1
            }
          }
        }

        currentToken = ['word', css.slice(pos, next + 1),
          line, pos - offset,
          line, next - offset
        ]

        pos = next
        break

      default:
        // SCSS PATCH {
        n = css.charCodeAt(pos + 1)

        if (code === HASH && n === OPEN_CURLY) {
          next = pos
          interpolation()

          content = css.slice(pos, next + 1)
          lines = content.split('\n')
          last = lines.length - 1

          if (last > 0) {
            nextLine = line + last
            nextOffset = next - lines[last].length
          } else {
            nextLine = line
            nextOffset = offset
          }

          currentToken = ['word', content,
            line, pos - offset,
            nextLine, next - nextOffset
          ]

          offset = nextOffset
          line = nextLine
          pos = next
        } else if (code === SLASH && n === ASTERISK) {
          // } SCSS PATCH
          next = css.indexOf('*/', pos + 2) + 1
          if (next === 0) {
            if (ignore) {
              next = css.length
            } else {
              unclosed('comment')
            }
          }

          content = css.slice(pos, next + 1)
          lines = content.split('\n')
          last = lines.length - 1

          if (last > 0) {
            nextLine = line + last
            nextOffset = next - lines[last].length
          } else {
            nextLine = line
            nextOffset = offset
          }

          currentToken = ['comment', content,
            line, pos - offset,
            nextLine, next - nextOffset
          ]

          offset = nextOffset
          line = nextLine
          pos = next

          // SCSS PATCH {
        } else if (code === SLASH && n === SLASH) {
          RE_NEW_LINE.lastIndex = pos + 1
          RE_NEW_LINE.test(css)
          if (RE_NEW_LINE.lastIndex === 0) {
            next = css.length - 1
          } else {
            next = RE_NEW_LINE.lastIndex - 2
          }

          content = css.slice(pos, next + 1)

          currentToken = ['comment', content,
            line, pos - offset,
            line, next - offset,
            'inline'
          ]

          pos = next
          // } SCSS PATCH
        } else {
          RE_WORD_END.lastIndex = pos + 1
          RE_WORD_END.test(css)
          if (RE_WORD_END.lastIndex === 0) {
            next = css.length - 1
          } else {
            next = RE_WORD_END.lastIndex - 2
          }

          currentToken = ['word', css.slice(pos, next + 1),
            line, pos - offset,
            line, next - offset
          ]

          buffer.push(currentToken)

          pos = next
        }

        break
    }

    pos++
    return currentToken
  }

  function back (token) {
    returned.push(token)
  }

  return {
    back,
    nextToken,
    endOfFile,
    position
  }
}
