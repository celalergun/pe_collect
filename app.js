const express = require('express');
const fs = require('fs');
const path = require('path');
var app = express();
app.use(express.static(path.join(process.cwd(), '/public')));
//app.use(express.json);
const PORT = 3003;

app.get('/', (req, res) => {
    res.setHeader('Content-type', 'text/html');
    indexFile = fs.readFileSync(path.join(process.cwd(), 'index.html'));
    res.write(indexFile, (err) => {
        if (err) throw err;
    });
    res.end();
});

app.post('/hash', (req, res) => {
    res.status(200).send(
        {
            exists: false,
            status: "Ready to send"
        });
});

app.post('/upload', (req, res) => {
    if (req.files){
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