import { applyFilters } from '@wordpress/hooks';

/**
 * The general post-filter every design-value output helper runs before returning.
 *
 * Fires ONLY for the CSS values the design-value helpers emit (color, dimension/size, border-width,
 * shadow-color) — not the library's non-CSS utilities. Named `cssValue` rather than a generic
 * `output` so it does not overpromise coverage. Third-party listeners get a single seam over these
 * values; the `context` argument (`{ type, input, ... }`) lets them discriminate.
 *
 * @since TBD
 *
 * @var string
 */
const GENERAL_HOOK = 'kadence.helpers.cssValue';

/**
 * Route a color output through the Kadence Helpers filter seam.
 *
 * Runs the type-specific `kadence.helpers.colorValue` filter FIRST with the raw value; if a listener
 * transforms it, that wins and the default color logic is skipped, otherwise `computeDefault()`
 * produces the normal output. Either way the result passes through the general `cssValue` filter last.
 * With no filters registered this returns `computeDefault()` unchanged (strictly additive).
 *
 * @since TBD
 *
 * @param {string|undefined} string         The color the helper received — a hex string, a `paletteN`
 *                                          slug, a `{dot.alias}` reference, or empty/undefined.
 * @param {number|null}      opacity        The opacity (0–1), or null; forwarded to listeners for context.
 * @param {() => string}     computeDefault Produces the helper's normal output when no listener handled the value.
 *
 * @return {string} The final color value.
 */
export function filterColorValue( string, opacity, computeDefault ) {
	const early = applyFilters( 'kadence.helpers.colorValue', string, opacity );
	const value = early !== string ? early : computeDefault();

	return applyFilters( GENERAL_HOOK, value, { type: 'color', input: string, opacity } );
}

/**
 * Route a dimension/size value through the Kadence Helpers filter seam.
 *
 * Runs the type-specific `kadence.helpers.dimensionValue` filter FIRST with the raw value; if a
 * listener transforms it, that wins and unit/format logic is skipped, otherwise `computeDefault()`
 * produces the normal output. Either way the result passes through the general `cssValue` filter last.
 * With no filters registered this returns `computeDefault()` unchanged (strictly additive).
 *
 * @since TBD
 *
 * @param {string|number|undefined} value          The length/size the helper received — a number, a
 *                                                 numeric string, a size slug, a `{dot.alias}` reference,
 *                                                 or empty/undefined.
 * @param {string|null}             unit           The CSS unit (e.g. `px`, `em`), or null; forwarded to listeners.
 * @param {() => string}            computeDefault Produces the helper's normal output when no listener handled the value.
 *
 * @return {string} The final dimension/size value.
 */
export function filterDimensionValue( value, unit, computeDefault ) {
	const early = applyFilters( 'kadence.helpers.dimensionValue', value, unit );
	const resolved = early !== value ? early : computeDefault();

	return applyFilters( GENERAL_HOOK, resolved, { type: 'dimension', input: value, unit } );
}

/**
 * Format a resolved border-width value through the dimension seam.
 *
 * Shared by `get-border-width` and `get-border-style`. The default output is `width + unit`; a
 * `dimensionValue` listener can override it before the unit is appended.
 *
 * @since TBD
 *
 * @param {string|number|undefined} width The resolved side width value.
 * @param {string}                  unit  The border unit appended to a literal width.
 *
 * @return {string} The CSS width string.
 */
export function formatBorderWidth( width, unit ) {
	return filterDimensionValue( width, unit, () => width + unit );
}
