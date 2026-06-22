#!/usr/bin/env node
const fs = require('fs');
const terms = JSON.parse(fs.readFileSync('terms.json', 'utf-8'));

const fixDefs = {
  '民间文化论坛': '**民间文化论坛**是讨论民间文化问题的学术平台，为民俗学者提供了学术交流和思想碰撞的空间。该论坛定期组织学术研讨和田野考察活动，推动了民间文化研究的深入发展。',
  '民间文化青年论坛': '**民间文化青年论坛**是青年民俗学者的学术交流平台，促进了青年学者的成长和学术传承。该论坛为青年学者提供了展示研究成果、交流学术思想的机会，对民俗学学术后备力量的培养具有重要意义。',
};

let count = 0;
const updated = terms.map(term => {
  if (!term[6]) return term;
  if (term[6].length >= 50) return term;
  const newDef = fixDefs[term[0]];
  if (newDef) {
    count++;
    return [...term.slice(0, 6), newDef];
  }
  return term;
});

fs.writeFileSync('terms.json', JSON.stringify(updated, null, 2), 'utf-8');

let short = 0, medium = 0, long = 0;
updated.forEach(r => {
  if (!r[6]) return;
  const len = r[6].length;
  if (len < 50) short++;
  else if (len < 100) medium++;
  else long++;
});
console.log(`本次修复 ${count} 条`);
console.log(`修复后: <50字:${short}条, 50-100字:${medium}条, 100-300字:${long}条`);
