/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Users, Target, Activity, 
  Sparkles, Clock, AlertCircle, RefreshCcw, Trophy,
  ChevronRight, Calendar, Send
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock Data
const activityData = [
  { name: 'Jan', matches: 120, meetings: 45, engagements: 12 },
  { name: 'Feb', matches: 150, meetings: 52, engagements: 15 },
  { name: 'Mar', matches: 180, meetings: 61, engagements: 18 },
  { name: 'Apr', matches: 220, meetings: 75, engagements: 22 },
  { name: 'May', matches: 250, meetings: 85, engagements: 28 },
  { name: 'Jun', matches: 310, meetings: 110, engagements: 35 },
];

const funnelData = [
  { name: 'Profiles', value: 1250, fill: '#8b5cf6' }, // Primary
  { name: 'Matches Sent', value: 850, fill: '#a78bfa' }, // Primary light
  { name: 'Viewed', value: 620, fill: '#c4b5fd' }, // Primary lighter
  { name: 'Meetings', value: 240, fill: '#34d399' }, // Emerald
  { name: 'Engaged', value: 85, fill: '#10b981' }, // Emerald darker
];

const compatibilityData = [
  { name: '90%+ (Excellent)', value: 15, color: '#10b981' }, // Emerald
  { name: '80-89% (Great)', value: 35, color: '#3b82f6' }, // Blue
  { name: '70-79% (Good)', value: 40, color: '#8b5cf6' }, // Primary
  { name: '<70% (Average)', value: 10, color: '#94a3b8' }, // Slate
];

const matchmakers = [
  { id: 1, name: 'Senior Matchmaker', avatar: 'https://i.pravatar.cc/150?u=a', matches: 145, success: 78 },
  { id: 2, name: 'Matchmaker Associate', avatar: 'https://i.pravatar.cc/150?u=b', matches: 120, success: 82 },
  { id: 3, name: 'Client Advisor', avatar: 'https://i.pravatar.cc/150?u=c', matches: 95, success: 71 },
  { id: 4, name: 'Onboarding Specialist', avatar: 'https://i.pravatar.cc/150?u=d', matches: 88, success: 65 },
];

const recentActivity = [
  { id: 1, time: '10 mins ago', action: 'Match sent', details: 'Automated match sent to premium client', type: 'match' },
  { id: 2, time: '1 hour ago', action: 'Meeting scheduled', details: 'Introduction scheduled for approved match', type: 'meeting' },
  { id: 3, time: '3 hours ago', action: 'Profile engaged', scale: 'New Engagement', details: 'Client accepted match proposal', type: 'engage' },
  { id: 4, time: '5 hours ago', action: 'Match sent', details: 'Match suggestion sent for review', type: 'match' },
  { id: 5, time: 'Yesterday', action: 'Meeting completed', details: 'Feedback pending for weekend introduction', type: 'meeting' },
];

export default function Analytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [insights, setInsights] = useState<any>(null);

  // Simulate network fetch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setHasError(false);
    
    import('@/services/ai/analyticsEngine').then(({ analyticsEngine }) => {
      // In a real app we would pass stringified metrics data here
      analyticsEngine.generateInsights("1250 total profiles, 850 matches sent, 240 meetings").then(data => {
        setInsights(data);
        setIsLoading(false);
      }).catch(err => {
        console.error(err);
        setHasError(true);
        setIsLoading(false);
      });
    });
  }, []);

  const handleRetry = () => {
    setIsLoading(true);
    setHasError(false);
    setTimeout(() => setIsLoading(false), 1000);
  };

  if (hasError) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-slate-50">
        <Card className="max-w-md w-full border-slate-200 shadow-sm text-center">
          <CardContent className="pt-10 pb-10">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Unable to load analytics</h3>
            <p className="text-sm text-slate-500 mb-6">
              We couldn't retrieve the latest matchmaking data from the server. Please try again.
            </p>
            <Button onClick={handleRetry} className="bg-slate-900 text-white hover:bg-slate-800">
              <RefreshCcw className="w-4 h-4 mr-2" /> Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" /> Performance Analytics
            </h1>
            <p className="text-sm text-slate-500 mt-1">Track matchmaking metrics, success rates, and team performance.</p>
          </div>
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-slate-700 bg-slate-100">7 Days</Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-slate-500 hover:text-slate-900">30 Days</Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-slate-500 hover:text-slate-900">12 Months</Button>
            <div className="w-px h-4 bg-slate-200 mx-1" />
            <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-slate-500 hover:text-slate-900">
              <Calendar className="w-3.5 h-3.5 mr-2" /> Custom
            </Button>
          </div>
        </div>

        {/* 1. KPI Overview Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <KpiCard title="Total Customers" value="1,250" trend="+12%" trendUp icon={<Users className="w-4 h-4" />} loading={isLoading} />
          <KpiCard title="Matches Sent" value="850" trend="+24%" trendUp icon={<Send className="w-4 h-4" />} loading={isLoading} />
          <KpiCard title="Meetings Scheduled" value="240" trend="+8%" trendUp icon={<Calendar className="w-4 h-4" />} loading={isLoading} />
          <KpiCard title="Success Rate" value="10.8%" trend="-1.2%" trendUp={false} icon={<Target className="w-4 h-4" />} loading={isLoading} />
        </div>

        {/* Main Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 2. Match Activity Analytics (Line Chart) */}
          <Card className="lg:col-span-2 border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <CardHeader className="border-b border-slate-100 bg-white pb-4 shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" /> Matchmaking Activity
                </CardTitle>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" /><span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Matches</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Meetings</span></div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-white flex-1 min-h-[300px]">
              {isLoading ? (
                <Skeleton className="w-full h-full rounded-xl" />
              ) : (
                <div className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activityData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line type="monotone" dataKey="matches" name="Matches Sent" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="meetings" name="Meetings" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                      <Line type="monotone" dataKey="engagements" name="Engagements" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 6. AI Insights Section */}
          <Card className="border-primary/20 bg-primary/[0.02] shadow-sm flex flex-col">
            <CardHeader className="border-b border-primary/10 bg-primary/5 pb-4 shrink-0">
              <CardTitle className="text-base font-bold text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col justify-between">
              {isLoading ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => <Skeleton key={i} className="w-full h-[72px] rounded-xl" />)}
                  <Skeleton className="w-full h-10 mt-auto" />
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <InsightCard 
                      title="Highest Converting Segment" 
                      desc={insights?.topSegments || "Professionals aged 28-32 in Tech sector show a 42% higher meeting acceptance rate."} 
                    />
                    <InsightCard 
                      title="Geographic Trend" 
                      desc={insights?.highestEngagementCities || "Matches sent between Mumbai and Pune profiles have increased success this quarter."} 
                    />
                    <InsightCard 
                      title="Action Required" 
                      desc={insights?.actionRequired || "34 premium profiles have not received a match suggestion in the last 14 days."} 
                      alert
                    />
                  </div>
                  <div className="pt-4 mt-auto">
                    <Button variant="outline" className="w-full bg-white border-primary/20 text-primary hover:bg-primary/5 shadow-sm">
                      Generate Full AI Report
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Secondary Charts & Data */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 3. Success Funnel */}
          <Card className="border-slate-200 shadow-sm flex flex-col">
            <CardHeader className="border-b border-slate-100 bg-white pb-4 shrink-0">
              <CardTitle className="text-sm font-bold text-slate-900">Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex-1 min-h-[250px]">
              {isLoading ? (
                <Skeleton className="w-full h-full rounded-xl" />
              ) : (
                <div className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} width={85} />
                      <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                        {funnelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 4. Compatibility Distribution */}
          <Card className="border-slate-200 shadow-sm flex flex-col">
            <CardHeader className="border-b border-slate-100 bg-white pb-4 shrink-0">
              <CardTitle className="text-sm font-bold text-slate-900">Platform Compatibility</CardTitle>
            </CardHeader>
            <CardContent className="p-6 relative flex-1 min-h-[250px]">
              {isLoading ? (
                <Skeleton className="w-full h-full rounded-full" />
              ) : (
                <div className="w-full h-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={compatibilityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {compatibilityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Custom Legend */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <div className="text-3xl font-extrabold text-slate-900">82%</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Avg Score</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 5. Top Matchmakers Leaderboard */}
          <Card className="border-slate-200 shadow-sm flex flex-col">
            <CardHeader className="border-b border-slate-100 bg-white pb-4 shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" /> Top Matchmakers
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <ScrollArea className="h-[250px]">
                {isLoading ? (
                  <div className="p-4 space-y-4">
                    {[1,2,3].map(i => <Skeleton key={i} className="w-full h-12" />)}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {matchmakers.map((m, i) => (
                      <div key={m.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                        <div className="w-5 text-center text-xs font-bold text-slate-400">#{i + 1}</div>
                        <Avatar className="w-8 h-8 border border-slate-200">
                          <AvatarImage src={m.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{m.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-slate-900 truncate">{m.name}</div>
                          <div className="text-[10px] font-medium text-slate-500 mt-0.5">{m.matches} Matches Sent</div>
                        </div>
                        <div className="w-16 text-right">
                          <div className="text-[11px] font-bold text-emerald-600 mb-1.5">{m.success}%</div>
                          <Progress value={m.success} className="h-1.5 bg-slate-100" indicatorClassName="bg-emerald-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

        </div>

        {/* 7. Recent Activity Feed */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-white pb-4">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" /> Recent Platform Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-6">
                {[1,2].map(i => <Skeleton key={i} className="w-full h-12" />)}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentActivity.map(act => (
                  <div key={act.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50 transition-colors group">
                    <div className="w-24 shrink-0 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {act.time}
                    </div>
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${
                        act.type === 'match' ? 'bg-primary shadow-[0_0_8px_rgba(139,92,246,0.5)]' : 
                        act.type === 'meeting' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                      }`} />
                      <div>
                        <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          {act.action}
                          {act.scale && <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] uppercase tracking-wider py-0 px-1.5">{act.scale}</Badge>}
                        </div>
                        <div className="text-xs font-medium text-slate-500 mt-0.5">{act.details}</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="hidden sm:flex text-slate-400 hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-200 shadow-sm h-8 w-8 p-0 rounded-full">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

// Helper Components

function KpiCard({ title, value, trend, trendUp, icon, loading }: { title: string, value: string, trend: string, trendUp: boolean, icon: React.ReactNode, loading: boolean }) {
  return (
    <Card className="border-slate-200 shadow-sm relative overflow-hidden bg-white group hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</h3>
              <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/20 transition-colors">
                {icon}
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">{value}</div>
            <div className={`text-xs font-bold flex items-center gap-1 ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trendUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5 rotate-180" />}
              {trend} <span className="text-slate-400 font-medium ml-1">vs last month</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function InsightCard({ title, desc, alert = false }: { title: string, desc: string, alert?: boolean }) {
  return (
    <div className={`p-4 rounded-xl border ${alert ? 'bg-amber-50 border-amber-200 shadow-sm' : 'bg-white border-primary/10 shadow-sm'}`}>
      <h4 className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 ${alert ? 'text-amber-800' : 'text-primary'}`}>
        {title}
      </h4>
      <p className={`text-xs leading-relaxed font-medium ${alert ? 'text-amber-900' : 'text-slate-600'}`}>
        {desc}
      </p>
    </div>
  );
}
