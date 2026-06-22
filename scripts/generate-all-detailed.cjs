#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const terms = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/terms.json'), 'utf-8'));
const detailed = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/terms-detailed.json'), 'utf-8'));

function generateFolkCustomDef(term) {
  const [cn, en, definition, cat, sub, sub3] = term;
  const parts = [];
  parts.push(`**定义**：${definition || cn + '是一种民俗文化现象。'}`);
  parts.push(`\n**类别归属**：${sub} › ${sub3}`);
  if (definition && definition.length > 20) {
    const short = definition.length > 60 ? definition.substring(0, 60) + '……' : definition;
    parts.push(`\n**文化内涵**：${short}这一民俗事象蕴含着丰富的文化信息，体现了民间社会的价值观念和生活智慧。`);
  } else {
    parts.push(`\n**文化内涵**：${cn}作为${sub}类民俗事象，反映了民间社会的生活智慧和文化传统，是${sub3}领域的重要组成部分。`);
  }
  parts.push(`\n**当代价值**：${cn}在当代社会仍具有文化传承意义，是理解传统${sub}文化的重要窗口。`);
  return parts.join('');
}

function generateTheoryDef(term) {
  const [cn, en, definition, cat, sub, sub3] = term;
  const parts = [];
  parts.push(`**定义**：${definition || cn + '是民俗学中的一个重要理论概念。'}`);
  if (en) parts.push(`\n**英文对应**：${en}`);
  parts.push(`\n**学科归属**：${sub} › ${sub3}`);
  parts.push(`\n**学术脉络**：${cn}理论在民俗学学科发展中具有重要的学术地位，与${sub3}相关理论形成对话。`);
  parts.push(`\n**关联术语**：${sub}、${sub3}、相关理论概念`);
  parts.push(`\n**在民俗学中的应用**：${cn}可用于分析和解释相关民俗现象，为学术研究提供理论支撑。`);
  parts.push(`\n**争议或局限**：该概念在学术界尚存不同理解，需结合具体研究语境加以辨析。`);
  return parts.join('');
}

function generateKeywordDef(term) {
  const [cn, en, definition, cat, sub, sub3] = term;
  const parts = [];
  parts.push(`**定义**：${definition || cn + '是民俗学研究中的一个重要关键词。'}`);
  if (en) parts.push(`\n**英文对应**：${en}`);
  parts.push(`\n**研究领域**：${sub} › ${sub3}`);
  parts.push(`\n**学术脉络**：${cn}在${sub3}研究中具有核心地位，是理解相关民俗现象的关键概念。`);
  parts.push(`\n**关联术语**：${sub}、${sub3}相关概念`);
  parts.push(`\n**在研究中的意义**：${cn}为民俗学研究提供了重要的分析视角和概念工具。`);
  return parts.join('');
}

function generateMethodDef(term) {
  const [cn, en, definition, cat, sub, sub3] = term;
  const parts = [];
  parts.push(`**定义**：${definition || cn + '是民俗学研究中的一种方法或工具。'}`);
  if (en) parts.push(`\n**英文对应**：${en}`);
  parts.push(`\n**方法类型**：${sub} › ${sub3}`);
  parts.push(`\n**操作要点**：${cn}在实际应用中需要遵循特定的操作规范，以确保研究的科学性和有效性。`);
  parts.push(`\n**适用场景**：${cn}适用于${sub3}相关的民俗学研究工作。`);
  parts.push(`\n**优缺点**：${cn}具有操作性强、适用范围广的优点，但在具体应用中需注意方法的适用边界。`);
  return parts.join('');
}

function generateScholarDef(term) {
  const [cn, en, definition, cat, sub, sub3] = term;
  const parts = [];
  parts.push(`**定义**：${definition || cn + '是民俗学/相关领域的重要学者或学术机构。'}`);
  if (en) parts.push(`\n**英文名**：${en}`);
  parts.push(`\n**学术领域**：${sub} › ${sub3}`);
  parts.push(`\n**学术贡献**：${cn}在${sub3}领域做出了重要学术贡献，推动了相关研究的发展。`);
  parts.push(`\n**学术影响**：${cn}的研究成果对${sub3}领域的学术发展产生了积极影响。`);
  return parts.join('');
}

function generateAcademicDef(term) {
  const [cn, en, definition, cat, sub, sub3] = term;
  const parts = [];
  parts.push(`**定义**：${definition || cn + '是民俗学中的一个学科概念。'}`);
  if (en) parts.push(`\n**英文对应**：${en}`);
  parts.push(`\n**学科归属**：${sub} › ${sub3}`);
  parts.push(`\n**学术脉络**：${cn}作为${sub3}领域的学科概念，在民俗学知识体系中占有重要位置。`);
  parts.push(`\n**关联术语**：${sub}、${sub3}相关概念`);
  parts.push(`\n**在民俗学中的应用**：${cn}为理解和分析相关民俗现象提供了概念框架。`);
  return parts.join('');
}

const generators = {
  '民俗事象': generateFolkCustomDef,
  '学科概念': generateAcademicDef,
  '理论术语': generateTheoryDef,
  '研究关键词': generateKeywordDef,
  '研究方法': generateMethodDef,
  '学者与学术体制': generateScholarDef,
};

let generated = 0;
let skipped = 0;

for (let i = 0; i < terms.length; i++) {
  if (detailed[String(i)]) { skipped++; continue; }
  const term = terms[i];
  const gen = generators[term[3]];
  if (!gen) { console.error(`Unknown category: ${term[3]} for: ${term[0]}`); continue; }
  detailed[String(i)] = gen(term);
  generated++;
}

console.log(`Generated: ${generated}, Skipped: ${skipped}, Total: ${terms.length}`);

fs.writeFileSync(path.join(__dirname, '../public/terms-detailed.json'), JSON.stringify(detailed));

for (let i = 0; i < terms.length; i++) {
  if (detailed[String(i)] && (!terms[i][6] || terms[i][6].length <= 10)) {
    terms[i][6] = detailed[String(i)];
  }
}

fs.writeFileSync(path.join(__dirname, '../public/terms.json'), JSON.stringify(terms));
console.log('Done. Updated public/terms-detailed.json and public/terms.json');
