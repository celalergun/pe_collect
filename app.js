const express = require('express');
const fs = require('fs');
const path = require('path');
//file upload module
const multer = require('multer');
const upload = multer({preservePath:true});

var app = express();
app.use(express.static(path.join(process.cwd(), '/public')));
//app.use(express.json);
const PORT = 3003;

const bodyParser = require('body-parser');
app.use(bodyParser.json());
// let's create the database if it does not exist
const db = require('better-sqlite3')('./database/pe_metadata.db3', { verbose: console.log });
db.exec('Create Table If Not Exists meta_data(id integer primary key autoincrement, hash varchar(64) not null, filename text not null, filesize int64, directory text not null);');
// and add an index to make the queries faster
db.exec('Create Unique Index If Not Exists ByHash on meta_data(hash);');
db.close();

app.get('/', (req, res) => {
    res.setHeader('Content-type', 'text/html');
    indexFile = fs.readFileSync(path.join(process.cwd(), 'index.html'));
    res.write(indexFile, (err) => {
        if (err) throw err;
    });
    res.end();
});

app.post('/hash', (req, res) => {
    const hash = req.body.hash;
    let fileName = path.join(process.cwd(), 'storage', hash+'.sample');
    const db = require('better-sqlite3')('./database/pe_metadata.db3', { verbose: console.log });
    var query = db.prepare('select id from meta_data where hash = ?').bind(hash);
    const val = query.get();
    if (val) {
        res.status(200).send(
            {
                exists: true,
                status: "You don't need to send this file"
            });

    } else {
        res.status(200).send(
            {
                exists: false,
                status: "Ready to send"
            });

    }
    db.close();
});

app.post('/upload', upload.single('sample'), function (req, res, next) {
    let hash = req.body.hashHex;
    let fileName = req.file.originalname;
    let fileSize = req.file.size;
    let directory = req.body.filePath;
    let physicalFileName = path.join(process.cwd(), 'storage', hash+ '.sample');
    if (hash === undefined || fileName === undefined || fileSize === undefined || directory === undefined){
        res.status(403).send('Invalid data');
        res.end();
        return;
    }
    fs.writeFileSync(physicalFileName, req.file.buffer);
    const db = require('better-sqlite3')('./database/pe_metadata.db3', { verbose: console.log });
    var s = 'insert into "meta_data" (hash, filename, filesize, directory) values (?, ?, ?, ?);';
    var query = db.prepare(s);
    var result = query.run(hash, fileName, fileSize, directory);
    console.log(result);
    db.close();
});

app.get("*", (req, res) => {
    res.setHeader('Content-type', 'text/html');
    file404 = fs.readFileSync(path.join(process.cwd(), 'notfound.html'));
    res.write(file404, (err) => {
        if (err) throw err;
    });
    res.end();
});

app.listen(PORT, () => {
    console.log(`Server is running at: http://127.0.0.1:${PORT}`);
});

module.exports = app;