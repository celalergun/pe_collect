// we should wait for the document object to be loaded completely to attach 
document.addEventListener('readystatechange', (event) => {
    if (document.readyState == 'complete') {
        setEvents();
    }
});

function setEvents() {
    document.getElementById('fileInput').addEventListener('change', function () {
        console.log("File has been loaded");
        let reader = new FileReader();
        reader.onload = async function () {
            let buffer = this.result;
            let { isPE, hashHex } = await readAndCheckFile(buffer);
            displayHash(hashHex);
            if (!isPE) {
                setGui(isPE, 'Not a PE', '', '');
                return;
            }
        
            let fileType = 'PE File';

            postData('/hash', { hash: hashHex, fileName: reader.fileName, fileSize:reader.fileSize, directory:reader.directory })
                .then(data => {
                    setGui(isPE, fileType, data.exists, data.status);
                })
                .catch(error => {
                    console.error(error);
                });

        };
        reader.readAsArrayBuffer(this.files[0]);
        document.getElementById('filePath').value = this.files[0].webkitRelativePath;
    }, false);

}

function displayHash(hashHex) {
    document.getElementById('hash').innerText = hashHex;
    document.getElementById('hashHex').value = hashHex;
}

async function readAndCheckFile(buffer) {
    let array = new Uint8Array(buffer);
    const hashBuffer = await crypto.subtle.digest('SHA-256', array);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    let mzSign = 0;
    let peSign = 0;
    // we check here:
    // if the file is bigger than 130 bytes
    let isBigEnough = array.length > 130;
    if (isBigEnough) {
        // if it is starting with 'MZ' (Mark Zbikowski) 
        mzSign = array[0] * 0x100 + array[1];
        let peLocation = array[0x3c] + (array[0x3d] * 0x100) + (array[0x3e] * 0x10000) + (array[0x3f] * 0x1000000);
        peSign = (array[peLocation] << 24) + (array[peLocation + 1] << 16) + (array[peLocation + 2] << 8) + (array[peLocation + 3]);
    }
    //console.log(peSign.toString(16));
    // if it has MZ and PE marks (http://www.phreedom.org/research/tinype/)
    let isPE = isBigEnough && mzSign == 0x4d5a && peSign == 0x50450000;
    return { isPE, hashHex };
}

//https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
async function postData(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(data)
    });
    return response.json();
}

function setGui(isPE, type, exist, status) {
    document.getElementById('ctype').innerText = type;
    document.getElementById('btnSubmit').disabled = !isPE || exist;
    document.getElementById('exists').innerText = exist ? "File already exists": "File is a new sample";
    document.getElementById('status').innerText = status;
}
