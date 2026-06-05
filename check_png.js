const fs = require('fs');
const path = require('path');

const file = 'C:\\Users\\Harsh\\.gemini\\antigravity-ide\\brain\\726f066b-6e30-4081-bd54-647250d2adb5\\media__1780670885738.png';
const buffer = fs.readFileSync(file);

const width = buffer.readUInt32BE(16);
const height = buffer.readUInt32BE(20);

console.log('PNG width:', width);
console.log('PNG height:', height);
console.log('PNG buffer length:', buffer.length);
