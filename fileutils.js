const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function checkDirectory(dirName){
    fs.mkdir(path.join(__dirname, dirName), 0o744, function(err) {
        if ((err != null) && (err.code == 'EEXIST'))
        {
            console.log(`Directory "${dirName}" exists`);
            return;
        }
            
        if (err) throw err;
    });    
}

function checkBuffer(buffer) {
    var array = new Uint8Array(buffer);
    const hash = crypto.createHash('sha256');
    hash.update(array);
    const hexHash = hash.digest('hex');
    var mzSign = 0;
    var peSign = 0;
    // we check here:
    // if the file is bigger than 130 bytes
    var isBigEnough = array.length > 130;
    if (isBigEnough) {
        // if it is starting with 'MZ' (Mark Zbikowski) 
        mzSign = array[0] * 0x100 + array[1];
        var peLocation = array[0x3c] + (array[0x3d] * 0x100) + (array[0x3e] * 0x10000) + (array[0x3f] * 0x1000000);
        peSign = (array[peLocation] << 24) + (array[peLocation + 1] << 16) + (array[peLocation + 2] << 8) + (array[peLocation + 3]);
    }
    //console.log(peSign.toString(16));
    // if it has MZ and PE marks (http://www.phreedom.org/research/tinype/)
    var isPE = isBigEnough && mzSign == 0x4d5a && peSign == 0x50450000;
    return { isPE, hexHash };
}

exports.checkDirectory = checkDirectory;
exports.checkBuffer = checkBuffer;