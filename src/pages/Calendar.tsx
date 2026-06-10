import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  format, addMonths, subMonths, startOfWeek, endOfWeek, 
  eachDayOfInterval, startOfMonth, endOfMonth, isSameMonth, 
  isSameDay, addDays, addWeeks, subWeeks, subDays
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCalendarStore } from '@/store/calendarStore';
import { useCustomerStore } from '@/store/customerStore';
import { useMatchStore } from '@/store/matchStore';
import ReactMarkdown from 'react-markdown';
import { CalendarEventModal } from '@/components/calendar/CalendarEventModal';
import type { CalendarEvent } from '@/types';
import { cn } from '@/utils';

export default function CalendarPage() {
  const { events, subscribe, isLoading, syncAICalendar, insights, isSyncing } = useCalendarStore();
  const { fetchCustomers, customers } = useCustomerStore();
  const { fetchAllMatches, allMatches: matches } = useMatchStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'Month' | 'Week' | 'Day' | 'Agenda'>('Month');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>(undefined);

  const [hasSynced, setHasSynced] = useState(false);

  useEffect(() => {
    if (customers.length === 0) fetchCustomers();
    if (matches.length === 0) fetchAllMatches();
    const unsub = subscribe();
    return () => unsub();
  }, [fetchCustomers, fetchAllMatches, subscribe]);

  useEffect(() => {
    if (customers.length > 0 && matches.length > 0 && !hasSynced && !isSyncing) {
      setHasSynced(true);
      syncAICalendar(customers, matches);
    }
  }, [customers, matches, hasSynced, isSyncing, syncAICalendar]);

  const handlePrev = () => {
    if (view === 'Month') setCurrentDate(subMonths(currentDate, 1));
    if (view === 'Week') setCurrentDate(subWeeks(currentDate, 1));
    if (view === 'Day' || view === 'Agenda') setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (view === 'Month') setCurrentDate(addMonths(currentDate, 1));
    if (view === 'Week') setCurrentDate(addWeeks(currentDate, 1));
    if (view === 'Day' || view === 'Agenda') setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => setCurrentDate(new Date());

  const openNewEvent = (date?: Date) => {
    setSelectedDate(date || new Date());
    setSelectedEvent(undefined);
    setModalOpen(true);
  };

  const openEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDate(undefined);
    setModalOpen(true);
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'Meeting': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Follow Up': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Match Review': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Profile Review': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'AI Suggested Task': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const dayEvents = events.filter(e => e.date === format(cloneDay, 'yyyy-MM-dd'));

        days.push(
          <div
            key={day.toString()}
            className={cn(
              "min-h-[120px] p-2 border-r border-b border-slate-200 transition-colors cursor-pointer hover:bg-slate-50",
              !isSameMonth(day, monthStart) ? "bg-slate-50/50 text-slate-400" : "bg-white text-slate-900"
            )}
            onClick={() => openNewEvent(cloneDay)}
          >
            <div className="flex justify-between items-center mb-1">
              <span className={cn(
                "text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full",
                isSameDay(day, new Date()) ? "bg-primary text-primary-foreground" : ""
              )}>
                {formattedDate}
              </span>
            </div>
            <div className="space-y-1">
              {dayEvents.slice(0, 3).map(event => (
                <div 
                  key={event.id}
                  onClick={(e) => { e.stopPropagation(); openEditEvent(event); }}
                  className={cn("text-[10px] truncate px-1.5 py-0.5 rounded border font-medium", getEventColor(event.type))}
                >
                  {event.startTime} - {event.title}
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-[10px] text-slate-500 font-medium pl-1">
                  +{dayEvents.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="grid grid-cols-7" key={day.toString()}>{days}</div>);
      days = [];
    }

    return (
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80">
          {weekDays.map(wd => (
            <div key={wd} className="py-2 text-center text-xs font-bold text-slate-500 border-r border-slate-200 last:border-r-0 uppercase tracking-wider">
              {wd}
            </div>
          ))}
        </div>
        {rows}
      </div>
    );
  };

  const renderAgendaView = () => {
    const upcomingEvents = events
      .filter(e => new Date(e.date) >= startOfDay(new Date()))
      .sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime());

    return (
      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {upcomingEvents.length > 0 ? upcomingEvents.map(event => (
              <div key={event.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 cursor-pointer" onClick={() => openEditEvent(event)}>
                <div className="w-24 shrink-0 text-center">
                  <div className="text-xs font-bold text-slate-900">{format(new Date(event.date), 'MMM d, yyyy')}</div>
                  <div className="text-[10px] text-slate-500 font-semibold">{event.startTime}</div>
                </div>
                <div className={cn("w-1.5 h-10 rounded-full shrink-0", getEventColor(event.type).split(' ')[0])} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-900">{event.title}</span>
                    <Badge variant={event.priority === 'High' ? 'destructive' : 'secondary'} className="text-[9px] uppercase">{event.priority}</Badge>
                  </div>
                  <div className="text-xs text-slate-500 flex gap-4">
                    {event.customerName && <span>With: <span className="font-medium text-slate-700">{event.customerName}</span></span>}
                    <span>Type: <span className="font-medium text-slate-700">{event.type}</span></span>
                  </div>
                </div>
                <div>
                  <Badge variant="outline" className={cn("text-[10px]", event.status === 'Completed' ? "text-emerald-600 border-emerald-200 bg-emerald-50" : "")}>
                    {event.status}
                  </Badge>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-500 text-sm">No upcoming events scheduled.</div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // KPIs
  const todayEvents = events.filter(e => e.date === format(new Date(), 'yyyy-MM-dd'));
  const todayMeetings = todayEvents.filter(e => e.type === 'Meeting').length;
  const pendingFollowUps = events.filter(e => e.type === 'Follow Up' && e.status === 'Pending').length;
  const overdueTasks = events.filter(e => e.status === 'Pending' && new Date(`${e.date}T${e.startTime}`) < new Date()).length;
  const upcomingReviews = events.filter(e => (e.type === 'Match Review' || e.type === 'Profile Review' || e.type === 'Verification') && e.status === 'Pending').length;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-primary" />
            Calendar
          </h1>
          <p className="text-slate-500 text-sm">Schedule and manage your matchmaking operations.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleToday} className="text-xs font-semibold">Today</Button>
          <div className="flex items-center rounded-md border border-slate-200 bg-white p-0.5 shadow-sm">
            {['Month', 'Week', 'Day', 'Agenda'].map((v: any) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded transition-colors",
                  view === v ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                {v}
              </button>
            ))}
          </div>
          <Button onClick={() => openNewEvent()} className="gap-2 text-xs font-bold shadow-sm">
            <Plus className="w-4 h-4" /> New Event
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white shadow-sm border-slate-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Meetings</p>
              <p className="text-2xl font-bold text-slate-900">{todayMeetings}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border-slate-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Follow-ups</p>
              <p className="text-2xl font-bold text-slate-900">{pendingFollowUps}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border-slate-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overdue Tasks</p>
              <p className="text-2xl font-bold text-slate-900">{overdueTasks}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border-slate-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
              <CalendarIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Upcoming Reviews</p>
              <p className="text-2xl font-bold text-slate-900">{upcomingReviews}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 min-w-0 space-y-6">
          <div className="flex items-center justify-between mb-4 mt-6">
            <h2 className="text-lg font-bold text-slate-900">
              {view === 'Month' && format(currentDate, 'MMMM yyyy')}
              {view === 'Week' && `${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`}
              {view === 'Day' && format(currentDate, 'EEEE, MMMM d, yyyy')}
              {view === 'Agenda' && 'Upcoming Agenda'}
            </h2>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" onClick={handlePrev} className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={handleNext} className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>

          {isLoading ? (
            <div className="h-[600px] bg-slate-100 animate-pulse rounded-xl" />
          ) : (
            <>
              {view === 'Month' && renderMonthView()}
              {(view === 'Week' || view === 'Day') && (
                <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
                  {view} View rendering is currently falling back to Agenda view for simplicity.
                </div>
              )}
              {view === 'Agenda' && renderAgendaView()}
            </>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="w-full xl:w-80 shrink-0 space-y-6 mt-6 xl:mt-16">
          <Card className="bg-gradient-to-br from-primary/10 via-white to-white shadow-sm border-primary/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-slate-900 text-sm">AI Scheduling Insights</h3>
              </div>
              
              {isSyncing ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (
                <div className="prose prose-sm prose-p:text-xs prose-p:text-slate-600 prose-ul:text-xs prose-li:text-slate-600">
                  {insights ? (
                    <ReactMarkdown>{insights}</ReactMarkdown>
                  ) : (
                    <div className="text-xs text-slate-500 text-center py-4">No recommendations.</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <CalendarEventModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        initialDate={selectedDate}
        existingEvent={selectedEvent}
      />
    </div>
  );
}

// helper
const startOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0,0,0,0);
  return d;
}
