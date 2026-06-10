import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Loader2, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles, Activity, Bot, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authStatus, setAuthStatus] = useState<'idle' | 'authenticating' | 'success'>('idle');
  const { login, loginWithGoogle } = useAuthStore();
  const navigate = useNavigate();

  const handleDemoAutofill = () => {
    setEmail('admin@tdc.com');
    setPassword('password123');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Custom Enterprise Authentication Rule
    if (email !== 'admin@tdc.com') {
      toast.error('Invalid workspace credentials. Use the authorized workspace account or continue with Google.', {
        duration: 4000,
        position: 'top-center'
      });
      return;
    }

    if (password !== 'password123') {
      toast.error('Invalid workspace credentials.', { position: 'top-center' });
      return;
    }

    setAuthStatus('authenticating');
    try {
      // Under the hood, we authenticate with the seeded Firebase demo credentials
      await login('demo@gmail.com', 'Demo123');
      setAuthStatus('success');
      // Artificial delay to show success state before redirecting
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch {
      setAuthStatus('idle');
      // Error toast is handled by authStore
    }
  };

  const handleGoogleLogin = async () => {
    setAuthStatus('authenticating');
    try {
      await loginWithGoogle();
      setAuthStatus('success');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch {
      setAuthStatus('idle');
      toast.error('Google authentication failed. Please try again.');
    }
  };

  const handleNeedAccess = (e: React.MouseEvent) => {
    e.preventDefault();
    toast('Contact your workspace administrator to request access.', {
      icon: '🛡️',
      position: 'top-center',
    });
  };

  // Stagger animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none z-0" />
      
      {/* Main Container - Enterprise Glassmorphic */}
      <div className="w-full max-w-[1200px] flex flex-col lg:flex-row rounded-[32px] overflow-hidden shadow-2xl shadow-slate-200/50 border border-white bg-white/60 backdrop-blur-2xl z-10">
        
        {/* Left Side: Brand Panel */}
        <div className="flex flex-col justify-between p-8 sm:p-12 lg:p-14 w-full lg:w-[55%] bg-slate-50/80 relative overflow-hidden">
          {/* Subtle light gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-slate-50/50 to-white/80 pointer-events-none z-0" />
          
          <motion.div 
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="relative z-10 flex-1 flex flex-col"
          >
            {/* Logo Block */}
            <motion.div variants={itemVariants} className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight leading-none text-slate-900">TDC</h1>
                <p className="text-[12px] font-bold text-slate-500 mt-1 uppercase tracking-widest">AI Matchmaker</p>
              </div>
            </motion.div>
            
            {/* Hero Typography */}
            <motion.div variants={itemVariants} className="space-y-4 max-w-lg mb-12">
              <h2 className="text-4xl lg:text-[48px] font-bold tracking-tight leading-[1.1] text-slate-900">
                Smarter matches.<br />
                Meaningful futures.
              </h2>
              <p className="text-[16px] text-slate-600 leading-relaxed font-medium">
                The intelligent operating system for modern matchmaking firms. Manage clients, review compatibility, schedule meetings, generate AI insights, and deliver better matches from a single workspace.
              </p>
            </motion.div>

            {/* Feature Blocks */}
            <motion.div variants={containerVariants} className="space-y-6 max-w-lg mt-auto mb-12">
              <motion.div variants={itemVariants} className="flex items-start gap-4">
                <div className="mt-1 w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">AI Match Intelligence</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">Generate compatibility insights and relationship recommendations instantly.</p>
                </div>
              </motion.div>
              <motion.div variants={itemVariants} className="flex items-start gap-4">
                <div className="mt-1 w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Operational Command Center</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">Track meetings, reviews, follow-ups, and customer priorities in real time.</p>
                </div>
              </motion.div>
              <motion.div variants={itemVariants} className="flex items-start gap-4">
                <div className="mt-1 w-8 h-8 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">AI Copilot</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">Ask questions about customers, matches, analytics, and scheduling using natural language.</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Demo Workspace Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="relative z-10 mt-auto"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-md max-w-[440px]">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[14px] font-bold text-slate-900 uppercase tracking-wider">Demo Workspace</span>
                </div>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                  Authorized Matchmaker Environment
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email</div>
                  <div className="text-[13px] font-bold text-slate-700 font-mono truncate">admin@tdc.com</div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</div>
                  <div className="text-[13px] font-bold text-slate-700 font-mono truncate">password123</div>
                </div>
              </div>
              
              <Button 
                type="button"
                onClick={handleDemoAutofill}
                variant="outline"
                className="w-full h-12 bg-white hover:bg-slate-50 text-slate-800 border-slate-200 transition-all font-bold text-[15px] shadow-sm rounded-xl"
              >
                Use Demo Account
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Enterprise Login Form */}
        <div className="flex flex-col justify-center items-center p-8 sm:p-12 lg:p-16 w-full lg:w-[45%] bg-white relative">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-[400px]"
          >
            <div className="text-left mb-10">
              <h1 className="text-[28px] font-bold tracking-tight text-slate-900 mb-2">Welcome Back</h1>
              <p className="text-slate-500 font-medium text-sm">
                Sign in to access your matchmaking workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Floating Label Email Input */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <Input 
                  id="email" 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="peer pl-12 pt-5 pb-1 h-14 rounded-xl bg-slate-50 border-slate-200 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-[15px] font-medium shadow-sm placeholder-transparent"
                  placeholder=" "
                />
                <Label 
                  htmlFor="email" 
                  className="absolute left-12 top-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-placeholder-shown:font-medium peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-primary cursor-text"
                >
                  Email Address
                </Label>
              </div>

              {/* Floating Label Password Input */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="peer pl-12 pr-12 pt-5 pb-1 h-14 rounded-xl bg-slate-50 border-slate-200 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-[15px] font-medium shadow-sm placeholder-transparent"
                  placeholder=" "
                />
                <Label 
                  htmlFor="password" 
                  className="absolute left-12 top-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-placeholder-shown:font-medium peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-primary cursor-text"
                >
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Remember Me & Need Access */}
              <div className="flex items-center justify-between pt-1 pb-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" defaultChecked className="w-[18px] h-[18px] rounded-[4px] border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                  <Label htmlFor="remember" className="text-[13px] font-medium leading-none text-slate-600 cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <button 
                  type="button"
                  onClick={handleNeedAccess}
                  className="text-[13px] font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Need Access?
                </button>
              </div>
              
              {/* Primary CTA */}
              <Button 
                type="submit" 
                className="w-full h-14 rounded-xl text-[15px] font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group relative overflow-hidden" 
                disabled={authStatus !== 'idle'}
              >
                {authStatus === 'idle' && (
                  <>
                    Sign In To Workspace
                    <ArrowRight className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </>
                )}
                {authStatus === 'authenticating' && (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Authenticating...
                  </>
                )}
                {authStatus === 'success' && (
                  <>
                    <ShieldCheck className="h-5 w-5" />
                    Redirecting to Command Center...
                  </>
                )}
              </Button>

              {/* Security Notice */}
              <div className="flex items-center justify-center gap-1.5 pt-2">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-500">Authorized matchmakers only</span>
              </div>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full bg-slate-200" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase">
                  <span className="bg-white px-3 text-slate-400 font-bold tracking-widest">
                    OR
                  </span>
                </div>
              </div>

              {/* Google Sign In */}
              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-14 rounded-xl font-bold text-slate-700 border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all text-[15px]"
                onClick={handleGoogleLogin}
                disabled={authStatus !== 'idle'}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue With Google
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
