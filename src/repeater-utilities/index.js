const { repeatersEndpoint, repeaterDataEndpoint } = window.kadenceDynamicParams;
const { apiFetch } = wp;
const { addQueryArgs } = wp.url;
const { addFilter } = wp.hooks;
const {
	localStorage,
} = window;

/**
 * Returns an array of repeater fields for a source
 * 
 * @param {*} source The post id (or option) source
 * @returns {array} All repeater fields associated with the source
 */
export function getRepeatersForSource( source, onFinish ) {
    if ( 'function' == typeof(onFinish) ) {
        const repeatersKey = 'kadenceRepeaters-' + source;
        
        const localRepeatersForSource = JSON.parse( localStorage.getItem( repeatersKey ) );

        if ( localRepeatersForSource ) {
            onFinish( localRepeatersForSource );
            return localRepeatersForSource;
        } else {
            apiFetch( {
                path: addQueryArgs(
                    repeatersEndpoint,
                    {
                        source: source,
                    }
                ),
            } )
            .then( ( response ) => {
                if( 'object' === typeof( response ) && 1 <= Object.keys(response).length ) {
                    localStorage.setItem( repeatersKey, JSON.stringify( response ) );

                    onFinish( response );
                    return response
                }
            } )
            .catch( ( e ) => {
                // Nothing needed here.
            } );
            onFinish( null );
            return null
        }
    }
}

/**
 * Returns the repeater data (row data) for a repeater source
 * 
 * @param {*} source The post id (or option) source
 * @returns {array} All repeater fields associated with the source
 */
export function getRepeaterData( source, field, onFinish ) {
    if ( 'function' == typeof(onFinish) ) {
        const repeaterDataKey = 'kadenceRepeaterData-' + source + '-' + field;
        
        const localRepeaterDataForSourceAndKey = JSON.parse( localStorage.getItem( repeaterDataKey ) );

        if ( localRepeaterDataForSourceAndKey ) {
            onFinish( localRepeaterDataForSourceAndKey );
            return localRepeaterDataForSourceAndKey;
        } else {
            apiFetch( {
                path: addQueryArgs(
                    repeaterDataEndpoint,
                    {
                        source: source,
                        field: field
                    }
                ),
            } )
            .then( ( response ) => {
                if( 'object' === typeof( response ) && 1 <= Object.keys(response).length ) {
                    localStorage.setItem( repeaterDataKey, JSON.stringify( response ) );

                    onFinish( response );
                    return response
                }
            } )
            .catch( ( e ) => {
                // Nothing needed here.
            } );
            onFinish( null );
            return null
        }
    }
}

export function clearRepeatersForSource( source ) {
    const repeatersKey = 'kadenceRepeaters-' + source;

    localStorage.removeItem( repeatersKey );
}

export function clearRepeaterData( source, field ) {
    console.log('clearing', source, field)
    const repeaterDataKey = 'kadenceRepeaterData-' + source + '-' + field;

    localStorage.removeItem( repeaterDataKey );
}

export function getRepeaterOptionFromRepeaters( repeaters, repeaterSlug ) {
    var repeaterOption = {};
    console.log('getRepeaterOptionFromRepeaters', repeaters, repeaterSlug)
    if ( repeaters && repeaterSlug ) {
        repeaters.forEach(repeaterGroup => {
            if ( repeaterGroup['options'] ) {
                repeaterGroup['options'].forEach(repeater => {
                    if( repeater['value'] == repeaterSlug ) {
                        repeaterOption = repeater;
                    }
                });
            }
        });
    }
    return repeaterOption;
}