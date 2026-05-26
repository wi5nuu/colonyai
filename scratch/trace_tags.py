import re
import sys

def trace_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove JSX comments
    content = re.sub(r'{\/\*.*?\*\/}', lambda m: ' ' * len(m.group(0)), content, flags=re.DOTALL)
    
    lines = content.splitlines()
    stack = []
    
    for i, line in enumerate(lines):
        line_num = i + 1
        # Simple tokenization of line to find <div, </div>, and multi-line or single-line self-closing
        # Let's find all occurrences of <div, </div>, />
        matches = re.finditer(r'<div\b|<\/div>|\/>', line)
        for m in matches:
            tok = m.group(0)
            if tok == '<div':
                stack.append((line_num, line.strip()))
            elif tok == '</div>':
                if stack:
                    popped = stack.pop()
                    print(f"[{line_num}] Closed div from line {popped[0]}: {popped[1][:40]}...")
                else:
                    print(f"[{line_num}] Error: Extra </div>")
            elif tok == '/>':
                # Self closing can be tricky. It could close a div or a different tag like <FlaskConical />
                # We can check if the current line or previous lines in JSX had a <div without a > before />.
                # But to keep it simple, since we only want to trace divs, let's look at the actual code structure.
                pass

    print(f"\nRemaining unclosed divs in stack: {len(stack)}")
    for line_num, text in stack:
        print(f"Line {line_num}: {text[:60]}")

if __name__ == '__main__':
    trace_file(sys.argv[1])
