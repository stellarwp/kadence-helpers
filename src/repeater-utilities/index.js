const { repeatersEndpoint } = window.kadenceDynamicParams;
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
export function getACFRepeatorsForSource( source, onFinish ) {
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

export function clearACFRepeatorsForSource( source ) {
    const repeatersKey = 'kadenceRepeaters-' + source;

    localStorage.removeItem( repeatersKey );
}