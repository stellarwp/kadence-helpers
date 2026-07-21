/**
 * Unit tests for the alias-aware output helpers.
 *
 * Two guarantees per helper: (1) a `{dot.alias}` resolves to `var(--kb-token--<id>)`, and (2) every
 * non-alias input (literal, palette slug, size slug, numeric+unit) is byte-identical to the pre-alias
 * behavior — the change is strictly additive and must not regress literal/palette output.
 */
import KadenceColorOutput from '../src/kadence-color-output';
import { getSpacingOptionOutput } from '../src/spacing-utilities';
import { getGapSizeOptionOutput } from '../src/gap-size-utilities';
import { getFontSizeOptionOutput } from '../src/font-size-utilities';
import KadenceBlocksCSS from '../src/css';

describe( 'KadenceColorOutput', () => {
	it( 'resolves an alias to a token var', () => {
		expect( KadenceColorOutput( '{semantic.color.brand-primary}' ) ).toBe(
			'var(--kb-token--semantic--color--brand-primary)'
		);
	} );

	it( 'ignores opacity for an alias (the token carries its own value)', () => {
		expect( KadenceColorOutput( '{semantic.color.brand-primary}', 0.5 ) ).toBe(
			'var(--kb-token--semantic--color--brand-primary)'
		);
	} );

	// Pass-through / regression guard.
	it( 'maps a palette slug to a global var, unchanged', () => {
		expect( KadenceColorOutput( 'palette3' ) ).toBe( 'var(--global-palette3)' );
	} );

	it( 'returns a hex literal unchanged when no opacity is applied', () => {
		expect( KadenceColorOutput( '#3182CE' ) ).toBe( '#3182CE' );
	} );

	it( 'still applies opacity to a hex literal', () => {
		expect( KadenceColorOutput( '#000000', 0.5 ) ).toBe( 'rgba(0, 0, 0, 0.5)' );
	} );
} );

describe( 'getSpacingOptionOutput', () => {
	it( 'resolves an alias to a token var', () => {
		expect( getSpacingOptionOutput( '{primitive.spacing.md}', 'px' ) ).toBe(
			'var(--kb-token--primitive--spacing--md)'
		);
	} );

	// Pass-through / regression guard.
	it( 'returns a numeric value with its unit, unchanged', () => {
		expect( getSpacingOptionOutput( '20', 'px' ) ).toBe( '20px' );
	} );

	it( 'leaves a known size slug on the slug path (not treated as an alias)', () => {
		expect( getSpacingOptionOutput( 'sm', 'px' ) ).not.toContain( 'kb-token' );
	} );
} );

describe( 'getGapSizeOptionOutput', () => {
	it( 'resolves an alias to a token var', () => {
		expect( getGapSizeOptionOutput( '{primitive.gap.lg}', 'px' ) ).toBe(
			'var(--kb-token--primitive--gap--lg)'
		);
	} );

	it( 'returns a numeric value with its unit, unchanged', () => {
		expect( getGapSizeOptionOutput( '12', 'px' ) ).toBe( '12px' );
	} );
} );

describe( 'getFontSizeOptionOutput', () => {
	it( 'resolves an alias to a token var', () => {
		expect( getFontSizeOptionOutput( '{primitive.font-size.lg}', 'px' ) ).toBe(
			'var(--kb-token--primitive--font-size--lg)'
		);
	} );

	it( 'returns a numeric value with its unit, unchanged', () => {
		expect( getFontSizeOptionOutput( '18', 'px' ) ).toBe( '18px' );
	} );
} );

describe( 'KadenceBlocksCSS.render_size / render_half_size', () => {
	let css;
	beforeEach( () => {
		css = new KadenceBlocksCSS();
	} );

	it( 'render_size resolves an alias to a bare var (no unit)', () => {
		expect( css.render_size( '{primitive.size.icon}', 'px' ) ).toBe(
			'var(--kb-token--primitive--size--icon)'
		);
	} );

	it( 'render_size returns value+unit for a literal, unchanged', () => {
		expect( css.render_size( 20, 'px' ) ).toBe( '20px' );
	} );

	it( 'render_half_size resolves an alias to a bare var (no calc)', () => {
		expect( css.render_half_size( '{primitive.size.icon}', 'px' ) ).toBe(
			'var(--kb-token--primitive--size--icon)'
		);
	} );

	it( 'render_half_size wraps a literal in calc(), unchanged', () => {
		expect( css.render_half_size( 10, 'px' ) ).toBe( 'calc(10px / 2)' );
	} );
} );

describe( 'KadenceBlocksCSS.render_measure_output', () => {
	it( 'emits a per-side alias as a bare var, and literal sides with their unit', () => {
		const css = new KadenceBlocksCSS();
		css.render_measure_output(
			[ '{semantic.radius.media}', 8, '', '' ],
			null,
			null,
			'Desktop',
			'border-radius',
			'px',
			{},
			true
		);
		expect( css._css ).toContain(
			'border-top-left-radius:var(--kb-token--semantic--radius--media);'
		);
		expect( css._css ).toContain( 'border-top-right-radius:8px;' );
	} );
} );

describe( 'KadenceBlocksCSS.render_shadow', () => {
	it( 'resolves an aliased shadow color while keeping numeric offsets literal', () => {
		const css = new KadenceBlocksCSS();
		const shadow = css.render_shadow( {
			inset: false,
			hOffset: 0,
			vOffset: 4,
			blur: 8,
			spread: 0,
			color: '{semantic.color.shadow}',
		} );
		expect( shadow ).toBe( '0px 4px 8px 0px var(--kb-token--semantic--color--shadow)' );
	} );
} );
