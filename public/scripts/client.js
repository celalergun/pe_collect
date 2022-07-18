// we should wait for the document object to be loaded completely to attach 
document.addEventListener('readystatechange', (event) => {
    if (document.readyState == 'complete') {
        setEvents();
    }
});

function setEvents() {
    document.getElementById('myFile').addEventListener('change', function () {
        console.log("File has been loaded");
        var reader = new FileReader();
        reader.onload = async function() {
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
            // if it is starting with 'MZ' (Mark Zbikowski) 
            var mzSign = isBigEnough ? array[0] * 0x100 + array[1] : 0;
            // if it has PE mark (http://www.phreedom.org/research/tinype/)
            var peSign = isBigEnough ? (array[0x80] * 0x1000000) + (array[0x81] * 0x10000) + (array[0x82] * 0x100) + array[0x83] : 0;
            //console.log(peSign.toString(16));
            if (isBigEnough && mzSign == 0x4d5a && peSign == 0x50450000){
                document.getElementById('ctype').innerText = "File is PE";
            }
            else{
                document.getElementById('ctype').innerText = "Not interested";
            }
        };
        reader.readAsArrayBuffer(this.files[0]);
    }, false);

    document.getElementById('fileUploadForm').addEventListener('submit', function() {

    }, false);
}
