const fs = require('fs');
const path = require('path');

const dir = './src';
const walk = (d) => {
    let results = [];
    const list = fs.readdirSync(d);
    list.forEach(file => {
        file = path.join(d, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(dir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content
        .replace(/\bIris\b/g, 'Isabel')
        .replace(/\bIRIS\b/g, 'ISABEL')
        .replace(/\biris\b/g, 'isabel')
        .replace(/\bAva\b/g, 'Abby')
        .replace(/\bAVA\b/g, 'ABBY')
        .replace(/\bava\b/g, 'abby')
        .replace(/\bMegan\b/g, 'Maya')
        .replace(/\bMEGAN\b/g, 'MAYA')
        .replace(/\bmegan\b/g, 'maya')
        .replace(/\bMeghan\b/g, 'Maya')
        .replace(/\bMEGHAN\b/g, 'MAYA')
        .replace(/\bmeghan\b/g, 'maya');
    
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log('Updated:', file);
    }
});
