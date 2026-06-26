#!/usr/bin/env python3
import json

# 读取数据
with open('terms.json', 'r', encoding='utf-8') as f:
    terms = json.load(f)

with open('terms-detailed.json', 'r', encoding='utf-8') as f:
    terms_detailed = json.load(f)

# 筛选西方学者条目
western_scholars = []
for i, term in enumerate(terms):
    # term格式：[术语, 英文名, 简短定义, category, subCategory, 更细分, 详细释义]
    if len(term) >= 6:
        category = term[3]
        sub_category = term[4]
        if category == '学者与学术体制' and sub_category == '西方学者':
            western_scholars.append({
                'index': i,
                'term': term[0],
                'english_name': term[1],
                'short_def': term[2],
                'detailed': terms_detailed.get(str(i), '')
            })

print(f"总共找到 {len(western_scholars)} 个西方学者条目")

# 检查模板化内容
template_patterns = [
    "**定义**：", "**学术出处**：", "**学术脉络**：", "**关联术语**：",
    "**提出背景**：", "**经典原文/核心命题**：", "**在民俗学中的应用**：", "**争议或局限**：",
    "在民俗学中的应用", "争议或局限", "学术脉络", "关联术语"
]

def has_template_content(text):
    """检查是否包含模板化内容"""
    for pattern in template_patterns:
        if pattern in text:
            return True
    return False

# 统计需要优化的学者
need_optimization = []
already_optimized = []

for scholar in western_scholars:
    if has_template_content(scholar['detailed']):
        need_optimization.append(scholar)
    else:
        already_optimized.append(scholar)

print(f"需要优化的学者: {len(need_optimization)}")
print(f"已经优化的学者: {len(already_optimized)}")

# 输出需要优化的学者信息
print("\n需要优化的学者列表:")
for i, scholar in enumerate(need_optimization):
    print(f"{i+1}. {scholar['term']} ({scholar['english_name']}) - 索引: {scholar['index']}")
    print(f"   简短定义: {scholar['short_def'][:100]}...")
    print()