import { getBlocksParams, getBlocksParam } from '../get-params';

/**
 * Returns new attributes object with defaults applied.
 */
export default ( blockSlug, attributes ) => {
	if ( ! attributes.uniqueID ) {
		if ( undefined === attributes.noCustomDefaults || ! attributes.noCustomDefaults ) {
			const oldBlockConfig =
				getBlocksParam( 'config' ) && getBlocksParam( 'config' )[ blockSlug ]
					? getBlocksParam( 'config' )[ blockSlug ]
					: undefined;
			const blockConfigObject = getBlocksParam( 'configuration' )
				? JSON.parse( getBlocksParam( 'configuration' ) )
				: [];

			if ( blockConfigObject[ blockSlug ] !== undefined && typeof blockConfigObject[ blockSlug ] === 'object' ) {
				Object.keys( blockConfigObject[ blockSlug ] ).map( ( attribute ) => {
					attributes[ attribute ] = blockConfigObject[ blockSlug ][ attribute ];
				} );
			} else if ( oldBlockConfig !== undefined && typeof oldBlockConfig === 'object' ) {
				Object.keys( oldBlockConfig ).map( ( attribute ) => {
					attributes[ attribute ] = oldBlockConfig[ attribute ];
				} );
			}
		}
	}

	return attributes;
};
