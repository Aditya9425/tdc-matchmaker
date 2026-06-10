import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { CompatibilityScoreBadge } from './CompatibilityScoreBadge';
import {
  Sparkles, AlertTriangle, CheckCircle2, ArrowRight, RefreshCw,
  User, MapPin, Briefcase, Heart, Brain, Star, FileText, Send, Bookmark
} from 'lucide-react';
import type { Customer } from '@/types';
import type { AIMatchReport } from '@/services/ai/generateMatchReportService';
import toast from 'react-hot-toast';
import { useMatchStore } from '@/store/matchStore';

interface AIMatchReportPanelProps {
  isOpen: boolean;
  onClose: () => void;
  primaryCustomer: Customer | null;
  candidateCustomer: Customer | null;
}

export function AIMatchReportPanel({ isOpen, onClose, primaryCustomer, candidateCustomer }: AIMatchReportPanelProps) {
  const { createMatch } = useMatchStore();
  const [report, setReport] = useState<AIMatchReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef(false);

  const runAnalysis = useCallback(async () => {
    if (!primaryCustomer || !candidateCustomer || requestRef.current) return;
    requestRef.current = true;
    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const { generateMatchReport } = await import('@/services/ai/generateMatchReportService');
      const data = await generateMatchReport(primaryCustomer, candidateCustomer);
      setReport(data);
    } catch (err: any) {
      console.error('Match report failed:', err);
      setError(err?.message || 'Failed to generate match report');
    } finally {
      setIsLoading(false);
      requestRef.current = false;
    }
  }, [primaryCustomer, candidateCustomer]);

  useEffect(() => {
    if (isOpen && primaryCustomer && candidateCustomer) {
      runAnalysis();
    }
    if (!isOpen) {
      setReport(null);
      setError(null);
    }
  }, [isOpen, primaryCustomer, candidateCustomer, runAnalysis]);

  const handleSendMatch = async () => {
    if (!primaryCustomer || !candidateCustomer) return;
    try {
      await createMatch({
        customerId: primaryCustomer.id,
        matchedCustomerId: candidateCustomer.id,
        compatibilityScore: report?.compatibilityScore || 0,
        matchConfidence: report?.compatibilityScore || 0,
        reasons: report?.keyStrengths || [],
        concerns: report?.potentialConcerns || [],
        conversationStarters: report?.suggestedDiscussionTopics || [],
        status: 'sent',
        createdAt: new Date().toISOString(),
      });
      toast.success('Match sent successfully');
      onClose();
    } catch {
      toast.error('Failed to send match');
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:!max-w-[85vw] md:!max-w-[75vw] lg:!max-w-[65vw] xl:!max-w-[1200px] p-0 bg-slate-50 flex flex-col"
      >
        <SheetHeader className="p-5 pb-4 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-lg font-bold text-slate-900">AI Match Report</SheetTitle>
              <SheetDescription className="text-xs text-slate-500">
                {primaryCustomer && candidateCustomer 
                  ? `Comprehensive analysis for ${primaryCustomer.firstName} & ${candidateCustomer.firstName}`
                  : 'Loading...'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(100vh-140px)]">
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-6">
                <div className="flex items-center justify-center gap-8 py-8">
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-24 w-24 rounded-full" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-40 w-full rounded-xl" />
                  <Skeleton className="h-32 w-full rounded-xl" />
                </div>
              </motion.div>
            )}

            {error && !isLoading && (
              <motion.div key="error" className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-4">
                  <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
                  <h3 className="text-base font-bold text-red-800">Report Generation Failed</h3>
                  <p className="text-sm text-red-600">{error}</p>
                  <Button onClick={runAnalysis} variant="outline" className="border-red-200 text-red-700">
                    <RefreshCw className="w-4 h-4 mr-2" /> Retry Analysis
                  </Button>
                </div>
              </motion.div>
            )}

            {report && !isLoading && primaryCustomer && candidateCustomer && (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-8 pb-12">
                
                {/* Header Profile Comparison */}
                <div className="flex items-center justify-center gap-6 md:gap-12 py-4">
                  <div className="text-center space-y-2">
                    <Avatar className="h-24 w-24 md:h-32 md:w-32 mx-auto border-4 border-white shadow-md">
                      <AvatarImage src={primaryCustomer.photo} />
                      <AvatarFallback className="bg-slate-100 text-slate-400 text-2xl font-bold">{primaryCustomer.firstName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="font-bold text-slate-900">{primaryCustomer.firstName}</div>
                    <div className="text-xs text-slate-500">{primaryCustomer.age} yrs • {primaryCustomer.city}</div>
                  </div>

                  <div className="flex flex-col items-center">
                    <CompatibilityScoreBadge score={report.compatibilityScore} size="lg" />
                  </div>

                  <div className="text-center space-y-2">
                    <Avatar className="h-24 w-24 md:h-32 md:w-32 mx-auto border-4 border-white shadow-md">
                      <AvatarImage src={candidateCustomer.photo} />
                      <AvatarFallback className="bg-slate-100 text-slate-400 text-2xl font-bold">{candidateCustomer.firstName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="font-bold text-slate-900">{candidateCustomer.firstName}</div>
                    <div className="text-xs text-slate-500">{candidateCustomer.age} yrs • {candidateCustomer.city}</div>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 shadow-sm text-center">
                  <p className="text-sm font-medium text-slate-800 leading-relaxed italic">
                    "{report.executiveSummary}"
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths & Concerns */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                    <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Key Strengths
                    </h3>
                    <ul className="space-y-2">
                      {report.keyStrengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                          <span className="leading-relaxed">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                    <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Potential Concerns
                    </h3>
                    <ul className="space-y-2">
                      {report.potentialConcerns.map((c, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                          <span className="leading-relaxed">{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Deep Dive Sections */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-2 md:col-span-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Detailed Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-1.5"><Heart className="w-4 h-4 text-rose-500"/> Family & Values</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">{report.familyCompatibility}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-1.5"><Star className="w-4 h-4 text-purple-500"/> Lifestyle</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">{report.lifestyleCompatibility}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-1.5"><Briefcase className="w-4 h-4 text-blue-500"/> Career Alignment</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">{report.careerAlignment}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-1.5"><MapPin className="w-4 h-4 text-emerald-500"/> Location</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">{report.locationAnalysis}</p>
                      </div>
                    </div>
                  </div>

                  {/* Discussion Topics & Next Action */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 md:col-span-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-primary" /> Suggested Discussion Topics
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {report.suggestedDiscussionTopics.map((t, i) => (
                        <div key={i} className="bg-slate-50 border border-slate-200 text-slate-700 text-sm px-3 py-1.5 rounded-lg shadow-sm">
                          {t}
                        </div>
                      ))}
                    </div>
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between bg-primary/5 rounded-lg p-4 border border-primary/10">
                      <div>
                        <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Recommended Action</div>
                        <div className="text-sm font-bold text-slate-900">{report.recommendedNextAction}</div>
                      </div>
                      <Button onClick={handleSendMatch} className="bg-primary hover:bg-primary/90 text-white shadow-sm shrink-0">
                        <Send className="w-4 h-4 mr-2" /> Send Match
                      </Button>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
