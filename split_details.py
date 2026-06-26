#!/usr/bin/env python3
"""Split terms.json detail data into small chunk files by unicode-based initial for on-demand loading.

Uses a CJK code-point modulo heuristic (matching the client-side logic in useDetailedTerm.ts)
so both sides produce identical bucket assignments without shipping pinyin data to the browser.
"""
import json, os, sys
from pathlib import Path

BASE = Path(__file__).parent
PUBLIC = BASE / 'public'
DETAILS_DIR = PUBLIC / 'details'

def get_chunk_key(name):
    """Produces the same chunk key as the client-side getChunkKey() in useDetailedTerm.ts."""
    if not name:
        return 'en'
    c0 = ord(name[0])
    # CJK Unified Ideographs (0x4E00-0x9FFF) and Extension A (0x3400-0x4DBF)
    if (0x4e00 <= c0 <= 0x9fff) or (0x3400 <= c0 <= 0x4dbf):
        idx = (c0 - 0x4e00) % 26
        return chr(0x61 + idx)  # 'a' through 'z'
    return 'en'

# Load terms
with open(PUBLIC / 'terms.json', encoding='utf-8') as f:
    terms = json.load(f)

# Build chunks
chunks = {}
for t in terms:
    cn, detail = t[0], t[6] if len(t) >= 7 and t[6] else None
    if not detail:
        continue
    key = get_chunk_key(cn)
    chunks.setdefault(key, {})
    chunks[key][cn] = detail

# Write chunk files
DETAILS_DIR.mkdir(exist_ok=True)
sizes = {}
for key, data in sorted(chunks.items()):
    path = DETAILS_DIR / f'{key}.json'
    raw = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    with open(path, 'w', encoding='utf-8') as f:
        f.write(raw)
    sizes[key] = len(raw)

print(f'Details split into {len(chunks)} chunk files (modulo heuristic):')
for key, size in sorted(sizes.items(), key=lambda x: -x[1]):
    count = len(chunks[key])
    print(f'  {key}: {count} terms, {size/1024:.1f} KB')
print(f'\nTotal details: {sum(len(v) for v in chunks.values())}')
print(f'Details dir: {DETAILS_DIR}')
