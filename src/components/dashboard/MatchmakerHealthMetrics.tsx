import { Card, CardContent } from '@/components/ui/card';
import { Users, ShieldAlert, CalendarClock, UserCheck, Clock, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export interface HealthMetrics {
  customersRequiringAttention: number;
  highConfidencePending: number;
  overdueFollowUps: number;
  profilesAwaitingVerification: number;
  meetingsScheduledToday: number;
  newProfilesThisWeek: number;
}

export function MatchmakerHealthMetrics({ metrics }: { metrics: HealthMetrics }) {
  const displayMetrics = [
    { label: 'Customers Requiring Attention', value: metrics.customersRequiringAttention, icon: ShieldAlert, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'High Confidence Pending', value: metrics.highConfidencePending, icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Overdue Follow-Ups', value: metrics.overdueFollowUps, icon: Clock, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Awaiting Verification', value: metrics.profilesAwaitingVerification, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Meetings Today', value: metrics.meetingsScheduledToday, icon: CalendarClock, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'New Profiles This Week', value: metrics.newProfilesThisWeek, icon: UserPlus, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-3 mb-6">
      <h3 className="text-lg font-bold text-slate-900">Matchmaker Health</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {displayMetrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white shadow-sm border-slate-200 h-full">
              <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${m.bg}`}>
                  <m.icon className={`w-4 h-4 ${m.color}`} />
                </div>
                <div className="text-2xl font-bold text-slate-900">{m.value}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{m.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
