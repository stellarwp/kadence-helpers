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
 * @param {*}        string         The raw color value the helper received.
 * @param {*}        opacity        The opacity argument, forwarded to listeners for context.
 * @param {Function} computeDefault Produces the helper's normal output when no listener handled the value.
 *
 * @return {*} The final color value.
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
 * @param {*}        value          The raw dimension/size value the helper received.
 * @param {*}        unit           The unit argument, forwarded to listeners for context.
 * @param {Function} computeDefault Produces the helper's normal output when no listener handled the value.
 *
 * @return {*} The final dimension/size value.
 */
export function filterDimensionValue( value, unit, computeDefault ) {
	const early = applyFilters( 'kadence.helpers.dimensionValue', value, unit );
	const resolved = early !== value ? early : computeDefault();

	return applyFilters( GENERAL_HOOK, resolved, { type: 'dimension', input: value, unit } );
}
