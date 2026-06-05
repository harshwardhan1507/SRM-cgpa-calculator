const Tesseract = require('tesseract.js');
const fs = require('fs');

async function run() {
  const imagePath = 'C:\\Users\\Harsh\\.gemini\\antigravity-ide\\brain\\726f066b-6e30-4081-bd54-647250d2adb5\\media__1780670885738.png';
  const outputPath = 'C:\\Users\\Harsh\\.gemini\\antigravity-ide\\brain\\726f066b-6e30-4081-bd54-647250d2adb5\\scratch\\raw_ocr_text_direct.txt';
  
  console.log('Running direct OCR...');
  try {
    const ret = await Tesseract.recognize(imagePath, 'eng', {
      logger: m => console.log(m)
    });
    const text = ret.data.text;
    fs.writeFileSync(outputPath, text, 'utf-8');
    console.log('Done! Text length:', text.length);
    console.log('Sample text:');
    console.log(text.slice(0, 500));
  } catch (err) {
    console.error('Direct OCR failed:', err);
  }
}

run();
