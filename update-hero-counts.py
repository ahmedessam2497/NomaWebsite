import os, re

base = os.path.dirname(os.path.abspath(__file__))

folders = {
    'group': os.path.join(base, 'assets', 'hero-main'),
    'noma':  os.path.join(base, 'assets', 'hero-noma'),
    'beit':  os.path.join(base, 'assets', 'hero-beit'),
}

def count_images(folder):
    exts = ('.jpg', '.jpeg', '.png', '.webp')
    try:
        return len([f for f in os.listdir(folder) if f.lower().endswith(exts)])
    except:
        return 0

counts = {key: count_images(path) for key, path in folders.items()}

chrome_path = os.path.join(base, 'chrome.js')
with open(chrome_path, 'r', encoding='utf-8') as f:
    content = f.read()

for key, count in counts.items():
    content = re.sub(
        r"('" + key + r"'\s*:\s*\{[^}]*count\s*:\s*)\d+",
        lambda m, c=count: m.group(1) + str(c),
        content
    )

with open(chrome_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done! Hero image counts updated:")
for key, count in counts.items():
    print(f"  {key}: {count} images")
input("\nPress Enter to close.")
