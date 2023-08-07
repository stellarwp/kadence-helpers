import {SafeParseJSON} from '@kadence/helpers';

/**
 * Parse a usable source (post id) value from something more raw from a repeater
 */
export default ( source ) => {
    var theSource = source;
    if( kbpData.isKadenceE && kadenceElementParams.previewPostID ) {
        const postId = SafeParseJSON( kadenceElementParams.previewPostID );
        theSource = postId && postId.id ? postId.id : '';
    } else {
        if ( source && 'string' == typeof( source ) && source.includes( '|' )) {
            const sourceSplit = source.split( '|' );
            theSource = 'undefined' != typeof( sourceSplit[0] ) ? sourceSplit?.[0] : '';

            theSource = 'current' == theSource ? '' : theSource;
        }
    }
    return theSource;
};