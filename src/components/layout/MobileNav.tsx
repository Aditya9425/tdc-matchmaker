import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Sparkles, BarChart3, MessageSquare } from 'lucide-react';
import { cn } from '@/utils';

const navItems = [
  { path: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/match-studio', label: 'AI Copilot', icon: Sparkles },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/messages', label: 'Messages', icon: MessageSquare },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-bg-secondary/95 backdrop-blur-xl border-t border-border-secondary safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-150 min-w-0',
                isActive ? 'text-accent-light' : 'text-text-muted'
              )}
            >
              {item.path === '/match-studio' ? (
                <div className={cn(
                  'w-10 h-10 rounded-2xl flex items-center justify-center -mt-4 shadow-lg',
                  isActive ? 'gradient-accent' : 'bg-accent/20'
                )}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
              ) : (
                <item.icon className={cn('w-5 h-5', isActive ? 'text-accent-light' : 'text-text-muted')} />
              )}
              <span className="text-[10px] font-medium truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
