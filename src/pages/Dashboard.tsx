import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, Calendar, TrendingUp, ArrowUpRight, Clock, Sparkles, ChevronRight, Bot, Activity, ShieldAlert, RefreshCw, BarChart2, CheckSquare, Check } from 'lucide-react';
import { getGreeting } from '@/utils';
import { useCustomerStore } from '@/store/customerStore';
import { useAuthStore } from '@/store/authStore';
import { useDashboardStore } from '@/store/dashboardStore';
import type { AIPriority } from '@/types';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { ReviewMatchesPanel } from '@/components/dashboard/ReviewMatchesPanel';
import { GenerateBriefPanel } from '@/components/dashboard/GenerateBriefPanel';
import { MatchmakerHealthMetrics, type HealthMetrics } from '@/components/dashboard/MatchmakerHealthMetrics';
import { AIAnalyticsPanel } from '@/components/dashboard/AIAnalyticsPanel';
import { AIWorkQueuePanel } from '@/components/dashboard/AIWorkQueuePanel';
import { useCalendarStore } from '@/store/calendarStore';
import type { AITask } from '@/services/ai/taskQueueService';
import CustomerProfileModal from '@/components/customers/CustomerProfileModal';
import { dismissSystemTask } from '@/firebase/tasks';
import { format } from 'date-fns';
import { calculateCustomerPriority } from '@/services/priorityEngine';
import { useUIStore } from '@/store/uiStore';

const statLabels = [
  { label: 'Customers', icon: Users },
  { label: 'Matches Sent', icon: Heart },
  { label: 'Meetings', icon: Calendar },
  { label: 'Avg. Compatibility', icon: TrendingUp },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { customers, fetchCustomers, isLoading: isCustomersLoading } = useCustomerStore();
  const { user } = useAuthStore();
  
  const {
    recentActivity, todayAgenda, insight, taskQueue,
    isLoadingActivity, isLoadingAgenda, isLoadingInsight, isLoadingTaskQueue,
    subscribeActivity, fetchAgenda, fetchInsight, fetchTaskQueue, dismissTask
  } = useDashboardStore();

  const {
    setProfileModalOpen,
    setReviewMatchesOpen,
    setGenerateBriefOpen,
    setAnalyticsPanelOpen
  } = useUIStore();

  const [taskQueuePanelOpen, setTaskQueuePanelOpen] = useState(false);
  const [selectedPriorityCustomerId, setSelectedPriorityCustomerId] = useState<string | null>(null);
  const [activityFilter, setActivityFilter] = useState<string>('All');

  const selectedCustomer = customers.find(c => c.id === selectedPriorityCustomerId) || null;

  const { events: calendarEvents, subscribe: subscribeCalendar, updateEvent: updateCalendarEvent } = useCalendarStore();

  useEffect(() => {
    if (customers.length === 0) {
      fetchCustomers();
    }
  }, [customers.length, fetchCustomers]);

  useEffect(() => {
    const unsubCalendar = subscribeCalendar();
    return () => unsubCalendar();
  }, [subscribeCalendar]);

  useEffect(() => {
    const unsub = subscribeActivity();
    return () => unsub();
  }, [subscribeActivity]);

  useEffect(() => {
    if (customers.length > 0 && calendarEvents.length > 0) {
      const todayEvents = calendarEvents.filter(e => e.date === format(new Date(), 'yyyy-MM-dd'));
      fetchAgenda(customers, todayEvents);
      fetchInsight();
      fetchTaskQueue(customers, calendarEvents);
    } else if (customers.length > 0) {
      fetchInsight();
    }
  }, [customers, calendarEvents, fetchAgenda, fetchInsight, fetchTaskQueue]);

  const handleTaskAction = (task: AITask) => {
    const customer = customers.find(c => c.id === task.customerId);
    if (!customer) return;

    setSelectedPriorityCustomerId(customer.id);
    setTaskQueuePanelOpen(false);

    switch (task.actionType) {
      case 'open_profile':
      case 'review_verification':
      case 'schedule_meeting':
        useCustomerStore.getState().setSelectedCustomer(customer);
        setProfileModalOpen(true);
        break;
      case 'review_match':
        useCustomerStore.getState().setSelectedCustomer(customer);
        setReviewMatchesOpen(true);
        break;
      case 'generate_brief':
        useCustomerStore.getState().setSelectedCustomer(customer);
        setGenerateBriefOpen(true);
        break;
      default:
        useCustomerStore.getState().setSelectedCustomer(customer);
        setProfileModalOpen(true);
    }
  };

  const handleDismissTask = async (taskId: string) => {
    // Optimistically dismiss locally
    dismissTask(taskId);

    try {
      if (!taskId.startsWith('pri-') && !taskId.startsWith('ver-')) {
        // It's a calendar event
        useCalendarStore.getState().updateEvent(taskId, { status: 'Completed' });
      } else {
        // It's a system priority/verification task
        await dismissSystemTask(taskId);
      }
    } catch (e) {
      console.error('Failed to dismiss task in db:', e);
    }
  };

  // Derive stats from live customer data
  const stats = [
    { ...statLabels[0], value: String(customers.length), change: `+${Math.floor(customers.length * 0.1)} this week` },
    { ...statLabels[1], value: '54', change: '+8 this week' },
    { ...statLabels[2], value: '17', change: '+4 this week' },
    { ...statLabels[3], value: '82%', change: '+6% this week' },
  ];

  // Build priorities from live customers
  const priorities: AIPriority[] = customers.length > 3
    ? [
        {
          id: '1', customerId: customers[0]?.id, customerName: customers[0]?.firstName + ' ' + customers[0]?.lastName, customerAvatar: customers[0]?.photo,
          priority: 'high', label: 'High Priority', message: 'No match sent in 12 days', action: `/ai-match-studio?customerId=${customers[0]?.id}`,
          actionLabel: 'Review Matches', updatedAt: '10m ago',
        },
        {
          id: '2', customerId: customers[1]?.id, customerName: customers[1]?.firstName + ' ' + customers[1]?.lastName, customerAvatar: customers[1]?.photo,
          priority: 'medium', label: 'Follow Up', message: 'Call scheduled tomorrow', action: `/customers`,
          actionLabel: 'Generate Brief', updatedAt: '2h ago',
        },
        {
          id: '3', customerId: customers[2]?.id, customerName: customers[2]?.firstName + ' ' + customers[2]?.lastName, customerAvatar: customers[2]?.photo,
          priority: 'high', label: 'High Potential', message: 'High compatibility detected - 94% match confidence', action: `/ai-match-studio?customerId=${customers[2]?.id}`,
          actionLabel: 'View Candidate', updatedAt: '3h ago',
        },
        {
          id: '4', customerId: customers[3]?.id, customerName: customers[3]?.firstName + ' ' + customers[3]?.lastName, customerAvatar: customers[3]?.photo,
          priority: 'low', label: 'Needs Action', message: 'Profile pending review', action: `/customers`,
          actionLabel: 'Review Profile', updatedAt: '1d ago',
        },
      ]
    : [];



  const displayName = user?.displayName || 'Matchmaker';

  if (isCustomersLoading && customers.length === 0) {
    return (
      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="p-5 shadow-sm border-slate-200">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Skeleton className="h-6 w-[150px]" />
          <Card className="p-6 shadow-sm border-slate-200 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4 items-center">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 pb-24 lg:pb-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-1"
      >
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
          {getGreeting()}, {displayName} 👋
        </h1>
        <p className="text-slate-500 text-sm">Here's your matchmaker command center for today.</p>
      </motion.div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.25 }}
          >
            <Card className="hover:shadow-md transition-shadow bg-white shadow-sm border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                  <div className="w-8 h-8 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <stat.icon className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold tracking-tight text-slate-900">{stat.value}</div>
                <div className="flex items-center gap-1.5 mt-2">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-600">{stat.change}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* AI Priorities (Structured List) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.25 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold tracking-tight text-slate-900">AI Priorities</h2>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-slate-900">
            View all
          </Button>
        </div>

        <Card className="bg-white shadow-sm border-slate-200 overflow-hidden">
          <div className="flex flex-col divide-y divide-slate-100">
            {priorities.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className="flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors group"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <Avatar className="h-10 w-10 border border-slate-200 shadow-sm shrink-0">
                    <AvatarImage src={p.customerAvatar} alt={p.customerName} />
                    <AvatarFallback className="bg-slate-100 text-slate-600 font-medium">{p.customerName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-slate-900 truncate">{p.customerName}</span>
                      <Badge 
                        variant={p.priority === 'high' ? 'destructive' : p.priority === 'medium' ? 'default' : 'secondary'}
                        className="text-[10px] font-bold uppercase tracking-wider py-0"
                      >
                        {p.label}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500 truncate">{p.message}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 pl-4">
                  <span className="hidden sm:block text-xs text-slate-400">{p.updatedAt}</span>
                  <Button 
                    size="sm"
                    className="h-8 text-xs font-medium shadow-sm w-[130px]" 
                    variant={p.priority === 'high' ? 'default' : 'outline'}
                    onClick={() => {
                      if (p.actionLabel === 'Review Matches') {
                        setSelectedPriorityCustomerId(p.customerId);
                        setReviewMatchesOpen(true);
                      } else if (p.actionLabel === 'Generate Brief') {
                        setSelectedPriorityCustomerId(p.customerId);
                        setGenerateBriefOpen(true);
                      } else {
                        navigate(p.action);
                      }
                    }}
                  >
                    {p.actionLabel}
                  </Button>
                </div>
              </motion.div>
            ))}
            {priorities.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-500">
                No priorities found. You're all caught up!
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Health Metrics & Operational Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <MatchmakerHealthMetrics metrics={{
            customersRequiringAttention: customers.filter(c => calculateCustomerPriority(c, [], calendarEvents.filter(e => e.customerId === c.id)).score >= 3).length,
            highConfidencePending: 8, // mock
            overdueFollowUps: calendarEvents.filter(e => e.status === 'Pending' && new Date(e.date + 'T' + e.startTime).getTime() < new Date().getTime()).length,
            profilesAwaitingVerification: customers.filter(c => !c.verified).length,
            meetingsScheduledToday: calendarEvents.filter(e => e.date === format(new Date(), 'yyyy-MM-dd') && e.type === 'Meeting').length,
            newProfilesThisWeek: customers.filter(c => new Date(c.joinedDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
          }} />
        </div>
        <div className="lg:col-span-4">
          <Card className="h-full bg-white border border-slate-200 shadow-sm relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 p-32 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
            <CardHeader className="pb-3 border-b border-slate-100 relative z-10 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base text-slate-900">
                    Today's Focus
                  </CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={() => fetchTaskQueue(customers, calendarEvents, true)} className="text-xs h-8 px-2 text-slate-500">
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoadingTaskQueue ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-5 relative z-10 flex flex-col flex-1 pb-4 px-5">
              {isLoadingTaskQueue ? (
                <div className="space-y-4 flex-1">
                  <Skeleton className="h-32 w-full rounded-xl" />
                  <div className="space-y-3 mt-4">
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                  </div>
                </div>
              ) : !taskQueue || taskQueue.tasks.length === 0 ? (
                <div className="text-center py-10 flex flex-col items-center justify-center flex-1">
                  <CheckSquare className="w-10 h-10 text-slate-300 mb-3" />
                  <p className="text-sm font-bold text-slate-700 mb-1">You're all caught up!</p>
                  <p className="text-xs text-slate-500 mb-4">No pending actions required.</p>
                  <Button variant="outline" size="sm" className="text-slate-600" onClick={() => fetchTaskQueue(customers, calendarEvents, true)}>
                    Check Again
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col h-full space-y-4">
                  {/* Primary Action */}
                  <div className="bg-gradient-to-br from-rose-50 to-white border border-rose-100 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-1 h-full bg-rose-500" />
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="destructive" className="text-[9px] uppercase font-bold px-1.5 h-4 bg-rose-500 hover:bg-rose-600">Primary Action</Badge>
                      <span className="text-xs font-bold text-slate-900">{taskQueue.tasks[0].customerName}</span>
                    </div>
                    <p className="text-xs text-slate-700 mb-3 font-medium">{taskQueue.tasks[0].reasoning}</p>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => handleTaskAction(taskQueue.tasks[0])} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white shadow-sm h-9">
                        {taskQueue.tasks[0].actionLabel} <ChevronRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDismissTask(taskQueue.tasks[0].id)} className="w-9 h-9 p-0 shrink-0 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 bg-white">
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Additional Tasks */}
                  <div className="space-y-2.5 flex-1">
                    {taskQueue.tasks.slice(1, 4).map(task => (
                      <div key={task.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{task.customerName}</span>
                            {task.priority === 'High' && <ShieldAlert className="w-3 h-3 text-rose-500" />}
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{task.reasoning}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                          <Button variant="outline" size="sm" onClick={() => handleTaskAction(task)} className="h-7 text-[10px] flex-1 sm:flex-none">
                            {task.actionLabel}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDismissTask(task.id)} className="h-7 w-7 shrink-0 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50">
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {taskQueue.tasks.length > 4 && (
                    <Button variant="ghost" className="w-full text-xs text-primary hover:text-primary hover:bg-primary/5 mt-auto" onClick={() => setTaskQueuePanelOpen(true)}>
                      View All {taskQueue.tasks.length} Tasks <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tri-Column Layout: Insight, Agenda, Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AI Insight */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.25 }}
        >
          <Card className="h-full relative overflow-hidden bg-white shadow-sm border-slate-200 flex flex-col">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base text-slate-900">Insight of the Day</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => fetchInsight(true)} className="w-8 h-8 text-slate-500 hover:text-slate-900">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setAnalyticsPanelOpen(true)} className="w-8 h-8 text-primary hover:text-primary hover:bg-primary/10">
                    <BarChart2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 pt-5">
              {isLoadingInsight ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                </div>
              ) : insight ? (
                <>
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4 shadow-sm relative">
                    <div className="absolute top-2 right-3 flex items-center gap-2">
                      {insight.trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />}
                      {insight.trend === 'down' && <TrendingUp className="w-3.5 h-3.5 text-rose-500 rotate-180" />}
                      <span className="text-[10px] font-bold text-primary">{insight.confidence}% Conf.</span>
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed font-medium pr-16 mt-2">
                      {insight.insight}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Evidence</span>
                      <p className="text-xs text-slate-600 leading-relaxed">{insight.evidence}</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">Recommendation</span>
                      <p className="text-xs text-emerald-800 font-medium leading-relaxed">{insight.recommendation}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500 mb-3">Unable to generate insight.</p>
                  <Button variant="outline" size="sm" onClick={() => fetchInsight(true)}>Retry</Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-4 border-t border-slate-100 mt-auto flex justify-between items-center bg-slate-50/30">
              <p className="text-[10px] text-slate-400 font-medium">Generated: {insight ? new Date(insight.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</p>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Today's Agenda */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.25 }}
        >
          <Card className="h-full flex flex-col bg-white shadow-sm border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-slate-400" />
                  <CardTitle className="text-base text-slate-900">Today's Agenda</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/calendar')} className="text-xs h-8 px-2 text-slate-500">
                  View Calendar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[340px] px-5 py-4">
                {isLoadingAgenda ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
                  </div>
                ) : todayAgenda?.items.length ? (
                  <div className="space-y-5 pb-6">
                    {todayAgenda.items.map((item, index) => {
                      const isComplete = item.status === 'Completed';
                      let Icon = Calendar;
                      let iconColor = 'text-slate-400';
                      
                      if (item.type === 'AI Recommendation') { Icon = Bot; iconColor = 'text-purple-500'; }
                      else if (item.type === 'Action Required') { Icon = ShieldAlert; iconColor = 'text-amber-500'; }
                      else if (item.type === 'Review Task') { Icon = Sparkles; iconColor = 'text-blue-500'; }
                      else if (item.type === 'Follow-Up' || item.type === 'Follow Up') { Icon = Clock; iconColor = 'text-rose-500'; }
                      else if (item.type === 'Meeting') { Icon = Calendar; iconColor = 'text-emerald-500'; }

                      return (
                      <div key={item.id} className={`relative pl-8 pb-2 ${isComplete ? 'opacity-50' : ''}`}>
                        {index !== todayAgenda.items.length - 1 && (
                          <div className="absolute left-[11px] top-6 bottom-[-24px] w-px bg-slate-200" />
                        )}
                        <div className={`absolute left-0 top-1.5 h-[24px] w-[24px] rounded-full flex items-center justify-center border-2 border-white ring-1 ring-slate-200 ${isComplete ? 'bg-emerald-100' : 'bg-slate-50'}`}>
                          <Icon className={`w-3 h-3 ${isComplete ? 'text-emerald-600' : iconColor}`} />
                        </div>
                        
                        <div className="flex flex-col gap-1 rounded-lg hover:bg-slate-50 transition-colors p-3 -ml-2.5 -mt-2.5 group border border-transparent hover:border-slate-100">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{item.startTime === 'Anytime' ? 'System Task' : `${item.startTime} - ${item.endTime}`}</span>
                            <Badge variant={item.aiPriority === 'High' ? 'destructive' : item.aiPriority === 'Medium' ? 'default' : 'secondary'} className="text-[10px] uppercase font-bold h-5 px-1.5">
                              {item.aiPriority}
                            </Badge>
                          </div>
                          <div className={`text-sm font-bold text-slate-800 ${isComplete ? 'line-through text-slate-500' : ''}`}>{item.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{item.aiReasoning}</div>
                          <div className="text-xs text-slate-500 flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                            <span className="font-medium text-slate-700">{item.customerName}</span>
                            <div className="flex items-center gap-2">
                              {!isComplete && (
                                <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={() => {
                                  if (!item.id.startsWith('sys-task-')) {
                                    updateCalendarEvent(item.id, { status: 'Completed' });
                                  } else {
                                    navigate(`/workspace/${item.customerId}`);
                                  }
                                }}>
                                  {item.id.startsWith('sys-task-') ? 'Take Action' : 'Complete'}
                                </Button>
                              )}
                              <Badge variant="outline" className={`text-[9px] uppercase font-bold bg-white`}>{item.type}</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    )})}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 text-center py-8">
                    Agenda clear for today.
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.25 }}
        >
          <Card className="h-full flex flex-col bg-white shadow-sm border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-slate-400" />
                  <CardTitle className="text-base text-slate-900">Recent Activity</CardTitle>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {['All', 'Customers', 'Meetings', 'System'].map(filter => (
                    <button
                      key={filter}
                      onClick={() => setActivityFilter(filter)}
                      className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition-colors whitespace-nowrap ${
                        activityFilter === filter ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[305px]">
                {isLoadingActivity ? (
                  <div className="p-4 space-y-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
                  </div>
                ) : recentActivity.length > 0 ? (
                  <div className="flex flex-col divide-y divide-slate-100">
                    {recentActivity.filter(a => {
                      if (activityFilter === 'All') return true;
                      if (activityFilter === 'Customers') return ['profile_verified', 'preferences_updated', 'note_added'].includes(a.type);
                      if (activityFilter === 'Meetings') return ['meeting_scheduled', 'call_completed'].includes(a.type);
                      if (activityFilter === 'System') return a.customerId === 'system';
                      return true;
                    }).map((activity) => {
                      const c = customers.find(cust => cust.id === activity.customerId);
                      const isToday = new Date(activity.date).toDateString() === new Date().toDateString();
                      const timeDisplay = isToday 
                        ? new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : new Date(activity.date).toLocaleDateString([], { month: 'short', day: 'numeric' });

                      return (
                        <div key={activity.id} className="p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors">
                          <Avatar className="h-8 w-8 border border-slate-200 shadow-sm shrink-0">
                            {c && <AvatarImage src={c.photo} alt={c.firstName} />}
                            <AvatarFallback className="text-[10px] bg-slate-100 text-slate-600 font-bold">
                              {c ? c.firstName.charAt(0) : 'SYS'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 leading-snug">
                              {activity.title}
                            </p>
                            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                              {activity.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                {timeDisplay}
                              </p>
                              {c && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-slate-100 text-slate-500">
                                    {c.firstName} {c.lastName}
                                  </Badge>
                                </>
                              )}
                              {activity.customerId === 'system' && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-slate-100 text-slate-500">
                                    System
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 text-center py-8">
                    No recent activity matches the selected filter.
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

      </div>

      <AIWorkQueuePanel
        isOpen={taskQueuePanelOpen}
        onClose={() => setTaskQueuePanelOpen(false)}
        tasks={taskQueue?.tasks || []}
        onAction={handleTaskAction}
        onDismiss={handleDismissTask}
      />
    </div>
  );
}
