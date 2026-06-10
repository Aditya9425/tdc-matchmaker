import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import { useCopilotStore } from '@/store/copilotStore';
import { useCustomerStore } from '@/store/customerStore';
import { useMatchStore } from '@/store/matchStore';
import { useCalendarStore } from '@/store/calendarStore';
import { generateCopilotResponse } from '@/services/ai/copilotService';
import { 
  Bot, X, Send, Sparkles, User, Activity, Calendar, 
  ExternalLink, ChevronRight, MessageSquare 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const SUGGESTED_PROMPTS = [
  "Who requires attention today?",
  "What meetings are scheduled today?",
  "Show me pending reviews.",
  "Which customers are inactive?"
];

export function CopilotPanel() {
  const { isCopilotOpen, setCopilotOpen, setProfileModalOpen, setReviewMatchesOpen } = useUIStore();
  const { messages, isGenerating, addMessage, setGenerating } = useCopilotStore();
  const { customers, setSelectedCustomer } = useCustomerStore();
  const { matches } = useMatchStore();
  const { events: calendarEvents } = useCalendarStore();
  const navigate = useNavigate();
  
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleActionClick = (action: any) => {
    if (action.type === 'OPEN_PROFILE' && action.payload) {
      const customer = customers.find(c => c.id === action.payload);
      if (customer) {
        setSelectedCustomer(customer);
        setProfileModalOpen(true);
      }
    } else if (action.type === 'REVIEW_MATCHES' && action.payload) {
      const customer = customers.find(c => c.id === action.payload);
      if (customer) {
        setSelectedCustomer(customer);
        setReviewMatchesOpen(true);
      }
    } else if (action.type === 'NAVIGATE_CALENDAR') {
      navigate('/calendar');
      setCopilotOpen(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent, overrideInput?: string) => {
    if (e) e.preventDefault();
    const query = overrideInput || input;
    if (!query.trim() || isGenerating) return;

    setInput('');
    const newMessageId = Date.now().toString();
    addMessage({ id: newMessageId, role: 'user', content: query });
    setGenerating(true);

    const platformContext = {
      totalCustomers: customers.length,
      customersAwaitingMatches: customers.filter(c => c.status === 'Active Matching').slice(0, 20).map(c => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        status: c.status
      })),
      pendingMatches: matches.filter(m => m.status === 'suggested').slice(0, 10).map(m => ({
        id: m.id,
        customerId: m.customerId,
        candidateId: m.matchedCustomerId,
        score: m.compatibilityScore
      })),
      todayEvents: calendarEvents.filter(ev => {
        const today = new Date().toISOString().split('T')[0];
        return ev.date.startsWith(today);
      }).map(ev => ({
        id: ev.id,
        title: ev.title,
        type: ev.type,
        customerName: ev.customerName
      }))
    };

    const response = await generateCopilotResponse(useCopilotStore.getState().messages, platformContext);

    addMessage({
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.reply,
      actions: response.actions,
      sources: response.sources
    });

    setGenerating(false);
  };

  return (
    <AnimatePresence>
      {isCopilotOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCopilotOpen(false)}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 lg:hidden"
          />

          <motion.div
            initial={{ x: '100%', boxShadow: '-4px 0 24px rgba(0,0,0,0)' }}
            animate={{ x: 0, boxShadow: '-4px 0 24px rgba(0,0,0,0.1)' }}
            exit={{ x: '100%', boxShadow: '-4px 0 24px rgba(0,0,0,0)' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[500px] bg-white z-50 flex flex-col border-l border-slate-200"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Intelligence Center</h2>
                  <p className="text-[10px] text-slate-500 font-medium">Platform Copilot AI</p>
                </div>
              </div>
              <button
                onClick={() => setCopilotOpen(false)}
                className="p-2 rounded-full hover:bg-slate-200/50 text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white no-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-100' : 'bg-primary'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-slate-600" /> : <Sparkles className="w-4 h-4 text-primary-foreground" />}
                  </div>

                  <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-tr-sm' : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-sm'}`}>
                      {msg.role === 'user' ? (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      ) : (
                        <div className="prose prose-sm prose-p:leading-relaxed prose-p:my-1">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>

                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-col gap-2 mt-1 w-full">
                        {msg.actions.map((action, i) => (
                          <button
                            key={i}
                            onClick={() => handleActionClick(action)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-lg transition-colors w-full text-left"
                          >
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex items-center gap-2 mt-1 opacity-60">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Sources:</span>
                        <div className="flex items-center gap-1">
                          {msg.sources.map((s, i) => (
                            <span key={i} className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isGenerating && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-primary-foreground animate-pulse" />
                  </div>
                  <div className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm text-sm text-slate-500 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75" />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex overflow-x-auto no-scrollbar gap-2 mb-4 pb-1">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSubmit(undefined, prompt)}
                    className="shrink-0 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 hover:border-primary/30 hover:bg-primary/5 rounded-full transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:border-primary/30 focus-within:ring-1 focus-within:ring-primary/30 transition-all">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask the Intelligence Center..."
                  className="flex-1 max-h-32 min-h-[40px] bg-transparent text-sm text-slate-900 placeholder:text-slate-400 resize-none outline-none py-2 px-2 no-scrollbar"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!input.trim() || isGenerating}
                  className="h-9 w-9 rounded-lg shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <div className="mt-2 text-center">
                <span className="text-[10px] text-slate-400 font-medium">
                  AI Copilot uses live platform data. It can make mistakes. Check important information.
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
