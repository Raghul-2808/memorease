import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  LayoutDashboard, 
  Timer, 
  Database, 
  User, 
  LogOut,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Upload,
  Folder,
  ChevronRight,
  Edit3,
  Camera,
  Trash2,
  CheckCheck,
  TrendingUp,
  Award,
  Mail,
  Lock,
  UserPlus,
  ArrowLeft,
  Plus,
  BookOpen,
  Zap,
  Star,
  Flame,
  Brain,
  Info,
  MessageCircle,
  Target,
  Rocket,
  ShieldCheck,
  FileText,
  FilePlus,
  Search,
  Bell,
  X,
  ArrowRight,
  AlertTriangle,
  Type,
  Download,
  Eye,
  EyeOff,
  Settings,
  Sliders,
  Crown,
  Shield,
  Swords,
  Gem,
  Sparkles,
  Trophy,
  Medal,
  Heart,
  Coffee,
  Moon,
  Sun,
  CloudRain,
  Music,
  Headphones,
  Gift,
  PartyPopper,
  TimerReset,
  Siren,
  Crosshair,
  Clipboard,
  Sword,
  HeartPulse,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { supabase } from './supabaseClient';

// --- Types ---
type View = 'auth' | 'overview' | 'focus' | 'vault' | 'profile' | 'notifications' | 'battle';
type AuthMode = 'landing' | 'login' | 'signup' | 'forgot';

interface Topic {
  id: string;
  uid: string;
  subjectId: string;
  name: string;
  progress: number;
  description: string;
  imageUrl: string;
  lastReviewed: string;
  nextReview: string;
  chapters: number;
  masteryLevel: number;
  assets?: { name: string, type: string, path?: string }[];
}

interface Subject {
  id: string;
  uid: string;
  name: string;
  topics: Topic[];
}

interface UserProfile {
  uid: string;
  name: string;
  avatar: string;
  rank: string;
  level: number;
  xp: number;
  streak: number;
  totalCards: number;
  globalRank: number;
  lastActive: string;
  plan: 'free' | 'pro';
}

interface Notification {
  id: string;
  uid: string;
  title: string;
  message: string;
  time: string;
  type: 'reminder' | 'achievement' | 'system';
  isRead: boolean;
}

interface PomodoroSettings {
  workTime: number;
  shortBreak: number;
  longBreak: number;
}

// --- Components ---

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void, 
  title: string, 
  message: string 
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full card-lumina p-10 text-center"
        >
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trash2 size={32} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-display font-bold text-lumina-text mb-4">{title}</h2>
          <p className="text-lumina-text/40 text-sm mb-10 leading-relaxed">{message}</p>
          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 rounded-xl bg-white/5 text-lumina-text/40 font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={() => { onConfirm(); onClose(); }}
              className="flex-1 py-4 rounded-xl bg-red-500 text-white font-bold uppercase tracking-widest text-xs hover:bg-red-600 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
            >
              Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const PlanLimitModal = ({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean, 
  onClose: () => void 
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full card-lumina p-10 text-center border-lumina-accent/30"
        >
          <div className="w-16 h-16 bg-lumina-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Zap size={32} className="text-lumina-accent" />
          </div>
          <h2 className="text-2xl font-display font-bold text-lumina-text mb-4">Neural Limit Reached</h2>
          <p className="text-lumina-text/40 text-sm mb-10 leading-relaxed">
            Free plan limit reached. Upgrade to Pro to synchronize unlimited neural chapters and unlock advanced cognitive tools.
          </p>
          <button 
            onClick={onClose}
            className="btn-primary w-full"
          >
            Upgrade to Pro
          </button>
          <button 
            onClick={onClose}
            className="mt-4 text-[10px] font-bold text-lumina-text/20 uppercase tracking-widest hover:text-lumina-text transition-colors"
          >
            Maybe Later
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const Navbar = ({ currentView, setView, unreadCount, onLogout }: { currentView: View, setView: (v: View) => void, unreadCount: number, onLogout: () => void }) => {
  const [time, setTime] = useState(new Date());
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (currentView === 'auth') return null;

  return (
    <nav className={`fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl h-16 z-50 flex items-center justify-between px-6 transition-all duration-300 rounded-full border ${
      scrolled ? 'glass-lumina' : 'bg-transparent border-transparent'
    }`}>
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setView('overview')}>
          <div className="w-8 h-8 bg-lumina-accent rounded-lg flex items-center justify-center shadow-lg shadow-lumina-accent/20">
            <Brain size={18} className="text-black" strokeWidth={2.5} />
          </div>
          <span className="text-lumina-text font-display font-bold text-xl tracking-tight">MemorEase</span>
        </div>
        
        <div className="hidden md:flex items-center gap-1">
          <NavLink active={currentView === 'overview'} onClick={() => setView('overview')} icon={<LayoutDashboard size={16} />} label="Metrics" />
          <NavLink active={currentView === 'focus'} onClick={() => setView('focus')} icon={<Timer size={16} />} label="Focus" />
          <NavLink active={currentView === 'vault'} onClick={() => setView('vault')} icon={<Database size={16} />} label="Vault" />
          <NavLink active={currentView === 'battle'} onClick={() => setView('battle')} icon={<Sword size={16} />} label="Arena" />
          <NavLink active={currentView === 'profile'} onClick={() => setView('profile')} icon={<User size={16} />} label="Profile" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-lumina-text/40 font-mono text-[10px] bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
          <Clock size={12} />
          <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
        </div>
        <button 
          onClick={() => setView('notifications')}
          className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all border ${
            currentView === 'notifications' ? 'bg-lumina-accent border-lumina-accent text-black' : 'text-lumina-text/40 border-white/10 hover:bg-white/5'
          }`}
        >
          <Zap size={16} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-lumina-accent text-black text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-lumina-bg">
              {unreadCount}
            </span>
          )}
        </button>
        <button 
          onClick={onLogout}
          className="w-9 h-9 rounded-full flex items-center justify-center text-lumina-text/40 border border-white/10 hover:text-red-500 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
};

const NavLink = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
      active 
        ? 'text-lumina-accent bg-lumina-accent/10' 
        : 'text-lumina-text/50 hover:text-lumina-text hover:bg-white/5'
    }`}
  >
    {icon}
    <span className="text-xs font-semibold tracking-wide">{label}</span>
  </button>
);

// --- Views ---

const AuthView = ({ onLogin }: { onLogin: () => void }) => {
  const [mode, setMode] = useState<'landing' | 'login' | 'signup' | 'forgot'>('landing');
  const [showInfoModal, setShowInfoModal] = useState<'about' | 'contact' | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Successful login is handled by the onAuthStateChange listener in App
      setLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      if (!data.session) {
        setSuccessMsg("Your account has been created. Please check your email and verify your address before logging in.");
        setMode('login');
        setPassword('');
      }
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setSuccessMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-lumina-bg relative overflow-hidden flex flex-col font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-lumina-accent/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-lumina-secondary/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Top Navigation for Landing Page */}
      <nav className="relative z-20 flex items-center justify-between px-8 md:px-16 py-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-lumina-accent rounded-xl flex items-center justify-center shadow-xl shadow-lumina-accent/20">
            <Brain size={24} className="text-black" strokeWidth={2.5} />
          </div>
          <span className="text-lumina-text font-display font-bold text-2xl tracking-tight">MemorEase</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => setShowInfoModal('about')}
            className="text-sm font-medium text-lumina-text/60 hover:text-lumina-accent transition-colors"
          >
            About
          </button>
          <button 
            onClick={() => setShowInfoModal('contact')}
            className="text-sm font-medium text-lumina-text/60 hover:text-lumina-accent transition-colors"
          >
            Contact
          </button>
          <button 
            onClick={() => setMode('login')}
            className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-bold hover:bg-white/10 transition-all"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center relative z-10 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-lumina-accent text-[10px] font-bold uppercase tracking-widest mb-8">
            <Zap size={12} />
            Next-Gen Learning Engine
          </div>
          
          <h1 className="text-6xl md:text-8xl font-display font-bold text-lumina-text leading-[1.1] tracking-tight mb-8">
            Master Anything <br />
            <span className="text-gradient">Faster Than Ever</span>
          </h1>
          
          <p className="text-lg md:text-xl text-lumina-text/50 max-w-2xl mx-auto leading-relaxed mb-12">
            Deploying advanced neural focus modes and spaced repetition algorithms to ensure long-term knowledge durability. Interface with your intellectual assets through a high-performance terminal.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <button 
              onClick={() => setMode('signup')}
              data-testid="get-started-btn"
              className="btn-primary px-10 py-4 text-base"
            >
              Get Started Free
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Feature Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-6xl mx-auto">
            {[
              { title: 'Spaced Repetition', desc: 'AI-driven review cycles optimized for your unique learning curve.', icon: <Clock className="text-lumina-accent" />, col: 'md:col-span-1' },
              { title: 'Deep Focus Mode', desc: 'Eliminate distractions with our proprietary hardcore focus protocols.', icon: <Timer className="text-lumina-accent" />, col: 'md:col-span-1' },
              { title: 'Neural Mapping', desc: 'Visualize connections between concepts with interactive knowledge graphs.', icon: <Brain className="text-lumina-accent" />, col: 'md:col-span-1' },
              { title: 'Secure Vault', desc: 'Your intellectual assets are encrypted and stored in a high-performance database.', icon: <Database className="text-lumina-accent" />, col: 'md:col-span-2' },
              { title: 'Smart Progress', desc: 'Track your mastery journey with intelligent analytics and insights.', icon: <TrendingUp className="text-lumina-accent" />, col: 'md:col-span-1' }
            ].map((f, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className={`${f.col} card-lumina group cursor-default`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-lumina-accent/10 group-hover:border-lumina-accent/20 transition-all">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-lumina-text/40 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 opacity-50">
            <Brain size={20} className="text-lumina-accent" />
            <span className="text-sm font-bold tracking-tight">MemorEase</span>
          </div>
          <div className="flex gap-8 text-xs font-medium text-lumina-text/30">
            <button className="hover:text-lumina-accent transition-colors">Privacy Policy</button>
            <button className="hover:text-lumina-accent transition-colors">Terms of Service</button>
            <button className="hover:text-lumina-accent transition-colors">Documentation</button>
          </div>
          <div className="text-[10px] font-mono text-lumina-text/20 uppercase tracking-widest">
            © 2026 MemorEase Neural Systems
          </div>
        </div>
      </footer>

      {/* Info Modals */}
      <AnimatePresence>
        {showInfoModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-lg card-lumina relative"
            >
              <button 
                onClick={() => setShowInfoModal(null)}
                className="absolute top-8 right-8 text-lumina-text/20 hover:text-lumina-accent transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              
              {showInfoModal === 'about' ? (
                <div>
                  <h2 className="text-3xl font-bold mb-6">System Documentation</h2>
                  <p className="text-lumina-text/50 leading-relaxed mb-8">
                    MemorEase is a high-performance cognitive optimization platform designed for scholars and researchers. 
                    Our core engine utilizes advanced spaced repetition focus modes to ensure maximum information durability.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="w-2 h-2 bg-lumina-accent rounded-full shadow-[0_0_10px_#d4ff00]"></div>
                      <span className="text-sm font-medium">Build v2.5.0-stable</span>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="w-2 h-2 bg-lumina-accent rounded-full shadow-[0_0_10px_#d4ff00]"></div>
                      <span className="text-sm font-medium">Neural Engine: Active</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-3xl font-bold mb-6">Establish Connection</h2>
                  <p className="text-lumina-text/50 leading-relaxed mb-8">
                    Establish a secure channel with our support team.
                  </p>
                  <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowInfoModal(null); }}>
                    <input type="text" placeholder="Your Name" className="input-lumina" required />
                    <input type="email" placeholder="Email Address" className="input-lumina" required />
                    <textarea placeholder="Your Message" className="input-lumina h-32 resize-none" required />
                    <button type="submit" className="btn-primary w-full py-4">Transmit Message</button>
                  </form>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modals (Overlay) */}
      <AnimatePresence>
        {mode !== 'landing' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md card-lumina relative"
            >
              <button 
                onClick={() => {
                  setMode('landing');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="absolute top-8 right-8 text-lumina-text/20 hover:text-lumina-accent transition-colors"
              >
                <ArrowLeft size={24} />
              </button>

              {mode === 'login' && (
                <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                  <p className="text-sm text-lumina-text/40 mb-8">Verify credentials to access terminal.</p>
                  
                  {successMsg && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold p-3 rounded-xl mb-6 leading-relaxed">
                      {successMsg}
                    </div>
                  )}

                  <form className="space-y-4" onSubmit={handleEmailLogin}>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-lumina-text/40 ml-1">Email</label>
                      <input 
                        type="email" 
                        placeholder="alex@rivers.sys" 
                        className="input-lumina" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-lumina-text/40 ml-1">Password</label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          className="input-lumina pr-12" 
                          required 
                          data-testid="login-password-input"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button 
                          type="button"
                          data-testid="login-toggle-password"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-lumina-text/30 hover:text-lumina-accent transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button type="button" onClick={() => { setMode('forgot'); setError(null); setSuccessMsg(null); }} className="text-[10px] font-bold text-lumina-accent hover:underline uppercase tracking-widest">Forgot Password?</button>
                    </div>
                    
                    {error && (
                      <div className="text-red-500 text-xs font-bold text-center mt-2">{error}</div>
                    )}

                    <button type="submit" disabled={loading} data-testid="login-submit-btn" className="btn-primary w-full py-4 mt-4 disabled:opacity-50">
                      {loading ? 'Authenticating...' : 'Login to System'}
                    </button>
                    
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                        <span className="bg-lumina-bg px-2 text-lumina-text/20">Or continue with</span>
                      </div>
                    </div>

                    <button 
                      type="button" 
                      onClick={handleGoogleLogin}
                      className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 hover:bg-white/10 transition-all font-bold text-sm"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12 5.04c1.94 0 3.51.68 4.75 1.81l3.51-3.51C18.1 1.31 15.26 0 12 0 7.31 0 3.25 2.69 1.24 6.63l4.09 3.17C6.3 7.39 8.94 5.04 12 5.04z" />
                        <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.86 3c2.26-2.09 3.56-5.17 3.56-8.82z" />
                        <path fill="#FBBC05" d="M5.33 14.24c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09L1.24 6.63C.45 8.24 0 10.07 0 12s.45 3.76 1.24 5.37l4.09-3.13z" />
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96L1.24 17.42C3.25 21.31 7.31 24 12 24z" />
                      </svg>
                      Google Sign In
                    </button>

                    <p className="text-center text-xs text-lumina-text/30 mt-6">
                      Don't have an account? <button type="button" onClick={() => { setMode('signup'); setError(null); setSuccessMsg(null); }} className="text-lumina-accent font-bold">Sign Up</button>
                    </p>
                  </form>
                </motion.div>
              )}

              {mode === 'signup' && (
                <motion.div key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-3xl font-bold mb-2">Create Account</h2>
                  <p className="text-sm text-lumina-text/40 mb-8">Initialize your neural learning profile.</p>
                  <form className="space-y-4" onSubmit={handleEmailSignup}>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-lumina-text/40 ml-1">Full Name</label>
                      <input 
                        type="text" 
                        placeholder="Alex Rivers" 
                        className="input-lumina" 
                        required 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-lumina-text/40 ml-1">Email</label>
                      <input 
                        type="email" 
                        placeholder="alex@rivers.sys" 
                        className="input-lumina" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-lumina-text/40 ml-1">Password</label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          className="input-lumina pr-12" 
                          required 
                          data-testid="signup-password-input"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button 
                          type="button"
                          data-testid="signup-toggle-password"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-lumina-text/30 hover:text-lumina-accent transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    
                    {error && (
                      <div className="text-red-500 text-xs font-bold text-center mt-2">{error}</div>
                    )}

                    <button type="submit" disabled={loading} data-testid="signup-submit-btn" className="btn-primary w-full py-4 mt-4 disabled:opacity-50">
                      {loading ? 'Initializing...' : 'Initialize Profile'}
                    </button>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                        <span className="bg-lumina-bg px-2 text-lumina-text/20">Or continue with</span>
                      </div>
                    </div>

                    <button 
                      type="button" 
                      onClick={handleGoogleLogin}
                      className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 hover:bg-white/10 transition-all font-bold text-sm"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12 5.04c1.94 0 3.51.68 4.75 1.81l3.51-3.51C18.1 1.31 15.26 0 12 0 7.31 0 3.25 2.69 1.24 6.63l4.09 3.17C6.3 7.39 8.94 5.04 12 5.04z" />
                        <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.86 3c2.26-2.09 3.56-5.17 3.56-8.82z" />
                        <path fill="#FBBC05" d="M5.33 14.24c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09L1.24 6.63C.45 8.24 0 10.07 0 12s.45 3.76 1.24 5.37l4.09-3.13z" />
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96L1.24 17.42C3.25 21.31 7.31 24 12 24z" />
                      </svg>
                      Google Sign In
                    </button>

                    <p className="text-center text-xs text-lumina-text/30 mt-6">
                      Already have an account? <button type="button" onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }} className="text-lumina-accent font-bold">Login</button>
                    </p>
                  </form>
                </motion.div>
              )}

              {mode === 'forgot' && (
                <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-3xl font-bold mb-2">Recovery</h2>
                  <p className="text-sm text-lumina-text/40 mb-8">Request credential reset link.</p>
                  <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setMode('login'); }}>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-lumina-text/40 ml-1">Email</label>
                      <input type="email" placeholder="alex@rivers.sys" className="input-lumina" required />
                    </div>
                    <button type="submit" className="btn-primary w-full py-4 mt-4">Send Recovery Link</button>
                    <button type="button" onClick={() => setMode('login')} className="w-full text-xs font-bold text-lumina-text/20 hover:text-lumina-text transition-colors mt-4">Back to Login</button>
                  </form>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SUBJECT_IMAGES: Record<string, string> = {
  'Mathematics': 'https://images.unsplash.com/photo-1635372722656-389f87a941b7?auto=format&fit=crop&q=80&w=1000',
  'Physics': 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=1000',
  'Chemistry': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1000',
  'Biology': 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=1000',
  'Computer Science': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1000',
  'History': 'https://images.unsplash.com/photo-1461360370896-922624d12a74?auto=format&fit=crop&q=80&w=1000',
  'English': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1000',
  'Geography': 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000',
  'Psychology': 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=1000',
  'Economics': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1000',
  'default': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000',
};

const getSubjectImage = (name: string): string => {
  for (const key of Object.keys(SUBJECT_IMAGES)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return SUBJECT_IMAGES[key];
  }
  const keys = Object.keys(SUBJECT_IMAGES).filter(k => k !== 'default');
  const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return keys[hash % keys.length] ? SUBJECT_IMAGES[keys[hash % keys.length]] : SUBJECT_IMAGES['default'];
};

const getRankIcon = (rank: string) => {
  const r = rank.toLowerCase();
  if (r.includes('eternal')) return <Crown size={16} className="text-yellow-200" />;
  if (r.includes('omniscient')) return <Sparkles size={16} className="text-purple-300" />;
  if (r.includes('transcendent')) return <Gem size={16} className="text-red-400" />;
  if (r.includes('archon')) return <Star size={16} className="text-cyan-300" />;
  if (r.includes('luminary')) return <Sparkles size={16} className="text-amber-300" />;
  if (r.includes('virtuoso')) return <Trophy size={16} className="text-blue-300" />;
  if (r.includes('sage')) return <Medal size={16} className="text-green-400" />;
  if (r.includes('adept')) return <Shield size={16} className="text-yellow-400" />;
  if (r.includes('scholar')) return <BookOpen size={16} className="text-gray-300" />;
  if (r.includes('apprentice')) return <Shield size={16} className="text-amber-600" />;
  return <Shield size={16} className="text-gray-500" />;
};

const getRankColor = (rank: string) => {
  const r = rank.toLowerCase();
  if (r.includes('eternal')) return 'from-yellow-200 via-amber-400 to-orange-500';
  if (r.includes('omniscient')) return 'from-purple-300 to-violet-500';
  if (r.includes('transcendent')) return 'from-red-400 to-rose-600';
  if (r.includes('archon')) return 'from-cyan-300 to-blue-500';
  if (r.includes('luminary')) return 'from-amber-300 to-yellow-500';
  if (r.includes('virtuoso')) return 'from-blue-300 to-indigo-500';
  if (r.includes('sage')) return 'from-green-400 to-emerald-600';
  if (r.includes('adept')) return 'from-yellow-400 to-orange-500';
  if (r.includes('scholar')) return 'from-gray-300 to-gray-500';
  if (r.includes('apprentice')) return 'from-amber-600 to-orange-700';
  return 'from-gray-500 to-gray-600';
};

// ========================================
// ACTIVITY HEATMAP (LeetCode-style)
// ========================================
const ActivityHeatmap = () => {
  const heatmapData = React.useMemo(() => {
    const data: { date: string, value: number, month: string, week: number, day: number }[] = [];
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 364; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const weekNum = Math.floor((364 - i) / 7);
      const dayNum = d.getDay();
      const isRecent = i < 120;
      const val = isRecent ? Math.floor(Math.random() * 5) : (Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0);
      data.push({ date: d.toISOString().split('T')[0], value: val, month: months[d.getMonth()], week: weekNum, day: dayNum });
    }
    return data;
  }, []);

  const activeDays = heatmapData.filter(d => d.value > 0).length;
  const maxStreak = (() => {
    let max = 0, cur = 0;
    heatmapData.forEach(d => { if (d.value > 0) { cur++; max = Math.max(max, cur); } else cur = 0; });
    return max;
  })();

  const monthLabels = (() => {
    const labels: { month: string, week: number }[] = [];
    let lastMonth = '';
    heatmapData.forEach(d => { if (d.month !== lastMonth) { labels.push({ month: d.month, week: d.week }); lastMonth = d.month; } });
    return labels;
  })();

  return (
    <div className="card-lumina p-6" data-testid="activity-heatmap">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h3 className="text-sm font-bold text-lumina-text">{activeDays} sessions in the last year</h3>
        <div className="flex items-center gap-6 text-[10px] font-bold text-lumina-text/40 uppercase tracking-widest">
          <span>Active days: <span className="text-lumina-text">{activeDays}</span></span>
          <span>Max streak: <span className="text-lumina-accent">{maxStreak}</span></span>
        </div>
      </div>
      <div className="overflow-x-auto custom-scrollbar pb-2">
        <div className="min-w-[700px]">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(53, 1fr)', gridTemplateRows: 'repeat(7, 1fr)', gap: '3px' }}>
            {Array.from({ length: 53 * 7 }).map((_, idx) => {
              const week = Math.floor(idx / 7);
              const day = idx % 7;
              const dp = heatmapData.find(d => d.week === week && d.day === day);
              const val = dp?.value || 0;
              return (
                <div key={idx} className={`aspect-square rounded-[2px] ${val === 0 ? 'bg-white/[0.04]' : val === 1 ? 'bg-lumina-accent/20' : val === 2 ? 'bg-lumina-accent/40' : val === 3 ? 'bg-lumina-accent/70' : 'bg-lumina-accent'}`} style={{ minWidth: '10px', minHeight: '10px' }} />
              );
            })}
          </div>
          <div className="flex mt-2">
            {monthLabels.map((m, i) => (
              <span key={i} className="text-[8px] font-bold text-lumina-text/20 uppercase tracking-widest" style={{ position: 'relative', left: `${(m.week / 53) * 100}%`, width: 0, whiteSpace: 'nowrap' }}>{m.month}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-3">
        <span className="text-[8px] font-bold text-lumina-text/20 uppercase tracking-widest">Less</span>
        {[0.04, 0.2, 0.4, 0.7, 1].map((op, i) => (
          <div key={i} className="w-[10px] h-[10px] rounded-[2px]" style={{ backgroundColor: i === 0 ? 'rgba(255,255,255,0.04)' : `rgba(212, 255, 0, ${op})` }} />
        ))}
        <span className="text-[8px] font-bold text-lumina-text/20 uppercase tracking-widest">More</span>
      </div>
    </div>
  );
};

const OverviewView = ({ onJumpBack, user, subjects, noteCount }: { onJumpBack: (topic: Topic) => void, user: UserProfile, subjects: Subject[], noteCount: number }) => {
  const allTopics = subjects.flatMap(s => s.topics);
  const currentTopic = allTopics.find(t => t.progress < 100) || allTopics[0] || {
    id: 't1',
    uid: user?.uid || '',
    subjectId: subjects[0]?.id || '',
    name: 'Neural Architecture',
    progress: 74,
    description: 'Master the fundamental components of neural networks and their biological inspirations.',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000',
    lastReviewed: '2h ago',
    nextReview: 'Today',
    chapters: 12,
    masteryLevel: 4,
    assets: []
  };

  return (
    <div className="pt-32 px-6 pb-20 min-h-screen relative font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lumina-accent/10 border border-lumina-accent/20 text-lumina-accent text-[10px] font-bold uppercase tracking-widest mb-4">
              <LayoutDashboard size={12} />
              Neural Dashboard
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-lumina-text tracking-tight">Welcome back, <span className="text-gradient">{user.name.split(' ')[0]}</span></h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 bg-lumina-accent/10 rounded-xl flex items-center justify-center">
                <Flame size={20} className="text-lumina-accent" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-lumina-text/30 uppercase tracking-widest">Streak</div>
                <div className="text-xl font-bold text-lumina-text">{user.streak}D</div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 bg-lumina-secondary/10 rounded-xl flex items-center justify-center">
                <Award size={20} className="text-lumina-secondary" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-lumina-text/30 uppercase tracking-widest">Level</div>
                <div className="text-xl font-bold text-lumina-text">{user.level}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Active Focus - Large Card */}
          <div className="md:col-span-8 card-lumina relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-lumina-accent/10 border border-lumina-accent/20 text-lumina-accent text-[10px] font-bold uppercase tracking-widest">
                Active Session
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-10">
              <div className="lg:w-2/5 aspect-square rounded-3xl overflow-hidden border border-white/5 shadow-2xl shadow-black">
                <img 
                  src={currentTopic.imageUrl} 
                  alt={currentTopic.name} 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-4xl font-display font-bold text-lumina-text mb-4 tracking-tight">{currentTopic.name}</h2>
                <p className="text-lumina-text/40 text-sm mb-8 leading-relaxed line-clamp-2">
                  {currentTopic.description}
                </p>
                
                <div className="space-y-4 mb-10">
                  <div className="flex justify-between text-[10px] font-bold text-lumina-text/40 uppercase tracking-widest">
                    <span>Mastery Progress</span>
                    <span className="text-lumina-accent">{currentTopic.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${currentTopic.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-lumina-accent to-lumina-secondary shadow-[0_0_15px_rgba(212,255,0,0.3)]" 
                    />
                  </div>
                </div>
                
                <button 
                  onClick={() => onJumpBack(currentTopic)}
                  className="btn-primary self-start group/btn"
                >
                  Resume Focus
                  <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Neural Load - Medium Card */}
          <div className="md:col-span-4 card-lumina flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold">Retention Curve</h3>
              <TrendingUp size={18} className="text-lumina-accent" />
            </div>
            <div className="flex-1 min-h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { day: 'D1', retention: 95 }, { day: 'D2', retention: 80 }, { day: 'D3', retention: 65 },
                  { day: 'D5', retention: 55 }, { day: 'D7', retention: 50 }, { day: 'D14', retention: 45 },
                  { day: 'D21', retention: 60 }, { day: 'D30', retention: 75 }, { day: 'D45', retention: 85 }
                ]}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4ff00" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#d4ff00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="retention" stroke="#d4ff00" fill="url(#colorVal)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
              <span className="text-[10px] font-bold text-lumina-text/30 uppercase tracking-widest">Optimizing for 85%</span>
              <span className="text-sm font-bold text-lumina-accent">85%</span>
            </div>
          </div>

          {/* Quick Stats - Small Cards */}
          <div className="md:col-span-3 card-lumina flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <Database size={20} className="text-lumina-text/40" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-lumina-text/30 uppercase tracking-widest mb-1">Total Notes</div>
              <div className="text-3xl font-display font-bold">{noteCount}</div>
            </div>
          </div>

          <div className="md:col-span-3 card-lumina flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <Award size={20} className="text-lumina-accent" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-lumina-text/30 uppercase tracking-widest mb-1">Neural Rank</div>
              <div className="flex items-center gap-2">
                {getRankIcon(user.rank)}
                <span className={`text-lg font-display font-bold bg-gradient-to-r ${getRankColor(user.rank)} bg-clip-text text-transparent uppercase tracking-wider`}>{user.rank}</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 card-lumina flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <Zap size={20} className="text-lumina-accent" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-lumina-text/30 uppercase tracking-widest mb-1">Total XP</div>
              <div className="text-3xl font-display font-bold text-lumina-accent">{user.xp.toLocaleString()}</div>
            </div>
          </div>

          {/* Neural Load Distribution - Wide Card */}
          <div className="md:col-span-6 card-lumina">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold">Study Load Distribution</h3>
              <Zap size={18} className="text-lumina-accent" />
            </div>
            {subjects.length > 0 ? (
              <>
                <div className="h-56 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={subjects.map(s => ({ name: s.name, value: Math.max(s.topics.reduce((acc, t) => acc + t.chapters, 0), 1) }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {subjects.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={['#d4ff00', '#60a5fa', '#f472b6', '#34d399', '#fbbf24', '#a78bfa', '#fb923c', '#22d3ee'][index % 8]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
                  {subjects.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ['#d4ff00', '#60a5fa', '#f472b6', '#34d399', '#fbbf24', '#a78bfa', '#fb923c', '#22d3ee'][i % 8] }} />
                      <span className="text-[9px] font-bold text-lumina-text/50 uppercase tracking-widest">{s.name}</span>
                      <span className="text-[9px] font-bold text-lumina-text/20">{s.topics.length} topics</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center text-lumina-text/20">
                <Database size={32} className="mb-3" />
                <span className="text-xs font-bold uppercase tracking-widest">No subjects yet</span>
                <span className="text-[10px] text-lumina-text/10 mt-1">Add subjects to see distribution</span>
              </div>
            )}
          </div>

          {/* Active Subjects - Wide Card */}
          <div className="md:col-span-6 card-lumina">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold">Active Subjects</h3>
              <span className="text-[10px] font-bold text-lumina-text/30 uppercase tracking-widest">{subjects.length} total</span>
            </div>
            {subjects.length > 0 ? (
              <div className="space-y-3">
                {subjects.slice(0, 4).map((subject, idx) => {
                  const totalProgress = subject.topics.length > 0 
                    ? Math.round(subject.topics.reduce((acc, t) => acc + t.progress, 0) / subject.topics.length)
                    : 0;
                  return (
                    <div key={subject.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group cursor-pointer">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                        <img src={getSubjectImage(subject.name)} alt={subject.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold mb-1 truncate">{subject.name}</div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full rounded-full bg-lumina-accent transition-all" style={{ width: `${totalProgress}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-lumina-text/40 shrink-0">{totalProgress}%</span>
                        </div>
                        <div className="text-[10px] text-lumina-text/30 uppercase tracking-widest mt-1">{subject.topics.length} modules</div>
                      </div>
                      <ChevronRight size={16} className="text-lumina-text/20 group-hover:text-lumina-accent transition-colors shrink-0" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-lumina-text/20">
                <BookOpen size={32} className="mb-3" />
                <span className="text-xs font-bold uppercase tracking-widest">No subjects yet</span>
                <span className="text-[10px] text-lumina-text/10 mt-1">Go to Vault to add subjects</span>
              </div>
            )}
          </div>

          {/* Features removed from metrics - available as standalone components */}
        </div>
      </div>
    </div>
  );
};

const FocusView = ({ 
  settings, 
  activeTopic, 
  onFinishTopic 
}: { 
  settings: PomodoroSettings, 
  activeTopic: Topic | null, 
  onFinishTopic: (t: Topic) => void 
}) => {
  const [customWork, setCustomWork] = useState(settings.workTime);
  const [customShort, setCustomShort] = useState(settings.shortBreak);
  const [customLong, setCustomLong] = useState(settings.longBreak);
  const [timerMode, setTimerMode] = useState<'pomodoro' | 'countdown' | 'stopwatch'>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(customWork * 60);
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'short' | 'long'>('work');
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [selectedMusic, setSelectedMusic] = useState('None');
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [hardcoreMode, setHardcoreMode] = useState(false);
  const [sessionFailed, setSessionFailed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [sessionsBeforeLong, setSessionsBeforeLong] = useState(4);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const AMBIENCE_URLS: Record<string, string> = {
    'Rain': 'https://cdn.pixabay.com/audio/2022/10/30/audio_a6a201c5ab.mp3',
    'Lo-Fi': 'https://cdn.pixabay.com/audio/2024/11/05/audio_98bf0b00c7.mp3',
    'Waves': 'https://cdn.pixabay.com/audio/2022/02/23/audio_ea70ad31a0.mp3',
    'Forest': 'https://cdn.pixabay.com/audio/2022/08/31/audio_419263fc5b.mp3',
    'Night': 'https://cdn.pixabay.com/audio/2024/09/26/audio_e2b1d20c1e.mp3',
  };

  useEffect(() => {
    if (selectedMusic === 'None') {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }
    
    const url = AMBIENCE_URLS[selectedMusic];
    if (!url) return;
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = 0.4;
    audio.play().catch(err => console.log('Audio autoplay blocked:', err));
    audioRef.current = audio;
    
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [selectedMusic]);

  useEffect(() => {
    let timer: any;
    if (timerMode === 'stopwatch') {
      if (isActive) {
        timer = setInterval(() => setStopwatchTime(t => t + 1), 1000);
      }
    } else {
      if (isActive && timeLeft > 0) {
        timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      } else if (timeLeft === 0 && isActive) {
        setIsActive(false);
        if (timerMode === 'pomodoro' && mode === 'work') {
          const newCount = pomodoroCount + 1;
          setPomodoroCount(newCount);
          if (newCount % sessionsBeforeLong === 0) {
            setMode('long');
            setTimeLeft(customLong * 60);
          } else {
            setMode('short');
            setTimeLeft(customShort * 60);
          }
        } else if (timerMode === 'pomodoro' && (mode === 'short' || mode === 'long')) {
          setMode('work');
          setTimeLeft(customWork * 60);
        }
        if (mode === 'work') setShowFinishModal(true);
      }
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft, mode, timerMode, stopwatchTime, customWork, customShort, customLong, pomodoroCount, sessionsBeforeLong]);

  useEffect(() => {
    if (!isActive || !hardcoreMode) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setIsActive(false);
        setSessionFailed(true);
      }
    };
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsActive(false);
        setSessionFailed(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isActive, hardcoreMode]);

  useEffect(() => {
    if (!isActive) return;
    const phases = setInterval(() => {
      setPhase(p => p === 'inhale' ? 'hold' : p === 'hold' ? 'exhale' : 'inhale');
    }, 4000);
    return () => clearInterval(phases);
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    if (!isActive && hardcoreMode) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    setIsActive(!isActive);
  };

  const resetTimer = (newMode: 'work' | 'short' | 'long') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft((newMode === 'work' ? customWork : newMode === 'short' ? customShort : customLong) * 60);
  };

  const resetStopwatch = () => {
    setIsActive(false);
    setStopwatchTime(0);
  };

  const applyCustomTime = (mins: number) => {
    setCustomWork(mins);
    if (!isActive && mode === 'work') {
      setTimeLeft(mins * 60);
    }
  };

  const timePresets = [15, 25, 30, 45, 50, 60, 90, 120];

  const totalTime = timerMode === 'stopwatch' ? 1 : (mode === 'work' ? customWork : mode === 'short' ? customShort : customLong) * 60;
  const displayTime = timerMode === 'stopwatch' ? stopwatchTime : timeLeft;
  const progress = timerMode === 'stopwatch' ? Math.min(stopwatchTime / 1500, 1) : (totalTime - timeLeft) / totalTime;

  return (
    <div className="pt-32 px-6 pb-20 min-h-screen relative font-sans overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-lumina-accent/5 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-lumina-text/40 text-[10px] font-bold uppercase tracking-widest mb-6">
            <Brain size={12} />
            Deep Focus Protocol
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-lumina-text tracking-tight mb-4">
            {timerMode === 'stopwatch' ? 'Stopwatch' : mode === 'work' ? 'Deep Work' : mode === 'short' ? 'Short Rest' : 'Long Rest'}
          </h1>
          {activeTopic && (
            <p className="text-lumina-accent font-bold uppercase tracking-[0.2em] text-xs">
              Focusing on: {activeTopic.name}
            </p>
          )}
          {timerMode === 'pomodoro' && (
            <div className="flex items-center gap-2 mt-3">
              {Array.from({ length: sessionsBeforeLong }).map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full transition-all ${i < (pomodoroCount % sessionsBeforeLong) ? 'bg-lumina-accent shadow-[0_0_8px_rgba(212,255,0,0.5)]' : 'bg-white/10'}`} />
              ))}
              <span className="text-[10px] text-lumina-text/30 ml-2 uppercase tracking-widest">{pomodoroCount} sessions</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Timer Section */}
          <div className="md:col-span-8 card-lumina flex flex-col items-center justify-center py-16 relative">
            <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mb-12">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="50%" cy="50%" r="48%" className="stroke-white/5 fill-none" strokeWidth="4" />
                <motion.circle 
                  cx="50%" cy="50%" r="48%" 
                  className="stroke-lumina-accent fill-none" 
                  strokeWidth="4"
                  strokeDasharray="100 100"
                  initial={{ strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 100 - progress * 100 }}
                  transition={{ duration: 1, ease: "linear" }}
                />
              </svg>
              <div className="text-7xl md:text-8xl font-display font-bold text-lumina-text tracking-tighter tabular-nums">
                {formatTime(displayTime)}
              </div>
              {isActive && timerMode !== 'stopwatch' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute bottom-12 text-[10px] font-bold text-lumina-accent uppercase tracking-[0.5em]"
                >
                  {phase === 'inhale' ? 'Inhale' : phase === 'hold' ? 'Hold' : 'Exhale'}
                </motion.div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTimer}
                data-testid="focus-play-pause-btn"
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  isActive 
                    ? 'bg-white/5 border border-white/10 text-lumina-text hover:bg-white/10' 
                    : 'bg-lumina-accent text-black shadow-[0_0_30px_rgba(212,255,0,0.3)] hover:scale-105'
                }`}
              >
                {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} className="ml-1" fill="currentColor" />}
              </button>
              <button 
                onClick={() => timerMode === 'stopwatch' ? resetStopwatch() : resetTimer(mode)}
                data-testid="focus-reset-btn"
                className="w-14 h-14 rounded-full bg-white/5 border border-white/10 text-lumina-text/40 flex items-center justify-center hover:bg-white/10 hover:text-lumina-text transition-all"
              >
                <RotateCcw size={20} />
              </button>
              {activeTopic && (
                <button 
                  onClick={() => setShowFinishModal(true)}
                  data-testid="focus-finish-btn"
                  className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-all"
                >
                  <CheckCheck size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Controls Section */}
          <div className="md:col-span-4 space-y-6">
            {/* Timer Mode Selector */}
            <div className="card-lumina">
              <h3 className="text-[10px] font-bold text-lumina-text/30 uppercase tracking-widest mb-6">Timer Mode</h3>
              <div className="space-y-2">
                {([
                  { key: 'pomodoro' as const, label: 'Pomodoro', icon: <Timer size={14} /> },
                  { key: 'countdown' as const, label: 'Countdown', icon: <Clock size={14} /> },
                  { key: 'stopwatch' as const, label: 'Stopwatch', icon: <TimerReset size={14} /> },
                ]).map((m) => (
                  <button
                    key={m.key}
                    onClick={() => {
                      setTimerMode(m.key);
                      setIsActive(false);
                      if (m.key === 'stopwatch') setStopwatchTime(0);
                      else setTimeLeft(customWork * 60);
                      setMode('work');
                    }}
                    data-testid={`timer-mode-${m.key}`}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-left flex items-center gap-3 ${
                      timerMode === m.key 
                        ? 'bg-lumina-accent text-black' 
                        : 'bg-white/5 text-lumina-text/40 hover:bg-white/10'
                    }`}
                  >
                    {m.icon}
                    {m.label}
                    {timerMode === m.key && <div className="w-1.5 h-1.5 rounded-full bg-black ml-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Session Mode (Pomodoro only) */}
            {timerMode === 'pomodoro' && (
              <div className="card-lumina">
                <h3 className="text-[10px] font-bold text-lumina-text/30 uppercase tracking-widest mb-6">Session Phase</h3>
                <div className="space-y-2">
                  {(['work', 'short', 'long'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => resetTimer(m)}
                      data-testid={`session-phase-${m}`}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-left flex items-center justify-between ${
                        mode === m 
                          ? 'bg-lumina-accent text-black' 
                          : 'bg-white/5 text-lumina-text/40 hover:bg-white/10'
                      }`}
                    >
                      {m === 'work' ? 'Deep Work' : m === 'short' ? 'Short Break' : 'Long Break'}
                      {mode === m && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Timer Customization */}
            <div className="card-lumina">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-bold text-lumina-text/30 uppercase tracking-widest">Customize Time</h3>
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  data-testid="toggle-timer-settings"
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${showSettings ? 'bg-lumina-accent text-black' : 'bg-white/5 text-lumina-text/40 hover:bg-white/10'}`}
                >
                  <Sliders size={14} />
                </button>
              </div>
              
              {/* Quick Presets */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {timePresets.map(p => (
                  <button
                    key={p}
                    onClick={() => applyCustomTime(p)}
                    data-testid={`preset-${p}min`}
                    className={`py-2 rounded-lg text-[10px] font-bold transition-all ${
                      customWork === p && mode === 'work'
                        ? 'bg-lumina-accent/20 text-lumina-accent border border-lumina-accent/30' 
                        : 'bg-white/5 text-lumina-text/40 border border-transparent hover:border-white/10'
                    }`}
                  >
                    {p}m
                  </button>
                ))}
              </div>

              {showSettings && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 mt-4 pt-4 border-t border-white/5"
                >
                  <div>
                    <label className="text-[9px] font-bold text-lumina-text/30 uppercase tracking-widest mb-2 block">Focus: {customWork} min</label>
                    <input 
                      type="range" min="5" max="120" value={customWork}
                      onChange={(e) => { const v = Number(e.target.value); setCustomWork(v); if (!isActive && mode === 'work') setTimeLeft(v * 60); }}
                      data-testid="focus-duration-slider"
                      className="w-full accent-lumina-accent h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-lumina-text/30 uppercase tracking-widest mb-2 block">Short Break: {customShort} min</label>
                    <input 
                      type="range" min="1" max="30" value={customShort}
                      onChange={(e) => { const v = Number(e.target.value); setCustomShort(v); if (!isActive && mode === 'short') setTimeLeft(v * 60); }}
                      data-testid="short-break-slider"
                      className="w-full accent-lumina-accent h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-lumina-text/30 uppercase tracking-widest mb-2 block">Long Break: {customLong} min</label>
                    <input 
                      type="range" min="5" max="60" value={customLong}
                      onChange={(e) => { const v = Number(e.target.value); setCustomLong(v); if (!isActive && mode === 'long') setTimeLeft(v * 60); }}
                      data-testid="long-break-slider"
                      className="w-full accent-lumina-accent h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-lumina-text/30 uppercase tracking-widest mb-2 block">Sessions before long break: {sessionsBeforeLong}</label>
                    <input 
                      type="range" min="2" max="8" value={sessionsBeforeLong}
                      onChange={(e) => setSessionsBeforeLong(Number(e.target.value))}
                      data-testid="sessions-before-long-slider"
                      className="w-full accent-lumina-accent h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            <div className="card-lumina">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-bold text-lumina-text/30 uppercase tracking-widest">Hardcore Mode</h3>
                <button 
                  onClick={() => setHardcoreMode(!hardcoreMode)}
                  data-testid="hardcore-mode-toggle"
                  className={`w-10 h-5 rounded-full relative transition-all ${hardcoreMode ? 'bg-lumina-accent' : 'bg-white/10'}`}
                >
                  <motion.div 
                    animate={{ x: hardcoreMode ? 22 : 2 }}
                    className={`absolute top-1 w-3 h-3 rounded-full ${hardcoreMode ? 'bg-black' : 'bg-white/40'}`} 
                  />
                </button>
              </div>
              <p className="text-[10px] text-lumina-text/30 leading-relaxed">
                Session fails if you leave the tab or exit fullscreen. Streak reset risk active.
              </p>
            </div>

            <div className="card-lumina">
              <h3 className="text-[10px] font-bold text-lumina-text/30 uppercase tracking-widest mb-6">Neural Ambience</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'None', icon: <X size={12} /> },
                  { name: 'Rain', icon: <CloudRain size={12} /> },
                  { name: 'Lo-Fi', icon: <Headphones size={12} /> },
                  { name: 'Waves', icon: <Music size={12} /> },
                  { name: 'Forest', icon: <Sun size={12} /> },
                  { name: 'Night', icon: <Moon size={12} /> },
                ].map((music) => (
                  <button
                    key={music.name}
                    onClick={() => setSelectedMusic(music.name)}
                    data-testid={`ambience-${music.name.toLowerCase()}`}
                    className={`py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                      selectedMusic === music.name 
                        ? 'bg-lumina-accent/20 text-lumina-accent border border-lumina-accent/30' 
                        : 'bg-white/5 text-lumina-text/40 border border-transparent hover:border-white/10'
                    }`}
                  >
                    {music.icon}
                    {music.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Session Failed Modal */}
      <AnimatePresence>
        {sessionFailed && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full card-lumina text-center p-10 border-red-500/30"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <AlertTriangle size={40} className="text-red-500" />
              </div>
              <h2 className="text-3xl font-display font-bold text-lumina-text mb-4">Protocol Terminated</h2>
              <p className="text-lumina-text/40 text-sm mb-10 leading-relaxed">
                Hardcore mode violation detected. Neural synchronization lost. Focus session invalidated.
              </p>
              <button 
                onClick={() => { setSessionFailed(false); resetTimer('work'); }}
                className="btn-primary w-full bg-red-500 hover:bg-red-600 text-white border-red-500"
              >
                Re-Initialize
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session Finish Modal */}
      <AnimatePresence>
        {showFinishModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full card-lumina text-center p-10"
            >
              <div className="w-20 h-20 bg-lumina-accent/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCheck size={40} className="text-lumina-accent" />
              </div>
              <h2 className="text-3xl font-display font-bold text-lumina-text mb-2">Session Complete</h2>
              <p className="text-lumina-accent font-bold uppercase tracking-widest text-xs mb-6">Neural Load Synchronized</p>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-10">
                <div className="text-[10px] font-bold text-lumina-text/30 uppercase tracking-widest mb-2">XP Gained</div>
                <div className="text-4xl font-display font-bold text-lumina-text">+250</div>
              </div>

              <button 
                onClick={() => { setShowFinishModal(false); activeTopic && onFinishTopic(activeTopic); }}
                className="btn-primary w-full"
              >
                Claim Rewards
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const VaultView = ({ 
  user,
  subjects, 
  onAddSubject, 
  onAddTopic, 
  onDeleteSubject, 
  onDeleteTopic, 
  onJumpToFocus 
}: { 
  user: UserProfile,
  subjects: Subject[], 
  onAddSubject: (name: string) => void, 
  onAddTopic: (id: string, name: string) => void, 
  onDeleteSubject: (id: string) => void, 
  onDeleteTopic: (id: string) => void, 
  onJumpToFocus: (t: Topic) => void 
}) => {
  const [newSubjectName, setNewSubjectName] = useState('');
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(subjects[0]?.id || null);
  const [newTopicName, setNewTopicName] = useState('');
  const [previewTopic, setPreviewTopic] = useState<Topic | null>(null);
  const [repairTopic, setRepairTopic] = useState<Topic | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadType, setUploadType] = useState<'PDF' | 'Text' | 'Notes' | null>(null);
  const [textInput, setTextInput] = useState('');

  const handleFileUpload = async (file: File | null, type: string, textContent?: string) => {
    if (!previewTopic || !user) return;
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      let fileToUpload: File;
      if (textContent) {
        const blob = new Blob([textContent], { type: 'text/plain' });
        fileToUpload = new File([blob], 'Neural_Notes.txt', { type: 'text/plain' });
      } else if (file) {
        fileToUpload = file;
      } else {
        throw new Error("No file provided");
      }

      // Simulate progress while uploading
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const fileExt = fileToUpload.name.split('.').pop() || 'bin';
      const uuid = crypto.randomUUID();
      const filePath = `${user.uid}/assets/${previewTopic.id}/${uuid}.${fileExt}`;

      const { error } = await supabase.storage
        .from('app-files')
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);

      if (error) throw error;

      // Update topic assets in Supabase
      const newAssets = [...(previewTopic.assets || []), { 
        name: fileToUpload.name, 
        type: type.toLowerCase(),
        path: filePath
      }];
      
      await supabase
        .from('topics')
        .update({ assets: newAssets })
        .eq('id', previewTopic.id);
        
      setPreviewTopic(prev => prev ? { ...prev, assets: newAssets } : null);
      
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setShowUploadModal(false);
        setUploadType(null);
        setTextInput('');
      }, 500);

    } catch (error) {
      console.error('Error uploading asset:', error);
      setIsUploading(false);
    }
  };

  const handleDownloadAsset = async (path: string) => {
    try {
      const { data, error } = await supabase.storage.from('app-files').createSignedUrl(path, 60);
      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      console.error('Error downloading asset:', error);
    }
  };

  const handleDeleteAsset = async (assetToDelete: { name: string, type: string, path?: string }) => {
    if (!previewTopic || !assetToDelete.path) return;
    try {
      const { error: storageError } = await supabase.storage.from('app-files').remove([assetToDelete.path]);
      if (storageError) throw storageError;

      const newAssets = (previewTopic.assets || []).filter(a => a.path !== assetToDelete.path);
      const { error: dbError } = await supabase
        .from('topics')
        .update({ assets: newAssets })
        .eq('id', previewTopic.id);
      
      if (dbError) throw dbError;
      setPreviewTopic(prev => prev ? { ...prev, assets: newAssets } : null);
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  const activeSubject = subjects.find(s => s.id === activeSubjectId);

  return (
    <div className="pt-32 px-6 pb-20 min-h-screen relative font-sans">
      <div className="max-w-7xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-lumina-text/40 text-[10px] font-bold uppercase tracking-widest mb-4">
              <Database size={12} />
              Neural Repository
            </div>
            <h1 className="text-5xl font-display font-bold text-lumina-text tracking-tight">The Vault</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-lumina-text/20" size={16} />
              <input 
                type="text" 
                placeholder="Search chapters..." 
                className="bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-6 text-sm text-lumina-text focus:border-lumina-accent/50 transition-all outline-none w-64"
              />
            </div>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={18} />
              Add Notes
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar: Subjects */}
          <div className="lg:col-span-3 space-y-6">
            <div className="card-lumina p-4">
              <div className="text-[10px] font-bold text-lumina-text/20 uppercase tracking-widest mb-4 px-2">Directories</div>
              <div className="space-y-1">
                {subjects.map(subject => (
                  <div
                    key={subject.id}
                    onClick={() => setActiveSubjectId(subject.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group cursor-pointer ${
                      activeSubjectId === subject.id 
                        ? 'bg-lumina-accent text-black' 
                        : 'text-lumina-text/40 hover:bg-white/5 hover:text-lumina-text'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Folder size={16} className={activeSubjectId === subject.id ? 'text-black' : 'text-lumina-accent'} />
                      <span className="text-xs font-bold uppercase tracking-tight">{subject.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono ${activeSubjectId === subject.id ? 'text-black/40' : 'text-lumina-text/10'}`}>
                        {subject.topics.length.toString().padStart(2, '0')}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteSubject(subject.id); }}
                        className={`p-1 rounded-md transition-all ${activeSubjectId === subject.id ? 'hover:bg-black/10 text-black/40' : 'hover:bg-white/10 text-lumina-text/10 hover:text-red-500'}`}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/5">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="New Subject..."
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newSubjectName.trim()) {
                        onAddSubject(newSubjectName.trim());
                        setNewSubjectName('');
                      }
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-[10px] text-lumina-text outline-none focus:border-lumina-accent/30 transition-all"
                  />
                  <button 
                    onClick={() => {
                      if (newSubjectName.trim()) {
                        onAddSubject(newSubjectName.trim());
                        setNewSubjectName('');
                      }
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-lumina-text/20 hover:text-lumina-accent transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div className="card-lumina p-6">
              <h3 className="text-[10px] font-bold text-lumina-text/20 uppercase tracking-widest mb-4">Vault Health</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-lumina-text/40 mb-2 uppercase">
                    <span>Synchronization</span>
                    <span>94%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-lumina-accent w-[94%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-lumina-text/40 mb-2 uppercase">
                    <span>Neural Integrity</span>
                    <span>88%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-lumina-accent w-[88%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content: Topics */}
          <div className="lg:col-span-9 space-y-8">
            {activeSubject ? (
              <motion.div 
                key={activeSubjectId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-lumina-accent/10 border border-lumina-accent/20 flex items-center justify-center text-lumina-accent">
                      <Folder size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-display font-bold text-lumina-text tracking-tight">{activeSubject.name}</h2>
                      <p className="text-[10px] text-lumina-text/30 uppercase tracking-widest">
                        {activeSubject.topics.length} synchronized chapters in this directory
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="New Note Name..."
                        value={newTopicName}
                        onChange={(e) => setNewTopicName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && activeSubjectId && newTopicName.trim()) {
                            onAddTopic(activeSubjectId, newTopicName.trim());
                            setNewTopicName('');
                          }
                        }}
                        className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-xs text-lumina-text outline-none focus:border-lumina-accent/30 transition-all w-48"
                      />
                    </div>
                    <button 
                      onClick={() => {
                        if (activeSubjectId && newTopicName.trim()) {
                          onAddTopic(activeSubjectId, newTopicName.trim());
                          setNewTopicName('');
                        }
                      }}
                      className="p-2 rounded-xl bg-white text-black hover:scale-105 transition-all"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeSubject.topics.map((topic) => {
                    const isFading = topic.progress < 50 || topic.masteryLevel < 2;
                    return (
                    <motion.div
                      key={topic.id}
                      layoutId={topic.id}
                      onClick={() => isFading ? setRepairTopic(topic) : setPreviewTopic(topic)}
                      data-testid={`topic-card-${topic.id}`}
                      className={`card-lumina p-6 group cursor-pointer transition-all relative overflow-hidden ${
                        isFading 
                          ? 'border-red-500/40 hover:border-red-500/60 animate-[glitch_3s_infinite]' 
                          : 'hover:border-lumina-accent/30'
                      }`}
                    >
                      {isFading && (
                        <>
                          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48bGluZSB4MT0iMCIgeTE9IjQwIiB4Mj0iMjAwIiB5Mj0iNjAiIHN0cm9rZT0icmdiYSgyMzksMjksMjksMC4wOCkiIHN0cm9rZS13aWR0aD0iMSIvPjxsaW5lIHgxPSI1MCIgeTE9IjAiIHgyPSIxNTAiIHkyPSIyMDAiIHN0cm9rZT0icmdiYSgyMzksMjksMjksMC4wNikiIHN0cm9rZS13aWR0aD0iMSIvPjxsaW5lIHgxPSIxMjAiIHkxPSIxMCIgeDI9IjgwIiB5Mj0iMTkwIiBzdHJva2U9InJnYmEoMjM5LDI5LDI5LDAuMDYpIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')] opacity-50 pointer-events-none" />
                          <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-red-500/20 border border-red-500/30">
                            <span className="text-[8px] font-bold text-red-400 uppercase tracking-widest">Fading</span>
                          </div>
                        </>
                      )}
                      <div className="flex items-start justify-between mb-6">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${
                          isFading 
                            ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                            : 'bg-white/5 border-white/10 text-lumina-text/40 group-hover:text-lumina-accent'
                        }`}>
                          <BookOpen size={20} />
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div 
                                key={i} 
                                className={`w-1 h-3 rounded-full ${i < topic.masteryLevel ? (isFading ? 'bg-red-400' : 'bg-lumina-accent') : 'bg-white/10'}`} 
                              />
                            ))}
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onDeleteTopic(topic.id); }}
                            className="p-2 rounded-lg bg-white/5 border border-white/10 text-lumina-text/20 hover:text-red-500 hover:bg-red-500/10 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <h3 className={`text-lg font-bold mb-2 transition-colors ${isFading ? 'text-red-400' : 'text-lumina-text group-hover:text-lumina-accent'}`}>{topic.name}</h3>
                      <p className="text-xs text-lumina-text/40 line-clamp-2 mb-6 leading-relaxed">
                        {topic.description}
                      </p>
                      <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                            <span className="text-[8px] text-lumina-text/20 uppercase tracking-widest mb-1">Progress</span>
                            <span className={`text-[10px] font-bold ${isFading ? 'text-red-400' : 'text-lumina-text'}`}>{topic.progress}%</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[8px] text-lumina-text/20 uppercase tracking-widest mb-1">Next Review</span>
                            <span className="text-[10px] font-bold text-lumina-accent">{topic.nextReview}</span>
                          </div>
                        </div>
                        {isFading 
                          ? <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest">Repair</span>
                          : <ArrowRight size={16} className="text-lumina-text/20 group-hover:translate-x-1 group-hover:text-lumina-accent transition-all" />
                        }
                      </div>
                    </motion.div>
                    );
                  })}

                  {activeSubject.topics.length === 0 && (
                    <div className="col-span-2 py-20 flex flex-col items-center justify-center text-center">
                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-lumina-text/10 mb-6">
                        <Database size={40} />
                      </div>
                      <h3 className="text-xl font-bold text-lumina-text/40 mb-2">Directory Empty</h3>
                      <p className="text-xs text-lumina-text/20 uppercase tracking-widest">No neural chapters synchronized yet.</p>
                    </div>
                  )}
                </div>

                {/* Magic Drop Zone */}
                <div className="mt-8">
                  <MagicDropZone user={user} activeSubjectId={activeSubjectId} onAddTopic={onAddTopic} />
                </div>
              </motion.div>
            ) : (
              <div className="h-[600px] flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-lumina-text/10 mb-8">
                  <Folder size={48} />
                </div>
                <h3 className="text-2xl font-bold text-lumina-text/40 mb-4">Select a Directory</h3>
                <p className="text-xs text-lumina-text/20 uppercase tracking-widest max-w-xs leading-relaxed">
                  Choose a neural directory from the sidebar to manage your synchronized chapters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="max-w-xl w-full card-lumina p-10"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-display font-bold text-lumina-text tracking-tight">Ingest Data</h2>
                <button 
                  onClick={() => { setShowUploadModal(false); setUploadType(null); }}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lumina-text/40 hover:text-lumina-text transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {!uploadType ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'PDF', icon: <FileText />, label: 'PDF Document', desc: 'Sync research papers' },
                    { id: 'Text', icon: <Type />, label: 'Raw Text', desc: 'Paste neural notes' },
                    { id: 'Notes', icon: <BookOpen />, label: 'Study Notes', desc: 'Import markdown' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setUploadType(type.id as any)}
                      className="p-6 rounded-2xl bg-white/5 border border-white/10 text-left hover:border-lumina-accent/30 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-lumina-accent/10 border border-lumina-accent/20 flex items-center justify-center text-lumina-accent mb-4 group-hover:scale-110 transition-transform">
                        {type.icon}
                      </div>
                      <div className="text-xs font-bold text-lumina-text uppercase tracking-widest mb-1">{type.label}</div>
                      <div className="text-[10px] text-lumina-text/30 leading-tight">{type.desc}</div>
                    </button>
                  ))}
                </div>
              ) : isUploading ? (
                <div className="py-10 space-y-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 relative mb-8">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="50%" cy="50%" r="45%" className="stroke-white/5 fill-none" strokeWidth="4" />
                        <motion.circle 
                          cx="50%" cy="50%" r="45%" className="stroke-lumina-accent fill-none" strokeWidth="4"
                          strokeDasharray="100 100"
                          animate={{ strokeDashoffset: 100 - uploadProgress }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-xl font-display font-bold text-lumina-text">
                        {uploadProgress}%
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-lumina-text mb-2">Neural Ingestion in Progress</h3>
                    <p className="text-xs text-lumina-text/40 uppercase tracking-widest">Extracting semantic patterns from {uploadType}...</p>
                  </div>
                </div>
              ) : uploadType === 'Text' ? (
                <div className="space-y-6">
                  <textarea 
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Paste your content here..."
                    className="w-full h-64 bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-lumina-text outline-none focus:border-lumina-accent/30 transition-all resize-none leading-relaxed"
                  />
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setUploadType(null)}
                      className="flex-1 py-4 rounded-xl bg-white/5 text-lumina-text/40 font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => handleFileUpload(null, 'Text', textInput)}
                      disabled={!textInput.trim()}
                      className="flex-[2] btn-primary disabled:opacity-50"
                    >
                      Synchronize
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl group hover:border-lumina-accent/30 transition-all cursor-pointer"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-lumina-text/20 mb-6 group-hover:scale-110 transition-transform">
                    <Upload size={32} />
                  </div>
                  <p className="text-sm text-lumina-text/40 font-bold uppercase tracking-widest mb-2">Drop your {uploadType} here</p>
                  <p className="text-[10px] text-lumina-text/20 uppercase tracking-widest">or click to browse files</p>
                  <input 
                    id="file-upload"
                    type="file" 
                    className="hidden" 
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], uploadType)}
                  />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Topic Preview Modal */}
      <AnimatePresence>
        {previewTopic && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="max-w-4xl w-full card-lumina overflow-hidden flex flex-col md:flex-row"
            >
              <div className="md:w-1/2 relative h-64 md:h-auto">
                <img 
                  src={previewTopic.imageUrl} 
                  alt={previewTopic.name} 
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-lumina-bg via-lumina-bg/20 to-transparent" />
                <div className="absolute bottom-8 left-8">
                  <div className="text-[10px] font-bold text-lumina-accent uppercase tracking-[0.4em] mb-2">Neural Chapter</div>
                  <h2 className="text-4xl font-display font-bold text-lumina-text tracking-tight">{previewTopic.name}</h2>
                </div>
              </div>

              <div className="md:w-1/2 p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-lumina-accent animate-pulse" />
                    <span className="text-[10px] font-bold text-lumina-text/40 uppercase tracking-widest">Active Synchronization</span>
                  </div>
                  <button 
                    onClick={() => setPreviewTopic(null)}
                    className="text-lumina-text/20 hover:text-lumina-text transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-lumina-text/20 uppercase tracking-widest">Chapter Overview</h3>
                  <p className="text-sm text-lumina-text/60 leading-relaxed">
                    {previewTopic.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="text-[8px] text-lumina-text/20 uppercase tracking-widest mb-1">Mastery</div>
                    <div className="text-xl font-display font-bold text-lumina-text">Level {previewTopic.masteryLevel}</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="text-[8px] text-lumina-text/20 uppercase tracking-widest mb-1">Retention</div>
                    <div className="text-xl font-display font-bold text-lumina-accent">{previewTopic.progress}%</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-lumina-text/20 uppercase tracking-widest">Synchronized Assets</h3>
                  <div className="space-y-2">
                    {previewTopic.assets?.map((asset, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 group hover:border-lumina-accent/30 transition-all">
                        <div className="flex items-center gap-3">
                          <FileText size={14} className="text-lumina-accent" />
                          <span className="text-[10px] font-bold text-lumina-text uppercase tracking-tight">{asset.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[8px] text-lumina-text/20 uppercase tracking-widest">{asset.type}</span>
                          {asset.path && (
                            <>
                              <button onClick={() => handleDownloadAsset(asset.path!)} className="text-lumina-accent hover:text-white transition-colors">
                                <Download size={14} />
                              </button>
                              <button onClick={() => handleDeleteAsset(asset)} className="text-red-500 hover:text-red-400 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!previewTopic.assets || previewTopic.assets.length === 0) && (
                      <p className="text-[10px] text-lumina-text/10 uppercase tracking-widest italic">No assets linked.</p>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => { if (previewTopic) { onJumpToFocus(previewTopic); setPreviewTopic(null); } }}
                  data-testid="initialize-focus-btn"
                  className="btn-primary w-full py-4 text-xs uppercase tracking-[0.2em]"
                >
                  Initialize Focus Session
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Repair Memory Modal */}
      <AnimatePresence>
        {repairTopic && (
          <RepairMemoryModal 
            topic={repairTopic} 
            onClose={() => setRepairTopic(null)}
            onRepaired={() => setRepairTopic(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const ProfileView = ({ user, setUser, subjects }: { user: UserProfile, setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>, subjects: Subject[] }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editAvatar, setEditAvatar] = useState(user.avatar);
  const [avatarUrl, setAvatarUrl] = useState<string>(user.avatar);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    const fetchAvatarUrl = async () => {
      if (!user.avatar) return;
      if (user.avatar.startsWith('http')) {
        setAvatarUrl(user.avatar);
      } else {
        try {
          const { data, error } = await supabase.storage.from('app-files').createSignedUrl(user.avatar, 3600);
          if (error) throw error;
          if (data?.signedUrl) setAvatarUrl(data.signedUrl);
        } catch (error) {
          console.error('Error fetching avatar URL:', error);
        }
      }
    };
    fetchAvatarUrl();
  }, [user.avatar]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const uuid = crypto.randomUUID();
      const filePath = `${user.uid}/avatar/${user.uid}/${uuid}.${fileExt}`;

      const { error } = await supabase.storage
        .from('app-files')
        .upload(filePath, file, { upsert: true });

      if (error) throw error;

      setEditAvatar(filePath);
      
      const { data: urlData } = await supabase.storage.from('app-files').createSignedUrl(filePath, 3600);
      if (urlData?.signedUrl) {
        setAvatarUrl(urlData.signedUrl);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const isStreakBroken = user.streak === 0 && user.xp >= 500;

  const repairStreak = async () => {
    if (user.xp >= 500) {
      try {
        const updates = { 
          streak: 1, 
          xp: user.xp - 500, 
          lastActive: new Date().toISOString() 
        };
        await supabase.from('users').update(updates).eq('uid', user.uid);
        setUser({ ...user, ...updates });
      } catch (error) {
        console.error('Error repairing streak:', error);
      }
    }
  };

  const saveProfile = async () => {
    try {
      const updates = { name: editName, avatar: editAvatar };
      await supabase.from('users').update(updates).eq('uid', user.uid);
      setUser({ ...user, ...updates });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  return (
    <div className="pt-32 px-6 pb-20 min-h-screen relative font-sans">
      <div className="max-w-7xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-lumina-text/40 text-[10px] font-bold uppercase tracking-widest mb-4">
              <User size={12} />
              Neural Dossier
            </div>
            <h1 className="text-5xl font-display font-bold text-lumina-text tracking-tight">Profile</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getRankColor(user.rank)} flex items-center justify-center shadow-lg`}>
                {getRankIcon(user.rank)}
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-lumina-text/20 uppercase tracking-widest mb-1">Rank</span>
                <span className={`text-sm font-bold bg-gradient-to-r ${getRankColor(user.rank)} bg-clip-text text-transparent uppercase tracking-widest`}>{user.rank}</span>
              </div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="btn-primary flex items-center gap-2"
            >
              <Edit3 size={16} />
              {isEditing ? 'Cancel' : 'Edit Identity'}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Identity Column */}
          <div className="lg:col-span-4 space-y-8">
            <div className="card-lumina p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-lumina-accent" />
              
              <div className="relative inline-block mb-8">
                <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-lumina-accent/20 p-1 group">
                  <img 
                    src={avatarUrl} 
                    alt={user.name} 
                    className={`w-full h-full object-cover rounded-2xl grayscale group-hover:grayscale-0 transition-all duration-500 ${isUploadingAvatar ? 'opacity-50' : ''}`}
                    referrerPolicy="no-referrer"
                  />
                </div>
                {isEditing && (
                  <div 
                    className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-lumina-accent text-black flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    <Camera size={18} />
                    <input 
                      id="avatar-upload"
                      type="file" 
                      accept="image/*"
                      className="hidden" 
                      onChange={handleAvatarUpload}
                    />
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4 mb-8">
                  <div className="space-y-1 text-left">
                    <label className="text-[8px] font-bold text-lumina-text/20 uppercase tracking-widest ml-2">Display Name</label>
                    <input 
                      type="text" 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-lumina-text outline-none focus:border-lumina-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[8px] font-bold text-lumina-text/20 uppercase tracking-widest ml-2">Avatar Source URL</label>
                    <input 
                      type="text" 
                      value={editAvatar} 
                      onChange={(e) => setEditAvatar(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-lumina-text outline-none focus:border-lumina-accent/30 transition-all"
                    />
                  </div>
                  <button 
                    onClick={saveProfile}
                    className="w-full py-4 rounded-xl bg-white text-black font-bold uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Synchronize Identity
                  </button>
                </div>
              ) : (
                <div className="mb-8">
                  <h2 className="text-3xl font-display font-bold text-lumina-text tracking-tight mb-2">{user.name}</h2>
                  <p className="text-[10px] font-bold text-lumina-text/20 uppercase tracking-[0.4em]">Member since {new Date().getFullYear()}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left">
                  <div className="text-[8px] text-lumina-text/20 uppercase tracking-widest mb-1">Neural Level</div>
                  <div className="text-2xl font-display font-bold text-lumina-text">{user.level}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left relative group">
                  <div className="text-[8px] text-lumina-text/20 uppercase tracking-widest mb-1">Focus Streak</div>
                  <div className={`text-2xl font-display font-bold ${user.streak > 0 ? 'text-lumina-accent' : 'text-red-500'}`}>
                    {user.streak}D
                  </div>
                  {isStreakBroken && (
                    <button 
                      onClick={repairStreak}
                      className="absolute inset-0 bg-lumina-accent text-black flex items-center justify-center text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
                    >
                      Repair (-500 XP)
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="card-lumina p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-lumina-text">Study Summary</h3>
                <TrendingUp size={16} className="text-lumina-accent" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-display font-bold text-lumina-accent">{subjects.length}</div>
                  <div className="text-[8px] text-lumina-text/30 uppercase tracking-widest mt-1">Subjects</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-display font-bold text-lumina-text">{subjects.flatMap(s => s.topics).length}</div>
                  <div className="text-[8px] text-lumina-text/30 uppercase tracking-widest mt-1">Topics</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-display font-bold text-lumina-accent">{Math.round(subjects.flatMap(s => s.topics).reduce((a, t) => a + t.progress, 0) / Math.max(subjects.flatMap(s => s.topics).length, 1))}%</div>
                  <div className="text-[8px] text-lumina-text/30 uppercase tracking-widest mt-1">Avg Mastery</div>
                </div>
              </div>
              <p className="text-[10px] text-lumina-text/20 uppercase tracking-widest mt-4 text-center">Activity heatmap available in Metrics tab</p>
            </div>
          </div>

          {/* Analytics Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Rank Progression Card */}
            <div className="card-lumina p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-bold text-lumina-text/20 uppercase tracking-widest">Rank Progression</h3>
                <Trophy size={16} className="text-lumina-accent" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { rank: 'Novice', minXp: 0, icon: <Shield size={20} className="text-gray-500" />, color: 'from-gray-500 to-gray-600' },
                  { rank: 'Apprentice', minXp: 200, icon: <Shield size={20} className="text-amber-600" />, color: 'from-amber-600 to-orange-700' },
                  { rank: 'Scholar', minXp: 500, icon: <BookOpen size={20} className="text-gray-300" />, color: 'from-gray-300 to-gray-500' },
                  { rank: 'Adept', minXp: 1000, icon: <Shield size={20} className="text-yellow-400" />, color: 'from-yellow-400 to-orange-500' },
                  { rank: 'Sage', minXp: 2000, icon: <Medal size={20} className="text-green-400" />, color: 'from-green-400 to-emerald-600' },
                  { rank: 'Virtuoso', minXp: 4000, icon: <Trophy size={20} className="text-blue-300" />, color: 'from-blue-300 to-indigo-500' },
                  { rank: 'Luminary', minXp: 7000, icon: <Sparkles size={20} className="text-amber-300" />, color: 'from-amber-300 to-yellow-500' },
                  { rank: 'Archon', minXp: 12000, icon: <Star size={20} className="text-cyan-300" />, color: 'from-cyan-300 to-blue-500' },
                  { rank: 'Transcendent', minXp: 20000, icon: <Gem size={20} className="text-red-400" />, color: 'from-red-400 to-rose-600' },
                  { rank: 'Omniscient', minXp: 35000, icon: <Sparkles size={20} className="text-purple-300" />, color: 'from-purple-300 to-violet-500' },
                  { rank: 'Eternal', minXp: 60000, icon: <Crown size={20} className="text-yellow-200" />, color: 'from-yellow-200 via-amber-400 to-orange-500' },
                ].map((r) => {
                  const isUnlocked = user.xp >= r.minXp;
                  const isCurrent = user.rank.toLowerCase().includes(r.rank.toLowerCase());
                  return (
                    <div 
                      key={r.rank}
                      className={`p-4 rounded-2xl border transition-all ${
                        isCurrent 
                          ? 'bg-lumina-accent/10 border-lumina-accent/30 shadow-[0_0_20px_rgba(212,255,0,0.1)]' 
                          : isUnlocked 
                            ? 'bg-white/5 border-white/10' 
                            : 'bg-white/[0.02] border-white/5 opacity-40'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${isUnlocked ? `bg-gradient-to-br ${r.color}` : 'bg-white/5'}`}>
                        {r.icon}
                      </div>
                      <div className="text-xs font-bold text-lumina-text uppercase tracking-tight">{r.rank}</div>
                      <div className="text-[8px] text-lumina-text/30 uppercase tracking-widest mt-1">{r.minXp.toLocaleString()} XP</div>
                      {isCurrent && <div className="w-full h-0.5 bg-lumina-accent rounded-full mt-2" />}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card-lumina p-8">
              <h3 className="text-[10px] font-bold text-lumina-text/20 uppercase tracking-widest mb-8">Mastery Milestones</h3>
              <div className="space-y-4">
                {[
                  { title: 'Neural Initiate', progress: 100, date: 'SYNCED', icon: <Zap size={16} /> },
                  { title: 'Memory Architect', progress: 100, date: 'SYNCED', icon: <Database size={16} /> },
                  { title: 'Focus Vanguard', progress: 65, date: 'IN_PROGRESS', icon: <Award size={16} /> },
                  { title: 'Cognitive Sovereign', progress: 0, date: 'LOCKED', icon: <Award size={16} /> },
                ].map((m) => (
                  <div key={m.title} className="flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/10 group hover:border-lumina-accent/30 transition-all">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${m.progress === 100 ? 'bg-lumina-accent text-black' : 'bg-white/5 text-lumina-text/10'}`}>
                      {m.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-3">
                        <span className="text-xs font-bold text-lumina-text uppercase tracking-tight">{m.title}</span>
                        <span className="text-[8px] font-bold text-lumina-accent uppercase tracking-widest">{m.date}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${m.progress}%` }}
                          className="h-full bg-lumina-accent"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationsView = ({ notifications, subjects, user }: { notifications: Notification[], subjects: Subject[], user: UserProfile }) => {
  const generateDynamicNotifications = () => {
    const dynamic: { id: string, uid: string, title: string, message: string, time: string, type: 'reminder' | 'achievement' | 'system', isRead: boolean }[] = [];
    
    const allTopics = subjects.flatMap(s => s.topics);
    
    allTopics.forEach((topic, i) => {
      if (topic.progress < 100 && topic.lastReviewed !== 'Never') {
        dynamic.push({
          id: `decay-${topic.id}`,
          uid: user.uid,
          title: `${topic.name} is fading!`,
          message: `Your "${topic.name}" chapter is slipping away from memory! A quick review session now will lock it in. Don't let your progress decay!`,
          time: 'Now',
          type: 'reminder',
          isRead: false
        });
      }
    });

    if (user.streak >= 3) {
      dynamic.push({
        id: 'streak-fire',
        uid: user.uid,
        title: `${user.streak}-Day Streak!`,
        message: `You're absolutely crushing it! ${user.streak} days of consistent learning. Your brain is building powerful neural pathways right now!`,
        time: 'Today',
        type: 'achievement',
        isRead: false
      });
    }

    if (user.streak === 0) {
      dynamic.push({
        id: 'streak-broken',
        uid: user.uid,
        title: 'Your streak needs attention!',
        message: 'Start a focus session today to rebuild your streak. Even 15 minutes can make a huge difference in retention!',
        time: 'Today',
        type: 'reminder',
        isRead: false
      });
    }

    const nextRankXp = [200, 500, 1000, 2000, 4000, 7000, 12000, 20000, 35000, 60000].find(x => x > user.xp);
    if (nextRankXp) {
      const remaining = nextRankXp - user.xp;
      if (remaining < 300) {
        dynamic.push({
          id: 'rank-close',
          uid: user.uid,
          title: 'Rank Up Incoming!',
          message: `Only ${remaining} XP away from your next rank! One solid focus session could get you there!`,
          time: 'Now',
          type: 'achievement',
          isRead: false
        });
      }
    }

    if (allTopics.length > 0) {
      const lowProgress = allTopics.filter(t => t.progress < 50 && t.progress > 0);
      lowProgress.slice(0, 2).forEach(topic => {
        dynamic.push({
          id: `low-${topic.id}`,
          uid: user.uid,
          title: `MemorEase "${topic.name}" now!`,
          message: `This chapter is at only ${topic.progress}% mastery. The forgetting curve is working against you - review it before it drops further!`,
          time: '1h ago',
          type: 'reminder',
          isRead: true
        });
      });
    }

    if (user.level >= 5) {
      dynamic.push({
        id: 'level-milestone',
        uid: user.uid,
        title: `Level ${user.level} Achieved!`,
        message: `Incredible progress! You've reached Level ${user.level}. Your dedication to learning is truly inspiring!`,
        time: 'Recent',
        type: 'achievement',
        isRead: true
      });
    }

    if (subjects.length > 0) {
      dynamic.push({
        id: 'daily-goal',
        uid: user.uid,
        title: 'Daily Focus Goal',
        message: `You have ${allTopics.filter(t => t.progress < 100).length} chapters still in progress. Try to complete at least one review session today!`,
        time: 'Morning',
        type: 'system',
        isRead: true
      });
    }

    const completedTopics = allTopics.filter(t => t.progress === 100);
    if (completedTopics.length > 0) {
      dynamic.push({
        id: 'mastery-celebrate',
        uid: user.uid,
        title: `${completedTopics.length} Chapters Mastered!`,
        message: `You've fully mastered ${completedTopics.length} chapter${completedTopics.length > 1 ? 's' : ''}! Knowledge deeply encoded in your neural pathways!`,
        time: 'This week',
        type: 'achievement',
        isRead: true
      });
    }

    return dynamic;
  };

  const dynamicNotifs = generateDynamicNotifications();
  const allNotifications = [...notifications, ...dynamicNotifs];

  const markAllRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
      if (unreadIds.length > 0) {
        await supabase
          .from('notifications')
          .update({ isRead: true })
          .in('id', unreadIds);
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    if (id.startsWith('decay-') || id.startsWith('streak-') || id.startsWith('rank-') || id.startsWith('low-') || id.startsWith('level-') || id.startsWith('daily-') || id.startsWith('mastery-')) return;
    try {
      await supabase.from('notifications').delete().eq('id', id);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotifEmoji = (type: string, title: string) => {
    const t = title.toLowerCase();
    if (t.includes('fading') || t.includes('fade') || t.includes('decay') || t.includes('memorease')) return '🧠';
    if (t.includes('streak') && !t.includes('attention')) return '🔥';
    if (t.includes('streak') && t.includes('attention')) return '⚡';
    if (t.includes('rank')) return '🏅';
    if (t.includes('level')) return '⭐';
    if (t.includes('mastered') || t.includes('milestone')) return '🏆';
    if (t.includes('daily') || t.includes('goal')) return '🎯';
    if (type === 'reminder') return '📚';
    if (type === 'achievement') return '🌟';
    return '⚡';
  };

  const getNotifBg = (type: string) => {
    if (type === 'reminder') return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    if (type === 'achievement') return 'bg-lumina-accent/10 text-lumina-accent border-lumina-accent/20';
    return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  };

  return (
    <div className="pt-32 px-6 pb-20 min-h-screen relative font-sans">
      <div className="max-w-4xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-lumina-text/40 text-[10px] font-bold uppercase tracking-widest mb-4">
              <Bell size={12} />
              System Logs
            </div>
            <h1 className="text-5xl font-display font-bold text-lumina-text tracking-tight">Notifications</h1>
            <p className="text-sm text-lumina-text/30 mt-2">Stay on top of your learning journey</p>
          </div>
          <button 
            onClick={markAllRead}
            data-testid="clear-all-notifications"
            className="text-[10px] font-bold text-lumina-accent hover:underline flex items-center gap-2 uppercase tracking-widest"
          >
            <CheckCheck size={14} /> Clear All
          </button>
        </header>

        <div className="space-y-4">
          {allNotifications.length > 0 ? (
            allNotifications.map((n, i) => {
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  data-testid={`notification-item-${n.id}`}
                  className={`card-lumina p-6 flex items-start gap-6 relative group transition-all ${!n.isRead ? 'border-lumina-accent/50' : ''}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${getNotifBg(n.type)}`}>
                    <span className="text-2xl">{getNotifEmoji(n.type, n.title)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-bold text-lumina-text tracking-tight flex items-center gap-2">
                        {n.title}
                        {!n.isRead && <span className="w-2 h-2 bg-lumina-accent rounded-full inline-block animate-pulse" />}
                      </h3>
                      <span className="text-[10px] font-bold text-lumina-text/20 uppercase tracking-widest shrink-0 ml-4">{n.time}</span>
                    </div>
                    <p className="text-xs text-lumina-text/50 leading-relaxed">{n.message}</p>
                    {n.type === 'reminder' && (
                      <button className="mt-3 text-[10px] font-bold text-lumina-accent uppercase tracking-widest hover:underline flex items-center gap-1">
                        Review Now <ChevronRight size={12} />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => deleteNotification(n.id)}
                      data-testid={`delete-notification-${n.id}`}
                      className="w-10 h-10 rounded-xl bg-white/5 text-lumina-text/40 flex items-center justify-center hover:bg-red-500 hover:text-black transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="py-32 text-center text-lumina-text/10">
              <Zap size={48} className="mx-auto mb-6" />
              <p className="text-[10px] uppercase tracking-[0.3em]">All focuses synchronized.</p>
            </div>
          )}
        </div>

        <div className="mt-16 p-8 card-lumina relative overflow-hidden group border-orange-500/30">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
              <span className="text-3xl">🧠</span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-bold text-lumina-text mb-2 tracking-tight">Memory Decay Alert</h3>
              <p className="text-xs text-lumina-text/40 leading-relaxed">
                Your chapters are starting to fade! The forgetting curve is real - a quick 10-minute review can save weeks of relearning. Don't let your hard work slip away!
              </p>
            </div>
            <button className="btn-primary w-full md:w-auto py-4 px-10 text-[10px] uppercase tracking-[0.2em]" data-testid="review-now-btn">Review Now</button>
          </div>
        </div>

        {/* Motivational Banner */}
        <div className="mt-8 p-6 card-lumina relative overflow-hidden group border-lumina-accent/20">
          <div className="absolute top-0 left-0 w-1 h-full bg-lumina-accent" />
          <div className="flex items-center gap-6">
            <span className="text-4xl">💡</span>
            <div>
              <h3 className="text-sm font-bold text-lumina-text mb-1">Pro Tip</h3>
              <p className="text-xs text-lumina-text/40 leading-relaxed">
                Students who review within 24 hours retain 80% more information. Your next review session could be the difference between remembering and forgetting!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CommandPalette = ({ 
  isOpen, 
  setIsOpen, 
  setView, 
  subjects, 
  onSelectTopic 
}: { 
  isOpen: boolean, 
  setIsOpen: (o: boolean) => void, 
  setView: (v: View) => void, 
  subjects: Subject[], 
  onSelectTopic: (topic: Topic) => void 
}) => {
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  const commands = [
    { name: 'Neural Dossier', action: () => { setView('profile'); setIsOpen(false); }, icon: <User size={16} /> },
    { name: 'Neural Repository', action: () => { setView('vault'); setIsOpen(false); }, icon: <Database size={16} /> },
    { name: 'Focus Chamber', action: () => { setView('focus'); setIsOpen(false); }, icon: <Timer size={16} /> },
    { name: 'Battle Arena', action: () => { setView('battle'); setIsOpen(false); }, icon: <Sword size={16} /> },
    { name: 'Command Center', action: () => { setView('overview'); setIsOpen(false); }, icon: <LayoutDashboard size={16} /> },
    { name: 'Terminate Session', action: () => { setView('auth'); setIsOpen(false); }, icon: <LogOut size={16} /> },
  ];

  const filtered = commands.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[20vh] bg-black/80 backdrop-blur-xl" onClick={() => setIsOpen(false)}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-xl card-lumina shadow-2xl overflow-hidden font-sans"
      >
        <div className="p-6 border-b border-white/10 flex items-center gap-4">
          <Search size={20} className="text-lumina-accent" />
          <input 
            autoFocus
            type="text" 
            placeholder="Search neural commands..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-lumina-text w-full text-sm font-bold tracking-widest placeholder:text-lumina-text/20"
          />
        </div>
        <div className="max-h-80 overflow-y-auto p-3 custom-scrollbar">
          {filtered.map((cmd, i) => (
            <button 
              key={i}
              onClick={cmd.action}
              className="w-full text-left px-5 py-4 rounded-2xl hover:bg-white/5 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lumina-text/20 group-hover:text-lumina-accent transition-colors">
                  {cmd.icon}
                </div>
                <span className="text-xs font-bold text-lumina-text/60 group-hover:text-lumina-text uppercase tracking-widest transition-colors">{cmd.name}</span>
              </div>
              <div className="text-[10px] font-bold text-lumina-text/10 uppercase tracking-widest group-hover:text-lumina-accent/40 transition-colors">Select</div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="p-10 text-center text-[10px] text-lumina-text/20 uppercase tracking-widest">No neural commands found.</div>
          )}
        </div>
        <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded bg-white/10 text-[8px] font-bold text-lumina-text/40 uppercase tracking-widest">↑↓</span>
            <span className="text-[8px] font-bold text-lumina-text/20 uppercase tracking-widest">Navigate</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded bg-white/10 text-[8px] font-bold text-lumina-text/40 uppercase tracking-widest">Enter</span>
            <span className="text-[8px] font-bold text-lumina-text/20 uppercase tracking-widest">Select</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded bg-white/10 text-[8px] font-bold text-lumina-text/40 uppercase tracking-widest">Esc</span>
            <span className="text-[8px] font-bold text-lumina-text/20 uppercase tracking-widest">Close</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const SocraticInterrogation = ({ topic, onClose, onComplete }: { topic: Topic, onClose: () => void, onComplete: (xp: number) => void }) => {
  const [messages, setMessages] = useState<{role: 'ai' | 'user', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [grade, setGrade] = useState<{score: number, feedback: string} | null>(null);
  
  useEffect(() => {
    const initChat = async () => {
      setIsTyping(true);
      try {
        const ai = new GoogleGenAI({ apiKey: (import.meta as any).env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '' });
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-preview",
          contents: `You are a strict but fair Socratic tutor. The student is studying: ${topic.name}. Description: ${topic.description}. Ask them ONE thought-provoking question to test their understanding. Keep it under 3 sentences.`,
        });
        setMessages([{ role: 'ai', text: response.text || 'Could not generate question.' }]);
      } catch (e) {
        setMessages([{ role: 'ai', text: 'Neural link failed. Ensure API key is set.' }]);
      }
      setIsTyping(false);
    };
    initChat();
  }, [topic]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsGrading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: (import.meta as any).env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-preview",
        contents: `The student is studying ${topic.name}. You asked: "${messages[0]?.text}". The student answered: "${userMsg}". Grade their answer out of 100. Provide brief feedback. Return ONLY JSON in this format: {"score": number, "feedback": "string"}`,
        config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(response.text || '{}');
      setGrade(data);
    } catch (e) {
      setGrade({ score: 0, feedback: 'Error grading response.' });
    }
    setIsGrading(false);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl card-lumina p-10 relative flex flex-col h-[80vh]"
      >
        <button 
          onClick={onClose} 
          className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lumina-text/40 hover:text-lumina-text transition-all"
        >
          <X size={20} />
        </button>
        
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-lumina-accent/10 border border-lumina-accent/20 flex items-center justify-center text-lumina-accent">
            <Brain size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-display font-bold text-lumina-text tracking-tight">Socratic Interrogation</h3>
            <p className="text-[10px] text-lumina-text/30 uppercase tracking-widest">Topic: {topic.name}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto mb-8 space-y-6 custom-scrollbar pr-4">
          {messages.map((m, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${m.role === 'ai' ? 'items-start' : 'items-end'}`}
            >
              <div className={`max-w-[85%] p-6 rounded-2xl text-sm leading-relaxed ${
                m.role === 'ai' 
                  ? 'bg-white/5 border border-white/10 text-lumina-text/80' 
                  : 'bg-lumina-accent text-black font-medium'
              }`}>
                <span className={`text-[8px] font-bold uppercase tracking-widest block mb-2 ${m.role === 'ai' ? 'text-lumina-text/20' : 'text-black/40'}`}>
                  {m.role === 'ai' ? 'Neural Tutor' : 'You'}
                </span>
                {m.text}
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <div className="flex items-center gap-2 text-[10px] text-lumina-accent animate-pulse uppercase tracking-widest">
              <div className="w-1 h-1 rounded-full bg-lumina-accent" />
              Formulating query...
            </div>
          )}
          
          {isGrading && (
            <div className="flex items-center gap-2 text-[10px] text-lumina-accent animate-pulse uppercase tracking-widest">
              <div className="w-1 h-1 rounded-full bg-lumina-accent" />
              Analyzing patterns...
            </div>
          )}
          
          {grade && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 bg-white/5 border border-lumina-accent/30 rounded-3xl mt-6 text-center"
            >
              <div className="text-[10px] font-bold text-lumina-text/20 uppercase tracking-widest mb-4">Neural Evaluation</div>
              <div className="text-6xl font-display font-bold text-lumina-accent mb-4">{grade.score}%</div>
              <p className="text-xs text-lumina-text/60 leading-relaxed mb-8 italic">"{grade.feedback}"</p>
              <button 
                onClick={() => { onComplete(grade.score * 5); onClose(); }}
                className="btn-primary w-full py-4 text-[10px] uppercase tracking-[0.2em]"
              >
                Claim {grade.score * 5} XP & Synchronize
              </button>
            </motion.div>
          )}
        </div>

        {!grade && (
          <div className="flex gap-3">
            <textarea 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter your neural response..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-lumina-text outline-none focus:border-lumina-accent/30 transition-all resize-none h-24 leading-relaxed"
              disabled={isTyping || isGrading}
            />
            <button 
              onClick={handleSend}
              disabled={isTyping || isGrading || !input.trim()}
              className="w-24 rounded-2xl bg-lumina-accent text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              <ArrowRight size={24} />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// --- Main App ---

const getMemorEaseRank = (xp: number) => {
  if (xp < 200) return 'Novice';
  if (xp < 500) return 'Apprentice';
  if (xp < 1000) return 'Scholar';
  if (xp < 2000) return 'Adept';
  if (xp < 4000) return 'Sage';
  if (xp < 7000) return 'Virtuoso';
  if (xp < 12000) return 'Luminary';
  if (xp < 20000) return 'Archon';
  if (xp < 35000) return 'Transcendent';
  if (xp < 60000) return 'Omniscient';
  return 'Eternal';
};

// ========================================
// FEATURE 1: TRIAGE MODE (24-Hour Panic Button)
// ========================================
const TriageModeWidget = ({ subjects, user, onJumpToFocus }: { subjects: Subject[], user: UserProfile, onJumpToFocus: (t: Topic) => void }) => {
  const [isTriageActive, setIsTriageActive] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const fadingTopics = subjects.flatMap(s => s.topics).filter(t => 
    t.progress < 50 || t.masteryLevel < 3 || t.lastReviewed === 'Never'
  );

  const toggleTriage = () => {
    setIsTriageActive(!isTriageActive);
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  const nextCard = () => {
    setShowAnswer(false);
    setCurrentCardIndex(prev => (prev + 1) % Math.max(fadingTopics.length, 1));
  };

  if (!isTriageActive) {
    return (
      <button
        onClick={toggleTriage}
        data-testid="triage-mode-btn"
        className="w-full card-lumina p-5 border-red-500/30 hover:border-red-500/60 transition-all group cursor-pointer flex items-center gap-3 h-full"
      >
        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
          <Siren size={18} className="text-red-400" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="text-xs font-bold text-red-400 truncate">Triage Mode</div>
          <div className="text-[10px] text-lumina-text/30 truncate">{fadingTopics.length} fading topics</div>
        </div>
        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-red-400">{fadingTopics.length}</span>
        </div>
      </button>
    );
  }

  const currentTopic = fadingTopics[currentCardIndex % Math.max(fadingTopics.length, 1)];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-6"
      style={{ background: 'radial-gradient(ellipse at center, rgba(127,29,29,0.15) 0%, rgba(0,0,0,0.95) 70%)' }}
    >
      <div className="max-w-2xl w-full">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-[10px] font-bold uppercase tracking-[0.3em]">Emergency Triage Active</span>
          </div>
          <button 
            onClick={toggleTriage}
            data-testid="exit-triage-btn"
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-lumina-text/40 hover:text-lumina-text uppercase tracking-widest transition-all"
          >
            Exit Triage
          </button>
        </div>

        {fadingTopics.length > 0 && currentTopic ? (
          <motion.div
            key={currentCardIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-lumina p-10 border-red-500/20 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />
            
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-bold text-red-400/60 uppercase tracking-widest">Card {currentCardIndex + 1} of {fadingTopics.length}</span>
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`w-1.5 h-4 rounded-full ${i < currentTopic.masteryLevel ? 'bg-red-400' : 'bg-white/10'}`} />
                ))}
              </div>
            </div>

            <h2 className="text-3xl font-display font-bold text-lumina-text mb-3 tracking-tight">{currentTopic.name}</h2>
            <p className="text-sm text-lumina-text/40 mb-8 leading-relaxed">{currentTopic.description}</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-[8px] text-lumina-text/20 uppercase tracking-widest mb-1">Progress</div>
                <div className="text-lg font-bold text-red-400">{currentTopic.progress}%</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-[8px] text-lumina-text/20 uppercase tracking-widest mb-1">Mastery</div>
                <div className="text-lg font-bold text-lumina-text">Lv.{currentTopic.masteryLevel}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-[8px] text-lumina-text/20 uppercase tracking-widest mb-1">Last Seen</div>
                <div className="text-lg font-bold text-orange-400">{currentTopic.lastReviewed}</div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {showAnswer ? (
                <motion.div
                  key="answer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-lumina-accent/5 border border-lumina-accent/20 rounded-2xl p-6 mb-8"
                >
                  <p className="text-sm text-lumina-text/60 leading-relaxed">
                    This topic covers key concepts in <strong className="text-lumina-accent">{currentTopic.name}</strong>. 
                    You have {currentTopic.chapters} chapter{currentTopic.chapters > 1 ? 's' : ''} to review. 
                    Focus on reinforcing weak areas to prevent further decay.
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="flex gap-3">
              {!showAnswer ? (
                <button
                  onClick={() => setShowAnswer(true)}
                  data-testid="triage-reveal-btn"
                  className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-lumina-text uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Reveal Details
                </button>
              ) : (
                <>
                  <button
                    onClick={nextCard}
                    data-testid="triage-skip-btn"
                    className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-lumina-text/40 uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Skip
                  </button>
                  <button
                    onClick={() => { toggleTriage(); onJumpToFocus(currentTopic); }}
                    data-testid="triage-focus-btn"
                    className="flex-[2] py-4 rounded-xl bg-red-500 text-white text-sm font-bold uppercase tracking-widest hover:bg-red-600 transition-all shadow-[0_0_30px_rgba(239,68,68,0.3)]"
                  >
                    Focus Now
                  </button>
                </>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="card-lumina p-16 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCheck size={40} className="text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-lumina-text mb-2">All Clear!</h3>
            <p className="text-xs text-lumina-text/40 uppercase tracking-widest">No topics are currently in danger of fading.</p>
            <button onClick={toggleTriage} className="mt-6 btn-primary">Return to Dashboard</button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ========================================
// FEATURE 2: MAGIC DROP (Auto-Parsing Vault)
// ========================================
const MagicDropZone = ({ user, activeSubjectId, onAddTopic }: { user: UserProfile, activeSubjectId: string | null, onAddTopic: (subjectId: string, name: string) => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [parsedCards, setParsedCards] = useState<string[]>([]);
  const [showParsed, setShowParsed] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const text = e.dataTransfer.getData('text/plain');
    if (text) {
      parseContent(text);
      return;
    }
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const content = await file.text();
        parseContent(content);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text/plain');
    if (text.length > 50) {
      e.preventDefault();
      parseContent(text);
    }
  };

  const parseContent = (text: string) => {
    const lines = text.split(/\n\n|\n(?=[A-Z0-9])/g)
      .map(l => l.trim())
      .filter(l => l.length > 5 && l.length < 200);
    
    const cards = lines.length > 0 ? lines.slice(0, 20) : text.match(/.{20,100}/g)?.slice(0, 10) || [];
    setParsedCards(cards as string[]);
    setShowParsed(true);
  };

  const saveAllCards = async () => {
    if (!activeSubjectId || parsedCards.length === 0) return;
    setSaving(true);
    
    for (const card of parsedCards) {
      const title = card.substring(0, 60).replace(/[^\w\s]/g, '').trim();
      if (title) {
        onAddTopic(activeSubjectId, title);
        await new Promise(r => setTimeout(r, 200));
      }
    }
    
    setSaving(false);
    setShowParsed(false);
    setParsedCards([]);
  };

  return (
    <>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
        data-testid="magic-drop-zone"
        className={`rounded-3xl border-2 border-dashed p-10 text-center transition-all cursor-pointer ${
          isDragging 
            ? 'border-lumina-accent bg-lumina-accent/5 scale-[1.02]' 
            : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
        }`}
      >
        <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center transition-all ${
          isDragging ? 'bg-lumina-accent/20 scale-110' : 'bg-white/5'
        }`}>
          <Clipboard size={28} className={isDragging ? 'text-lumina-accent' : 'text-lumina-text/20'} />
        </div>
        <h3 className="text-sm font-bold text-lumina-text mb-1">Magic Drop</h3>
        <p className="text-[10px] text-lumina-text/30 uppercase tracking-widest leading-relaxed max-w-sm mx-auto">
          Drop a text file, paste content, or drag notes here. Auto-parses into individual quest nodes.
        </p>
      </div>

      <AnimatePresence>
        {showParsed && parsedCards.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="max-w-xl w-full card-lumina p-8 max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-display font-bold text-lumina-text">Parsed Quest Nodes</h2>
                  <p className="text-[10px] text-lumina-text/30 uppercase tracking-widest mt-1">{parsedCards.length} nodes detected</p>
                </div>
                <button onClick={() => { setShowParsed(false); setParsedCards([]); }} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-lumina-text/40 hover:text-lumina-text">
                  <X size={16} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2 mb-6 pr-2 custom-scrollbar">
                {parsedCards.map((card, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="w-6 h-6 rounded-lg bg-lumina-accent/10 flex items-center justify-center shrink-0">
                      <span className="text-[8px] font-bold text-lumina-accent">{i + 1}</span>
                    </div>
                    <span className="text-xs text-lumina-text/60 flex-1 truncate">{card}</span>
                    <button 
                      onClick={() => setParsedCards(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-lumina-text/20 hover:text-red-400 transition-colors shrink-0"
                    >
                      <X size={12} />
                    </button>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowParsed(false); setParsedCards([]); }}
                  className="flex-1 py-3 rounded-xl bg-white/5 text-xs font-bold text-lumina-text/40 uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={saveAllCards}
                  disabled={saving || !activeSubjectId}
                  data-testid="save-parsed-cards-btn"
                  className="flex-[2] py-3 rounded-xl bg-lumina-accent text-black text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : `Save ${parsedCards.length} Nodes`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ========================================
// FEATURE 3: DISTRACTION INTERCEPTOR
// ========================================
const DistractionInterceptor = ({ topics, user, onXpGain }: { topics: Topic[], user: UserProfile, onXpGain: (xp: number) => void }) => {
  const [showModal, setShowModal] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState('');

  const generateQuiz = (topic: Topic) => {
    const questions = [
      `What are the key principles of ${topic.name}?`,
      `Can you explain the main concept behind ${topic.name}?`,
      `What is the most important formula/rule in ${topic.name}?`,
      `Name 3 sub-topics within ${topic.name}.`,
      `How does ${topic.name} relate to real-world applications?`,
      `What was the last thing you learned about ${topic.name}?`,
      `What's the foundational theory of ${topic.name}?`,
      `Describe the relationship between concepts in ${topic.name}.`,
    ];
    return questions[Math.floor(Math.random() * questions.length)];
  };

  useEffect(() => {
    if (!isActive) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') return;
      if (document.visibilityState === 'visible' && topics.length > 0) {
        const fadingTopics = topics.filter(t => t.progress < 80);
        if (fadingTopics.length > 0) {
          const randomTopic = fadingTopics[Math.floor(Math.random() * fadingTopics.length)];
          setCurrentTopic(randomTopic);
          setQuizQuestion(generateQuiz(randomTopic));
          setShowModal(true);
          setAnswered(false);
          setCorrect(false);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isActive, topics]);

  const handleAnswer = (isCorrect: boolean) => {
    setAnswered(true);
    setCorrect(isCorrect);
    if (isCorrect) {
      onXpGain(50);
    }
  };

  const dismissModal = () => {
    setShowModal(false);
    setCurrentTopic(null);
    setAnswered(false);
  };

  return (
    <>
      <div className="card-lumina p-5 flex items-center justify-between gap-3 h-full">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-lumina-accent/10 border border-lumina-accent/20' : 'bg-white/5 border border-white/10'}`}>
            <Crosshair size={18} className={isActive ? 'text-lumina-accent' : 'text-lumina-text/30'} />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-lumina-text truncate">Interceptor</div>
            <div className="text-[10px] text-lumina-text/30 truncate">{isActive ? 'Armed +50 XP' : 'Inactive'}</div>
          </div>
        </div>
        <button
          onClick={() => setIsActive(!isActive)}
          data-testid="interceptor-toggle"
          className={`w-12 h-6 rounded-full relative transition-all shrink-0 ${isActive ? 'bg-lumina-accent' : 'bg-white/10'}`}
        >
          <motion.div
            animate={{ x: isActive ? 26 : 2 }}
            className={`absolute top-1 w-4 h-4 rounded-full ${isActive ? 'bg-black' : 'bg-white/40'}`}
          />
        </button>
      </div>

      <AnimatePresence>
        {showModal && currentTopic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-center justify-center p-6"
            style={{ backdropFilter: 'blur(20px)', background: 'rgba(0,0,0,0.8)' }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="max-w-md w-full rounded-3xl p-8 border border-white/10 relative overflow-hidden"
              style={{ background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(24px)' }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lumina-accent via-cyan-400 to-lumina-accent" />
              
              <div className="flex items-center gap-2 mb-6">
                <Crosshair size={14} className="text-lumina-accent" />
                <span className="text-[10px] font-bold text-lumina-accent uppercase tracking-[0.3em]">Distraction Intercepted</span>
              </div>

              <h3 className="text-xl font-display font-bold text-lumina-text mb-2">{currentTopic.name}</h3>

              <div className="bg-white/5 rounded-2xl p-4 mb-6">
                <div className="text-[10px] text-lumina-accent uppercase tracking-widest mb-2 font-bold">Quick Recall</div>
                <p className="text-sm text-lumina-text/70 leading-relaxed">{quizQuestion}</p>
              </div>

              <div className="flex items-center gap-2 mb-6">
                <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-lumina-accent/50 rounded-full" style={{ width: `${currentTopic.progress}%` }} />
                </div>
                <span className="text-[10px] text-lumina-text/30 font-bold">{currentTopic.progress}% mastery</span>
              </div>

              {!answered ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAnswer(false)}
                    data-testid="interceptor-no"
                    className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-lumina-text/40 uppercase tracking-widest hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all"
                  >
                    Can't Recall
                  </button>
                  <button
                    onClick={() => handleAnswer(true)}
                    data-testid="interceptor-yes"
                    className="flex-[2] py-3 rounded-xl bg-lumina-accent text-black text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all"
                  >
                    I Got This! +50 XP
                  </button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <div className={`p-4 rounded-xl text-center ${correct ? 'bg-lumina-accent/10 border border-lumina-accent/30' : 'bg-orange-500/10 border border-orange-500/30'}`}>
                    <span className="text-lg font-bold">{correct ? '+50 XP Earned!' : 'Time to review this!'}</span>
                  </div>
                  <button
                    onClick={dismissModal}
                    data-testid="interceptor-ok"
                    className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-lumina-text uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    OK
                  </button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ========================================
// FEATURE 4: CLASS RAID WIDGET
// ========================================
const ClassRaidWidget = ({ user }: { user: UserProfile }) => {
  const [raids, setRaids] = useState([
    { id: 'r1', name: 'Advanced Architecture', bossHp: 1000, currentDamage: 647, participants: 12, reward: 500 },
    { id: 'r2', name: 'Quantum Algorithms', bossHp: 800, currentDamage: 234, participants: 8, reward: 400 },
  ]);
  const [activeRaid, setActiveRaid] = useState<string | null>(null);
  const [attacking, setAttacking] = useState(false);
  const [damageDealt, setDamageDealt] = useState(0);
  const [expanded, setExpanded] = useState(false);

  // Try to fetch from Supabase class_raids table
  useEffect(() => {
    const fetchRaids = async () => {
      try {
        const { data, error } = await supabase
          .from('class_raids')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
        if (data && data.length > 0 && !error) {
          setRaids(data.map((r: any) => ({
            id: r.id,
            name: r.name || r.boss_name || 'Unknown Raid',
            bossHp: r.boss_hp || r.bossHp || 1000,
            currentDamage: r.current_damage || r.currentDamage || 0,
            participants: r.participants || 0,
            reward: r.reward || 500,
          })));
        }
      } catch (err) {
        // Table might not exist yet, use mock data
        console.log('class_raids table not found, using mock data');
      }
    };
    fetchRaids();
  }, []);

  const joinRaid = async (raidId: string) => {
    setActiveRaid(raidId);
    setAttacking(true);
    setDamageDealt(0);
    
    let dealt = 0;
    const interval = setInterval(() => {
      dealt += Math.floor(Math.random() * 15) + 5;
      setDamageDealt(dealt);
      if (dealt >= 50) {
        clearInterval(interval);
        setAttacking(false);
        // Try to update in Supabase
        supabase
          .from('class_raids')
          .update({ current_damage: raids.find(r => r.id === raidId)!.currentDamage + dealt })
          .eq('id', raidId)
          .then(() => {})
          .catch(() => {});
      }
    }, 300);
  };

  const topRaid = raids[0];
  const hpPercent = topRaid ? Math.max(0, ((topRaid.bossHp - topRaid.currentDamage - (activeRaid === topRaid.id ? damageDealt : 0)) / topRaid.bossHp) * 100) : 0;
  const remainingHp = topRaid ? Math.max(0, topRaid.bossHp - topRaid.currentDamage - (activeRaid === topRaid.id ? damageDealt : 0)) : 0;

  return (
    <div className="card-lumina p-5 border-cyan-500/20 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <Sword size={18} className="text-cyan-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-lumina-text truncate">Class Raids</h3>
            <p className="text-[10px] text-lumina-text/30 truncate">Cooperative battles</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[9px] text-cyan-400 font-bold shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Live
        </div>
      </div>

      {/* Top raid - always visible */}
      {topRaid && (
        <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5 flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-lumina-text truncate">{topRaid.name}</span>
            <span className="text-[9px] font-mono font-bold text-red-400 shrink-0">{remainingHp.toFixed(0)}/{topRaid.bossHp}</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-2">
            <motion.div animate={{ width: `${hpPercent}%` }} transition={{ duration: 0.5 }} className={`h-full rounded-full ${hpPercent > 50 ? 'bg-red-500' : hpPercent > 25 ? 'bg-orange-500' : 'bg-green-500'}`} />
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[8px] text-lumina-text/30 flex items-center gap-1"><Users size={9} />{topRaid.participants} raiders</span>
            <span className="text-[8px] text-lumina-accent font-bold">+{topRaid.reward} XP</span>
          </div>
          {activeRaid === topRaid.id && attacking ? (
            <div className="flex items-center justify-center gap-2 py-1.5">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-3 h-3 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full" />
              <span className="text-[9px] font-bold text-cyan-400">{damageDealt} DMG</span>
            </div>
          ) : (
            <button onClick={() => joinRaid(topRaid.id)} data-testid={`join-raid-${topRaid.id}`} disabled={activeRaid === topRaid.id && !attacking && damageDealt > 0} className="w-full py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-bold text-cyan-400 uppercase tracking-widest hover:bg-cyan-500/20 transition-all disabled:opacity-40">
              {activeRaid === topRaid.id && damageDealt > 0 ? `${damageDealt} DMG Dealt` : 'Join Raid'}
            </button>
          )}
        </div>
      )}

      {raids.length > 1 && (
        <button onClick={() => setExpanded(!expanded)} className="mt-2 text-[9px] font-bold text-lumina-text/30 hover:text-lumina-text/50 uppercase tracking-widest transition-colors text-center">
          {expanded ? 'Show Less' : `+${raids.length - 1} More Raids`}
        </button>
      )}

      <AnimatePresence>
        {expanded && raids.slice(1).map((raid) => {
          const rHp = Math.max(0, ((raid.bossHp - raid.currentDamage) / raid.bossHp) * 100);
          return (
            <motion.div key={raid.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white/[0.03] rounded-xl p-3 border border-white/5 mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-lumina-text truncate">{raid.name}</span>
                <span className="text-[9px] font-mono text-red-400 shrink-0">{Math.max(0, raid.bossHp - raid.currentDamage)}/{raid.bossHp}</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                <div className={`h-full rounded-full ${rHp > 50 ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${rHp}%` }} />
              </div>
              <button onClick={() => joinRaid(raid.id)} data-testid={`join-raid-${raid.id}`} className="w-full py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-bold text-cyan-400 uppercase tracking-widest hover:bg-cyan-500/20 transition-all">
                Join Raid
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};




// ========================================
// REPAIR MEMORY MODAL (3-Question Flashcard)
// ========================================
const RepairMemoryModal = ({ topic, onClose, onRepaired }: { topic: Topic, onClose: () => void, onRepaired: () => void }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showResult, setShowResult] = useState(false);

  const questions = [
    { q: `What is the core concept of "${topic.name}"?`, hint: 'Think about the fundamental idea' },
    { q: `Name one real-world application of ${topic.name}.`, hint: 'How is this used in practice?' },
    { q: `What connects ${topic.name} to other topics you\'ve studied?`, hint: 'Find the relationships' },
  ];

  const handleAnswer = (correct: boolean) => {
    const newAnswers = [...answers, correct];
    setAnswers(newAnswers);
    if (step < 2) {
      setStep(step + 1);
    } else {
      setShowResult(true);
      if (newAnswers.filter(a => a).length >= 2) {
        setTimeout(() => onRepaired(), 2000);
      }
    }
  };

  const correctCount = answers.filter(a => a).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="max-w-lg w-full card-lumina p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5">
          <motion.div 
            animate={{ width: `${((step + (showResult ? 1 : 0)) / 3) * 100}%` }}
            className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-lumina-accent rounded-full"
          />
        </div>

        <div className="flex items-center gap-3 mb-8 mt-2">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <HeartPulse size={18} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-lumina-text">Repair Memory</h2>
            <p className="text-[10px] text-lumina-text/30 uppercase tracking-widest">{topic.name} - Quick Recovery</p>
          </div>
          <button onClick={onClose} className="ml-auto w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-lumina-text/40 hover:text-lumina-text">
            <X size={16} />
          </button>
        </div>

        {!showResult ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              <div className="flex items-center gap-3 mb-6">
                {[0, 1, 2].map(i => (
                  <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${
                    i < step ? (answers[i] ? 'bg-lumina-accent' : 'bg-red-500') :
                    i === step ? 'bg-white/20' : 'bg-white/5'
                  }`} />
                ))}
              </div>

              <div className="text-[10px] text-lumina-text/30 font-bold uppercase tracking-widest mb-3">Question {step + 1} of 3</div>
              <h3 className="text-xl font-bold text-lumina-text mb-3 leading-relaxed">{questions[step].q}</h3>
              <p className="text-xs text-lumina-text/20 italic mb-8">{questions[step].hint}</p>

              <div className="flex gap-3">
                <button
                  onClick={() => handleAnswer(false)}
                  data-testid="repair-wrong"
                  className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-lumina-text/40 uppercase tracking-widest hover:bg-red-500/10 hover:border-red-500/30 transition-all"
                >
                  Can't Recall
                </button>
                <button
                  onClick={() => handleAnswer(true)}
                  data-testid="repair-correct"
                  className="flex-[2] py-4 rounded-xl bg-lumina-accent text-black text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all"
                >
                  I Remember!
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
            <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
              correctCount >= 2 ? 'bg-lumina-accent/10' : 'bg-red-500/10'
            }`}>
              {correctCount >= 2 
                ? <CheckCheck size={40} className="text-lumina-accent" />
                : <AlertTriangle size={40} className="text-red-400" />
              }
            </div>
            <h3 className="text-2xl font-display font-bold text-lumina-text mb-2">
              {correctCount >= 2 ? 'Memory Repaired!' : 'Needs More Work'}
            </h3>
            <p className="text-xs text-lumina-text/40 mb-2">
              {correctCount}/3 correct - {correctCount >= 2 ? 'Node restored to healthy state' : 'Try a full focus session to rebuild'}
            </p>
            {correctCount >= 2 && <p className="text-sm font-bold text-lumina-accent">+25 XP Repair Bonus</p>}
            <button onClick={onClose} className="mt-6 px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-lumina-text uppercase tracking-widest hover:bg-white/10 transition-all">
              Close
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

// ========================================
// STREAK STORE WIDGET
// ========================================
const StreakStoreWidget = ({ user, onXpSpend }: { user: UserProfile, onXpSpend: (xp: number) => void }) => {
  const [streakFreezes, setStreakFreezes] = useState(0);
  const [purchasing, setPurchasing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const purchaseFreeze = () => {
    if (user.xp < 500) return;
    setPurchasing(true);
    setTimeout(() => {
      onXpSpend(500);
      setStreakFreezes(prev => prev + 1);
      setPurchasing(false);
      setShowConfirm(false);
    }, 800);
  };

  return (
    <div className="card-lumina p-6 border-orange-500/20" data-testid="streak-store-widget">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
          <Flame size={18} className="text-orange-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-lumina-text">Streak Store</h3>
          <p className="text-[10px] text-lumina-text/30 uppercase tracking-widest">Protect your progress</p>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🔥</div>
          <div>
            <div className="text-2xl font-display font-bold text-orange-400">{user.streak}</div>
            <div className="text-[8px] text-lumina-text/30 uppercase tracking-widest">Day Streak</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {Array.from({ length: Math.min(streakFreezes, 5) }).map((_, i) => (
            <div key={i} className="text-lg" title="Streak Freeze">🧊</div>
          ))}
          {streakFreezes > 5 && <span className="text-[10px] text-cyan-400 font-bold">+{streakFreezes - 5}</span>}
        </div>
      </div>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          data-testid="buy-streak-freeze"
          disabled={user.xp < 500}
          className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          <span className="text-lg">🧊</span>
          Buy Streak Freeze
          <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 text-[9px]">500 XP</span>
        </button>
      ) : (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <p className="text-[10px] text-lumina-text/40 text-center mb-2">Spend 500 XP for a Streak Freeze?</p>
          <div className="flex gap-2">
            <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-lumina-text/40 uppercase tracking-widest">Cancel</button>
            <button
              onClick={purchaseFreeze}
              disabled={purchasing}
              data-testid="confirm-buy-freeze"
              className="flex-[2] py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-[10px] font-bold text-cyan-400 uppercase tracking-widest disabled:opacity-50"
            >
              {purchasing ? 'Purchasing...' : 'Confirm Purchase'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// ========================================
// BATTLE HUB VIEW (Arena Tab)
// ========================================
const BattleHubView = ({ user, subjects, onJumpToFocus, onXpGain }: { 
  user: UserProfile, 
  subjects: Subject[], 
  onJumpToFocus: (t: Topic) => void,
  onXpGain: (xp: number) => void 
}) => {
  return (
    <div className="pt-32 px-6 pb-20 min-h-screen relative font-sans">
      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-widest mb-4">
            <Sword size={12} />
            Battle Arena
          </div>
          <h1 className="text-5xl font-display font-bold text-lumina-text tracking-tight" data-testid="battle-hub-title">Arena</h1>
          <p className="text-sm text-lumina-text/30 mt-2">Sharpen your skills through combat, raids, and survival challenges</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Triage + Interceptor */}
          <div className="lg:col-span-5 space-y-6">
            {/* Triage Mode - Full Card */}
            <div className="card-lumina p-6 border-red-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <Siren size={18} className="text-red-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-lumina-text">Emergency Triage</h2>
                  <p className="text-[10px] text-lumina-text/30 uppercase tracking-widest">Rescue fading memories</p>
                </div>
              </div>
              <TriageModeWidget subjects={subjects} user={user} onJumpToFocus={onJumpToFocus} />
            </div>

            {/* Distraction Interceptor - Full Card */}
            <div className="card-lumina p-6 border-lumina-accent/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-lumina-accent/10 border border-lumina-accent/20 flex items-center justify-center">
                  <Crosshair size={18} className="text-lumina-accent" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-lumina-text">Distraction Shield</h2>
                  <p className="text-[10px] text-lumina-text/30 uppercase tracking-widest">Intercept tab switches for +50 XP</p>
                </div>
              </div>
              <DistractionInterceptor 
                topics={subjects.flatMap(s => s.topics)} 
                user={user} 
                onXpGain={onXpGain} 
              />
            </div>

            {/* Quick Stats */}
            <div className="card-lumina p-6">
              <h3 className="text-[10px] font-bold text-lumina-text/30 uppercase tracking-widest mb-4">Arena Stats</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-xl font-display font-bold text-red-400">{subjects.flatMap(s => s.topics).filter(t => t.progress < 50).length}</div>
                  <div className="text-[8px] text-lumina-text/20 uppercase tracking-widest mt-1">Fading</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-xl font-display font-bold text-lumina-accent">{user.xp.toLocaleString()}</div>
                  <div className="text-[8px] text-lumina-text/20 uppercase tracking-widest mt-1">Total XP</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {getRankIcon(user.rank)}
                    <span className={`text-sm font-bold bg-gradient-to-r ${getRankColor(user.rank)} bg-clip-text text-transparent`}>{user.rank}</span>
                  </div>
                  <div className="text-[8px] text-lumina-text/20 uppercase tracking-widest mt-1">Rank</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Streak Store + Heatmap */}
          <div className="lg:col-span-7 space-y-6">
            {/* Streak Store */}
            <StreakStoreWidget 
              user={user} 
              onXpSpend={(xp) => onXpGain(-xp)} 
            />

            {/* Activity Heatmap */}
            <ActivityHeatmap />

            {/* Battle Tips */}
            <div className="card-lumina p-6 border-purple-500/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
              <div className="flex items-start gap-4 ml-2">
                <span className="text-3xl">💡</span>
                <div>
                  <h3 className="text-sm font-bold text-lumina-text mb-1">Arena Pro Tip</h3>
                  <p className="text-xs text-lumina-text/40 leading-relaxed">
                    Enable the Distraction Interceptor before starting a focus session. Every time you return from another tab, 
                    you'll earn +50 XP by recalling a topic. It's the fastest way to rack up XP while building real memory strength!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default function App() {
  const [view, setView] = useState<View>('auth');
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [noteCount, setNoteCount] = useState(0);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  const [showPlanLimit, setShowPlanLimit] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);

  // Auth Listener
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      handleSession(session);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSession = async (session: any) => {
    if (session?.user) {
      const supabaseUser = session.user;
      
      // Check if user exists in Supabase DB
      const { data: userDoc, error } = await supabase
        .from('users')
        .select('*')
        .eq('uid', supabaseUser.id)
        .single();

      if (userDoc) {
        const profile = userDoc as UserProfile;
        // Update rank based on XP if it's the old system
        const newRank = getMemorEaseRank(profile.xp);
        if (profile.rank !== newRank) {
          await supabase.from('users').update({ rank: newRank }).eq('uid', profile.uid);
          profile.rank = newRank;
        }
        setUser(profile);
      } else {
        // Create new user profile
        const newUser: UserProfile = {
          uid: supabaseUser.id,
          name: supabaseUser.user_metadata?.full_name || 'New Scholar',
          avatar: supabaseUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${supabaseUser.id}`,
          rank: getMemorEaseRank(0),
          level: 1,
          xp: 0,
          streak: 0,
          totalCards: 0,
          globalRank: 0,
          lastActive: new Date().toISOString(),
          plan: 'free'
        };
        await supabase.from('users').insert(newUser);
        setUser(newUser);
      }
      setView('overview');
    } else {
      setUser(null);
      setView('auth');
    }
    setAuthReady(true);
    setLoading(false);
  };

  // Supabase Listeners
  useEffect(() => {
    if (!user?.uid) return;

    const fetchSubjectsAndTopics = async () => {
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('*')
        .eq('uid', user.uid);

      if (subjectsData) {
        const subjectsWithTopics = await Promise.all(subjectsData.map(async (subject) => {
          const { data: topicsData } = await supabase
            .from('topics')
            .select('*')
            .eq('subjectId', subject.id);
          return { ...subject, topics: topicsData || [] };
        }));
        setSubjects(subjectsWithTopics as Subject[]);
      }
    };

    fetchSubjectsAndTopics();

    const fetchNotifications = async () => {
      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .eq('uid', user.uid);
      if (notificationsData) {
        setNotifications(notificationsData as Notification[]);
      }
    };

    fetchNotifications();

    const fetchNoteCount = async () => {
      const { count, error } = await supabase
        .from('topics')
        .select('*', { count: 'exact', head: true })
        .eq('uid', user.uid);
      
      if (!error && count !== null) {
        setNoteCount(count);
      }
    };

    fetchNoteCount();

    // Set up realtime subscriptions
    const subjectsSubscription = supabase
      .channel('subjects_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subjects', filter: `uid=eq.${user.uid}` }, fetchSubjectsAndTopics)
      .subscribe();

    const topicsSubscription = supabase
      .channel('topics_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'topics', filter: `uid=eq.${user.uid}` }, () => {
        fetchSubjectsAndTopics();
        fetchNoteCount();
      })
      .subscribe();

    const notificationsSubscription = supabase
      .channel('notifications_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `uid=eq.${user.uid}` }, fetchNotifications)
      .subscribe();

    return () => {
      supabase.removeChannel(subjectsSubscription);
      supabase.removeChannel(topicsSubscription);
      supabase.removeChannel(notificationsSubscription);
    };
  }, [user?.uid]);

  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleJumpToFocus = (topic: Topic) => {
    setActiveTopic(topic);
    setView('focus');
  };

  const handleFinishTopic = async (topic: Topic) => {
    if (user) {
      const xpGain = 250;
      try {
        // Update topic progress in Supabase
        await supabase
          .from('topics')
          .update({
            progress: 100,
            masteryLevel: Math.min(5, topic.masteryLevel + 1),
            lastReviewed: new Date().toISOString()
          })
          .eq('id', topic.id);

        // Update user XP and stats in Supabase
        const now = new Date();
        const last = new Date(user.lastActive);
        const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 3600 * 24));
        
        let newStreak = user.streak;
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        } else if (user.streak === 0) {
          newStreak = 1;
        }

        const newXp = user.xp + xpGain;
        const newLevel = Math.floor(newXp / 200) + 1;
        const newRank = getMemorEaseRank(newXp);

        await supabase
          .from('users')
          .update({
            xp: newXp,
            level: newLevel,
            rank: newRank,
            streak: newStreak,
            lastActive: now.toISOString()
          })
          .eq('uid', user.uid);

        // Update local user state (listeners will catch it, but this is faster for UI)
        setUser(prev => prev ? {
          ...prev,
          xp: newXp,
          level: newLevel,
          rank: newRank,
          streak: newStreak,
          lastActive: now.toISOString()
        } : null);

        setActiveTopic(null);
        if (xpGain > 0) {
          setView('overview');
        }
      } catch (error) {
        console.error('Error updating topic:', error);
      }
    }
  };

  const addSubject = async (name: string) => {
    if (!user) return;
    try {
      await supabase.from('subjects').insert({
        name,
        uid: user.uid
      });
    } catch (error) {
      console.error('Error adding subject:', error);
    }
  };

  const addTopic = async (subjectId: string, name: string) => {
    if (!user) return;
    
    if (user.plan === 'free' && noteCount >= 3) {
      setShowPlanLimit(true);
      return;
    }

    try {
      // Find the subject name for this topic
      const parentSubject = subjects.find(s => s.id === subjectId);
      const subjectImageUrl = parentSubject ? getSubjectImage(parentSubject.name) : SUBJECT_IMAGES['default'];
      
      await supabase.from('topics').insert({
        name,
        subjectId,
        uid: user.uid,
        progress: 0,
        description: 'New learning module.',
        imageUrl: subjectImageUrl,
        lastReviewed: 'Never',
        nextReview: 'Today',
        chapters: 1,
        masteryLevel: 1,
        assets: []
      });
    } catch (error) {
      console.error('Error adding topic:', error);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Directory',
      message: 'Are you sure? This will permanently delete all neural chapters and uploaded files within this directory.',
      onConfirm: async () => {
        try {
          // Get all topics in this subject to find their assets
          const subjectTopics = subjects.find(s => s.id === id)?.topics || [];
          
          // For each topic, list and remove all files from storage
          for (const topic of subjectTopics) {
            try {
              const dirPath = `${user!.uid}/assets/${topic.id}`;
              const { data: fileList, error: listError } = await supabase.storage
                .from('app-files')
                .list(dirPath);
              
              if (listError) {
                console.error(`[RLS/Storage] Error listing files in ${dirPath}:`, listError);
                continue;
              }
              
              if (fileList && fileList.length > 0) {
                const filePaths = fileList.map(f => `${dirPath}/${f.name}`);
                const { error: removeError } = await supabase.storage
                  .from('app-files')
                  .remove(filePaths);
                
                if (removeError) {
                  console.error(`[RLS/Storage] Error removing files in ${dirPath}:`, removeError);
                }
              }
            } catch (storageErr) {
              console.error(`[RLS/Storage] Failed to clean storage for topic ${topic.id}:`, storageErr);
            }
          }
          
          // Delete all topics in this subject from DB
          await supabase.from('topics').delete().eq('subjectId', id);
          // Delete the subject itself
          await supabase.from('subjects').delete().eq('id', id);
        } catch (error) {
          console.error('[RLS/Storage] Error deleting subject directory:', error);
        }
      }
    });
  };

  const handleDeleteTopic = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Chapter',
      message: 'Are you sure you want to delete this neural chapter? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await supabase.from('topics').delete().eq('id', id);
        } catch (error) {
          console.error('Error deleting topic:', error);
        }
      }
    });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const [pomodoroSettings] = useState<PomodoroSettings>({
    workTime: 25,
    shortBreak: 5,
    longBreak: 15
  });

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  if (!authReady || loading) {
    return (
      <div className="min-h-screen bg-lumina-bg flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-lumina-accent/20 border-t-lumina-accent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lumina-bg font-mono text-lumina-text selection:bg-lumina-accent/30">
      <CommandPalette isOpen={isCommandPaletteOpen} setIsOpen={setIsCommandPaletteOpen} setView={setView} subjects={subjects} onSelectTopic={handleJumpToFocus} />
      {user && <Navbar currentView={view} setView={setView} unreadCount={unreadCount} onLogout={handleLogout} />}
      
      <main className="relative">
        <AnimatePresence mode="wait">
          {!user && (
            <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AuthView onLogin={handleGoogleLogin} />
            </motion.div>
          )}
          {user && view === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <OverviewView onJumpBack={handleJumpToFocus} user={user} subjects={subjects} noteCount={noteCount} />
            </motion.div>
          )}
          {user && view === 'focus' && (
            <motion.div key="focus" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FocusView settings={pomodoroSettings} activeTopic={activeTopic} onFinishTopic={handleFinishTopic} />
            </motion.div>
          )}
          {user && view === 'vault' && (
            <motion.div key="vault" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <VaultView 
                user={user}
                subjects={subjects} 
                onAddSubject={addSubject}
                onAddTopic={addTopic}
                onDeleteSubject={handleDeleteSubject}
                onDeleteTopic={handleDeleteTopic}
                onJumpToFocus={handleJumpToFocus}
              />
            </motion.div>
          )}
          {user && view === 'battle' && (
            <motion.div key="battle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <BattleHubView 
                user={user} 
                subjects={subjects} 
                onJumpToFocus={handleJumpToFocus}
                onXpGain={(xp: number) => {
                  if (user) {
                    const newXp = user.xp + xp;
                    setUser({ ...user, xp: newXp, rank: getMemorEaseRank(newXp), level: Math.floor(newXp / 100) + 1 });
                    supabase.from('users').update({ xp: newXp, rank: getMemorEaseRank(newXp), level: Math.floor(newXp / 100) + 1 }).eq('uid', user.uid);
                  }
                }}
              />
            </motion.div>
          )}
          {user && view === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProfileView user={user} setUser={setUser} subjects={subjects} />
            </motion.div>
          )}
          {user && view === 'notifications' && (
            <motion.div key="notifications" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <NotificationsView notifications={notifications} subjects={subjects} user={user} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-lumina-accent/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-lumina-secondary/5 blur-[120px] rounded-full"></div>
      </div>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />
      <PlanLimitModal 
        isOpen={showPlanLimit}
        onClose={() => setShowPlanLimit(false)}
      />
    </div>
  );
}
