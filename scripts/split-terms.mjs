import { readFileSync, writeFileSync } from 'fs';

const data = JSON.parse(readFileSync('public/terms.json', 'utf-8'));

// Create lightweight version without detailed field
const lightweight = data.map(item => item.slice(0, 6));

writeFileSync('public/terms-list.json', JSON.stringify(lightweight));

console.log(`Original: ${data.length} terms with detailed`);
console.log(`Lightweight: ${lightweight.length} terms without detailed`);
console.log(`Saved detailed field from each term`);
