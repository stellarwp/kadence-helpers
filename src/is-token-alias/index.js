/**
 * Whole-string design-token alias pattern.
 *
 * Mirrors the PHP `Alias::PATTERN` (`^\{[\w.-]+\}$`) exactly: a "{", a dot-path of word characters,
 * dots and dashes, then a "}", anchored end to end. `\w` is ASCII on both sides (no unicode flag),
 * so the two implementations agree.
 *
 * Parity note: PHP's `$` (no PCRE_DOLLAR_ENDONLY) also matches immediately before a trailing "\n",
 * so `"{a.b}\n"` is an alias in PHP but not here. Block-attribute values never carry a trailing
 * newline, so the strict pattern is intentional.
 *
 * @since TBD
 */
const TOKEN_ALIAS_PATTERN = /^\{[\w.-]+\}$/;

/**
 * Whether the given value is a whole-string design-token alias, e.g. `{semantic.radius.media}`.
 *
 * Only strings can be aliases; any non-string (number, array, object, null, undefined) returns
 * false so callers can short-circuit "alias OR literal" cleanly. Mirrors PHP `Alias::is_alias()`.
 *
 * @since TBD
 *
 * @param {*} value The value to test.
 *
 * @return {boolean} True when the value is a well-formed alias string.
 */
export default function isTokenAlias( value ) {
	return typeof value === 'string' && TOKEN_ALIAS_PATTERN.test( value );
}
