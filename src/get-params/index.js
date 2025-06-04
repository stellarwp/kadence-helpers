/* global kadence_blocks_params, kbs_params */

/**
 * Get blocks params with fallback to kbs_params
 * @returns {Object} The params object
 */
export function getBlocksParams() {
	return typeof kadence_blocks_params !== 'undefined'
		? kadence_blocks_params
		: typeof kbs_params !== 'undefined'
		? kbs_params
		: {};
}

/**
 * Get a specific blocks param value with fallback to kbs_params
 * @param {string} key - The param key to get
 * @param {*} defaultValue - The default value if param is not found
 * @returns {*} The param value
 */
export function getBlocksParam( key, defaultValue = undefined ) {
	const params = getBlocksParams();
	return params[ key ] !== undefined ? params[ key ] : defaultValue;
}
