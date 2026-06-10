import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Sparkles, BarChart3, MessageSquare,
  ChevronLeft, ChevronRight, Heart, Bot, LogOut, Calendar
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/utils';

const navItems = [
  { path: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/match-studio', label: 'AI Match Studio', icon: Sparkles },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/messages', label: 'Messages', icon: MessageSquare },
];

export default function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();
  const { logout, user } = useAuthStore();
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 260 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={cn(
        'fixed left-0 top-0 bottom-0 z-40 hidden lg:flex flex-col',
        'bg-white border-r border-slate-200 shadow-sm shadow-slate-200/50'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary shrink-0 shadow-sm shadow-primary/20">
          <Heart className="w-5 h-5 text-primary-foreground" />
        </div>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="text-sm font-bold text-slate-900">TDC</div>
            <div className="text-[10px] text-slate-500 font-medium">AI Matchmaker</div>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto no-scrollbar">
        
        {/* Group: Main */}
        <div className="space-y-1">
          {!sidebarCollapsed && (
            <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Core
            </div>
          )}
          {navItems.slice(0, 3).map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  'hover:bg-slate-50',
                  isActive
                    ? 'bg-primary/5 text-primary border border-primary/10 shadow-sm'
                    : 'text-slate-600 border border-transparent hover:text-slate-900'
                )}
              >
                <item.icon className={cn('w-5 h-5 shrink-0', isActive ? 'text-primary' : 'text-slate-400')} />
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.label}
                  </motion.span>
                )}
                {isActive && !sidebarCollapsed && (
                  <motion.div
                    layoutId="activeTab"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Group: Analytics & Tools */}
        <div className="space-y-1">
          {!sidebarCollapsed && (
            <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Tools & Analytics
            </div>
          )}
          {navItems.slice(3).map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  'hover:bg-slate-50',
                  isActive
                    ? 'bg-primary/5 text-primary border border-primary/10 shadow-sm'
                    : 'text-slate-600 border border-transparent hover:text-slate-900'
                )}
              >
                <item.icon className={cn('w-5 h-5 shrink-0', isActive ? 'text-primary' : 'text-slate-400')} />
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.label}
                  </motion.span>
                )}
                {isActive && !sidebarCollapsed && (
                  <motion.div
                    layoutId="activeTab"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* AI Copilot */}
      <div className={cn('mx-3 mb-3', sidebarCollapsed ? 'px-0' : '')}>
        <button 
          onClick={() => useUIStore.getState().setCopilotOpen(true)}
          className="w-full text-left bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 shadow-sm hover:from-primary/15 hover:to-primary/10 hover:border-primary/30 transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-2 relative">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
              <Bot className="w-4 h-4 text-primary-foreground group-hover:scale-110 transition-transform" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">Intelligence</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold uppercase tracking-wider">BETA</span>
                </div>
                <span className="text-[10px] text-primary font-semibold">Platform Copilot</span>
              </div>
            )}
          </div>
          
          {!sidebarCollapsed && (
            <div className="text-xs text-slate-600 font-medium leading-relaxed relative mt-3 bg-white/50 p-2.5 rounded-lg border border-primary/10 group-hover:bg-white/80 transition-colors">
              <div className="flex items-center gap-2 text-primary font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Ask me anything...
              </div>
              Analyze matches, schedule meetings, and more.
            </div>
          )}
        </button>
      </div>

      {/* User + Collapse */}
      <div className="border-t border-slate-100 px-3 py-3 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0 shadow-sm shadow-primary/20">
              {user?.displayName?.charAt(0) || 'S'}
            </div>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
              >
                <div className="text-sm font-medium text-slate-900">{user?.displayName || 'Sarah'}</div>
                <div className="text-[10px] text-slate-500">Matchmaker</div>
              </motion.div>
            )}
          </div>
          <div className="flex items-center gap-1">
            {!sidebarCollapsed && (
              <button onClick={logout} className="p-1.5 rounded-lg hover:bg-slate-200/50 text-slate-400 hover:text-slate-700 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg hover:bg-slate-200/50 text-slate-400 hover:text-slate-700 transition-colors"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
