const express = require('express');
const path = require('path');
const fs = require('fs');
//file upload module
const multer = require('multer');
const upload = multer({ preservePath: true });
const fileutils = require('./fileutils');
const dbutils = require('./dbutils');

var app = express();
app.use(express.static(path.join(process.cwd(), '/public')));
const PORT = 3003;

// check if the directories exist
fileutils.checkDirectory('storage');
fileutils.checkDirectory('database');

const bodyParser = require('body-parser');
app.use(bodyParser.json());
// let's create the database if it does not exist
const db = require('better-sqlite3')('./database/pe_metadata.db3', { verbose: console.log });
db.exec('Create Table If Not Exists meta_data(id integer primary key autoincrement, hash varchar(64) not null, filename text not null, filesize int64, directory text not null);');
// and add an index to make the queries faster
db.exec('Create Unique Index If Not Exists ByHash on meta_data(hash);');
db.close();

// here we serve the file "index.html" 
app.get('/', (req, res) => {
    res.setHeader('Content-type', 'text/html');
    indexFile = fs.readFileSync(path.join(process.cwd(), 'index.html'));
    res.write(indexFile, (err) => {
        if (err) throw err;
    });
    res.end();
});

// if client posts data using our "hash" method, we get it here
app.post('/hash', (req, res) => {
    const hash = req.body.hash;
    let fileName = path.join(process.cwd(), 'storage', hash + '.sample');
    var val = dbutils.isHashInDb(hash);
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
});

app.post('/upload', upload.single('sample'), function (req, res, next) {
    let hash = req.body.hashHex;
    let fileName = req.file.originalname;
    let fileSize = req.file.size;
    let directory = req.body.filePath;
    let physicalFileName = path.join(process.cwd(), 'storage', hash + '.sample');
    if (hash === undefined || fileName === undefined || fileSize === undefined || directory === undefined) {
        res.status(403).send('Invalid data');
        res.end();
        return;
    }

    let { isPE, hexHash } = fileutils.checkBuffer(req.file.buffer);
    if (!isPE) {
        res.status(403).send('Invalid data');
        res.end();
        return;
    }

    if (hexHash !== hash || dbutils.isHashInDb(hash)) {
        res.status(403).send('Invalid data');
        res.end();
        return;
    }

    fs.writeFileSync(physicalFileName, req.file.buffer);
    dbutils.insertHash(hash, fileName, fileSize, directory);
    res.status(200).redirect('/');
    res.end();
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