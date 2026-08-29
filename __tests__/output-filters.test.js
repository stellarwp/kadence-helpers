/**
 * The design-value output helpers expose a `@wordpress/hooks` seam and are otherwise agnostic.
 *
 * Three guarantees: (1) with NO filter registered every helper is byte-identical to before the seam;
 * (2) a type-specific listener (`kadence.helpers.colorValue` / `kadence.helpers.dimensionValue`) gets
 * first crack and short-circuits the palette/hex/unit logic; (3) the general
 * `kadence.helpers.cssValue` post-filter runs last on every emitted CSS value with a `context`.
 * The library carries no design-token knowledge — that lives in the consuming plugin.
 */
import { addFilter, removeAllFilters } from '@wordpress/hooks';
import KadenceColorOutput from '../src/kadence-color-output';
import { getSpacingOptionOutput } from '../src/spacing-utilities';
import KadenceBlocksCSS from '../src/css';
import { filterColorValue, filterDimensionValue, formatBorderWidth } from '../src/apply-output-filters';

const HOOKS = [ 'kadence.helpers.colorValue', 'kadence.helpers.dimensionValue', 'kadence.helpers.cssValue' ];

afterEach( () => {
	HOOKS.forEach( ( hook ) => removeAllFilters( hook ) );
} );

describe( 'no filter registered (regression: byte-identical)', () => {
	it( 'KadenceColorOutput maps a palette slug, keeps a hex, applies opacity', () => {
		expect( KadenceColorOutput( 'palette3' ) ).toBe( 'var(--global-palette3)' );
		expect( KadenceColorOutput( '#3182CE' ) ).toBe( '#3182CE' );
		expect( KadenceColorOutput( '#000000', 0.5 ) ).toBe( 'rgba(0, 0, 0, 0.5)' );
	} );

	it( 'getSpacingOptionOutput returns a numeric value with its unit', () => {
		expect( getSpacingOptionOutput( '20', 'px' ) ).toBe( '20px' );
	} );

	it( 'KadenceBlocksCSS render_size / render_half_size are unchanged', () => {
		expect( new KadenceBlocksCSS().render_size( 24, 'px' ) ).toBe( '24px' );
		expect( new KadenceBlocksCSS().render_half_size( 12, 'px' ) ).toBe( 'calc(12px / 2)' );
	} );

	it( 'KadenceBlocksCSS render_measure_output emits the four sides with their unit', () => {
		const css = new KadenceBlocksCSS();
		css.render_measure_output( [ 10, 20, 30, 40 ], null, null, 'Desktop', 'padding', 'px', {}, true );
		expect( css._css ).toBe(
			'padding-top:10px;padding-right:20px;padding-bottom:30px;padding-left:40px;'
		);
	} );

	it( 'render_measure_output emits a zero side as "0px" rather than dropping it as falsy', () => {
		const css = new KadenceBlocksCSS();
		css.render_measure_output( [ 0, 0, 0, 0 ], null, null, 'Desktop', 'padding', 'px', {}, true );
		expect( css._css ).toBe(
			'padding-top:0px;padding-right:0px;padding-bottom:0px;padding-left:0px;'
		);
	} );

	it( 'render_measure_output skips only the empty side, keeping real values (incl. zero)', () => {
		const css = new KadenceBlocksCSS();
		css.render_measure_output( [ 0, 10, '', 20 ], null, null, 'Desktop', 'padding', 'px', {}, true );
		// The third side ('') contributes nothing; the zero first side is still emitted.
		expect( css._css ).toBe( 'padding-top:0px;padding-right:10px;padding-left:20px;' );
	} );
} );

describe( 'type-specific colorValue seam', () => {
	it( 'short-circuits the palette/hex logic when a listener transforms the value', () => {
		addFilter( 'kadence.helpers.colorValue', 'test/color', ( value ) =>
			value === '{alias}' ? 'var(--x)' : value
		);
		expect( KadenceColorOutput( '{alias}' ) ).toBe( 'var(--x)' );
		// A value the listener passes through still gets the default treatment.
		expect( KadenceColorOutput( 'palette3' ) ).toBe( 'var(--global-palette3)' );
	} );

	it( 'forwards opacity to the listener', () => {
		let seen;
		addFilter( 'kadence.helpers.colorValue', 'test/color', ( value, opacity ) => {
			seen = opacity;
			return value;
		} );
		KadenceColorOutput( '#ffffff', 0.25 );
		expect( seen ).toBe( 0.25 );
	} );
} );

describe( 'type-specific dimensionValue seam', () => {
	it( 'overrides render_size and skips the unit', () => {
		addFilter( 'kadence.helpers.dimensionValue', 'test/dim', ( value ) =>
			value === '{alias}' ? 'var(--y)' : value
		);
		expect( new KadenceBlocksCSS().render_size( '{alias}', 'px' ) ).toBe( 'var(--y)' );
	} );

	it( 'overrides a single measure side to a bare value, literal sides keep their unit', () => {
		addFilter( 'kadence.helpers.dimensionValue', 'test/dim', ( value ) =>
			value === '{alias}' ? 'var(--y)' : value
		);
		const css = new KadenceBlocksCSS();
		css.render_measure_output( [ '{alias}', 8, '', '' ], null, null, 'Desktop', 'border-radius', 'px', {}, true );
		expect( css._css ).toContain( 'border-top-left-radius:var(--y);' );
		expect( css._css ).toContain( 'border-top-right-radius:8px;' );
	} );

	it( 'render_shadow routes hOffset/vOffset/blur/spread through the dimensionValue filter', () => {
		addFilter( 'kadence.helpers.dimensionValue', 'test/dim', ( value ) =>
			typeof value === 'string' && value.startsWith( '{' ) ? `var(--${ value.slice( 1, -1 ).replace( /\./g, '-' ) })` : value
		);
		const css = new KadenceBlocksCSS();
		const shadow = css.render_shadow( {
			hOffset: '{shadow.offset-x.md}',
			vOffset: '{shadow.offset-y.md}',
			blur: '{shadow.blur.md}',
			spread: '{shadow.spread.md}',
			color: '#000000',
			opacity: 0.5,
			inset: false,
		} );
		expect( shadow ).toBe(
			'var(--shadow-offset-x-md) var(--shadow-offset-y-md) var(--shadow-blur-md) var(--shadow-spread-md) rgba(0, 0, 0, 0.5)'
		);
	} );

	it( 'render_shadow keeps a plain numeric offset/blur/spread rendering as "<n>px" when no filter is registered', () => {
		const css = new KadenceBlocksCSS();
		const shadow = css.render_shadow( {
			hOffset: 2,
			vOffset: 4,
			blur: 6,
			spread: 0,
			color: '#000000',
			opacity: 0.5,
			inset: false,
		} );
		expect( shadow ).toBe( '2px 4px 6px 0px rgba(0, 0, 0, 0.5)' );
	} );

	it( 'render_shadow prepends "inset" and still routes offset/blur/spread through the dimensionValue filter', () => {
		addFilter( 'kadence.helpers.dimensionValue', 'test/dim', ( value ) =>
			typeof value === 'string' && value.startsWith( '{' ) ? `var(--${ value.slice( 1, -1 ).replace( /\./g, '-' ) })` : value
		);
		const css = new KadenceBlocksCSS();
		const shadow = css.render_shadow( {
			hOffset: '{shadow.offset-x.md}',
			vOffset: '{shadow.offset-y.md}',
			blur: '{shadow.blur.md}',
			spread: '{shadow.spread.md}',
			color: '#000000',
			opacity: 0.5,
			inset: true,
		} );
		expect( shadow ).toBe(
			'inset var(--shadow-offset-x-md) var(--shadow-offset-y-md) var(--shadow-blur-md) var(--shadow-spread-md) rgba(0, 0, 0, 0.5)'
		);
	} );
} );

describe( 'general cssValue seam', () => {
	it( 'post-processes every color/dimension result and receives the discriminating context', () => {
		const contexts = [];
		addFilter( 'kadence.helpers.cssValue', 'test/css', ( value, context ) => {
			contexts.push( context );
			return value + '/*x*/';
		} );

		expect( KadenceColorOutput( '#ffffff' ) ).toBe( '#ffffff/*x*/' );
		expect( new KadenceBlocksCSS().render_size( 24, 'px' ) ).toBe( '24px/*x*/' );

		expect( contexts[ 0 ] ).toEqual( { type: 'color', input: '#ffffff', opacity: null } );
		expect( contexts[ 1 ] ).toMatchObject( { type: 'dimension', input: 24, unit: 'px' } );
	} );
} );

describe( 'zero / empty handling — a legitimate value is never dropped', () => {
	// The seam short-circuits on strict `early !== input`, NOT truthiness, so a 0 input (or a listener
	// that returns 0) flows to the default rather than being treated as "no value".
	it( 'filterColorValue / filterDimensionValue run computeDefault for a 0 input', () => {
		expect( filterColorValue( 0, null, () => 'default' ) ).toBe( 'default' );
		expect( filterDimensionValue( 0, 'px', () => '0px' ) ).toBe( '0px' );
	} );

	it( 'honors a listener that transforms 0 (strict-equality short-circuit)', () => {
		addFilter( 'kadence.helpers.dimensionValue', 'test/dim', ( v ) => ( v === 0 ? 'var(--zero)' : v ) );
		expect( filterDimensionValue( 0, 'px', () => '0px' ) ).toBe( 'var(--zero)' );
	} );

	it( 'formatBorderWidth emits a zero width as "0px"', () => {
		expect( formatBorderWidth( 0, 'px' ) ).toBe( '0px' );
	} );

	it( 'render_size / render_half_size emit a zero value', () => {
		expect( new KadenceBlocksCSS().render_size( 0, 'px' ) ).toBe( '0px' );
		expect( new KadenceBlocksCSS().render_half_size( 0, 'px' ) ).toBe( 'calc(0px / 2)' );
	} );

	it( 'getSpacingOptionOutput emits a zero (number or string) as "0px"', () => {
		expect( getSpacingOptionOutput( 0, 'px' ) ).toBe( '0px' );
		expect( getSpacingOptionOutput( '0', 'px' ) ).toBe( '0px' );
	} );
} );
