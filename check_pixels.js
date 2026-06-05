const fs = require('fs');

const file = 'C:\\Users\\Harsh\\.gemini\\antigravity-ide\\brain\\726f066b-6e30-4081-bd54-647250d2adb5\\media__1780670885738.png';
const buffer = fs.readFileSync(file);

// Simple check of pixel values (ignoring PNG header, just counting byte frequencies)
const freq = {};
for (let i = 0; i < buffer.length; i++) {
  const b = buffer[i];
  freq[b] = (freq[b] || 0) + 1;
}

const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
console.log('Total bytes:', buffer.length);
console.log('Top 10 byte values by frequency:');
sorted.slice(0, 10).forEach(([val, count]) => {
  console.log(`Byte ${val}: count=${count} (${(count/buffer.length*100).toFixed(2)}%)`);
});
