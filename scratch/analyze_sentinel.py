import re

with open(r'd:\lombapuai\frontend\src\app\dashboard\sentinel\page.tsx', 'r', encoding='utf-8') as f:
    lines = f.read().split('\n')

# We know after line 517 depth should be 4
# Let's simulate starting AT depth=4 from line 518 and trace exactly
depth = 4
stack_depth = [('L311','outer'),('L312','flex-relative'),('L313','flex-1'),('L454','max-w')]  # symbolic

START = 518
END = 810

print(f"Starting simulation at line {START} with depth={depth}\n")

for i, line in enumerate(lines, start=1):
    if i < START or i > END:
        continue

    stripped = line.strip()
    opens = len(re.findall(r'<div(?:\s[^>]*[^/])?>', stripped))
    closes = len(re.findall(r'</div>', stripped))
    self_cls = len(re.findall(r'<div[^>]*/>', stripped))
    net_opens = opens - self_cls

    old_depth = depth
    depth += net_opens
    depth -= closes

    # Flag lines where depth drops below where it should be
    # Section 1 content should stay >= 4 (the 4 outer wrappers)
    # Inside section content (inside the grid at 520), min depth should be 5
    flag = ''
    if closes > 0 and depth < 4:
        flag = f'  *** DROPS BELOW 4! (was {old_depth}) ***'
    
    if net_opens > 0 or closes > 0:
        direction = f'+{net_opens}' if net_opens > 0 else ''
        direction += f'-{closes}' if closes > 0 else ''
        print(f"L{i:4}: {direction} => d={depth}{flag}")
        if flag:
            print(f"       Content: {stripped[:80]}")

print(f"\nDepth after line {END}: {depth}")
