/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { CompatibilityScoreBadge } from './CompatibilityScoreBadge';
import {
  Sparkles, AlertTriangle, CheckCircle2, ArrowRight, RefreshCw,
  User, MapPin, Briefcase, Heart, Brain, Star, Shield, Eye,
  Send, Bookmark, XCircle, Loader2, Info,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMatchStore } from '@/store/matchStore';
import type { Customer } from '@/types';
import type { ReviewMatchesResult, MatchRecommendation } from '@/services/ai/reviewMatchesService';
import toast from 'react-hot-toast';

interface ReviewMatchesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  allCustomers: Customer[];
}

const PROGRESS_STEPS = [
  'Gathering customer data...',
  'Filtering compatible candidates...',
  'Scoring compatibility...',
  'Analyzing top matches with AI...',
  'Generating recommendations...',
];

function LoadingSkeleton() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex(prev => (prev < PROGRESS_STEPS.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Progress indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span className="text-sm font-semibold text-primary">AI Analysis in Progress</span>
        </div>
        <div className="space-y-2">
          {PROGRESS_STEPS.map((step, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: i <= stepIndex ? 1 : 0.3, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2 justify-center"
            >
              {i < stepIndex ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : i === stepIndex ? (
                <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
              )}
              <span className={`text-xs ${i <= stepIndex ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                {step}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Customer summary skeleton */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
      </div>

      {/* Insights skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>

      {/* Match cards skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-48" />
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-14 w-14 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConfidenceBadge({ level }: { level: 'High' | 'Medium' | 'Low' }) {
  const config = {
    High: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Shield },
    Medium: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Info },
    Low: { color: 'bg-slate-100 text-slate-600 border-slate-200', icon: AlertTriangle },
  };
  const { color, icon: Icon } = config[level];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${color}`}>
      <Icon className="w-3 h-3" />
      {level} Confidence
    </span>
  );
}

function MatchCard({
  recommendation,
  candidate,
  onViewProfile,
  onSendMatch,
  onShortlist,
  onReject,
  index,
}: {
  recommendation: MatchRecommendation;
  candidate: Customer | undefined;
  onViewProfile: () => void;
  onSendMatch: () => void;
  onShortlist: () => void;
  onReject: () => void;
  index: number;
}) {
  if (!candidate) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08 }}
      className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* Content Body */}
      <div className="flex flex-col lg:flex-row items-start gap-6 p-6">
        
        {/* Left: Avatar & Info */}
        <div className="w-full lg:w-1/4 shrink-0 space-y-4">
          <div className="flex items-center gap-4 lg:flex-col lg:items-start lg:gap-3">
            <Avatar className="h-14 w-14 lg:h-20 lg:w-20 border-2 border-slate-100 shadow-sm shrink-0">
              <AvatarImage src={candidate.photo} alt={candidate.name} />
              <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-lg">
                {candidate.firstName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <h4 className="text-base font-bold text-slate-900 truncate">
                  {candidate.firstName} {candidate.lastName}
                </h4>
                <ConfidenceBadge level={recommendation.confidenceLevel} />
              </div>
              <div className="flex flex-col gap-1.5 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" /> {candidate.age} years
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {candidate.designation || candidate.profession}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {candidate.city}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: AI Reasoning & Strengths/Concerns */}
        <div className="flex-1 min-w-0 space-y-4">
          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100">
            <p className="text-sm font-medium text-slate-700 leading-relaxed">
              <Brain className="w-4 h-4 text-primary inline mr-2 -mt-0.5" />
              {recommendation.reasoning}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h5 className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2">Strengths</h5>
              <ul className="space-y-1.5">
                {recommendation.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2">Concerns</h5>
              <ul className="space-y-1.5">
                {recommendation.concerns.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right: Score & Actions */}
        <div className="w-full lg:w-48 shrink-0 flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-4">
          <CompatibilityScoreBadge score={recommendation.compatibilityScore} size="lg" />
          <div className="flex items-center gap-2 bg-primary/5 rounded-lg px-3 py-2 border border-primary/10 w-full lg:w-auto mt-auto">
            <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-xs font-semibold text-primary">{recommendation.recommendedAction}</span>
          </div>
        </div>
      </div>



      {/* Action buttons */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
        <Button variant="outline" size="sm" className="text-sm h-9 px-4" onClick={onViewProfile}>
          <Eye className="w-4 h-4 mr-1.5" /> View Profile
        </Button>
        <Button variant="outline" size="sm" className="text-sm h-9 px-3" onClick={onShortlist} title="Shortlist">
          <Bookmark className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" className="text-sm h-9 px-3 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={onReject} title="Reject">
          <XCircle className="w-4 h-4" />
        </Button>
        <Button size="sm" className="text-sm h-9 px-5 ml-2" onClick={onSendMatch}>
          <Send className="w-4 h-4 mr-1.5" /> Send Match
        </Button>
      </div>
    </motion.div>
  );
}

export function ReviewMatchesPanel({ isOpen, onClose, customer, allCustomers }: ReviewMatchesPanelProps) {
  const navigate = useNavigate();
  const { createMatch } = useMatchStore();
  const [result, setResult] = useState<ReviewMatchesResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef(false);

  const runAnalysis = useCallback(async () => {
    if (!customer || requestRef.current) return;
    requestRef.current = true;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const { reviewMatches } = await import('@/services/ai/reviewMatchesService');
      const data = await reviewMatches(customer, allCustomers);
      setResult(data);
    } catch (err: any) {
      console.error('Review matches failed:', err);
      setError(err?.message || 'Failed to generate match review');
    } finally {
      setIsLoading(false);
      requestRef.current = false;
    }
  }, [customer, allCustomers]);

  useEffect(() => {
    if (isOpen && customer) {
      runAnalysis();
    }
    if (!isOpen) {
      // Reset on close for fresh state next time
      setResult(null);
      setError(null);
    }
  }, [isOpen, customer, runAnalysis]);

  const handleSendMatch = async (candidateId: string) => {
    if (!customer) return;
    const rec = result?.recommendations.find(r => r.candidateId === candidateId);
    try {
      await createMatch({
        customerId: customer.id,
        matchedCustomerId: candidateId,
        compatibilityScore: rec?.compatibilityScore || 0,
        matchConfidence: rec?.compatibilityScore || 0,
        reasons: rec?.strengths || [],
        concerns: rec?.concerns || [],
        conversationStarters: [],
        status: 'sent',
        createdAt: new Date().toISOString(),
      });
      toast.success('Match sent successfully');
    } catch {
      toast.error('Failed to send match');
    }
  };

  const handleShortlist = async (candidateId: string) => {
    if (!customer) return;
    const rec = result?.recommendations.find(r => r.candidateId === candidateId);
    try {
      await createMatch({
        customerId: customer.id,
        matchedCustomerId: candidateId,
        compatibilityScore: rec?.compatibilityScore || 0,
        matchConfidence: rec?.compatibilityScore || 0,
        reasons: rec?.strengths || [],
        concerns: rec?.concerns || [],
        conversationStarters: [],
        status: 'shortlisted',
        createdAt: new Date().toISOString(),
      });
      toast.success('Match shortlisted');
    } catch {
      toast.error('Failed to shortlist match');
    }
  };

  const handleReject = (candidateId: string) => {
    toast.success(`Candidate ${candidateId.substring(0, 6)}… dismissed`);
    if (result) {
      setResult({
        ...result,
        recommendations: result.recommendations.filter(r => r.candidateId !== candidateId),
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:!max-w-[85vw] md:!max-w-[75vw] lg:!max-w-[65vw] xl:!max-w-[1400px] p-0 bg-slate-50 flex flex-col"
      >
        {/* Header */}
        <SheetHeader className="p-5 pb-4 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-lg font-bold text-slate-900">AI Match Review</SheetTitle>
              <SheetDescription className="text-xs text-slate-500">
                {customer ? `Reviewing matches for ${customer.firstName} ${customer.lastName}` : 'Loading...'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(100vh-80px)]">
          <AnimatePresence mode="wait">
            {/* Loading State */}
            {isLoading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LoadingSkeleton />
              </motion.div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-6"
              >
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-4">
                  <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
                  <h3 className="text-base font-bold text-red-800">Analysis Failed</h3>
                  <p className="text-sm text-red-600">{error}</p>
                  <Button onClick={runAnalysis} variant="outline" className="border-red-200 text-red-700 hover:bg-red-100">
                    <RefreshCw className="w-4 h-4 mr-2" /> Retry Analysis
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Results */}
            {result && !isLoading && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 space-y-8 pb-12"
              >
                {/* AI Source Indicator */}
                {!result.isAIGenerated && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 flex items-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-xs font-medium text-amber-800">
                      AI analysis unavailable. Displaying fallback recommendations based on deterministic scoring.
                    </span>
                  </motion.div>
                )}

                {/* Top Section: Grid for Summary & Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Column: Customer Summary */}
                  <div className="lg:col-span-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-full flex flex-col"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-slate-100 shadow-sm shrink-0">
                          <AvatarImage src={customer?.photo} alt={result.customerSummary.name} />
                          <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-xl">
                            {customer?.firstName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-1.5 mb-2">
                            <h3 className="text-lg font-bold text-slate-900 leading-none">{result.customerSummary.name}</h3>
                            <Badge variant="secondary" className="w-fit text-[10px] font-bold uppercase">
                              {result.customerSummary.profileCompletionStatus}
                            </Badge>
                          </div>
                          <div className="flex flex-col gap-1.5 text-sm text-slate-500 mt-3">
                            <span className="flex items-center gap-2"><User className="w-4 h-4 text-slate-400" /> {result.customerSummary.age} years</span>
                            <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {result.customerSummary.location}</span>
                            <span className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-slate-400" /> {result.customerSummary.profession}</span>
                          </div>
                        </div>
                      </div>
                      {result.customerSummary.preferences && (
                        <div className="mt-6 pt-5 border-t border-slate-100 flex-1">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Preferences</h4>
                          <p className="text-sm text-slate-600 leading-relaxed">{result.customerSummary.preferences}</p>
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Right Column: AI Insights */}
                  <div className="lg:col-span-8">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-4 h-full flex flex-col"
                    >
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
                        <Brain className="w-5 h-5 text-primary" /> AI Insights
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Profile Assessment</h4>
                          <p className="text-sm font-medium text-slate-700 leading-relaxed">{result.aiInsights.overallProfileAssessment}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Match Readiness</h4>
                          <p className="text-sm font-medium text-slate-700 leading-relaxed">{result.aiInsights.matchReadinessAssessment}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 text-amber-500" /> Key Observations
                          </h4>
                          <ul className="space-y-2">
                            {result.aiInsights.importantObservations.map((obs, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-2" />
                                <span className="leading-relaxed">{obs}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <Heart className="w-3.5 h-3.5 text-primary" /> Priorities
                          </h4>
                          <ul className="space-y-2">
                            {result.aiInsights.suggestedPriorities.map((p, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                                <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                <span className="leading-relaxed">{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>



                <Separator className="bg-slate-200" />

                {/* Recommended Matches */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" /> Recommended Matches
                      <Badge variant="secondary" className="ml-1 text-[10px] font-bold px-2 py-0.5">
                        {result.recommendations.length}
                      </Badge>
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={runAnalysis}
                      disabled={isLoading}
                      className="text-sm h-8"
                    >
                      <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                  </div>

                  {result.recommendations.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                      <Heart className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <h4 className="text-sm font-bold text-slate-700 mb-1">No Matches Found</h4>
                      <p className="text-xs text-slate-500">No compatible candidates were identified. Try expanding the customer's preferences or adding more profiles.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {result.recommendations.map((rec, index) => {
                        const candidate = allCustomers.find(c => c.id === rec.candidateId);
                        return (
                          <MatchCard
                            key={rec.candidateId}
                            recommendation={rec}
                            candidate={candidate}
                            index={index}
                            onViewProfile={() => {
                              onClose();
                              navigate(`/workspace/${rec.candidateId}`);
                            }}
                            onSendMatch={() => handleSendMatch(rec.candidateId)}
                            onShortlist={() => handleShortlist(rec.candidateId)}
                            onReject={() => handleReject(rec.candidateId)}
                          />
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
