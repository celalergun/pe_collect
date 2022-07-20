
function isHashInDb(hash) {
    const db = connectDb();
    var query = db.prepare('select id from meta_data where hash = ?').bind(hash);
    const val = query.get();
    db.close();
    return val;
}

function insertHash(hash, filename, filesize, directory)
{
    const db = connectDb();
    var s = 'insert into "meta_data" (hash, filename, filesize, directory) values (?, ?, ?, ?);';
    var query = db.prepare(s);
    var result = query.run(hash, filename, filesize, directory);
    console.log(result);
    db.close();
}

function connectDb(){
    const connection = require('better-sqlite3')('./database/pe_metadata.db3', { verbose: console.log });
    return connection;
}

exports.isHashInDb = isHashInDb;
exports.insertHash = insertHash;