const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
var app = express();
app.use(express.static(path.join(process.cwd(), '/public')));
//app.use(express.json);
const PORT = 3003;

// let's create the database if it does not exist
const db = require('better-sqlite3')('./database/pe_metadata.db3', { verbose: console.log });
db.exec('Create Table If Not Exists meta_data(id integer primary key autoincrement, hash varchar(64) not null, filename text not null, filesize int64, directory text not null);');
// and add an index to make the queries faster
db.exec('Create Unique Index If Not Exists ByHash on meta_data(hash);');
db.close();

//file upload module
const upload = multer({dest: 'storage/'});

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
    let fileName = path.join(process.cwd(), 'storage', hash);
    const db = require('better-sqlite3')('./database/pe_metadata.db3', { verbose: console.log });
    var query = db.prepare('select id from meta_data where hash = ?');
    const val = query.get(hash);
    if (val){
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

app.post('/upload', (req, res) => {
    if (req.file) {
        console.log(req.files);
    }
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