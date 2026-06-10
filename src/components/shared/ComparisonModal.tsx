import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { GitCompare, CheckCircle2, AlertTriangle, Sparkles, TrendingUp, ShieldAlert } from 'lucide-react';
import type { Customer } from '@/types';
import { matchEngine } from '@/services/ai/matchEngine';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface ComparisonModalProps {
  primaryCustomer: Customer | null;
  candidateA: Customer | null;
  candidateB: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ComparisonResult {
  strongerCandidate: string;
  why: string;
  advantagesA: string[];
  risksA: string[];
  advantagesB: string[];
  risksB: string[];
  finalRecommendation: string;
}

export function ComparisonModal({ primaryCustomer, candidateA, candidateB, isOpen, onClose }: ComparisonModalProps) {
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);

  useEffect(() => {
    if (isOpen && primaryCustomer && candidateA && candidateB) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsComparing(true);
      matchEngine.compareCandidates(primaryCustomer, candidateA, candidateB)
        .then(res => setComparisonResult(res))
        .catch(() => setComparisonResult(null))
        .finally(() => setIsComparing(false));
    } else {
      setComparisonResult(null);
    }
  }, [isOpen, primaryCustomer, candidateA, candidateB]);

  if (!primaryCustomer || !candidateA || !candidateB) return null;

  const renderProfileColumn = (profile: Customer, role: 'Primary Customer' | 'Candidate A' | 'Candidate B') => (
    <div className={`space-y-6 bg-white p-6 rounded-2xl border ${role === 'Primary Customer' ? 'border-indigo-200 shadow-md ring-2 ring-indigo-50' : 'border-slate-200 shadow-sm'}`}>
      <div className="text-center pb-6 border-b border-slate-100">
        <Badge variant={role === 'Primary Customer' ? 'default' : 'secondary'} className={`mb-4 ${role === 'Primary Customer' ? 'bg-indigo-500 hover:bg-indigo-600 font-bold px-3 py-1' : 'bg-slate-100 text-slate-700 font-bold px-3 py-1'}`}>
          {role}
        </Badge>
        <Avatar className={`w-32 h-32 mx-auto border-4 shadow-sm mb-4 rounded-2xl ${role === 'Primary Customer' ? 'border-indigo-50' : 'border-slate-50'}`}>
          <AvatarImage src={profile.photo} className="object-cover" />
          <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold rounded-2xl">{profile.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <h3 className="text-2xl font-extrabold text-slate-900">{profile.name}</h3>
        <p className="text-sm font-medium text-slate-500 mt-1">{profile.profession || 'Professional'}</p>
      </div>

      <div className="space-y-5">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Demographics</div>
          <div className="text-sm font-medium text-slate-900">{profile.age} yrs • {profile.city}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Background</div>
          <div className="text-sm font-medium text-slate-900">{profile.religion} • {profile.caste || 'Any Community'}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Career & Income</div>
          <div className="text-sm font-medium text-slate-900">{profile.income || 'Not Specified'}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Education</div>
          <div className="text-sm font-medium text-slate-900">{profile.education}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Family & Lifestyle</div>
          <div className="text-sm font-medium text-slate-900">{profile.familyType || 'Unknown'} • {profile.diet || 'Unknown'}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Preferences</div>
          <div className="text-sm font-medium text-slate-900">
            Kids: {profile.wantKids || 'Unknown'}<br/>
            Relocate: {profile.openToRelocate || 'Unknown'}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="full" className="bg-slate-50 border-slate-200 shadow-2xl p-0 overflow-hidden rounded-2xl flex flex-col">
        {/* Header */}
        <DialogHeader className="p-6 bg-white border-b border-slate-100 shrink-0 sticky top-0 z-10 shadow-sm flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-extrabold text-slate-900 flex items-center gap-2 m-0">
            <GitCompare className="w-5 h-5 text-indigo-500" /> AI Comparison Engine
          </DialogTitle>
          {isComparing && (
            <div className="flex items-center gap-2 text-sm font-bold text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-full animate-pulse mt-0">
              <Sparkles className="w-4 h-4" /> Analyzing Compatibility...
            </div>
          )}
        </DialogHeader>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 no-scrollbar">
          
          {/* 3-Column Profile Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {renderProfileColumn(primaryCustomer, 'Primary Customer')}
            {renderProfileColumn(candidateA, 'Candidate A')}
            {renderProfileColumn(candidateB, 'Candidate B')}
          </div>

          {/* AI Analysis Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 mb-8">
              <Sparkles className="w-6 h-6 text-indigo-500" /> AI Head-to-Head Analysis
            </h2>
            
            {isComparing || !comparisonResult ? (
               <div className="space-y-6">
                <Skeleton className="h-24 w-full rounded-xl" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Skeleton className="h-48 rounded-xl" />
                  <Skeleton className="h-48 rounded-xl" />
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Winner Banner */}
                <div className="bg-indigo-900 rounded-xl shadow-sm p-8 text-center text-white relative overflow-hidden">
                  <Sparkles className="absolute -top-4 -right-4 w-40 h-40 text-indigo-500/20" />
                  <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">AI Verdict: Stronger Match</h3>
                  <div className="text-4xl font-extrabold mb-4">
                    {comparisonResult.strongerCandidate === 'A' ? candidateA.name : candidateB.name}
                  </div>
                  <p className="text-base font-medium text-indigo-100 leading-relaxed max-w-3xl mx-auto">
                    {comparisonResult.why}
                  </p>
                </div>

                {/* Pros/Cons Matrix */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Candidate A Analysis */}
                  <div className="space-y-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <h3 className="text-lg font-extrabold text-slate-900 text-center border-b border-slate-200 pb-4 mb-4">Candidate A: {candidateA.firstName}</h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2 mb-4">
                          <TrendingUp className="w-5 h-5 text-emerald-500" /> Advantages
                        </h4>
                        <ul className="space-y-3">
                          {comparisonResult.advantagesA.map((s: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Separator className="bg-slate-200" />
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2 mb-4">
                          <ShieldAlert className="w-5 h-5 text-amber-500" /> Potential Risks
                        </h4>
                        <ul className="space-y-3">
                          {comparisonResult.risksA.map((r: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Candidate B Analysis */}
                  <div className="space-y-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <h3 className="text-lg font-extrabold text-slate-900 text-center border-b border-slate-200 pb-4 mb-4">Candidate B: {candidateB.firstName}</h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2 mb-4">
                          <TrendingUp className="w-5 h-5 text-emerald-500" /> Advantages
                        </h4>
                        <ul className="space-y-3">
                          {comparisonResult.advantagesB.map((s: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Separator className="bg-slate-200" />
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2 mb-4">
                          <ShieldAlert className="w-5 h-5 text-amber-500" /> Potential Risks
                        </h4>
                        <ul className="space-y-3">
                          {comparisonResult.risksB.map((r: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-8 text-center">
                  <h3 className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-2">Final Recommendation</h3>
                  <p className="text-lg font-extrabold text-emerald-900">{comparisonResult.finalRecommendation}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
