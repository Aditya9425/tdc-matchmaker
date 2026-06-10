import { Search, Bell, Command, Menu, Settings, LogOut, User } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const { setSidebarOpen, sidebarOpen } = useAppStore();
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 lg:px-8 py-3 bg-white/80 backdrop-blur-xl border-b border-slate-200">
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div 
          className="relative group cursor-text"
          onClick={() => useUIStore.getState().setSearchOpen(true)}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <div className="w-full pl-9 pr-14 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-400 hover:bg-white hover:border-primary/30 transition-all shadow-sm">
            Search anything...
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
            <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 border border-slate-200 rounded text-slate-500">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 ml-auto">
        <button className="relative p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse ring-2 ring-white" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-primary/20 transition-all">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">
                {user?.displayName?.charAt(0) || 'S'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-slate-900">{user?.displayName || 'Sarah'}</p>
                <p className="text-xs leading-none text-slate-500">
                  {user?.email || 'sarah@tdc.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-slate-700">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-slate-700">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
