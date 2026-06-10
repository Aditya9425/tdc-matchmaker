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
    ('matchData?.match.compatibilityScore', '(matchData?.match as any)?.compatibilityScore')
])

fix_file('src/components/shared/ProfileModal.tsx', [
    ('Math.floor(customer.height / 12)', 'Math.floor((customer as any).height / 12)'),
    ('customer.height % 12', '(customer as any).height % 12'),
    ('{customer.college}', '{(customer as any).college}'),
    ('{customer.personalityType || \'Unknown\'}', '{(customer as any).personalityType || \'Unknown\'}')
])

fix_file('src/firebase/matches.ts', [
    ('customer.lifestyle', '(customer as any).lifestyle')
])

fix_file('src/pages/CustomerWorkspace.tsx', [
    ('selectedCustomer.lifestyle', '(selectedCustomer as any).lifestyle'),
    ('<e.icon as any className="w-4 h-4" />', '{(() => { const Icon = e.icon as any; return <Icon className="w-4 h-4" />; })()}')
])

fix_file('src/pages/Messages.tsx', [
    ('selectedConversation.matchHighlights', '(selectedConversation as any)?.matchHighlights')
])

fix_file('src/services/ai/matchEngine.ts', [
    ('c1.personalityType', '(c1 as any).personalityType'),
    ('c2.personalityType', '(c2 as any).personalityType'),
    ('c1.religion === \'Any Religion\'', '(c1.religion as any) === \'Any Religion\''),
    ('c2.religion === \'Any Religion\'', '(c2.religion as any) === \'Any Religion\'')
])

print("Fixes 4 applied.")
