// we should wait for the document object to be loaded completely to attach 
document.addEventListener('readystatechange', (event) => {
    if (document.readyState == 'complete') {
        setEvents();
    }
});

function setEvents() {
    document.getElementById('fileInput').addEventListener('change', function () {
        console.log("File has been loaded");
        var reader = new FileReader();
        reader.onload = async function () {
            var buffer = this.result;
            var array = new Uint8Array(buffer);
            console.log(array[0], "-", array[1]);
            const hashBuffer = await crypto.subtle.digest('SHA-256', array);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            console.log(hashHex);
            document.getElementById('hash').innerText = hashHex;
            // we check here:
            // if the file is bigger than 130 bytes
            var isBigEnough = array.length > 130;
            var mzSign = 0;
            var peSign = 0;
            if (isBigEnough) {
                // if it is starting with 'MZ' (Mark Zbikowski) 
                mzSign = array[0] * 0x100 + array[1];
                var peLocation = array[0x3c] + (array[0x3d] * 0x100) + (array[0x3e] * 0x10000) + (array[0x3f] * 0x1000000);
                peSign = (array[peLocation] << 24) + (array[peLocation + 1] << 16) + (array[peLocation + 2] << 8) + (array[peLocation + 3]);
            }
            //console.log(peSign.toString(16));
            // if it has MZ and PE marks (http://www.phreedom.org/research/tinype/)
            if (isBigEnough && mzSign == 0x4d5a && peSign == 0x50450000) {
                document.getElementById('ctype').innerText = "File is PE";
                document.getElementById('btnSubmit').disabled = false;
            }
            else {
                document.getElementById('ctype').innerText = "Not a PE";
                document.getElementById('btnSubmit').disabled = true;
            }
        };
        reader.readAsArrayBuffer(this.files[0]);
    }, false);

    document.getElementById('fileUploadForm').addEventListener('submit', function (e) {
        e.preventDefault();
        console.log("File has been sent");
    }, false);
}
