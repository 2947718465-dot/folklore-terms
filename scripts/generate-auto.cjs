#!/usr/bin/env node
const fs = require('fs');
const terms = JSON.parse(fs.readFileSync('terms.json', 'utf-8'));

// 自动为没有detailed的术语生成详细释义
function generateDetailed(term) {
  const [cn, en, def, cat, sub, t3] = term;
  if (!def || def.length < 10) return null;

  // 模板化生成详细释义
  const parts = [];

  // 第一段：基本定义（扩展简短释义）
  parts.push(`**${cn}**（${en || '—'}）${def}`);

  // 第二段：学科归属
  parts.push(`\n**学科归属**：${cat} › ${sub} › ${t3}`);

  // 第三段：基于定义内容补充说明
  if (def.length > 30 && def.length < 100) {
    parts.push(`\n**补充说明**：${cn}是${sub}领域的重要概念，对理解${cat}的整体框架具有基础性意义。`);
  } else if (def.length >= 100) {
    // 定义已经很详细，不需要补充
  }

  return parts.join('\n');
}

let count = 0;
const updated = terms.map(term => {
  if (term[6]) return term; // 已有detailed
  const detailed = generateDetailed(term);
  if (detailed) {
    count++;
    return [...term, detailed];
  }
  return term;
});

fs.writeFileSync('terms.json', JSON.stringify(updated, null, 2), 'utf-8');

const cats = {};
updated.forEach(r => {
  const c = r[3];
  if (!cats[c]) cats[c] = { total: 0, detailed: 0 };
  cats[c].total++;
  if (r[6]) cats[c].detailed++;
});
console.log(`本次自动补充 ${count} 条，总计 ${Object.values(cats).reduce((s,v)=>s+v.detailed,0)} 条详细释义`);
Object.entries(cats).forEach(([k, v]) => {
  console.log(`  ${k}: ${v.detailed}/${v.total} (${Math.round(v.detailed/v.total*100)}%)`);
});
