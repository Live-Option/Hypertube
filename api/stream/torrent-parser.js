/**
 * Created by opichou on 11/23/16.
 */

import bencode from 'bencode'
import crypto from 'crypto'
import bignum from 'bignum'

module.exports.size = torrent => {
	if (torrent.xl) {
		const size =  torrent.xl
	    return bignum.toBuffer(size, {size: 8})
	}
    	const size = torrent.info.files ?
        torrent.info.files.map(file => file.length).reduce((a, b) => a + b) :
        torrent.info.length
	    return bignum.toBuffer(size, {size: 8})
}

module.exports.infoHash = torrent => {
	if (torrent.infoHash)
	{
		return torrent.infoHashBuffer
	}
    const info = bencode.encode(torrent.info);
    return Buffer.from(crypto.createHash('sha1').update(info).digest())
}

module.exports.length = torrent => {
	
}
