import re
import sys

def parse_jsx(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove JSX comments
    content = re.sub(r'{\/\*.*?\*\/}', lambda m: ' ' * len(m.group(0)), content, flags=re.DOTALL)
    # Remove standard comments
    content = re.sub(r'\/\/.*', '', content)
    content = re.sub(r'\/\*.*?\*\/', '', content, flags=re.DOTALL)
    
    # Let's find all JSX tags: <tag, </tag>, />
    # We only care about div, DocumentationSidebar, and other tags that might contain divs
    # Let's tokenize by looking for:
    # 1. Opening tags: <([a-zA-Z0-9_.-]+)
    # 2. Closing tags: <\/([a-zA-Z0-9_.-]+)>
    # 3. Self-closing tags: <([a-zA-Z0-9_.-]+)[^>]*\/>
    
    tokens = re.finditer(r'<([a-zA-Z0-9_:-]+)(?:\s+[^>]*?)?(\/)?>|<\/([a-zA-Z0-9_:-]+)>', content)
    
    stack = []
    line_starts = [0]
    for line in content.splitlines():
        line_starts.append(line_starts[-1] + len(line) + 1)
        
    def get_line_num(pos):
        for idx, start in enumerate(line_starts):
            if start > pos:
                return idx
        return len(line_starts) - 1

    for match in tokens:
        pos = match.start()
        line_num = get_line_num(pos)
        
        if match.group(3):
            # Closing tag
            tag_name = match.group(3)
            if tag_name in ['div', 'DocumentationSidebar']:
                # Find matching opening tag in stack
                found = False
                for idx in range(len(stack) - 1, -1, -1):
                    if stack[idx]['name'] == tag_name:
                        # Pop all elements above it
                        popped = stack[idx:]
                        stack = stack[:idx]
                        print(f"[{line_num}] Popped </{tag_name}>, matched line {popped[0]['line']}. Popped elements: {[x['name'] + '@' + str(x['line']) for x in popped]}")
                        found = True
                        break
                if not found:
                    print(f"[{line_num}] Error: Extra closing </{tag_name}>")
        else:
            # Opening or self-closing tag
            tag_name = match.group(1)
            is_self_closing = match.group(2) == '/'
            
            # Check if self-closing by looking at tag content or attribute end
            if not is_self_closing:
                # If tag ends with />
                full_tag = match.group(0)
                if full_tag.endswith('/>'):
                    is_self_closing = True
            
            if tag_name in ['div', 'DocumentationSidebar'] and not is_self_closing:
                stack.append({'name': tag_name, 'line': line_num})
                print(f"[{line_num}] Pushed <{tag_name}>")

    print(f"\nRemaining unclosed elements in stack: {len(stack)}")
    for item in stack:
        print(f"Line {item['line']}: <{item['name']}>")

if __name__ == '__main__':
    parse_jsx(sys.argv[1])
