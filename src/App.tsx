import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import Header from '@/components/layout/Header';
import PageTransition from '@/components/layout/PageTransition';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Customers from '@/pages/Customers';
import CustomerWorkspace from '@/pages/CustomerWorkspace';
import AIMatchStudio from '@/pages/AIMatchStudio';
import Analytics from '@/pages/Analytics';
import Messages from '@/pages/Messages';
import Calendar from '@/pages/Calendar';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { GlobalModals } from '@/components/layout/GlobalModals';

function AppLayout() {
  const { sidebarCollapsed } = useAppStore();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div
        className="flex-1 flex flex-col overflow-hidden transition-all duration-200"
        style={{ marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024 ? (sidebarCollapsed ? 72 : 260) : 0 }}
      >
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
      <MobileNav />
      <CommandPalette />
      <GlobalModals />
    </div>
  );
}

function ProtectedRoute() {
  const { isAuthenticated, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-primary">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-accent/30 border-t-accent rounded-full animate-spin" />
          <p className="text-sm text-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AppLayout />;
}

export default function App() {
  const { setIsMobile } = useAppStore();
  const { isAuthenticated, isInitialized, initAuth } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initAuth();
    return unsubscribe;
  }, [initAuth]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [setIsMobile]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isInitialized && isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/workspace/:id" element={<CustomerWorkspace />} />
          <Route path="/match-studio" element={<AIMatchStudio />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/messages" element={<Messages />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
