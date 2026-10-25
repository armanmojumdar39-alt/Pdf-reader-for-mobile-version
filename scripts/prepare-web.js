// npm প্যাকেজ থেকে pdf.js ও pdf-lib কপি করে www/lib-এ রাখে (অফলাইনে চলবে)
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const out = path.join(root, 'www', 'lib');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const pdfjs = path.join(root, 'node_modules', 'pdfjs-dist');
const pdflib = path.join(root, 'node_modules', 'pdf-lib', 'dist', 'pdf-lib.min.js');

fs.copyFileSync(path.join(pdfjs, 'build', 'pdf.min.js'), path.join(out, 'pdf.min.js'));
fs.copyFileSync(path.join(pdfjs, 'build', 'pdf.worker.min.js'), path.join(out, 'pdf.worker.min.js'));
fs.copyFileSync(pdflib, path.join(out, 'pdf-lib.min.js'));
fs.cpSync(path.join(pdfjs, 'cmaps'), path.join(out, 'cmaps'), { recursive: true });
fs.cpSync(path.join(pdfjs, 'standard_fonts'), path.join(out, 'standard_fonts'), { recursive: true });
console.log('✓ www/lib তৈরি হয়েছে');
