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

# 更精确的检测：检查是否缺少新格式字段或字数不足
new_format_fields = ['**简介**：', '**英文名**：', '**学术领域**：', '**学术贡献**：', '**学术影响**：']

def needs_optimization(text, min_length=300):
    """检查是否需要优化"""
    if not text or len(text) < min_length:
        return True
    
    # 检查是否包含新格式字段
    has_new_format = all(field in text for field in new_format_fields)
    
    # 如果缺少新格式字段，需要优化
    if not has_new_format:
        return True
    
    return False

# 统计需要优化的学者
need_optimization = []
already_optimized = []

for scholar in western_scholars:
    if needs_optimization(scholar['detailed']):
        need_optimization.append(scholar)
    else:
        already_optimized.append(scholar)

print(f"需要优化的学者: {len(need_optimization)}")
print(f"已经优化的学者: {len(already_optimized)}")

# 输出需要优化的学者信息
if need_optimization:
    print("\n需要优化的学者列表:")
    for i, scholar in enumerate(need_optimization):
        print(f"{i+1}. {scholar['term']} ({scholar['english_name']}) - 索引: {scholar['index']}")
        print(f"   简短定义: {scholar['short_def'][:100]}...")
        print(f"   当前释义长度: {len(scholar['detailed'])} 字")
        print()

# 检查已完成的批处理文件
import os
batch_dir = '/tmp/scholar_updates/'
if os.path.exists(batch_dir):
    existing_files = [f for f in os.listdir(batch_dir) if f.startswith('western_batch_')]
    print(f"\n已存在的批处理文件: {len(existing_files)}")
    if existing_files:
        print("文件列表:", sorted(existing_files))
else:
    print("\n批处理目录不存在")