const { createWorker } = require('tesseract.js');
const fs = require('fs');
const path = require('path');

async function run() {
  const imagePath = 'C:\\Users\\Harsh\\.gemini\\antigravity-ide\\brain\\726f066b-6e30-4081-bd54-647250d2adb5\\media__1780670885738.png';
  const outputPath = 'C:\\Users\\Harsh\\.gemini\\antigravity-ide\\brain\\726f066b-6e30-4081-bd54-647250d2adb5\\scratch\\raw_ocr_text.txt';
  
  console.log('Running OCR on image:', imagePath);
  try {
    const worker = await createWorker('eng');
    const ret = await worker.recognize(imagePath);
    const text = ret.data.text;
    await worker.terminate();
    
    fs.writeFileSync(outputPath, text, 'utf-8');
    console.log('Successfully wrote OCR output to:', outputPath);
    console.log('OCR text length:', text.length);
  } catch (error) {
    console.error('OCR failed:', error);
  }
}

run();
