/**
 * `render_font` adds a block's typography declarations to the current selector.
 *
 * Guarantee: the declarations sit directly inside the selector block, with no nested rule.
 *
 * @since TBD
 */
import KadenceBlocksCSS from '../src/css';

// `getPreviewSize` resolves the previewed size through `useMemo`, which needs a component to run in.
jest.mock( 'react', () => ( {
	...jest.requireActual( 'react' ),
	useMemo: ( callback ) => callback(),
} ) );

/**
 * Returns the CSS for one selector after the given callback has added its rules.
 *
 * @since TBD
 *
 * @param {Function} callback Receives the CSS builder after its selector is set.
 *
 * @return {string} The generated CSS.
 */
function build( callback ) {
	const css = new KadenceBlocksCSS();
	css.set_selector( '.sel' );
	callback( css );
	return css.css_output();
}

describe( 'render_font', () => {
	it( 'emits the declarations directly inside the selector block', () => {
		const data = [ { size: [ '', '', '40' ], sizeType: 'px', weight: '700', textTransform: 'uppercase' } ];

		expect( build( ( css ) => css.render_font( data, 'Mobile' ) ) ).toBe(
			'.sel{font-size:40px;font-weight:700;text-transform:uppercase;}'
		);
	} );

	it( 'uses the value for the previewed device and falls back to the wider one', () => {
		const data = [ { size: [ '10', '20', '' ], sizeType: 'px' } ];

		expect( build( ( css ) => css.render_font( data, 'Desktop' ) ) ).toBe( '.sel{font-size:10px;}' );
		expect( build( ( css ) => css.render_font( data, 'Mobile' ) ) ).toBe( '.sel{font-size:20px;}' );
	} );

	it( 'adds nothing when there is no typography', () => {
		[ [], undefined, [ {} ] ].forEach( ( data ) => {
			expect( build( ( css ) => css.render_font( data, 'Desktop' ) ) ).toBe( '' );
		} );
	} );

	it( 'returns the builder so calls can be chained', () => {
		const css = new KadenceBlocksCSS();

		expect( css.render_font( [], 'Desktop' ) ).toBe( css );
	} );
} );
