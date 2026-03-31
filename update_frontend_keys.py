import os
import glob

def rename_global_keys():
    files = glob.glob('/Users/ogkush/ipl-draft/src/**/*.tsx', recursive=True)
    count = 0
    for path in files:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if 'points2025' in content:
            # Globally swap all UI typings explicitly down to what the user defined
            new_content = content.replace('points2025', 'total_points_2026')
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"✅ Globally updated variable reference in: {path}")
            count += 1
            
    print(f"\nSuccessfully redirected React Component mapping across {count} TypeScript files.")

if __name__ == "__main__":
    rename_global_keys()
