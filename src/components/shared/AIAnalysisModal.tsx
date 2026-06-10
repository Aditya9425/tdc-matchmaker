/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
 
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Sparkles, CheckCircle2, AlertTriangle, MessageCircle, Heart, Loader2 } from 'lucide-react';
import type { Match, Customer } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';


interface AIAnalysisModalProps {
  matchData: { match: Match; customer: Customer } | null;
  primaryCustomer: Customer | null;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
}

const LOADING_MESSAGES = [
  "Analyzing personality compatibility...",
  "Comparing relationship goals...",
  "Evaluating lifestyle preferences...",
  "Reviewing family expectations...",
  "Generating recommendations...",
  "Preparing final report..."
];

export function AIAnalysisModal({ matchData, primaryCustomer, isOpen, isLoading, onClose }: AIAnalysisModalProps) {
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [isTakingLong, setIsTakingLong] = useState(false);

  useEffect(() => {
    let messageInterval: ReturnType<typeof setInterval>;
    let longRequestTimeout: ReturnType<typeof setTimeout>;

    if (isLoading) {
      setLoadingMessageIndex(0);
      setIsTakingLong(false);
      
      messageInterval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 1500);

      longRequestTimeout = setTimeout(() => {
        setIsTakingLong(true);
      }, 8000);
    }

    return () => {
      if (messageInterval) clearInterval(messageInterval);
      if (longRequestTimeout) clearTimeout(longRequestTimeout);
    };
  }, [isLoading]);

  if (!matchData || !primaryCustomer) return null;

  const { match, customer } = matchData;
  const analysis = match.aiAnalysis;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="md" className="bg-slate-50 border-slate-200 shadow-2xl p-0 overflow-hidden rounded-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="p-6 bg-white border-b border-slate-100 shrink-0">
          <DialogTitle className="text-xl font-bold text-slate-900 flex items-center justify-between">
            <span className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> AI Match Analysis</span>
          </DialogTitle>
          <div className="flex items-center justify-center gap-8 pt-4">
            <div className="text-center space-y-2">
              <Avatar className="w-20 h-20 mx-auto border-4 border-slate-50 shadow-sm">
                <AvatarImage src={primaryCustomer.photo} />
                <AvatarFallback>{primaryCustomer.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="font-bold text-slate-900">{primaryCustomer.name}</div>
            </div>
            <div className="flex flex-col items-center">
              <Heart className="w-6 h-6 text-primary mb-2 fill-primary/20" />
              <div className="text-3xl font-extrabold text-primary">{(analysis as any)?.compatibilityScore}%</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Match Score</div>
            </div>
            <div className="text-center space-y-2">
              <Avatar className="w-20 h-20 mx-auto border-4 border-slate-50 shadow-sm">
                <AvatarImage src={customer.photo} />
                <AvatarFallback>{customer.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="font-bold text-slate-900">{customer.name}</div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 relative">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full py-12 animate-in fade-in duration-500">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin opacity-50" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2">🤖 AI Match Analysis</h3>
              
              <div className="h-6 overflow-hidden mb-6 flex justify-center">
                <p className="text-sm font-medium text-slate-500 animate-in slide-in-from-bottom-2 fade-in duration-300" key={loadingMessageIndex}>
                  {LOADING_MESSAGES[loadingMessageIndex]}
                </p>
              </div>

              {isTakingLong && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium px-4 py-3 rounded-lg mb-8 animate-in fade-in slide-in-from-top-4 duration-500 max-w-sm text-center">
                  The analysis is taking longer than expected. Please hold on while we complete the detailed report.
                </div>
              )}

              <div className="w-full max-w-md space-y-4">
                <Skeleton className="h-24 w-full rounded-xl" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-32 w-full rounded-xl" />
                  <Skeleton className="h-32 w-full rounded-xl" />
                </div>
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Relationship Summary</h3>
             <p className="text-sm font-medium text-slate-800 leading-relaxed">{analysis?.relationshipSummary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-emerald-100 shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Why They Match
              </h3>
              <Separator className="bg-emerald-50" />
              <ul className="space-y-3">
                {analysis?.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="font-medium">{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-amber-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Potential Concerns
              </h3>
              <Separator className="bg-amber-50" />
              <ul className="space-y-3">
                {analysis?.concerns.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span className="font-medium">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-blue-800 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-blue-500" /> Suggested First Conversation Topics
            </h3>
            <Separator className="bg-blue-50" />
            <ul className="space-y-3">
              {analysis?.conversationStarters.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-2" />
                  <span className="font-medium">{c}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-slate-900 rounded-xl shadow-sm p-5 text-center">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Recommended Next Action</h3>
            <div className="text-base font-bold text-white">{analysis?.recommendation}</div>
          </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
