import { __ } from '@wordpress/i18n';
import { GAP_SIZES_MAP } from '../constants';
import { filterDimensionValue } from '../apply-output-filters';
export function getGapSizeOptionOutput( value, unit, sizesMap = GAP_SIZES_MAP ) {
	return filterDimensionValue( value, unit, () => {
		if ( ! value ) {
			return '';
		}
		if ( ! sizesMap ) {
			return value;
		}
		if ( value === '0') {
			return '0';
		}
		const found = sizesMap.find( ( option ) => option.value === value );
		if ( ! found ) {
			return value + unit;
		}
		return found.output;
	} );
}
