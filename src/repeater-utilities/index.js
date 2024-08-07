import { SafeParseJSON } from '..';
import { resolveSelect } from '@wordpress/data';

const { repeatersEndpoint, repeaterDataEndpoint, dynamicFieldsEndpoint } = window.kadenceDynamicParams;
const { apiFetch } = wp;
const { addQueryArgs } = wp.url;
const { addFilter } = wp.hooks;

/**
 * Returns an array of repeater fields for a source
 *
 * @param {*} source The post id (or option) source
 * @returns {array} All repeater fields associated with the source
 */
export function getRepeatersForSource( source, contextPost, onFinish ) {
	if ( 'function' == typeof onFinish ) {
		const props = {
			source: source,
			type: 'repeaters',
			contextPost: contextPost,
			useRepeaterContext: true,
		};

		resolveSelect( 'kadenceblockspro/data' )
			.storeFetch( addQueryArgs( dynamicFieldsEndpoint, getQuery( props, contextPost ) ) )
			.then( ( response ) => {
				//this.setState( { fields, loaded: true } );
				if ( 'object' === typeof response && 1 <= Object.keys( response ).length ) {
					onFinish( response );
					return response;
				}
			} )
			.catch( ( e ) => {
				onFinish( null );
				return null;
			} );
	}
}

/**
 * Returns the repeater data (row data) for a repeater source
 *
 * @param {*} source The post id (or option) source
 * @returns {array} All repeater fields associated with the source
 */
export function getRepeaterData( source, field, onFinish ) {
	if ( 'function' == typeof onFinish ) {
		resolveSelect( 'kadenceblockspro/data' )
			.storeFetch(
				addQueryArgs( repeaterDataEndpoint, {
					source: source,
					field: field,
				} )
			)
			.then( ( response ) => {
				if ( 'object' === typeof response && 1 <= Object.keys( response ).length ) {
					onFinish( response );
					return response;
				} else if ( 'object' === typeof response && 0 == Object.keys( response ).length ) {
					//not doing anything different with a valid, but empty response yet.
					onFinish( response );
					return response;
				} else {
					onFinish( null );
					return null;
				}
			} )
			.catch( ( e ) => {
				// Nothing needed here.
				onFinish( null );
				return null;
			} );
	}
}

export function getRepeaterOptionFromRepeaters( repeaters, repeaterSlug ) {
	var repeaterOption = {};
	if ( repeaters && repeaterSlug ) {
		repeaters.forEach( ( repeaterGroup ) => {
			if ( repeaterGroup[ 'options' ] ) {
				repeaterGroup[ 'options' ].forEach( ( repeater ) => {
					if ( repeater[ 'value' ] == repeaterSlug ) {
						repeaterOption = repeater;
					}
				} );
			}
		} );
	}
	return repeaterOption;
}

function getQuery( blockAttributes, contextPost = null, repeaterRow = '', dynamicSource = '' ) {
	const {
		source,
		field,
		custom,
		para,
		before,
		after,
		fallback,
		type,
		relate,
		relcustom,
		showAll,
		useRepeaterContext,
	} = blockAttributes;
	let theSource = source ? source : contextPost;
	// This can be removed once fully updated to use kadenceblockspro/data store.
	if ( wp.data.select( 'core/editor' ) && ! theSource ) {
		if ( kbpData.isKadenceE && kadenceElementParams.previewPostID ) {
			const postId = SafeParseJSON( kadenceElementParams.previewPostID );
			theSource = postId && postId.id ? postId.id : '';
		} else {
			theSource = wp.data.select( 'core/editor' ).getCurrentPostId();
		}
	}
	dynamicSource = parseDynamicSource( dynamicSource, theSource );

	return {
		source: useRepeaterContext ? dynamicSource : theSource,
		field: field ? field : '',
		custom: custom ? custom : '',
		para: para ? para : '',
		before: before ? before : '',
		after: after ? after : '',
		fallback: fallback ? fallback : '',
		type: type ? type : '',
		relate: relate ? relate : '',
		relcustom: relcustom ? relcustom : '',
		ignore_source: showAll ? showAll : false,
		useRepeaterContext: useRepeaterContext ? useRepeaterContext : false,
		repeaterRow: repeaterRow,
	};
}

/**
 * Parse a usable source (post id) value from something more raw from a repeater
 */
export function parseRepeaterSource( source ) {
	var theSource = source;
	if ( kbpData.isKadenceE && kadenceElementParams.previewPostID ) {
		const postId = SafeParseJSON( kadenceElementParams.previewPostID );
		theSource = postId && postId.id ? postId.id : '';
	} else {
		if ( source && 'string' == typeof source && source.includes( '|' ) ) {
			const sourceSplit = source.split( '|' );
			theSource = 'undefined' != typeof sourceSplit[ 0 ] ? sourceSplit?.[ 0 ] : '';

			theSource = 'current' == theSource ? '' : theSource;
		}
	}
	return theSource;
}

/**
 * See if a dynamic source needs a context sensitive post prepended on account of being the "current" post
 */
export function parseDynamicSource( dynamicSource, theSource ) {
	var repeaterSource = '';
	if ( dynamicSource && 'string' == typeof dynamicSource && dynamicSource.includes( '|' ) ) {
		const sourceSplit = dynamicSource.split( '|' );
		if ( sourceSplit ) {
			repeaterSource = sourceSplit?.[ 0 ];
		}

		if ( ! repeaterSource ) {
			return theSource + dynamicSource;
		}
	}

	return dynamicSource ? dynamicSource : theSource;
}
