const { repeatersEndpoint } = window.kadenceDynamicParams;
const { apiFetch } = wp;
const { addQueryArgs } = wp.url;
const { addFilter } = wp.hooks;

/**
 * Returns an array of repeater fields for a source
 * 
 * @param {*} source The post id (or option) source
 * @returns {array} All repeater fields associated with the source
 */
export default function getACFRepeatorsForSource( source, onFinish ) {
    if ( 'function' == typeof(onFinish) ) {
		apiFetch( {
			path: addQueryArgs(
				repeatersEndpoint,
				{
                    source: source,
                }
			),
		} )
        .then( ( response ) => {
            if( 'object' === typeof( response ) && 1 >= Object.keys(response).length ) {
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
    // return content;
    // var repeaterKeys = []
    // if( record && 'object' == typeof( record['acf'] ) && 1 <= Object.keys(record['acf']).length ) {
    //     Object.keys(record['acf']).forEach( key => {
    //         const field = record['acf'][key];
    //         if ( 'object' == typeof( field ) && field && 1 <= field.length && 'undefined' != typeof( field[0] ) ) {
    //             repeaterKeys.push( { value: key, label: key } );
    //         }
    //     });
    // }
    // onFinish( repeaterKeys );
    // return true;
}