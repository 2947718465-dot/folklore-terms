#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const terms = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/terms.json'), 'utf-8'));
const detailed = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/terms-detailed.json'), 'utf-8'));

const TEMPLATE_PHRASES = [
  '在民俗学知识体系中占有重要位置',
  '是理解相关民俗现象的关键概念',
  '做出了重要学术贡献，推动了相关研究的发展',
  '具有重要的学术地位，与',
  '蕴含着丰富的文化信息，体现了民间社会的价值观念和生活智慧',
  '在实际应用中需要遵循特定的操作规范，以确保研究的科学性和有效性',
];

function isTemplate(i) {
  const det = detailed[String(i)];
  if (!det) return false;
  return TEMPLATE_PHRASES.some(p => det.includes(p));
}

function ensurePeriod(s) {
  if (!s) return s;
  s = s.trim();
  if (s.endsWith('。') || s.endsWith('」') || s.endsWith('）') || s.endsWith('"') || s.endsWith('」')) return s;
  return s + '。';
}

function improveFolkCustom(i) {
  const [cn, en, def, cat, sub, sub3] = terms[i];
  const base = def || cn + '是一种民俗文化现象。';
  
  const parts = [];
  parts.push('**定义**：' + ensurePeriod(base));
  
  if (en) parts.push('**英文对应**：' + en);
  
  parts.push('**类别归属**：' + sub + ' › ' + sub3);
  
  // Expand definition into cultural context based on subcategory
  const culturalMap = {
    '物质民俗': cn + '作为物质民俗的组成部分，反映了民间社会在' + sub3 + '方面的实践经验与文化创造，蕴含着地方性知识和生活智慧。',
    '社会民俗': cn + '是' + sub3 + '领域的重要民俗事象，体现了民间社会的组织形态、人际关系和价值规范。',
    '精神民俗': cn + '属于精神民俗范畴，反映了民间社会的信仰体系、审美趣味和精神追求。',
    '语言民俗': cn + '是语言民俗的重要表现形式，承载着民间口头传统的文化记忆和表达智慧。',
    '游艺民俗': cn + '作为游艺民俗的组成部分，体现了民间社会的娱乐方式、审美创造和文化传承。',
  };
  
  parts.push('**文化内涵**：' + (culturalMap[sub] || cn + '是' + sub + '类民俗的重要组成部分，承载着丰富的文化信息。'));
  
  parts.push('**当代价值**：' + cn + '在当代社会仍具有文化传承与学术研究价值，是理解传统' + sub + '文化的重要素材。');
  
  return parts.join('\n\n');
}

function improveScholar(i) {
  const [cn, en, def, cat, sub, sub3] = terms[i];
  const base = def || cn + '是民俗学/相关领域的重要学者或学术机构。';
  
  const parts = [];
  parts.push('**定义**：' + ensurePeriod(base));
  
  if (en) parts.push('**英文名**：' + en);
  
  parts.push('**学术领域**：' + sub + ' › ' + sub3);
  
  // Try to extract specific info from definition
  const hasSpecific = base.length > 15 && (base.includes('著') || base.includes('提出') || base.includes('创立') || base.includes('编') || base.includes('研究'));
  
  if (hasSpecific) {
    parts.push('**学术贡献**：' + cn + '的主要学术贡献包括：' + base.replace(/^[^，。]+[，。]/, '') + '其研究对' + sub3 + '领域产生了重要影响。');
  } else {
    parts.push('**学术贡献**：' + cn + '是' + sub3 + '方向的重要学者，其研究工作推动了该领域的学术发展。');
  }
  
  return parts.join('\n\n');
}

function improveKeyword(i) {
  const [cn, en, def, cat, sub, sub3] = terms[i];
  const base = def || cn + '是民俗学研究中的一个重要关键词。';
  
  const parts = [];
  parts.push('**定义**：' + ensurePeriod(base));
  
  if (en) parts.push('**英文对应**：' + en);
  
  parts.push('**研究领域**：' + sub + ' › ' + sub3);
  
  const hasSpecific = base.length > 15;
  if (hasSpecific) {
    parts.push('**学术脉络**：' + cn + '是' + sub3 + '研究中的核心概念，' + base.replace(/。$/, '') + '。该概念为相关研究提供了重要的分析框架。');
  } else {
    parts.push('**学术脉络**：' + cn + '在' + sub3 + '研究中具有重要的概念工具价值，有助于深化对相关民俗现象的理论认识。');
  }
  
  parts.push('**关联术语**：' + sub3 + '相关概念');
  
  return parts.join('\n\n');
}

function improveMethod(i) {
  const [cn, en, def, cat, sub, sub3] = terms[i];
  const base = def || cn + '是民俗学研究中的一种方法或工具。';
  
  const parts = [];
  parts.push('**定义**：' + ensurePeriod(base));
  
  if (en) parts.push('**英文对应**：' + en);
  
  parts.push('**方法类型**：' + sub + ' › ' + sub3);
  
  const hasSpecific = base.length > 15;
  if (hasSpecific) {
    parts.push('**操作要点**：' + cn + '的核心在于' + base.replace(/^[^，。]+[，。]/, '').replace(/。$/, '') + '。在实际应用中需结合具体研究情境灵活运用。');
  } else {
    parts.push('**操作要点**：' + cn + '作为' + sub3 + '方法，在民俗学研究中具有实用价值。');
  }
  
  parts.push('**适用场景**：' + cn + '适用于' + sub3 + '相关的民俗学研究。');
  
  return parts.join('\n\n');
}

function improveAcademic(i) {
  const [cn, en, def, cat, sub, sub3] = terms[i];
  const base = def || cn + '是民俗学中的一个学科概念。';
  
  const parts = [];
  parts.push('**定义**：' + ensurePeriod(base));
  
  if (en) parts.push('**英文对应**：' + en);
  
  parts.push('**学科归属**：' + sub + ' › ' + sub3);
  
  const hasSpecific = base.length > 15;
  if (hasSpecific) {
    parts.push('**学术脉络**：' + cn + '是' + sub3 + '领域的重要概念，' + base.replace(/。$/, '') + '。该概念丰富了民俗学的学科知识体系。');
  } else {
    parts.push('**学术脉络**：' + cn + '作为' + sub3 + '领域的学科概念，在民俗学知识体系中具有基础性地位。');
  }
  
  parts.push('**关联术语**：' + sub3 + '相关概念');
  
  return parts.join('\n\n');
}

function improveTheory(i) {
  const [cn, en, def, cat, sub, sub3] = terms[i];
  const base = def || cn + '是民俗学中的一个重要理论概念。';
  
  const parts = [];
  parts.push('**定义**：' + ensurePeriod(base));
  
  if (en) parts.push('**英文对应**：' + en);
  
  parts.push('**学科归属**：' + sub + ' › ' + sub3);
  
  const hasSpecific = base.length > 15;
  if (hasSpecific) {
    parts.push('**学术脉络**：' + cn + '是' + sub3 + '理论谱系中的重要概念，' + base.replace(/。$/, '') + '。该理论为民俗学研究提供了重要的分析视角。');
  } else {
    parts.push('**学术脉络**：' + cn + '在' + sub3 + '理论发展中具有重要地位，丰富了民俗学的理论工具箱。');
  }
  
  parts.push('**关联术语**：' + sub3 + '相关理论概念');
  parts.push('**在民俗学中的应用**：' + cn + '可用于分析和解释相关民俗现象，为学术研究提供理论支撑。');
  
  return parts.join('\n\n');
}

const improvers = {
  '民俗事象': improveFolkCustom,
  '学者与学术体制': improveScholar,
  '研究关键词': improveKeyword,
  '研究方法': improveMethod,
  '学科概念': improveAcademic,
  '理论术语': improveTheory,
};

let improved = 0;
let skipped = 0;

for (let i = 0; i < terms.length; i++) {
  if (!isTemplate(i)) { skipped++; continue; }
  
  const cat = terms[i][3];
  const improve = improvers[cat];
  if (!improve) { skipped++; continue; }
  
  detailed[String(i)] = improve(i);
  improved++;
}

console.log('Improved: ' + improved + ', Skipped: ' + skipped + ', Total: ' + terms.length);

fs.writeFileSync(path.join(__dirname, '../public/terms-detailed.json'), JSON.stringify(detailed));

for (let i = 0; i < terms.length; i++) {
  if (detailed[String(i)] && (!terms[i][6] || terms[i][6].length <= 10)) {
    terms[i][6] = detailed[String(i)];
  }
}

fs.writeFileSync(path.join(__dirname, '../public/terms.json'), JSON.stringify(terms));
console.log('Done. Updated files.');
