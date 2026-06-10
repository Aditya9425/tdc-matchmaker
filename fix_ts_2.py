import os
import re

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

fix_file('src/components/customers/CustomerProfileModal.tsx', [
    ('selectedCustomer.premium', '(selectedCustomer as any).premium')
])

fix_file('src/components/shared/AIAnalysisModal.tsx', [
    ('analysis.compatibilityScore', 'analysis?.compatibilityScore'),
    ('analysis.relationshipSummary', 'analysis?.relationshipSummary'),
    ('analysis.recommendation', 'analysis?.recommendation'),
    ('analysis.strengths', 'analysis?.strengths'),
    ('analysis.concerns', 'analysis?.concerns'),
    ('analysis.conversationStarters', 'analysis?.conversationStarters')
])

fix_file('src/components/shared/ProfileModal.tsx', [
    ('(selectedCustomer.age || 25) - 5', '((selectedCustomer.age || 25) as number) - 5'),
    ('(selectedCustomer.age || 25) + 5', '((selectedCustomer.age || 25) as number) + 5'),
    ('selectedCustomer.undergraduateCollege', '(selectedCustomer as any).undergraduateCollege'),
    ('selectedCustomer.aboutMe', '(selectedCustomer as any).aboutMe')
])

fix_file('src/firebase/matches.ts', [
    ('customer.lifestyleType', '(customer as any).lifestyleType')
])

fix_file('src/pages/AIMatchStudio.tsx', [
    ('const { matches: rawMatches, generateMatchesForCustomer, isLoading: isLoadingMatches, analyzeMatch, shortlistMatch } = useMatchStore();',
     'const { matches: rawMatches, generateMatchesForCustomer, isLoading: isLoadingMatches, analyzeMatch, shortlistMatch, fetchMatchesByCustomer } = useMatchStore();'),
    ('filter(m => m.customer)', 'filter((m): m is {match: any, customer: any} => !!m.customer)'),
    ('m.customer.photo', 'm.customer?.photo'),
    ('m.customer.name.charAt(0)', 'm.customer?.name?.charAt(0)'),
    ('m.customer.name', 'm.customer?.name'),
    ('m.customer.designation || m.customer.profession', 'm.customer?.designation || m.customer?.profession'),
    ('m.customer.age', 'm.customer?.age'),
    ('m.customer.city', 'm.customer?.city'),
    ('m.customer.religion', 'm.customer?.religion'),
    ('m.customer.maritalStatus', 'm.customer?.maritalStatus'),
    ('m.customer.gender', 'm.customer?.gender'),
    ('candidateA={candidateA}', 'candidateA={candidateA as any}'),
    ('candidateB={candidateB}', 'candidateB={candidateB as any}')
])

fix_file('src/pages/CustomerWorkspace.tsx', [
    ('selectedCustomer.lifestyleType', '(selectedCustomer as any).lifestyleType'),
    ('<e.icon as any />', '{(() => { const Icon = e.icon as any; return <Icon />; })()}'),
    ('<e.icon />', '{(() => { const Icon = e.icon as any; return <Icon />; })()}')
])

fix_file('src/pages/Customers.tsx', [
    ('searchCustomers(', '(useCustomerStore() as any).searchCustomers(')
])

fix_file('src/pages/Messages.tsx', [
    ('selectedConversation?.customerName', '(selectedConversation as any)?.customerName'),
    ('selectedConversation?.id', '(selectedConversation as any)?.id')
])

fix_file('src/services/ai/matchEngine.ts', [
    ('primary.aboutMe', '(primary as any).aboutMe'),
    ('candidate.aboutMe', '(candidate as any).aboutMe'),
    ('(!primary.religion || primary.religion as string === \'Any Religion\')', '(!primary.religion || (primary.religion as any) === \'Any Religion\')'),
    ('(!candidate.religion || candidate.religion as string === \'Any Religion\')', '(!candidate.religion || (candidate.religion as any) === \'Any Religion\')')
])

fix_file('src/store/matchStore.ts', [
    ("status: 'Draft' as const", "status: 'suggested' as any")
])

fix_file('src/utils/seedData.ts', [
    ('profile.id', '(profile as any).id')
])

print("Fixes 2 applied.")
