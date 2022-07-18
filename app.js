const express = require('express');
const fs = require('fs');
const path = require('path');
//const favicon = require('serve-favicon');
//const fileupload = require('express-fileupload');
//var static = require('node-static');
var app = express();
app.use(express.static(path.join(process.cwd(), '/public')));
//app.use(favicon(path.join(process.cwd(), 'images', 'favicon.ico')));
//app.use(fileupload);
const PORT = 3003;
//var file = new(static.Server)(__dirname);

app.get('/', (req, res) => {
    res.setHeader('Content-type', 'text/html');
    indexFile = fs.readFileSync(path.join(process.cwd(), 'index.html'));
    res.write(indexFile, (err) => {
        if (err) throw err;
    });
    res.end();
});

app.post('/upload', (req, res) => {
    if (req.files){
        console.log(req.files);
    }
    res.end();
});

app.get("*", (req, res) => {
    res.status(404).send("404 - Not Found!");
    res.end();
});

app.listen(PORT, () => {
    console.log(`Server is running at: http://127.0.0.1:${PORT}`);
});

module.exports = app;