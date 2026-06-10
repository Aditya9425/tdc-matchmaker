/* eslint-disable @typescript-eslint/no-explicit-any */
 
import { useState, useEffect, useMemo } from 'react';
import {
  Sparkles, Send, Clock, CheckCircle2,
  Wand2, RefreshCcw, Heart,
  Mail, MessageSquare, PlayCircle, Target
} from 'lucide-react';
import { useCustomerStore } from '@/store/customerStore';
import { cn } from '@/utils';
import { writingAssistant } from '@/services/ai/writingAssistant';
import type { TemplateType, CommunicationInsights } from '@/services/ai/writingAssistant';
import toast from 'react-hot-toast';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase } from 'lucide-react';

// ── Per-conversation data ──────────────────────────────────────────
interface ConversationData {
  id: string;
  customerName: string;
  matchName: string;
  status: string;
  time: string;
  avatar: string;
  compatibilityScore: number;
  timeline: { time: string; desc: string; status: 'done' | 'pending' }[];
  metrics: { sent: number; responseRate: number };
  matchHighlights: string[];
}

// ── Component ──────────────────────────────────────────────────────
export default function Messages() {
  const { customers, fetchCustomers } = useCustomerStore();
  
  const conversations = useMemo<ConversationData[]>(() => {
    const males = customers.filter(c => c.gender.toLowerCase() === 'male');
    const females = customers.filter(c => c.gender.toLowerCase() === 'female');
    
    if (males.length < 3 || females.length < 3) return [];
    
    return [
      {
        id: '1',
        customerName: males[0].name,
        matchName: females[0].name,
        status: 'Viewed',
        time: '2 hours ago',
        avatar: males[0].photo,
        compatibilityScore: 92,
        timeline: [
          { time: '10:00 AM', desc: 'Match recommendation sent', status: 'done' },
          { time: '12:30 PM', desc: 'Customer viewed recommendation', status: 'done' },
          { time: '04:00 PM', desc: 'Customer responded', status: 'done' },
          { time: 'Next Day', desc: 'Meeting scheduled', status: 'pending' },
        ],
        metrics: { sent: 45, responseRate: 68 },
        matchHighlights: ['Family Values', 'Career Alignment', 'Shared Hobbies'],
      },
      {
        id: '2',
        customerName: females[1].name,
        matchName: males[1].name,
        status: 'Replied',
        time: '5 hours ago',
        avatar: females[1].photo,
        compatibilityScore: 85,
        timeline: [
          { time: '09:00 AM', desc: 'Profile shortlisted by matchmaker', status: 'done' },
          { time: '11:00 AM', desc: 'Recommendation sent', status: 'done' },
          { time: '03:45 PM', desc: 'Customer replied with interest', status: 'done' },
          { time: 'Pending', desc: 'Schedule introductory call', status: 'pending' },
        ],
        metrics: { sent: 32, responseRate: 74 },
        matchHighlights: ['Professional Goals', 'Location Compatibility', 'Lifestyle Match'],
      },
      {
        id: '3',
        customerName: males[2].name,
        matchName: females[2].name,
        status: 'Sent',
        time: 'Yesterday',
        avatar: males[2].photo,
        compatibilityScore: 78,
        timeline: [
          { time: '02:00 PM', desc: 'AI match analysis completed', status: 'done' },
          { time: '02:30 PM', desc: 'Recommendation sent', status: 'done' },
          { time: 'Awaiting', desc: 'Customer response pending', status: 'pending' },
          { time: 'TBD', desc: 'Follow-up if no response in 48h', status: 'pending' },
        ],
        metrics: { sent: 18, responseRate: 55 },
        matchHighlights: ['Cultural Compatibility', 'Education Level', 'Relocation Flexibility'],
      },
    ];
  }, [customers]);

  const [selectedConversation, setSelectedConversation] = useState<ConversationData | null>(null);
  const [draft, setDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [template, setTemplate] = useState<TemplateType>('Formal');
  const [insights, setInsights] = useState<CommunicationInsights | null>(null);

  useEffect(() => {
    if (customers.length === 0) fetchCustomers();
  }, [customers.length, fetchCustomers]);

  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  // Derive customer & match from the selected conversation + store
  const customer = selectedConversation ? customers.find(c => c.name === (selectedConversation as any)?.customerName) : null;
  const match = selectedConversation ? customers.find(c => c.name === selectedConversation.matchName) : null;

  const generateNewDraft = async (temp: TemplateType) => {
    if (!customer || !match) return;
    setIsGenerating(true);
    setTemplate(temp);
    const newDraft = await writingAssistant.generateDraft(customer, match, temp);
    setDraft(newDraft);
    setIsGenerating(false);
  };

  useEffect(() => {
    if (customer && match) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      generateNewDraft(template);
      setInsights(null);
      writingAssistant.generateAssistantInsights(customer, match).then(setInsights);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [(selectedConversation as any)?.id, customer?.id, match?.id]);

  const handleRewrite = async (action: 'improve' | 'shorten' | 'professional' | 'friendly' | 'family') => {
    if (!draft) return;
    setIsGenerating(true);
    const newDraft = await writingAssistant.rewriteMessage(draft, action);
    setDraft(newDraft);
    setIsGenerating(false);
  };

  const handleGenerateFollowUp = async () => {
    if (!customer) return;
    setIsGenerating(true);
    const fu = await writingAssistant.generateFollowUp(customer);
    setDraft(fu);
    setIsGenerating(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sent': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Viewed': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Replied': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Meeting Scheduled': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Engaged': return 'bg-pink-50 text-pink-700 border-pink-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const scoreColor = (score: number) =>
    score >= 90 ? 'text-emerald-700 bg-emerald-50 border-emerald-100' :
    score >= 80 ? 'text-blue-700 bg-blue-50 border-blue-100' :
    'text-amber-700 bg-amber-50 border-amber-100';

  return (
    <div className="h-full bg-slate-50 flex flex-col lg:flex-row overflow-hidden">

      {/* ── LEFT PANEL ─────────────────────────────────────────── */}
      <div className="w-full lg:w-[320px] bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" /> Communications
          </h2>
          <p className="text-xs text-slate-500 mt-1">Manage AI recommendations</p>
        </div>
        <ScrollArea className="flex-1">
          <div className="divide-y divide-slate-100">
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={cn(
                  'w-full text-left p-4 hover:bg-slate-50 transition-colors',
                  (selectedConversation as any)?.id === conv.id && 'bg-primary/[0.03] border-l-2 border-primary'
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="w-8 h-8 border border-slate-200">
                    <AvatarImage src={conv.avatar} />
                    <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-bold">{conv.customerName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-900 truncate">{conv.customerName}</div>
                    <div className="text-xs text-slate-500 truncate">Match: {conv.matchName}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <Badge variant="outline" className={cn('text-[9px] uppercase tracking-wider py-0 px-1.5', getStatusColor(conv.status))}>
                    {conv.status}
                  </Badge>
                  <span className="text-[10px] text-slate-400 font-medium">{conv.time}</span>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* ── CENTER PANEL ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 relative overflow-hidden">
        {customer && match && selectedConversation ? (
          <ScrollArea className="h-full">
            <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">

              {/* Header — Sending To / Suggested Match / Compatibility */}
              <Card className="border-slate-200 shadow-sm bg-white">
                <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 border border-slate-200">
                      <AvatarImage src={customer.photo} />
                      <AvatarFallback>{customer.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sending To</div>
                      <div className="text-sm font-bold text-slate-900">{customer.name}</div>
                      <div className="text-xs text-slate-500">{customer.designation} · {customer.city}</div>
                    </div>
                  </div>

                  <div className={cn('hidden md:flex items-center gap-2 px-3 py-1 rounded-full border', scoreColor(selectedConversation.compatibilityScore))}>
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span className="text-xs font-bold">{selectedConversation.compatibilityScore}% Match</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suggested Match</div>
                      <div className="text-sm font-bold text-slate-900">{match.name}</div>
                      <div className="text-xs text-slate-500">{match.designation} · {match.city}</div>
                    </div>
                    <Avatar className="w-12 h-12 border border-slate-200">
                      <AvatarImage src={match.photo} />
                      <AvatarFallback>{match.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                </CardContent>
              </Card>

              {/* Composer */}
              <Card className="border-slate-200 shadow-sm bg-white flex flex-col">
                <CardHeader className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between shrink-0">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" /> AI Composer
                  </CardTitle>
                  <Tabs value={template} onValueChange={(v) => generateNewDraft(v as TemplateType)} className="w-[300px]">
                    <TabsList className="grid w-full grid-cols-3 h-8 bg-slate-200/50">
                      <TabsTrigger value="Formal" className="text-[10px] font-bold uppercase tracking-wider">Formal</TabsTrigger>
                      <TabsTrigger value="Friendly" className="text-[10px] font-bold uppercase tracking-wider">Friendly</TabsTrigger>
                      <TabsTrigger value="Premium" className="text-[10px] font-bold uppercase tracking-wider">Premium</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent className="p-0 flex-1 flex flex-col relative">
                  {isGenerating && (
                    <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-sm flex items-center justify-center">
                      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg border border-slate-200">
                        <RefreshCcw className="w-4 h-4 text-primary animate-spin" />
                        <span className="text-xs font-bold text-slate-700">AI is writing…</span>
                      </div>
                    </div>
                  )}
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    className="flex-1 min-h-[300px] border-0 focus-visible:ring-0 rounded-none p-6 text-sm text-slate-700 leading-relaxed resize-none"
                    placeholder="Drafting message…"
                  />
                  <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => generateNewDraft(template)} className="h-8 text-xs bg-white text-slate-600">
                        <RefreshCcw className="w-3.5 h-3.5 mr-1.5" /> Regenerate
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleGenerateFollowUp} className="h-8 text-xs bg-white text-slate-600">
                        <PlayCircle className="w-3.5 h-3.5 mr-1.5" /> Follow-Up
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="h-8 text-xs bg-white">Save Draft</Button>
                      <Button size="sm" onClick={() => toast.success(`Recommendation sent to ${customer.name}!`)} className="h-8 text-xs bg-primary text-white">
                        <Send className="w-3.5 h-3.5 mr-1.5" /> Send Recommendation
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline — driven by selectedConversation */}
              <div className="px-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Communication Timeline</h3>
                <div className="space-y-4">
                  {selectedConversation.timeline.map((evt, i) => (
                    <div key={i} className="flex gap-4 relative">
                      {i !== selectedConversation.timeline.length - 1 && <div className="absolute top-6 bottom-[-16px] left-[11px] w-px bg-slate-200" />}
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 border-2",
                        evt.status === 'done' ? "bg-primary border-primary" : "bg-white border-slate-300"
                      )}>
                        {evt.status === 'done' && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <div className="pt-0.5">
                        <div className="text-sm font-bold text-slate-900">{evt.desc}</div>
                        <div className="text-[11px] font-medium text-slate-500 mt-0.5">{evt.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </ScrollArea>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No communications yet</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Send your first AI-powered match recommendation from the Match Studio.
            </p>
          </div>
        )}
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────── */}
      <div className="w-full lg:w-[320px] bg-white border-l border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 bg-primary/[0.02]">
          <h2 className="text-base font-bold text-primary flex items-center gap-2">
            <Wand2 className="w-4 h-4" /> AI Assistant
          </h2>
          <p className="text-xs text-slate-500 mt-1">Writing tools & insights</p>
        </div>
        <ScrollArea className="flex-1 p-4 space-y-6">

          {/* Customer Profile Snapshot */}
          {customer && (
            <div className="space-y-3 mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Profile</h3>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5">
                <div className="text-sm font-bold text-slate-900">{customer.name}</div>
                <div className="text-xs text-slate-600">{customer.age} yrs · {customer.gender} · {customer.city}</div>
                <div className="text-xs text-slate-600">{customer.designation} at {customer.currentCompany}</div>
                <div className="text-xs text-slate-500">{customer.religion} · {customer.maritalStatus}</div>
              </div>
            </div>
          )}

          <Separator className="bg-slate-100" />

          {/* Quick Actions */}
          <div className="space-y-3 mt-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => handleRewrite('improve')} className="h-8 text-[10px] uppercase tracking-wider font-bold bg-slate-50 hover:bg-slate-100">
                <Sparkles className="w-3 h-3 mr-1.5 text-primary" /> Improve
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleRewrite('shorten')} className="h-8 text-[10px] uppercase tracking-wider font-bold bg-slate-50 hover:bg-slate-100">
                Shorten
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleRewrite('professional')} className="h-8 text-[10px] uppercase tracking-wider font-bold bg-slate-50 hover:bg-slate-100">
                <Briefcase className="w-3 h-3 mr-1.5" /> Professional
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleRewrite('friendly')} className="h-8 text-[10px] uppercase tracking-wider font-bold bg-slate-50 hover:bg-slate-100">
                <Heart className="w-3 h-3 mr-1.5" /> Friendly
              </Button>
            </div>
          </div>

          <Separator className="bg-slate-100" />

          {/* Communication Insights — from AI, driven by customer+match */}
          <div className="space-y-4 mt-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Communication Insights</h3>

            {insights ? (
              <div className="space-y-3">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Target className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">Response Probability</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">{insights.responseProbability}%</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">Best Time</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">{insights.bestTimeToSend}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Match Highlights</div>
                  <div className="space-y-1.5">
                    {(selectedConversation as any)?.matchHighlights.map((h: any, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> {h}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Top Factors</div>
                  <div className="space-y-1.5">
                    {insights.topFactors.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /> {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            )}
          </div>

          <Separator className="bg-slate-100" />

          {/* Metrics — driven by selectedConversation */}
          <div className="space-y-3 mt-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Metrics Overview</h3>
            {selectedConversation ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-slate-200 rounded-lg p-3 text-center shadow-sm">
                  <div className="text-xl font-extrabold text-slate-900">{selectedConversation.metrics.sent}</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Sent</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-3 text-center shadow-sm">
                  <div className="text-xl font-extrabold text-emerald-600">{selectedConversation.metrics.responseRate}%</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Response Rate</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </div>
            )}
          </div>

        </ScrollArea>
      </div>

    </div>
  );
}
