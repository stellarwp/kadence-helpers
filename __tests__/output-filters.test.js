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
