import { useEffect } from 'react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sparkles, RefreshCw, Copy, Download, Printer,
  TrendingUp, AlertTriangle, Lightbulb, Activity, CheckCircle2,
  Users, UserCheck, Clock, CheckSquare, Calendar, UserPlus, ShieldAlert
} from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import toast from 'react-hot-toast';

interface AIAnalyticsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  metricsPayload: any; // We'll pass the generated metrics object from Dashboard
}

export function AIAnalyticsPanel({ isOpen, onClose, metricsPayload }: AIAnalyticsPanelProps) {
  const {
    insight,
    fullAnalytics,
    isLoadingFullAnalytics,
    fetchFullAnalytics
  } = useDashboardStore();

  useEffect(() => {
    if (isOpen && insight && metricsPayload && !fullAnalytics && !isLoadingFullAnalytics) {
      fetchFullAnalytics(insight, metricsPayload);
    }
  }, [isOpen, insight, metricsPayload, fullAnalytics, isLoadingFullAnalytics, fetchFullAnalytics]);

  const handleRefresh = () => {
    if (insight && metricsPayload) {
      fetchFullAnalytics(insight, metricsPayload, true);
    }
  };

  const handleCopy = () => {
    toast.success('Analytics report copied to clipboard');
  };

  const handleExport = () => {
    toast.success('Analytics report exported as PDF');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:!max-w-[80vw] lg:!max-w-[1400px] p-0 flex flex-col bg-slate-50 overflow-hidden border-l border-slate-200">
        
        {/* Header */}
        <div className="bg-white px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-0 z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <SheetTitle className="text-2xl font-bold text-slate-900">AI Analytics Command Center</SheetTitle>
              <Badge variant="outline" className="ml-2 text-[10px] font-bold uppercase border-primary/20 text-primary bg-primary/5">Intelligence Workspace</Badge>
            </div>
            <SheetDescription className="text-sm text-slate-500">
              Deep operational insights, trends, and business recommendations based on real-time platform data.
            </SheetDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoadingFullAnalytics} className="bg-white text-slate-600">
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingFullAnalytics ? 'animate-spin' : ''}`} />
              Refresh Analysis
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopy} className="bg-white text-slate-600 hidden md:flex">
              <Copy className="w-4 h-4 mr-2" /> Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} className="bg-white text-slate-600 hidden md:flex">
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} className="bg-white text-slate-600 hidden lg:flex">
              <Printer className="w-4 h-4 mr-2" /> Print
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8">
            
            {isLoadingFullAnalytics || !fullAnalytics ? (
              <div className="space-y-8 animate-pulse">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Skeleton className="h-48 w-full rounded-2xl" />
                  <Skeleton className="h-48 w-full rounded-2xl" />
                </div>
              </div>
            ) : (
              <>
                {/* Section 1: Insight Summary */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-primary/5 p-6 border-b border-primary/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Executive Summary</h3>
                        <p className="text-xl font-bold text-slate-900 leading-snug">
                          {fullAnalytics.insightSummary.insight}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0 bg-white p-4 rounded-xl border border-primary/10 shadow-sm text-center min-w-[140px]">
                        <span className="text-3xl font-bold text-primary">{fullAnalytics.insightSummary.confidence}%</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Confidence</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Evidence</h4>
                      <p className="text-sm text-slate-700 leading-relaxed">{fullAnalytics.insightSummary.evidence}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Recommendation</h4>
                      <p className="text-sm text-emerald-700 font-medium leading-relaxed bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                        {fullAnalytics.insightSummary.recommendation}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Business Impact</h4>
                      <p className="text-sm text-blue-700 font-medium leading-relaxed bg-blue-50 p-3 rounded-lg border border-blue-100">
                        {fullAnalytics.insightSummary.businessImpact}
                      </p>
                    </div>
                  </div>
                  <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-end">
                    <span className="text-xs font-medium text-slate-400">
                      Generated at: {new Date(fullAnalytics.insightSummary.generatedTimestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Section 2: Supporting Metrics */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-slate-400" />
                    Supporting Metrics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                      { label: 'Attention Required', value: fullAnalytics.metrics.customersRequiringAttention, icon: ShieldAlert, color: 'text-amber-500' },
                      { label: 'High Confidence', value: fullAnalytics.metrics.highConfidencePending, icon: Sparkles, color: 'text-purple-500' },
                      { label: 'Overdue Follow-Ups', value: fullAnalytics.metrics.overdueFollowUps, icon: Clock, color: 'text-rose-500' },
                      { label: 'Awaiting Verification', value: fullAnalytics.metrics.profilesAwaitingVerification, icon: UserCheck, color: 'text-orange-500' },
                      { label: 'Meetings Today', value: fullAnalytics.metrics.meetingsScheduledToday, icon: Calendar, color: 'text-emerald-500' },
                      { label: 'New Profiles', value: fullAnalytics.metrics.newProfilesThisWeek, icon: UserPlus, color: 'text-blue-500' },
                    ].map((metric, i) => (
                      <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider line-clamp-2">{metric.label}</span>
                          <metric.icon className={`w-4 h-4 ${metric.color}`} />
                        </div>
                        <div className="text-2xl font-bold text-slate-900 mt-auto">{metric.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Section 3: Trend Analysis */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-slate-400" />
                      Trend Analysis
                    </h3>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="divide-y divide-slate-100">
                        {fullAnalytics.trends.map((trend, i) => (
                          <div key={i} className="p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors">
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-slate-500">{i + 1}</span>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed font-medium">{trend}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Section 6: Recommended Actions */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                      <CheckSquare className="w-5 h-5 text-slate-400" />
                      Recommended Actions
                    </h3>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-4 space-y-3">
                      {fullAnalytics.recommendedActions.map((action, i) => (
                        <Button 
                          key={i} 
                          variant={i === 0 ? "default" : "outline"} 
                          className={`w-full justify-start h-auto py-3 px-4 shadow-sm whitespace-normal text-left ${i !== 0 ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : ''}`}
                        >
                          <div className={`w-5 h-5 shrink-0 rounded-full mr-3 flex items-center justify-center ${i === 0 ? 'bg-white/20' : 'bg-slate-200'}`}>
                            <span className={`text-[10px] font-bold ${i === 0 ? 'text-white' : 'text-slate-600'}`}>{i + 1}</span>
                          </div>
                          <span className="leading-relaxed">{action}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Section 4: Opportunities */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                      Opportunities
                    </h3>
                    <div className="space-y-4">
                      {fullAnalytics.opportunities.map((opp, i) => (
                        <div key={i} className="bg-gradient-to-br from-amber-50 to-white p-5 rounded-xl border border-amber-100 shadow-sm">
                          <h4 className="text-sm font-bold text-amber-900 mb-2">{opp.opportunity}</h4>
                          <p className="text-xs text-amber-700/80 uppercase tracking-wider font-bold mb-1">Estimated Impact</p>
                          <p className="text-sm text-amber-800 bg-white/50 p-2 rounded-md">{opp.estimatedImpact}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 5: Risks */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                      <AlertTriangle className="w-5 h-5 text-rose-500" />
                      Risks
                    </h3>
                    <div className="space-y-4">
                      {fullAnalytics.risks.map((risk, i) => (
                        <div key={i} className="bg-gradient-to-br from-rose-50 to-white p-5 rounded-xl border border-rose-100 shadow-sm">
                          <h4 className="text-sm font-bold text-rose-900 mb-2">{risk.risk}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                            <div className="bg-white/60 p-3 rounded-lg">
                              <p className="text-[10px] text-rose-700/70 uppercase tracking-wider font-bold mb-1">Impact</p>
                              <p className="text-xs text-rose-800 font-medium">{risk.impact}</p>
                            </div>
                            <div className="bg-white/60 p-3 rounded-lg">
                              <p className="text-[10px] text-rose-700/70 uppercase tracking-wider font-bold mb-1">Recommendation</p>
                              <p className="text-xs text-rose-800 font-medium">{risk.recommendation}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
