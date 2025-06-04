import { getBlocksParam } from '../get-params';

export default function hasKadenceCustomCSS( kadenceBlockCSS ) {
	const isValidCSSRule = kadenceBlockCSS && /^\s*[^{]+\s*\{\s*[^\s}]+\s*[:;][^}]*\}$/.test( kadenceBlockCSS );
	const globalSettings = getBlocksParam( 'globalSettings' ) ? JSON.parse( getBlocksParam( 'globalSettings' ) ) : {};
	const showCSSIndicator =
		globalSettings.enable_custom_css_indicator !== undefined ? globalSettings.enable_custom_css_indicator : false;

	return !! ( isValidCSSRule && showCSSIndicator );
}
