/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft, Sparkles, Heart, MapPin, Send, GitCompare,
  CheckCircle2, ChevronRight, CheckSquare, SearchX, RefreshCcw, Search
} from 'lucide-react';
import { useCustomerStore } from '@/store/customerStore';
import { useMatchStore } from '@/store/matchStore';
import { cn } from '@/utils';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { Separator } from '@/components/ui/separator';

import { ProfileModal } from '@/components/shared/ProfileModal';
import { AIAnalysisModal } from '@/components/shared/AIAnalysisModal';
import { ComparisonModal } from '@/components/shared/ComparisonModal';

export default function AIMatchStudio() {
  const { customers, fetchCustomers } = useCustomerStore();
  const { matches: rawMatches, generateMatchesForCustomer, isLoading: isLoadingMatches, analyzeMatch, shortlistMatch, fetchMatchesByCustomer } = useMatchStore();
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const customerIdParam = searchParams.get('customerId');
  
  // Modals State
  const [profileToView, setProfileToView] = useState<any>(null);
  const [analysisDataToView, setAnalysisDataToView] = useState<{match: any, customer: any} | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  
  // Selection state for Comparison Mode
  const [selectedMatchIds, setSelectedMatchIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Send Match workflow
  const [matchToSend, setMatchToSend] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);
  const [generatedIntro, setGeneratedIntro] = useState<string>('');
  const [introTone, setIntroTone] = useState<'Formal' | 'Friendly' | 'Premium'>('Formal');

  const navigate = useNavigate();

  useEffect(() => {
    if (customers.length === 0) {
      fetchCustomers();
    }
  }, [customers.length, fetchCustomers]);

  useEffect(() => {
    if (customers.length > 0) {
      if (customerIdParam) {
        const urlCustomer = customers.find(c => c.id === customerIdParam);
        if (urlCustomer && selectedCustomer?.id !== urlCustomer.id) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setSelectedCustomer(urlCustomer);
        }
      } else if (!selectedCustomer) {
        // Default to first customer if no URL param
        setSelectedCustomer(customers[0]);
        setSearchParams({ customerId: customers[0].id }, { replace: true });
      }
    }
  }, [customers, customerIdParam, selectedCustomer, setSearchParams]);

  useEffect(() => {
    if (selectedCustomer && customers.length > 1) {
      generateMatchesForCustomer(selectedCustomer, customers);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedMatchIds([]); // Reset selection on customer change
      setProfileToView(null);
      setAnalysisDataToView(null);
      setIsCompareModalOpen(false);
    }
  }, [selectedCustomer, generateMatchesForCustomer, customers]);

  const handleGenerateProfiles = async () => {
    setIsSeeding(true);
    try {
      const { seedDummyProfiles } = await import('@/utils/seedData');
      await seedDummyProfiles(200);
      await fetchCustomers();
    } catch (err: any) {
      console.error('Failed to seed profiles', err);
    } finally {
      setIsSeeding(false);
    }
  };

  const matchData = useMemo(() => {
    return rawMatches.map(m => {
      const otherId = m.customerId === selectedCustomer?.id ? m.matchedCustomerId : m.customerId;
      const other = customers.find(c => c.id === otherId);
      return { match: m, customer: other };
    }).filter((m): m is {match: any, customer: any} => !!m.customer).slice(0, 6);
  }, [rawMatches, selectedCustomer, customers]);

  const avgScore = matchData.length > 0 
    ? Math.round(matchData.reduce((acc, curr) => acc + curr.match.compatibilityScore, 0) / matchData.length)
    : 0;

  const toggleMatchSelection = (matchId: string) => {
    setSelectedMatchIds(prev => 
      prev.includes(matchId) 
        ? prev.filter(id => id !== matchId)
        : [...prev, matchId]
    );
  };

  const handleSendMatch = async () => {
    setIsSending(true);
    await new Promise(r => setTimeout(r, 1000)); // Mock network
    setIsSending(false);
    setMatchToSend(null);
    // Real implementation would show a toast from the store
  };

  const handleAnalyzeMatch = async (m: {match: any, customer: any}) => {
    // Open modal immediately
    setAnalysisDataToView({ match: m.match, customer: m.customer });
    
    // Check if it's already cached
    if (m.match.aiAnalysis) return;
    
    setIsAnalyzing(m.match.id);
    const updatedMatch = await analyzeMatch(m.match, selectedCustomer, m.customer);
    // Update modal with results
    setAnalysisDataToView({ match: updatedMatch, customer: m.customer });
    setIsAnalyzing(null);
  };

  useEffect(() => {
    if (matchToSend && selectedCustomer) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGeneratedIntro('Generating personalized intro...');
      import('@/services/ai/introGenerator').then(({ introGenerator }) => {
        introGenerator.generateIntro(selectedCustomer, matchToSend.customer, introTone).then(draft => {
          setGeneratedIntro(`Subject: ${draft.subject}\n\n${draft.body}`);
        }).catch(() => {
          setGeneratedIntro('Failed to generate intro.');
        });
      });
    } else {
      setGeneratedIntro('');
    }
  }, [matchToSend, selectedCustomer, introTone]);

  const isInvalidCustomer = customerIdParam && customers.length > 0 && !customers.find(c => c.id === customerIdParam);

  if (isInvalidCustomer) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-slate-50">
        <Card className="border-slate-200 shadow-sm bg-white max-w-md w-full">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <SearchX className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Customer not found</h3>
            <p className="text-sm text-slate-500 mb-6">
              The customer ID provided in the URL does not exist.
            </p>
            <Button onClick={() => navigate('/customers')} className="bg-primary hover:bg-primary/90 text-white shadow-sm w-full">
              Return to Customers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedCustomer && customers.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-slate-50">
        <Card className="border-slate-200 shadow-sm bg-white max-w-md w-full">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            {isSeeding ? (
              <>
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Generating Demo Profiles...</h3>
                <p className="text-sm text-slate-500">Please wait while we seed the database with 200 candidates.</p>
              </>
            ) : (
              <>
                <SearchX className="w-16 h-16 text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">No profiles available.</h3>
                <p className="text-sm text-slate-500 mb-6">
                  You need candidate profiles in the system to use the AI Match Studio.
                </p>
                <Button onClick={handleGenerateProfiles} className="bg-primary hover:bg-primary/90 text-white shadow-sm w-full">
                  <Sparkles className="w-4 h-4 mr-2" /> Generate Demo Profiles
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const candidateA = isCompareModalOpen && selectedMatchIds[0] ? matchData.find(m => m.match.id === selectedMatchIds[0])?.customer : null;
  const candidateB = isCompareModalOpen && selectedMatchIds[1] ? matchData.find(m => m.match.id === selectedMatchIds[1])?.customer : null;

  return (
    <div className="h-full flex flex-col pb-20 lg:pb-0 bg-slate-50 max-w-[1600px] mx-auto w-full">
      {/* Header */}
      <div className="px-6 md:px-8 py-6 border-b border-slate-200 bg-white shrink-0 sticky top-0 z-20 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" /> Client Profile
              </h2>
            </div>
            <CustomerSearchableDropdown 
              customers={customers} 
              selectedCustomer={selectedCustomer} 
              onSelect={(c: any) => setSearchParams({ customerId: c.id })} 
            />
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="bg-white border-slate-200 text-slate-700 shadow-sm"
              onClick={() => {
                if (selectedMatchIds.length !== 2) {
                  import('react-hot-toast').then(toast => {
                    toast.default.error('Please select exactly 2 candidates to compare.');
                  });
                  return;
                }
                setIsCompareModalOpen(true);
              }}
            >
              <GitCompare className="w-4 h-4 mr-2" />
              Compare Selected
              {selectedMatchIds.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">
                  {selectedMatchIds.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="flex flex-col lg:flex-row h-full min-h-0">
          
          {/* Left Column - Sticky Profile (Desktop) */}
          <div className="w-full lg:w-[340px] xl:w-[380px] shrink-0 border-r border-slate-200 bg-white p-6 lg:p-8 lg:sticky lg:top-0 lg:h-[calc(100vh-85px)] overflow-y-auto no-scrollbar">
            <button
              onClick={() => navigate('/customers')}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Customers
            </button>

            {selectedCustomer ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-24 h-24 border-4 border-slate-50 shadow-sm mb-4">
                    <AvatarImage src={selectedCustomer.photo} />
                    <AvatarFallback className="bg-slate-100 text-slate-400 text-xl font-bold">
                      {selectedCustomer.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-1.5">
                    {selectedCustomer.name}
                    {selectedCustomer.verified && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  </h2>
                  <p className="text-sm font-medium text-slate-500 mt-1">
                    {selectedCustomer.designation || 'Professional'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedCustomer.age} yrs • {selectedCustomer.city}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100">
                      Active Matching
                    </Badge>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                      {selectedCustomer.religion || 'Any Religion'}
                    </Badge>
                  </div>
                </div>

                <Separator className="bg-slate-100" />

                <div>
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" /> AI Relationship Snapshot
                  </h3>
                  <div className="space-y-3">
                    <SnapshotRow icon="🎯" label="Goal" value={selectedCustomer.relationshipGoal || 'Long-term'} />
                    <SnapshotRow icon="👨‍👩‍👧" label="Family" value={selectedCustomer.familyOrientation || 'Traditional'} />
                    <SnapshotRow icon="💼" label="Career" value={selectedCustomer.careerFocus || 'Ambitious'} />
                    <SnapshotRow icon="🔄" label="Flexibility" value={selectedCustomer.flexibility || 'High'} />
                  </div>
                </div>

                <Card className="bg-primary/5 border-primary/10 shadow-sm">
                  <CardContent className="p-5 text-center">
                    <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Base Profile Score</div>
                    <div className="text-3xl font-extrabold text-primary mb-3">{selectedCustomer.aiScore || 85}%</div>
                    <Progress value={selectedCustomer.aiScore || 85} className="h-2 bg-white" indicatorClassName="bg-primary" />
                  </CardContent>
                </Card>

                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-sm" onClick={() => setProfileToView(selectedCustomer)}>
                  View Full Profile
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col items-center">
                  <Skeleton className="w-24 h-24 rounded-full mb-4" />
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Separator />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Matches Area */}
          <div className="flex-1 p-6 md:p-8 lg:p-10 bg-slate-50 overflow-y-auto no-scrollbar">
            
            {/* Top Analysis Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Discovery Matches</h2>
                <p className="text-sm text-slate-500 max-w-xl">
                  Our AI has analyzed {selectedCustomer?.name?.split(' ')[0]}'s profile against thousands of candidates and identified these top potential matches based on core values and lifestyle preferences.
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">{matchData.length}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Matches Found</div>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-600">{avgScore}%</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Compatibility</div>
                </div>
              </div>
            </div>

            {/* Error / Empty State */}
            {!isLoadingMatches && matchData.length === 0 && (
              <Card className="border-slate-200 shadow-sm bg-white">
                <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                  <SearchX className="w-16 h-16 text-slate-300 mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No active matches found</h3>
                  <p className="text-sm text-slate-500 max-w-md mb-6">
                    We couldn't find any high-compatibility matches at this moment. The AI engine is continuously analyzing new profiles.
                  </p>
                  <Button variant="outline" className="border-slate-200 shadow-sm" onClick={() => fetchMatchesByCustomer(selectedCustomer?.id)}>
                    <RefreshCcw className="w-4 h-4 mr-2" /> Refresh Analysis
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {isLoadingMatches && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">AI matches are being generated</h3>
                <p className="text-sm text-slate-500 mb-8 max-w-md text-center">
                  Please hold on while our AI scans thousands of profiles to find the best compatibility matches for {selectedCustomer?.name?.split(' ')[0] || 'this client'}.
                </p>
                <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <Card key={i} className="border-slate-100 shadow-sm opacity-50">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-12 h-12 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Matches Grid */}
            {!isLoadingMatches && matchData.length > 0 && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {matchData.map((m) => {
                  const isSelected = selectedMatchIds.includes(m.match.id);
                  const score = m.match.compatibilityScore;
                  const isHighMatch = score >= 90;

                  return (
                    <Card 
                      key={m.match.id || `fallback-${m.customer.id}`} 
                      className={cn(
                        "transition-all duration-200 border-slate-200 shadow-sm hover:shadow-md bg-white overflow-hidden group",
                        isSelected ? "ring-2 ring-primary border-transparent" : ""
                      )}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex items-start gap-4">
                            <Checkbox 
                              checked={isSelected} 
                              onCheckedChange={() => toggleMatchSelection(m.match.id)}
                              className="mt-1.5"
                            />
                            <Avatar className="w-16 h-16 border-2 border-slate-50 shadow-sm">
                              <AvatarImage src={m.customer?.photo} />
                              <AvatarFallback className="bg-slate-100 text-slate-500 font-bold">
                                {m.customer?.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                                {m.customer?.name}
                              </h3>
                              <p className="text-xs font-medium text-slate-500 mt-1">
                                {m.customer?.designation || m.customer?.profession || 'Professional'}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                                {m.customer?.age} yrs • <MapPin className="w-3 h-3" /> {m.customer?.city}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className={cn("text-2xl font-extrabold tracking-tight", isHighMatch ? "text-emerald-600" : "text-amber-600")}>
                              {score}%
                            </div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                              Match Score
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4 pl-8">
                          {m.customer?.religion && <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px]">{m.customer?.religion}</Badge>}
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px]">{m.customer?.maritalStatus || 'Never Married'}</Badge>
                          {m.match.reasons[0] && (
                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px]">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> {m.match.reasons[0].split(' ')[0]} Aligned
                            </Badge>
                          )}
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-5 pl-8 ml-6 relative">
                          <div className="absolute left-0 top-6 -translate-x-1/2 w-8 h-8 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-sm">
                            <Sparkles className="w-4 h-4 text-primary" />
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            {m.match.reasons.join('. ')}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pl-8">
                          <Button variant="outline" className="flex-1 border-slate-200 bg-white text-slate-700 shadow-sm text-xs h-9 min-w-[120px]" onClick={() => setProfileToView(m.customer)}>
                            View Profile
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1 border-primary/20 bg-primary/5 text-primary shadow-sm text-xs h-9 min-w-[120px]"
                            onClick={() => handleAnalyzeMatch(m)}
                            disabled={isAnalyzing === m.match.id}
                          >
                            {isAnalyzing === m.match.id ? (
                              <div className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-1.5" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                            )}
                            AI Analysis
                          </Button>
                          <Button variant="outline" className="flex-1 border-slate-200 bg-white text-slate-700 shadow-sm text-xs h-9 min-w-[120px]" onClick={() => toggleMatchSelection(m.match.id)}>
                            <GitCompare className="w-3.5 h-3.5 mr-1.5" /> {isSelected ? 'Selected' : 'Compare'}
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1 border-slate-200 bg-white text-slate-700 shadow-sm text-xs h-9 min-w-[120px]"
                            onClick={() => shortlistMatch(m.match.id)}
                            disabled={m.match.status === 'shortlisted'}
                          >
                            <CheckSquare className="w-3.5 h-3.5 mr-1.5" /> {m.match.status === 'shortlisted' ? 'Shortlisted' : 'Shortlist'}
                          </Button>
                          <Button 
                            className="flex-[2] bg-primary hover:bg-primary/90 text-white shadow-sm text-xs h-9 min-w-[140px]"
                            onClick={() => setMatchToSend(m)}
                          >
                            <Send className="w-3.5 h-3.5 mr-1.5" /> Send Match
                          </Button>
                        </div>
                        
                        {/* Priority 6: Debug Information */}
                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-4 text-[10px] font-mono text-slate-400 bg-slate-50/50 -mx-6 -mb-6 px-6 py-2 rounded-b-xl">
                          <div>
                            <span className="font-bold text-slate-500">P_GEN:</span> {selectedCustomer?.gender?.toUpperCase() || 'N/A'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-500">C_GEN:</span> {m.customer?.gender?.toUpperCase() || 'N/A'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-500">B_SCORE:</span> {m.match.compatibilityScore}
                          </div>
                        </div>

                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Send Match AlertDialog */}
      <AlertDialog open={!!matchToSend} onOpenChange={(open) => !open && setMatchToSend(null)}>
        <AlertDialogContent size="sm" className="bg-white border-slate-200 shadow-xl rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-900 text-center">Confirm Match Proposal</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              You are about to propose a match between <span className="font-bold text-slate-900">{selectedCustomer?.firstName}</span> and <span className="font-bold text-slate-900">{matchToSend?.customer?.firstName}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {matchToSend && (
            <div className="py-6">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="text-center space-y-2">
                  <Avatar className="w-16 h-16 mx-auto border-2 border-slate-100 shadow-sm">
                    <AvatarImage src={selectedCustomer?.photo} />
                  </Avatar>
                  <div className="text-xs font-semibold text-slate-700">{selectedCustomer?.firstName}</div>
                </div>
                <div className="flex flex-col items-center">
                  <Heart className="w-5 h-5 text-primary mb-1 fill-primary/20" />
                  <div className="text-lg font-bold text-slate-900">{matchToSend.match.compatibilityScore}%</div>
                </div>
                <div className="text-center space-y-2">
                  <Avatar className="w-16 h-16 mx-auto border-2 border-slate-100 shadow-sm">
                    <AvatarImage src={matchToSend.customer?.photo} />
                  </Avatar>
                  <div className="text-xs font-semibold text-slate-700">{matchToSend.customer?.firstName}</div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed font-medium">
                <strong className="text-slate-900 block mb-1">AI Match Summary:</strong>
                {matchToSend.match.reasons[0]}. Both share strong alignment in core demographics.
              </div>

              <div className="mt-4">
                <strong className="text-slate-900 text-xs block mb-2">AI Generated Introduction:</strong>
                
                <div className="flex gap-2 mb-3">
                  {['Formal', 'Friendly', 'Premium'].map((t) => (
                    <Button 
                      key={t}
                      variant={introTone === t ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 text-[10px] flex-1"
                      onClick={() => setIntroTone(t as 'Formal' | 'Friendly' | 'Premium')}
                    >
                      {t}
                    </Button>
                  ))}
                </div>

                <textarea 
                  className="w-full h-32 p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  value={generatedIntro}
                  onChange={(e) => setGeneratedIntro(e.target.value)}
                />
              </div>
            </div>
          )}

          <AlertDialogFooter className="sm:justify-center gap-3">
            <AlertDialogCancel className="w-full sm:w-1/2 bg-white text-slate-700 border-slate-200 shadow-sm" disabled={isSending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSendMatch} className="w-full sm:w-1/2 bg-primary hover:bg-primary/90 text-white shadow-sm" disabled={isSending}>
              {isSending ? 'Sending Proposal...' : 'Confirm Send'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {/* Modals */}
      <ProfileModal 
        customer={profileToView} 
        isOpen={!!profileToView} 
        onClose={() => setProfileToView(null)} 
      />
      <AIAnalysisModal
        matchData={analysisDataToView}
        primaryCustomer={selectedCustomer}
        isOpen={!!analysisDataToView}
        isLoading={!!isAnalyzing}
        onClose={() => setAnalysisDataToView(null)}
      />
      <ComparisonModal
        primaryCustomer={selectedCustomer}
        candidateA={candidateA as any}
        candidateB={candidateB as any}
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
      />
    </div>
  );
}

function SnapshotRow({ icon, label, value }: { icon: string, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
        <span className="w-5 text-center">{icon}</span> {label}
      </span>
      <span className="text-xs font-semibold text-slate-800">{value}</span>
    </div>
  );
}

function CustomerSearchableDropdown({ customers, selectedCustomer, onSelect }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.customer-dropdown-container')) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const filtered = useMemo(() => {
    if (!search) return customers;
    const lower = search.toLowerCase();
    return customers.filter((c: any) => 
      c.firstName?.toLowerCase().includes(lower) || 
      c.lastName?.toLowerCase().includes(lower) ||
      c.city?.toLowerCase().includes(lower) ||
      c.designation?.toLowerCase().includes(lower)
    );
  }, [search, customers]);

  return (
    <div className="relative customer-dropdown-container w-full sm:w-[320px]">
      <div 
        className="flex items-center justify-between px-4 py-2.5 bg-white border-2 border-primary/20 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-primary/40 transition-colors shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Reviewing Matches For</span>
          <span className="text-sm font-extrabold text-slate-900 truncate flex items-center gap-2">
            {selectedCustomer?.name || 'Select a client...'}
            {selectedCustomer?.verified && <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />}
          </span>
        </div>
        <ChevronRight className={cn("w-4 h-4 text-slate-400 transition-transform", isOpen && "rotate-90")} />
      </div>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 flex flex-col max-h-[400px]">
          <div className="p-3 border-b border-slate-100 flex items-center gap-2 sticky top-0 bg-white rounded-t-xl shrink-0">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input 
              type="text" 
              placeholder="Search clients..." 
              className="w-full text-sm outline-none bg-transparent placeholder:text-slate-400"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1 p-1.5">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">No clients found.</div>
            ) : (
              filtered.map((c: any) => (
                <div 
                  key={c.id} 
                  className={cn(
                    "px-3 py-2.5 flex items-center gap-3 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors",
                    selectedCustomer?.id === c.id && "bg-primary/5"
                  )}
                  onClick={() => {
                    onSelect(c);
                    setIsOpen(false);
                    setSearch('');
                  }}
                >
                  <Avatar className="w-9 h-9 shrink-0 border border-slate-200">
                    <AvatarImage src={c.photo} />
                    <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">{c.firstName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-slate-900 truncate">{c.name}</span>
                    <span className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
                      {c.age} yrs • {c.city} • {c.designation || 'Professional'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

