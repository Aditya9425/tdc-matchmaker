/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText, AlertTriangle, CheckCircle2, RefreshCw, Loader2,
  Copy, Printer, Download, MessageCircle, Target, Lightbulb,
  TrendingUp, Heart, ClipboardList, HelpCircle, ArrowRight,
} from 'lucide-react';
import type { Customer } from '@/types';
import type { MeetingBrief } from '@/services/ai/generateBriefService';
import toast from 'react-hot-toast';

interface GenerateBriefPanelProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

const PROGRESS_STEPS = [
  'Gathering customer data...',
  'Analyzing match history...',
  'Reviewing notes & timeline...',
  'Generating AI briefing...',
  'Preparing document...',
];

function LoadingSkeleton() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex(prev => (prev < PROGRESS_STEPS.length - 1 ? prev + 1 : prev));
    }, 1500);
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
          <span className="text-sm font-semibold text-primary">Generating Meeting Brief</span>
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

      {/* Content skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

function BriefSection({
  icon: Icon,
  title,
  children,
  colorClass = 'text-slate-400',
  delay = 0,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
  colorClass?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 print:shadow-none print:border-slate-300"
    >
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2 print:text-slate-600">
        <Icon className={`w-4 h-4 ${colorClass}`} />
        {title}
      </h3>
      {children}
    </motion.div>
  );
}

function formatBriefAsText(customer: Customer, brief: MeetingBrief): string {
  const divider = '━'.repeat(50);

  return `
${divider}
MEETING BRIEF — ${customer.firstName} ${customer.lastName}
Generated: ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
${divider}

📋 EXECUTIVE SUMMARY
${brief.executiveSummary}

📊 CURRENT SITUATION
${brief.currentSituation}

💬 KEY DISCUSSION TOPICS
${brief.keyDiscussionTopics.map((t, i) => `  ${i + 1}. ${t}`).join('\n')}

⚠️ IMPORTANT CONCERNS
${brief.importantConcerns.map((c, i) => `  ${i + 1}. ${c}`).join('\n')}

❓ SUGGESTED QUESTIONS
${brief.suggestedQuestions.map((q, i) => `  ${i + 1}. ${q}`).join('\n')}

🎯 RECOMMENDED NEXT STEPS
${brief.recommendedNextSteps.map((s, i) => `  ${i + 1}. ${s}`).join('\n')}

💕 MATCHMAKING OPPORTUNITIES
${brief.matchmakingOpportunities.map((o, i) => `  ${i + 1}. ${o}`).join('\n')}

${divider}
Generated by TDC AI Matchmaker${brief.isAIGenerated ? '' : ' (Fallback Mode)'}
${divider}
`.trim();
}

export function GenerateBriefPanel({ isOpen, onClose, customer }: GenerateBriefPanelProps) {
  const [brief, setBrief] = useState<MeetingBrief | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef(false);
  const briefContentRef = useRef<HTMLDivElement>(null);

  const runGeneration = useCallback(async () => {
    if (!customer || requestRef.current) return;
    requestRef.current = true;
    setIsLoading(true);
    setError(null);
    setBrief(null);

    try {
      const { generateMeetingBrief } = await import('@/services/ai/generateBriefService');
      const data = await generateMeetingBrief(customer);
      setBrief(data);
    } catch (err: any) {
      console.error('Brief generation failed:', err);
      setError(err?.message || 'Failed to generate meeting brief');
    } finally {
      setIsLoading(false);
      requestRef.current = false;
    }
  }, [customer]);

  useEffect(() => {
    if (isOpen && customer) {
      runGeneration();
    }
    if (!isOpen) {
      setBrief(null);
      setError(null);
    }
  }, [isOpen, customer, runGeneration]);

  const handleCopyBrief = async () => {
    if (!brief || !customer) return;
    try {
      const text = formatBriefAsText(customer, brief);
      await navigator.clipboard.writeText(text);
      toast.success('Brief copied to clipboard');
    } catch {
      toast.error('Failed to copy brief');
    }
  };

  const handlePrintBrief = () => {
    window.print();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:!max-w-[85vw] md:!max-w-[75vw] lg:!max-w-[65vw] xl:!max-w-[1400px] p-0 bg-slate-50 flex flex-col"
      >
        {/* Header - hidden in print */}
        <SheetHeader className="p-5 pb-4 bg-white border-b border-slate-200 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-lg font-bold text-slate-900">Meeting Brief</SheetTitle>
              <SheetDescription className="text-xs text-slate-500">
                {customer ? `AI-generated briefing for ${customer.firstName} ${customer.lastName}` : 'Loading...'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(100vh-140px)]">
          <div ref={briefContentRef}>
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
                    <h3 className="text-base font-bold text-red-800">Brief Generation Failed</h3>
                    <p className="text-sm text-red-600">{error}</p>
                    <Button onClick={runGeneration} variant="outline" className="border-red-200 text-red-700 hover:bg-red-100">
                      <RefreshCw className="w-4 h-4 mr-2" /> Retry
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Brief Content */}
              {brief && !isLoading && (
                <motion.div
                  key="brief"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 space-y-6 pb-12"
                >
                  {/* AI Source Indicator */}
                  {!brief.isAIGenerated && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 flex items-center gap-2 print:hidden"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="text-xs font-medium text-amber-800">
                        AI analysis unavailable. Displaying fallback briefing based on available data.
                      </span>
                    </motion.div>
                  )}

                  {/* Print header - visible only in print */}
                  <div className="hidden print:block mb-6">
                    <h1 className="text-2xl font-bold text-slate-900">Meeting Brief</h1>
                    <p className="text-sm text-slate-500">
                      {customer?.firstName} {customer?.lastName} — {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <Separator className="mt-3" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Executive Summary */}
                      <BriefSection icon={ClipboardList} title="Executive Summary" colorClass="text-primary" delay={0.05}>
                        <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                          <p className="text-sm font-medium text-slate-800 leading-relaxed">{brief.executiveSummary}</p>
                        </div>
                      </BriefSection>

                      {/* Current Situation */}
                      <BriefSection icon={TrendingUp} title="Current Situation" colorClass="text-blue-500" delay={0.1}>
                        <p className="text-sm text-slate-700 leading-relaxed">{brief.currentSituation}</p>
                      </BriefSection>

                      {/* Important Concerns */}
                      <BriefSection icon={AlertTriangle} title="Important Concerns" colorClass="text-amber-500" delay={0.2}>
                        <div className="space-y-2">
                          {brief.importantConcerns.map((concern, i) => (
                            <div key={i} className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-2.5 flex items-start gap-2">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <span className="text-xs font-medium text-amber-800 leading-relaxed">{concern}</span>
                            </div>
                          ))}
                        </div>
                      </BriefSection>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* Key Discussion Topics */}
                      <BriefSection icon={MessageCircle} title="Key Discussion Topics" colorClass="text-violet-500" delay={0.15}>
                        <ol className="space-y-3">
                          {brief.keyDiscussionTopics.map((topic, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <span className="w-6 h-6 rounded-full bg-violet-50 border border-violet-200 flex items-center justify-center text-[10px] font-bold text-violet-700 shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <span className="text-sm text-slate-700 font-medium leading-relaxed">{topic}</span>
                            </li>
                          ))}
                        </ol>
                      </BriefSection>

                      {/* Suggested Questions */}
                      <BriefSection icon={HelpCircle} title="Suggested Questions" colorClass="text-blue-500" delay={0.25}>
                        <ul className="space-y-3">
                          {brief.suggestedQuestions.map((question, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                              <div className="w-5 h-5 rounded border border-slate-300 shrink-0 mt-0.5 flex items-center justify-center">
                                <span className="text-[10px] text-slate-400 font-bold">{i + 1}</span>
                              </div>
                              <span className="font-medium leading-relaxed">{question}</span>
                            </li>
                          ))}
                        </ul>
                      </BriefSection>

                      {/* Recommended Next Steps */}
                      <BriefSection icon={Target} title="Recommended Next Steps" colorClass="text-emerald-500" delay={0.3}>
                        <ul className="space-y-3">
                          {brief.recommendedNextSteps.map((step, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="text-sm font-medium text-slate-700 leading-relaxed">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </BriefSection>

                      {/* Matchmaking Opportunities */}
                      <BriefSection icon={Lightbulb} title="Matchmaking Opportunities" colorClass="text-pink-500" delay={0.35}>
                        <ul className="space-y-3">
                          {brief.matchmakingOpportunities.map((opp, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <Heart className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                              <span className="text-sm font-medium text-slate-700 leading-relaxed">{opp}</span>
                            </li>
                          ))}
                        </ul>
                      </BriefSection>
                    </div>
                  </div>

                  {/* Generation meta */}
                  <div className="text-center pt-2 print:pt-6">
                    <p className="text-[10px] text-slate-400 font-medium">
                      {brief.isAIGenerated ? '✨ Generated by AI' : '📋 Generated from available data (fallback mode)'} • {new Date().toLocaleTimeString('en-IN')}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Export Actions Footer - shown only when brief is loaded */}
        {brief && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-white border-t border-slate-200 flex items-center gap-3 shrink-0 print:hidden"
          >
            <Button variant="outline" size="sm" className="text-sm h-10 px-6 flex-1" onClick={handleCopyBrief}>
              <Copy className="w-4 h-4 mr-2" /> Copy Brief
            </Button>
            <Button variant="outline" size="sm" className="text-sm h-10 px-6 flex-1" onClick={handlePrintBrief}>
              <Download className="w-4 h-4 mr-2" /> Download PDF
            </Button>
            <Button size="sm" className="text-sm h-10 px-6 flex-1" onClick={handlePrintBrief}>
              <Printer className="w-4 h-4 mr-2" /> Print Brief
            </Button>
          </motion.div>
        )}
      </SheetContent>
    </Sheet>
  );
}
