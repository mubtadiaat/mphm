import os
import glob

def get_markdown_files(directory):
    return glob.glob(os.path.join(directory, "*.md"))

old_dir = r"d:\DEVELZY\MPHM_V.02\.develzy\Blueprint_lama"
new_dir = r"d:\DEVELZY\MPHM_V.02\.develzy"

old_files = get_markdown_files(old_dir)
new_files = [f for f in get_markdown_files(new_dir) if "Blueprint_lama" not in f]

with open(r"d:\DEVELZY\MPHM_V.02\scratch\old_blueprints.txt", "w", encoding="utf-8") as f:
    for file in old_files:
        f.write(f"\n{'='*50}\nFILE: {os.path.basename(file)}\n{'='*50}\n")
        with open(file, "r", encoding="utf-8") as rf:
            f.write(rf.read())

with open(r"d:\DEVELZY\MPHM_V.02\scratch\new_blueprints.txt", "w", encoding="utf-8") as f:
    for file in new_files:
        f.write(f"\n{'='*50}\nFILE: {os.path.basename(file)}\n{'='*50}\n")
        with open(file, "r", encoding="utf-8") as rf:
            f.write(rf.read())

print("Collation done.")
