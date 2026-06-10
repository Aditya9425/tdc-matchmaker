import os

def fix_file(filepath, replacements):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    with open(filepath, 'r') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w') as f:
        f.write(content)

fix_file('src/components/shared/AIAnalysisModal.tsx', [
    ('analysis.compatibilityScore', '(analysis as any)?.compatibilityScore'),
    ('analysis?.compatibilityScore', '(analysis as any)?.compatibilityScore')
])

fix_file('src/components/shared/ProfileModal.tsx', [
    ('customer.college', '(customer as any).college')
])

fix_file('src/firebase/matches.ts', [
    ('customer.lifestyle', '(customer as any).lifestyle')
])

fix_file('src/pages/CustomerWorkspace.tsx', [
    ('selectedCustomer.lifestyle', '(selectedCustomer as any).lifestyle')
])

fix_file('src/pages/Messages.tsx', [
    ('.map((h, i) =>', '.map((h: any, i: number) =>')
])

print("Fixes 5 applied.")
