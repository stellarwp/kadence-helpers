import isTokenAlias from '../is-token-alias';

/**
 * The CSS custom-property namespace for Kadence design tokens.
 *
 * This is the shared namespace of the design-token system, not a per-product value: the tokens are
 * injected once as `--kb-token--*` custom properties, and every consumer (blocks, theme, ...) that
 * emits a token reference must emit the SAME prefix or the `var()` resolves to nothing. It is a
 * single canonical constant on purpose — mirroring `Css_Var::get_prefix()` on the PHP side — so it is
 * centralized here rather than hardcoded at each call site. Sibling precedent: the global palette
 * namespace `--global-` in KadenceColorOutput.
 *
 * @since TBD
 *
 * @type {string}
 */
export const TOKEN_VAR_PREFIX = '--kb-token--';

/**
 * Resolve a design-token alias string to its CSS custom-property reference.
 *
 * Pure, deterministic, data-free string transform that mirrors the PHP Resolver primitive
 * (`'var(' . Css_Var::from_id( Alias::path_of( $value ) ) . ')'`) byte-for-byte: strip the braces
 * (`substr($value, 1, -1)` / `value.slice(1, -1)`), then replace every "." with "--" behind the
 * `--kb-token--` prefix. Emits a BARE `var(--kb-token--<id>)` with no fallback literal, matching the
 * Resolver — the `var(--kb-token--id, <literal>)` fallback forms live in separate projection layers
 * and are intentionally not reproduced here. The `--kb-token--*` var itself is injected into the
 * editor canvas by the projector, so this helper needs no localized token data to run.
 *
 * Non-aliases fall through untouched, so callers can pipe any value through it unconditionally.
 *
 * @since TBD
 *
 * @param {*} value A value that may be an alias string, e.g. `{semantic.radius.media}`.
 *
 * @return {*} `var(--kb-token--<id>)` when the value is an alias; otherwise the value unchanged.
 */
export default function resolveTokenAlias( value ) {
	if ( ! isTokenAlias( value ) ) {
		return value;
	}

	const id = value.slice( 1, -1 ).replace( /\./g, '--' );

	return 'var(' + TOKEN_VAR_PREFIX + id + ')';
}
