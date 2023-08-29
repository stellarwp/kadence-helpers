function getBlockByUniqueID( blocks, uniqueID ) {
	if ( Array.isArray( blocks ) && blocks.length ) {
        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];

		    let innerBlock;
			if ( uniqueID == block?.attributes?.uniqueID ) {
				return block;
			}

			if ( 'undefined' != typeof( block.innerBlocks ) && Array.isArray( block.innerBlocks ) && block.innerBlocks.length ) {
				innerBlock = getBlockByUniqueID( block.innerBlocks, uniqueID );
                if ( innerBlock && uniqueID == innerBlock?.attributes?.uniqueID ) {
                    return innerBlock;
                }
			}
		}

		return undefined;
	}
}

export default getBlockByUniqueID;