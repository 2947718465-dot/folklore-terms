#!/usr/bin/env python3
import json
import re

template_patterns = [
    "在.*方向有深入研究",
    "长期从事.*领域的研究工作",
    "在.*领域做出了重要学术贡献",
    "推动了.*的发展",
    "对.*领域的学术发展产生了积极影响",
    "其研究成果具有重要学术价值",
    "在.*领域取得了重要成果",
    "为.*的发展做出了重要贡献",
    "对.*领域产生了深远影响",
    "深入研究.*方向",
    "长期从事.*工作",
    "重要学术贡献",
    "积极影响",
    "重要学术价值",
    "具有重要的学术价值",
    "产生了积极影响",
    "推动了.*发展",
    "做出了重要贡献",
    "在.*方面有深入研究",
    "对.*产生了重要影响",
    "为.*提供了重要参考",
    "在.*领域具有重要地位",
    "其研究对.*产生了积极影响",
]

# Compile all patterns
compiled = [re.compile(p) for p in template_patterns]

with open('/Users/myron/research/folklore-terms/public/terms-detailed.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

template_entries = []
for key, value in data.items():
    if isinstance(value, dict):
        content = value.get('content_preview', '')
        name = value.get('name', '')
        english_name = value.get('english_name', '')
        index = value.get('index', '')
    elif isinstance(value, str):
        content = value
        # Extract name from content
        name_match = re.search(r'\*\*简介\*\*[：:](.*?)(?:[。\n])', content)
        name = name_match.group(1).strip()[:30] if name_match else f'entry_{key}'
        english_name = ''
        index = key
    else:
        continue
    
    # Check for template phrases
    matched_phrases = []
    for i, pattern in enumerate(compiled):
        if pattern.search(content):
            matched_phrases.append(template_patterns[i])
    
    if matched_phrases:
        template_entries.append({
            'key': key,
            'name': name,
            'english_name': english_name,
            'index': index,
            'matched_phrases': matched_phrases,
            'content_length': len(content)
        })

# Sort by number of matched phrases (most template-like first)
template_entries.sort(key=lambda x: len(x['matched_phrases']), reverse=True)

print(f"总计找到 {len(template_entries)} 个包含模板化内容的条目\n")

# Save to a temp file for inspection
with open('/tmp/scholar_updates/template_entries.json', 'w', encoding='utf-8') as f:
    json.dump(template_entries, f, ensure_ascii=False, indent=2)

# Print first 20
for i, entry in enumerate(template_entries[:20]):
    print(f"{i+1}. Key: {entry['key']}, Name: {entry['name'][:40]}, "
          f"Index: {entry['index']}, Matches: {len(entry['matched_phrases'])}, "
          f"ContentLen: {entry['content_length']}")
    for p in entry['matched_phrases'][:3]:
        print(f"   -> {p}")
