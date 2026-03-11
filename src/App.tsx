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
  FilePlus
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

// --- Types ---
type View = 'auth' | 'overview' | 'focus' | 'vault' | 'profile' | 'notifications';
type AuthMode = 'landing' | 'login' | 'signup' | 'forgot';

interface Topic {
  id: string;
  name: string;
  progress: number;
  description: string;
  imageUrl: string;
  lastReviewed: string;
  nextReview: string;
  chapters: number;
  masteryLevel: number;
  assets?: { name: string, type: string }[];
}

interface Subject {
  id: string;
  name: string;
  topics: Topic[];
}

interface UserProfile {
  name: string;
  avatar: string;
  rank: string;
  level: number;
  xp: number;
  streak: number;
  totalCards: number;
  globalRank: number;
  lastActive: string;
}

interface Notification {
  id: string;
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

const Navbar = ({ currentView, setView, unreadCount }: { currentView: View, setView: (v: View) => void, unreadCount: number }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (currentView === 'auth') return null;

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-lumina-bg/80 backdrop-blur-md border-b border-lumina-border z-50 flex items-center justify-between px-8">
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setView('overview')}>
          <div className="w-8 h-8 bg-lumina-accent rounded flex items-center justify-center">
            <Brain size={20} className="text-black" strokeWidth={2.5} />
          </div>
          <span className="text-lumina-text font-mono font-bold text-lg tracking-tighter uppercase">MemorEase.sys</span>
        </div>
        
        <div className="hidden md:flex items-center gap-1">
          <NavLink active={currentView === 'overview'} onClick={() => setView('overview')} icon={<LayoutDashboard size={18} />} label="Metrics" />
          <NavLink active={currentView === 'focus'} onClick={() => setView('focus')} icon={<Timer size={18} />} label="Focus" />
          <NavLink active={currentView === 'vault'} onClick={() => setView('vault')} icon={<Database size={18} />} label="Vault" />
          <NavLink active={currentView === 'profile'} onClick={() => setView('profile')} icon={<User size={18} />} label="Terminal" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-lumina-text/40 font-mono text-xs border-r border-lumina-border pr-4">
          <Clock size={14} />
          <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</span>
        </div>
        <button 
          onClick={() => setView('notifications')}
          className={`relative w-8 h-8 rounded flex items-center justify-center transition-all ${
            currentView === 'notifications' ? 'bg-lumina-accent text-black' : 'text-lumina-text/40 hover:bg-white/5'
          }`}
        >
          <Zap size={16} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-lumina-accent text-black text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-lumina-bg">
              {unreadCount}
            </span>
          )}
        </button>
        <button 
          onClick={() => setView('auth')}
          className="w-8 h-8 rounded flex items-center justify-center text-lumina-text/40 hover:text-red-500 hover:bg-red-500/10 transition-all"
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
    className={`flex items-center gap-2 px-4 py-1.5 rounded transition-all duration-200 ${
      active 
        ? 'text-lumina-accent bg-lumina-accent/10 border border-lumina-accent/20' 
        : 'text-lumina-text/40 hover:text-lumina-text hover:bg-white/5'
    }`}
  >
    {icon}
    <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
  </button>
);

// --- Views ---

const AuthView = ({ onLogin }: { onLogin: () => void }) => {
  const [mode, setMode] = useState<'landing' | 'login' | 'signup' | 'forgot'>('landing');
  const [showInfoModal, setShowInfoModal] = useState<'about' | 'contact' | null>(null);

  return (
    <div className="min-h-screen bg-lumina-bg relative overflow-hidden flex flex-col font-mono">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      {/* Top Navigation for Landing Page */}
      <nav className="relative z-20 flex items-center justify-between px-12 py-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-lumina-accent rounded flex items-center justify-center">
            <Brain size={24} className="text-black" strokeWidth={2.5} />
          </div>
          <span className="text-lumina-text font-bold text-2xl tracking-tighter uppercase">MemorEase.sys</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => setShowInfoModal('about')}
            className="text-xs font-bold text-lumina-text/40 hover:text-lumina-accent transition-colors flex items-center gap-2 uppercase tracking-widest"
          >
            <Info size={14} />
            About
          </button>
          <button 
            onClick={() => setShowInfoModal('contact')}
            className="text-xs font-bold text-lumina-text/40 hover:text-lumina-accent transition-colors flex items-center gap-2 uppercase tracking-widest"
          >
            <MessageCircle size={14} />
            Contact
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center relative z-10 -mt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-5xl"
        >
          <div className="flex justify-center mb-8">
          </div>
          <h1 className="text-6xl lg:text-8xl font-bold text-lumina-text leading-[0.9] tracking-tighter mb-8 uppercase">
            Cognitive <br />
            <span className="text-lumina-accent">Optimization</span>
          </h1>
          <div className="space-y-10 mb-12">
            <p className="text-sm lg:text-base text-lumina-text/40 max-w-2xl mx-auto leading-relaxed uppercase tracking-wide">
              Deploying advanced neural focus modes for long-term knowledge retention. 
              Interface with your intellectual assets through a high-performance terminal.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-8">
              {[
                { title: 'Focus.01', desc: 'Spaced Repetition', icon: <Clock className="text-lumina-accent" /> },
                { title: 'Focus.02', desc: 'Deep Focus Mode', icon: <Timer className="text-lumina-accent" /> },
                { title: 'Focus.03', desc: 'Neural Mapping', icon: <Brain className="text-lumina-accent" /> },
                { title: 'Focus.04', desc: 'Vault Encryption', icon: <Database className="text-lumina-accent" /> }
              ].map((f, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -5, borderColor: 'rgba(212, 255, 0, 0.5)' }}
                  className="bg-lumina-card/50 border border-lumina-border p-6 rounded-xl text-left transition-all"
                >
                  <div className="w-10 h-10 rounded bg-lumina-bg border border-lumina-border flex items-center justify-center mb-4">
                    {f.icon}
                  </div>
                  <div className="font-bold text-lumina-text text-xs uppercase tracking-widest mb-1">{f.title}</div>
                  <div className="text-[10px] text-lumina-text/30 uppercase tracking-wider">{f.desc}</div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => setMode('login')}
                className="btn-primary w-full sm:w-auto px-12 uppercase tracking-widest text-xs"
              >
                Login
              </button>
              <button 
                onClick={() => setMode('signup')}
                className="btn-secondary w-full sm:w-auto px-12 uppercase tracking-widest text-xs"
              >
                Sign Up
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Info Modals */}
      <AnimatePresence>
        {showInfoModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-lg bg-lumina-card border border-lumina-border p-10 rounded-2xl relative"
            >
              <button 
                onClick={() => setShowInfoModal(null)}
                className="absolute top-6 right-6 text-lumina-text/20 hover:text-lumina-accent transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              
              {showInfoModal === 'about' ? (
                <div className="font-mono">
                  <h2 className="text-2xl font-bold text-lumina-text mb-6 uppercase tracking-tighter">System Documentation</h2>
                  <p className="text-xs text-lumina-text/40 leading-relaxed mb-6 uppercase tracking-wider">
                    MemorEase is a high-performance cognitive optimization platform designed for scholars and researchers. 
                    Our core engine utilizes advanced spaced repetition focus modes to ensure maximum information durability.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-[10px] font-bold text-lumina-text/60 uppercase tracking-widest">
                      <div className="w-2 h-2 bg-lumina-accent rounded-full"></div>
                      Build v2.5.0-stable
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-lumina-text/60 uppercase tracking-widest">
                      <div className="w-2 h-2 bg-lumina-accent rounded-full"></div>
                      Neural Engine: Active
                    </div>
                  </div>
                </div>
              ) : (
                <div className="font-mono">
                  <h2 className="text-2xl font-bold text-lumina-text mb-6 uppercase tracking-tighter">Communication Link</h2>
                  <p className="text-xs text-lumina-text/40 leading-relaxed mb-8 uppercase tracking-wider">
                    Establish a secure channel with our support team.
                  </p>
                  <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowInfoModal(null); }}>
                    <input type="text" placeholder="IDENTIFIER" className="input-lumina text-xs placeholder:uppercase" required />
                    <input type="email" placeholder="COMMS_ADDR" className="input-lumina text-xs placeholder:uppercase" required />
                    <textarea placeholder="MESSAGE_PAYLOAD" className="input-lumina text-xs placeholder:uppercase h-32 resize-none" required />
                    <button type="submit" className="btn-primary w-full py-4 text-xs uppercase tracking-[0.2em]">Transmit</button>
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md bg-lumina-card border border-lumina-border p-10 rounded-2xl relative font-mono"
            >
              <button 
                onClick={() => setMode('landing')}
                className="absolute top-6 right-6 text-lumina-text/20 hover:text-lumina-accent transition-colors"
              >
                <ArrowLeft size={20} />
              </button>

              {mode === 'login' && (
                <motion.div key="login">
                  <h2 className="text-2xl font-bold text-lumina-text mb-2 uppercase tracking-tighter">Authentication</h2>
                  <p className="text-[10px] text-lumina-text/30 mb-8 uppercase tracking-widest">Verify credentials to access terminal.</p>
                  <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
                    <input type="email" placeholder="EMAIL" className="input-lumina text-xs placeholder:uppercase" required />
                    <input type="password" placeholder="PASSWORD" className="input-lumina text-xs placeholder:uppercase" required />
                    <div className="flex justify-end">
                      <button type="button" onClick={() => setMode('forgot')} className="text-[10px] font-bold text-lumina-accent hover:underline uppercase tracking-widest">Recovery?</button>
                    </div>
                    <button type="submit" className="btn-primary w-full py-4 text-xs uppercase tracking-[0.2em] mt-2">Login</button>
                  </form>
                </motion.div>
              )}

              {mode === 'signup' && (
                <motion.div key="signup">
                  <h2 className="text-2xl font-bold text-lumina-text mb-2 uppercase tracking-tighter">Registration</h2>
                  <p className="text-[10px] text-lumina-text/30 mb-8 uppercase tracking-widest">Create new user profile.</p>
                  <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
                    <input type="text" placeholder="FULL_NAME" className="input-lumina text-xs placeholder:uppercase" required />
                    <input type="email" placeholder="EMAIL" className="input-lumina text-xs placeholder:uppercase" required />
                    <input type="password" placeholder="PASSWORD" className="input-lumina text-xs placeholder:uppercase" required />
                    <button type="submit" className="btn-primary w-full py-4 text-xs uppercase tracking-[0.2em] mt-2">Sign Up</button>
                  </form>
                </motion.div>
              )}

              {mode === 'forgot' && (
                <motion.div key="forgot">
                  <h2 className="text-2xl font-bold text-lumina-text mb-2 uppercase tracking-tighter">Recovery</h2>
                  <p className="text-[10px] text-lumina-text/30 mb-8 uppercase tracking-widest">Request credential reset.</p>
                  <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setMode('login'); }}>
                    <input type="email" placeholder="EMAIL" className="input-lumina text-xs placeholder:uppercase" required />
                    <button type="submit" className="btn-primary w-full py-4 text-xs uppercase tracking-[0.2em]">Send Link</button>
                    <button type="button" onClick={() => setMode('login')} className="w-full text-[10px] font-bold text-lumina-text/20 hover:text-lumina-text transition-colors uppercase tracking-widest">Abort</button>
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

const OverviewView = ({ onJumpBack, user, subjects }: { onJumpBack: (topic: Topic) => void, user: UserProfile, subjects: Subject[] }) => {
  const allTopics = subjects.flatMap(s => s.topics);
  const currentTopic = allTopics.find(t => t.progress < 100) || allTopics[0];

  return (
    <div className="pt-24 px-8 pb-20 min-h-screen relative font-mono">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex justify-between items-end border-b border-lumina-border pb-8">
          <div>
            <h1 className="text-4xl font-bold text-lumina-text mb-2 uppercase tracking-tighter">Neural Metrics</h1>
            <p className="text-xs text-lumina-text/30 uppercase tracking-widest">Real-time cognitive performance monitoring.</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Streak Metric */}
            <div className="bg-lumina-card border border-lumina-border px-6 py-3 rounded-xl flex items-center gap-4">
              <div className="w-10 h-10 bg-lumina-accent/10 rounded flex items-center justify-center">
                <Flame size={20} className="text-lumina-accent" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-lumina-text/30 uppercase tracking-widest">Streak</div>
                <div className="text-xl font-bold text-lumina-text">{user.streak}D</div>
              </div>
            </div>

            <div className="bg-lumina-card border border-lumina-border px-6 py-3 rounded-xl flex items-center gap-4">
              <div>
                <div className="text-[10px] font-bold text-lumina-text/30 uppercase tracking-widest">Auth_Level</div>
                <div className="text-xl font-bold text-lumina-accent">{user.rank.split(' ')[0]}</div>
              </div>
              <div className="w-10 h-10 bg-lumina-accent rounded flex items-center justify-center text-black">
                <Award size={20} />
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Metric Card */}
          <div className="lg:col-span-2 bg-lumina-card border border-lumina-border rounded-2xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
              <div className="w-2 h-2 bg-lumina-accent rounded-full animate-pulse"></div>
            </div>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3 aspect-square rounded-xl overflow-hidden border border-lumina-border">
                <img 
                  src={currentTopic.imageUrl} 
                  alt={currentTopic.name} 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="text-[10px] font-bold text-lumina-accent uppercase tracking-[0.3em] mb-2">Active Focus</div>
                <h2 className="text-3xl font-bold text-lumina-text mb-4 uppercase tracking-tighter">{currentTopic.name}</h2>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-[10px] font-bold text-lumina-text/40 uppercase tracking-widest">
                    <span>Durability</span>
                    <span>{currentTopic.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-lumina-bg border border-lumina-border rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${currentTopic.progress}%` }}
                      className="h-full bg-lumina-accent" 
                    />
                  </div>
                </div>
                <button 
                  onClick={() => onJumpBack(currentTopic)}
                  className="btn-primary self-start flex items-center gap-3 text-xs uppercase tracking-widest"
                >
                  <Play size={14} fill="currentColor" />
                  Continue Progress
                </button>
              </div>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="space-y-6">
            <div className="bg-lumina-card border border-lumina-border rounded-2xl p-6">
              <div className="text-[10px] font-bold text-lumina-text/30 uppercase tracking-widest mb-4">Neural_Load</div>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { val: 40 }, { val: 30 }, { val: 65 }, { val: 45 }, { val: 90 }, { val: 70 }, { val: 85 }
                  ]}>
                    <Area type="monotone" dataKey="val" stroke="#d4ff00" fill="#d4ff00" fillOpacity={0.1} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-lumina-card border border-lumina-border rounded-2xl p-6 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-lumina-text/30 uppercase tracking-widest mb-1">Total_Chapters</div>
                <div className="text-2xl font-bold text-lumina-text">{user.totalCards}</div>
              </div>
              <Database size={24} className="text-lumina-text/10" />
            </div>
          </div>
        </div>

        {/* Focus Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {allTopics.map((topic, i) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-lumina-card border p-6 rounded-xl transition-all hover:border-lumina-accent/50 ${
                topic.progress > 0 && topic.progress < 100 ? 'border-lumina-accent/30' : 'border-lumina-border'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-8 h-8 rounded flex items-center justify-center ${
                  topic.progress === 100 ? 'bg-green-500/10 text-green-500' :
                  topic.progress > 0 ? 'bg-lumina-accent/10 text-lumina-accent' : 'bg-white/5 text-lumina-text/20'
                }`}>
                  {topic.progress === 100 ? <CheckCheck size={16} /> : <Zap size={16} />}
                </div>
                <span className="text-[9px] font-bold text-lumina-text/20 uppercase tracking-widest">PRTCL_{i+1}</span>
              </div>
              <h3 className="text-sm font-bold text-lumina-text mb-1 uppercase tracking-tight">{topic.name}</h3>
              <div className="flex items-center justify-between mt-4">
                <span className="text-[9px] font-bold text-lumina-accent uppercase tracking-widest">+{topic.chapters * 10} XP</span>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-bold text-lumina-text/40">{topic.progress}%</span>
                  <div className="w-10 h-1 bg-lumina-bg border border-lumina-border rounded-full overflow-hidden">
                    <div className="h-full bg-lumina-accent" style={{ width: `${topic.progress}%` }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const FocusView = ({ settings, streak, activeTopic, onFinish }: { settings: PomodoroSettings, streak: number, activeTopic: Topic | null, onFinish: (xp: number) => void }) => {
  const [timeLeft, setTimeLeft] = useState(settings.workTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'short' | 'long'>('work');
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [selectedMusic, setSelectedMusic] = useState('None');
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [hardcoreMode, setHardcoreMode] = useState(false);
  const [sessionFailed, setSessionFailed] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

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

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const switchMode = (newMode: 'work' | 'short' | 'long') => {
    setMode(newMode);
    setIsActive(false);
    if (newMode === 'work') setTimeLeft(settings.workTime * 60);
    if (newMode === 'short') setTimeLeft(settings.shortBreak * 60);
    if (newMode === 'long') setTimeLeft(settings.longBreak * 60);
  };

  const toggleHardcore = async () => {
    if (!hardcoreMode) {
      try {
        await document.documentElement.requestFullscreen();
        setHardcoreMode(true);
      } catch (err) {
        console.error("Error attempting to enable full-screen mode:", err);
      }
    } else {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setHardcoreMode(false);
    }
  };

  const handleFinish = () => {
    setShowFinishModal(true);
    setIsActive(false);
  };

  const confirmFinish = () => {
    onFinish(500); // Award 500 XP
    setShowFinishModal(false);
  };

  return (
    <div className="pt-24 px-8 pb-20 min-h-screen flex flex-col items-center justify-center relative overflow-hidden font-mono">
      {/* Technical Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,#d4ff0010_0%,transparent_70%)]"></div>
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-lumina-accent/20"></div>
        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-lumina-accent/20"></div>
      </div>

      <div className="relative z-10 text-center max-w-4xl w-full">
        {activeTopic && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="text-[10px] font-bold text-lumina-accent uppercase tracking-[0.4em] mb-2">Focus Execution</div>
            <h2 className="text-4xl font-bold text-lumina-text uppercase tracking-tighter">{activeTopic.name}</h2>
          </motion.div>
        )}

        <div className="flex justify-center gap-2 mb-12">
          {[
            { id: 'work', label: 'FOCUS' },
            { id: 'short', label: '5 MINS BREAK' },
            { id: 'long', label: '15 MINS BREAK' }
          ].map(m => (
            <button 
              key={m.id}
              onClick={() => switchMode(m.id as any)}
              className={`px-6 py-1.5 rounded text-[10px] font-bold transition-all border ${
                mode === m.id ? 'bg-lumina-accent text-black border-lumina-accent' : 'text-lumina-text/40 border-lumina-border hover:bg-white/5'
              }`}
            >
              {m.label}
            </button>
          ))}
          <button 
            onClick={toggleHardcore}
            className={`px-6 py-1.5 rounded text-[10px] font-bold transition-all border flex items-center gap-2 ${
              hardcoreMode ? 'bg-red-500 text-white border-red-500' : 'text-lumina-text/40 border-lumina-border hover:bg-white/5'
            }`}
          >
            <ShieldCheck size={12} /> HARDCORE
          </button>
        </div>
        
        <div className="relative flex items-center justify-center mb-16">
          {/* Technical Circle */}
          <div className="absolute w-[450px] h-[450px] rounded-full border border-lumina-accent/10"></div>
          <div className="absolute w-[400px] h-[400px] rounded-full border border-lumina-accent/20 border-dashed animate-[spin_60s_linear_infinite]"></div>
          
          <motion.div 
            animate={{ 
              scale: isActive ? (phase === 'inhale' ? 1.1 : phase === 'hold' ? 1.1 : 1) : 1,
              opacity: isActive ? 0.2 : 0.05
            }}
            transition={{ duration: 4, ease: "easeInOut" }}
            className="absolute w-80 h-80 rounded-full bg-lumina-accent"
          />

          <div className="relative">
            <div className="text-[12rem] font-bold text-lumina-text leading-none tracking-tighter select-none">
              {formatTime(timeLeft)}
            </div>
            {isActive && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-bold text-lumina-accent mt-4 uppercase tracking-[0.5em]"
              >
                {phase === 'inhale' ? 'Inhale' : phase === 'hold' ? 'Hold' : 'Exhale'}
              </motion.div>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-6 mb-20">
          <button 
            onClick={() => setIsActive(!isActive)}
            className="w-20 h-20 rounded-xl bg-lumina-accent text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
          </button>
          <button 
            onClick={() => { setIsActive(false); switchMode(mode); }}
            className="w-20 h-20 rounded-xl bg-lumina-card border border-lumina-border text-lumina-text/40 flex items-center justify-center hover:text-lumina-text transition-all"
          >
            <RotateCcw size={32} />
          </button>
          {activeTopic && (
            <button 
              onClick={handleFinish}
              className="w-20 h-20 rounded-xl bg-white text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <CheckCheck size={32} />
            </button>
          )}
        </div>

        {/* Finish Modal */}
        <AnimatePresence>
          {showFinishModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md bg-lumina-card border border-lumina-border p-10 rounded-2xl text-center"
              >
                <div className="w-16 h-16 bg-lumina-accent rounded flex items-center justify-center text-black mx-auto mb-8 shadow-xl">
                  <Award size={32} />
                </div>
                <h3 className="text-2xl font-bold text-lumina-text mb-2 uppercase tracking-tighter">Focus Terminated</h3>
                <p className="text-xs text-lumina-text/40 mb-10 uppercase tracking-widest">Neural durability significantly increased.</p>
                
                <div className="bg-lumina-bg border border-lumina-border p-6 rounded-xl mb-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap size={20} className="text-lumina-accent" />
                    <span className="text-[10px] font-bold text-lumina-text uppercase tracking-widest">XP_GAIN</span>
                  </div>
                  <span className="text-xl font-bold text-lumina-accent">+500</span>
                </div>

                <button 
                  onClick={confirmFinish}
                  className="btn-primary w-full py-4 text-xs uppercase tracking-[0.2em]"
                >
                  Sync Rewards
                </button>
              </motion.div>
            </motion.div>
          )}

          {sessionFailed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md bg-lumina-card border border-red-500/50 p-10 rounded-2xl text-center"
              >
                <div className="w-16 h-16 bg-red-500/20 rounded flex items-center justify-center text-red-500 mx-auto mb-8 shadow-xl">
                  <Lock size={32} />
                </div>
                <h3 className="text-2xl font-bold text-red-500 mb-2 uppercase tracking-tighter">NEURAL LINK SEVERED</h3>
                <p className="text-xs text-lumina-text/40 mb-10 uppercase tracking-widest">Hardcore mode violation detected. Focus compromised.</p>
                
                <div className="bg-lumina-bg border border-red-500/30 p-6 rounded-xl mb-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap size={20} className="text-red-500" />
                    <span className="text-[10px] font-bold text-lumina-text uppercase tracking-widest">XP_PENALTY</span>
                  </div>
                  <span className="text-xl font-bold text-red-500">-100</span>
                </div>

                <button 
                  onClick={() => { setSessionFailed(false); onFinish(-100); }}
                  className="w-full py-4 bg-red-500/10 text-red-500 border border-red-500/50 rounded-xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-red-500/20 transition-colors"
                >
                  Acknowledge
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {[
            { name: 'Rainfall', icon: '🌧️' },
            { name: 'Lo-Fi', icon: '🎧' },
            { name: 'Forest', icon: '🐦' }
          ].map((music) => (
            <button 
              key={music.name} 
              onClick={() => setSelectedMusic(music.name)}
              className={`bg-lumina-card border p-6 rounded-xl transition-all group text-left ${
                selectedMusic === music.name ? 'border-lumina-accent' : 'border-lumina-border hover:border-lumina-accent/30'
              }`}
            >
              <div className="text-xl mb-3">{music.icon}</div>
              <div className="text-[10px] font-bold text-lumina-text uppercase tracking-widest">{music.name}</div>
              <div className="text-[8px] text-lumina-text/20 uppercase tracking-wider mt-1">Audio_Stream</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const VaultView = ({ subjects, setSubjects }: { subjects: Subject[], setSubjects: React.Dispatch<React.SetStateAction<Subject[]>> }) => {
  const [newSubjectName, setNewSubjectName] = useState('');
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [newTopicName, setNewTopicName] = useState('');
  const [previewTopic, setPreviewTopic] = useState<Topic | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadType, setUploadType] = useState<'PDF' | 'Text' | 'Notes' | null>(null);
  const [textInput, setTextInput] = useState('');
  const [showInterrogation, setShowInterrogation] = useState(false);

  const addSubject = () => {
    if (newSubjectName.trim() && subjects.length < 10) {
      const newId = Date.now().toString();
      setSubjects(prev => [...prev, { id: newId, name: newSubjectName.trim(), topics: [] }]);
      setNewSubjectName('');
      setActiveSubjectId(newId);
    }
  };

  const addTopic = (id: string) => {
    if (newTopicName) {
      const newTopic: Topic = {
        id: Date.now().toString(),
        name: newTopicName,
        progress: 0,
        description: `Deep dive into ${newTopicName}. Master the fundamentals and advanced concepts.`,
        imageUrl: `https://picsum.photos/seed/${newTopicName}/800/600`,
        lastReviewed: 'Never',
        nextReview: 'Today',
        chapters: 5,
        masteryLevel: 1,
        assets: []
      };
      setSubjects(subjects.map(s => s.id === id ? { ...s, topics: [...s.topics, newTopic] } : s));
      setNewTopicName('');
    }
  };

  const simulateUpload = (fileName: string, type: string) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setUploadProgress(100);
        setIsUploading(false);
        setShowUploadModal(false);
        
        if (activeSubjectId) {
          setSubjects(prevSubjects => prevSubjects.map(s => {
            if (s.id === activeSubjectId && s.topics.length > 0) {
              const updatedTopics = [...s.topics];
              updatedTopics[0] = {
                ...updatedTopics[0],
                assets: [...(updatedTopics[0].assets || []), { name: fileName, type }]
              };
              return { ...s, topics: updatedTopics };
            }
            return s;
          }));
        }
      } else {
        setUploadProgress(currentProgress);
      }
    }, 200);
  };

  return (
    <div className="pt-24 px-8 pb-20 min-h-screen font-mono">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-lumina-border pb-8">
          <div>
            <h1 className="text-4xl font-bold text-lumina-text mb-2 uppercase tracking-tighter">Neural Vault</h1>
            <p className="text-xs text-lumina-text/30 uppercase tracking-widest">Archive of all synchronized cognitive chapters.</p>
          </div>
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="NEW_DIRECTORY..." 
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              className="input-lumina w-64 text-xs placeholder:uppercase tracking-widest"
            />
            <button 
              onClick={addSubject}
              disabled={subjects.length >= 10}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 text-xs uppercase tracking-widest"
            >
              <Plus size={16} /> Add Topic
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Subject List */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-lumina-text/20 uppercase tracking-[0.3em] mb-4 px-4">Directories</div>
            {subjects.map(subject => (
              <button
                key={subject.id}
                onClick={() => setActiveSubjectId(subject.id)}
                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between group ${
                  activeSubjectId === subject.id ? 'bg-lumina-accent text-black border-lumina-accent' : 'bg-lumina-card text-lumina-text/60 border-lumina-border hover:border-lumina-accent/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded flex items-center justify-center ${activeSubjectId === subject.id ? 'bg-black/10' : 'bg-lumina-bg'}`}>
                    <Folder size={16} className={activeSubjectId === subject.id ? 'text-black' : 'text-lumina-accent'} />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-tight">{subject.name}</div>
                    <div className={`text-[9px] font-bold uppercase tracking-widest ${activeSubjectId === subject.id ? 'text-black/60' : 'text-lumina-text/20'}`}>{subject.topics.length} Chapters</div>
                  </div>
                </div>
                <ChevronRight size={14} className={activeSubjectId === subject.id ? 'text-black/40' : 'text-lumina-text/20'} />
              </button>
            ))}
          </div>

          {/* Topic Management & Preview */}
          <div className="lg:col-span-2">
            {activeSubjectId ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-lumina-card border border-lumina-border p-8 rounded-2xl min-h-[500px] relative"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b border-lumina-border pb-6">
                  <h2 className="text-2xl font-bold text-lumina-text uppercase tracking-tighter">
                    <span className="text-lumina-accent">/</span> {subjects.find(s => s.id === activeSubjectId)?.name}
                  </h2>
                  <div className="flex gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => setShowUploadModal(true)}
                      className="w-10 h-10 rounded-lg bg-lumina-bg border border-lumina-border flex items-center justify-center text-lumina-text/40 hover:text-lumina-accent transition-all"
                    >
                      <Upload size={18} />
                    </button>
                    <input 
                      type="text" 
                      placeholder="NEW_CHAPTER..." 
                      value={newTopicName}
                      onChange={(e) => setNewTopicName(e.target.value)}
                      className="input-lumina flex-1 md:w-48 text-[10px] placeholder:uppercase tracking-widest"
                    />
                    <button onClick={() => addTopic(activeSubjectId)} className="btn-primary py-2 px-6 text-[10px] uppercase tracking-widest">Sync</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjects.find(s => s.id === activeSubjectId)?.topics.map((topic) => (
                    <div 
                      key={topic.id} 
                      className="p-4 bg-lumina-bg rounded-xl border border-lumina-border flex items-center justify-between group hover:border-lumina-accent/30 transition-all cursor-pointer"
                      onClick={() => setPreviewTopic(topic)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-lumina-accent"></div>
                        <span className="text-xs font-bold text-lumina-text uppercase tracking-tight">{topic.name}</span>
                      </div>
                      <button className="text-lumina-text/20 group-hover:text-lumina-accent transition-colors">
                        <TrendingUp size={16} />
                      </button>
                    </div>
                  ))}
                  {subjects.find(s => s.id === activeSubjectId)?.topics.length === 0 && (
                    <div className="col-span-2 flex flex-col items-center justify-center py-20 text-lumina-text/10">
                      <Database size={48} className="mb-4" />
                      <p className="text-[10px] uppercase tracking-[0.3em]">No chapters synchronized.</p>
                    </div>
                  )}
                </div>

                {/* Upload Modal */}
                <AnimatePresence>
                  {showUploadModal && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm"
                    >
                      <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full max-w-md bg-lumina-card border border-lumina-border p-8 rounded-2xl relative"
                      >
                        <button 
                          onClick={() => setShowUploadModal(false)}
                          className="absolute top-6 right-6 text-lumina-text/30 hover:text-lumina-text transition-colors"
                        >
                          <ArrowLeft size={18} />
                        </button>
                        <h3 className="text-xl font-bold text-lumina-text mb-1 uppercase tracking-tighter">Chapter Ingestion</h3>
                        <p className="text-[10px] text-lumina-text/30 mb-8 uppercase tracking-widest">Synchronize external data with the vault.</p>

                        {isUploading ? (
                          <div className="space-y-6 py-4">
                            <div className="flex justify-between text-[10px] font-bold text-lumina-text/40 mb-2 uppercase tracking-widest">
                              <span>Processing {uploadType}...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-lumina-bg border border-lumina-border rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${uploadProgress}%` }}
                                className="h-full bg-lumina-accent"
                              />
                            </div>
                            <p className="text-center text-[9px] text-lumina-text/20 uppercase tracking-widest">Extracting neural patterns...</p>
                          </div>
                        ) : uploadType === 'Text' ? (
                          <div className="space-y-4">
                            <textarea 
                              value={textInput}
                              onChange={(e) => setTextInput(e.target.value)}
                              placeholder="RAW_TEXT_INPUT..."
                              className="input-lumina w-full h-40 resize-none p-4 text-[10px] placeholder:uppercase tracking-widest leading-relaxed"
                            />
                            <div className="flex gap-3">
                              <button 
                                onClick={() => setUploadType(null)}
                                className="flex-1 py-3 bg-lumina-bg border border-lumina-border rounded-xl text-[10px] font-bold text-lumina-text/40 hover:text-lumina-text transition-all uppercase tracking-widest"
                              >
                                Back
                              </button>
                              <button 
                                onClick={() => {
                                  if (textInput.trim()) {
                                    simulateUpload('Custom_Notes.txt', 'Text');
                                    setTextInput('');
                                  }
                                }}
                                className="flex-[2] py-3 btn-primary rounded-xl text-[10px] font-bold uppercase tracking-widest"
                              >
                                Analyze_Stream
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-3">
                            {[
                              { id: 'PDF', label: 'PDF_DUMP', desc: 'Research papers, textbooks', icon: <FileText size={18} />, color: 'text-red-500' },
                              { id: 'Text', label: 'RAW_INPUT', desc: 'Quick notes, snippets', icon: <Edit3 size={18} />, color: 'text-blue-500' },
                              { id: 'Notes', label: 'VISUAL_SCAN', desc: 'Handwritten notes, images', icon: <Camera size={18} />, color: 'text-emerald-500' }
                            ].map((type) => (
                              <button 
                                key={type.id}
                                onClick={() => { 
                                  if (type.id === 'Text') setUploadType('Text');
                                  else { setUploadType(type.id as any); simulateUpload(`${type.label}.dat`, type.id); }
                                }}
                                className="p-4 rounded-xl border border-lumina-border bg-lumina-bg hover:border-lumina-accent transition-all flex items-center gap-4 group"
                              >
                                <div className={`w-10 h-10 rounded bg-white/5 flex items-center justify-center ${type.color} group-hover:scale-110 transition-transform`}>
                                  {type.icon}
                                </div>
                                <div className="text-left">
                                  <div className="text-xs font-bold text-lumina-text uppercase tracking-tight">{type.label}</div>
                                  <div className="text-[9px] text-lumina-text/30 uppercase tracking-widest">{type.desc}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Topic Preview Overlay */}
                <AnimatePresence>
                  {previewTopic && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute inset-0 z-20 bg-lumina-card rounded-2xl p-8 flex flex-col border border-lumina-border"
                    >
                      <button 
                        onClick={() => setPreviewTopic(null)}
                        className="absolute top-6 right-6 text-lumina-text/30 hover:text-lumina-text transition-colors"
                      >
                        <ArrowLeft size={20} />
                      </button>
                      <span className="text-lumina-accent font-bold uppercase tracking-[0.4em] text-[10px] mb-2">Chapter Preview</span>
                      <h3 className="text-3xl font-bold text-lumina-text mb-8 uppercase tracking-tighter">{previewTopic.name}</h3>
                      <div className="flex-1 overflow-y-auto pr-4 space-y-6 custom-scrollbar">
                        <div className="p-6 bg-lumina-bg rounded-xl border border-lumina-border">
                          <h4 className="text-[10px] font-bold text-lumina-text mb-4 flex items-center gap-2 uppercase tracking-widest">
                            <Zap size={14} className="text-lumina-accent" />
                            Neural_Insights
                          </h4>
                          <p className="text-xs text-lumina-text/60 leading-relaxed uppercase tracking-tight">
                            {previewTopic.description}
                            <br /><br />
                            Focus contains {previewTopic.chapters} sub-modules. Potential yield: {previewTopic.chapters * 100} XP.
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-lumina-bg border border-lumina-border rounded-xl">
                            <div className="text-[8px] font-bold text-lumina-text/30 uppercase tracking-widest mb-1">Last_Sync</div>
                            <div className="text-xs font-bold text-lumina-text uppercase">{previewTopic.lastReviewed}</div>
                          </div>
                          <div className="p-4 bg-lumina-bg border border-lumina-border rounded-xl">
                            <div className="text-[8px] font-bold text-lumina-text/30 uppercase tracking-widest mb-1">Next_Checkpoint</div>
                            <div className="text-xs font-bold text-lumina-accent uppercase">{previewTopic.nextReview}</div>
                          </div>
                        </div>

                        {/* Predictive Memory Decay Curve */}
                        <div className="p-6 bg-lumina-bg border border-lumina-border rounded-xl">
                          <h4 className="text-[10px] font-bold text-lumina-text mb-4 flex items-center gap-2 uppercase tracking-widest">
                            <TrendingUp size={14} className="text-lumina-accent" />
                            Memory_Decay_Prediction
                          </h4>
                          <div className="h-32 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={[
                                { day: 0, retention: 100 },
                                { day: 1, retention: 80 + (previewTopic.masteryLevel * 2) },
                                { day: 2, retention: 60 + (previewTopic.masteryLevel * 4) },
                                { day: 3, retention: 40 + (previewTopic.masteryLevel * 6) },
                                { day: 7, retention: 20 + (previewTopic.masteryLevel * 8) },
                              ]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="day" stroke="#ffffff30" fontSize={8} tickLine={false} axisLine={false} />
                                <YAxis stroke="#ffffff30" fontSize={8} tickLine={false} axisLine={false} />
                                <Tooltip 
                                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '8px', fontSize: '10px' }}
                                  itemStyle={{ color: '#d4ff00' }}
                                />
                                <Line type="monotone" dataKey="retention" stroke="#d4ff00" strokeWidth={2} dot={{ fill: '#d4ff00', r: 3 }} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-8">
                        <button 
                          onClick={() => setShowInterrogation(true)}
                          className="flex-1 py-4 bg-lumina-bg border border-lumina-accent text-lumina-accent rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-lumina-accent/10 transition-colors"
                        >
                          Interrogate
                        </button>
                        <button className="flex-[2] btn-primary py-4 text-xs uppercase tracking-widest">Continue_Progress</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <AnimatePresence>
                  {showInterrogation && previewTopic && (
                    <SocraticInterrogation 
                      topic={previewTopic} 
                      onClose={() => setShowInterrogation(false)} 
                      onComplete={(xp) => {
                        setShowInterrogation(false);
                        // Add XP logic here if needed, or pass it up
                      }} 
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-lumina-card border border-dashed border-lumina-border rounded-2xl text-lumina-text/10">
                <LayoutDashboard size={48} className="mb-6" />
                <p className="text-[10px] uppercase tracking-[0.3em]">Select a directory to manage chapters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileView = ({ user, setUser, subjects }: { user: UserProfile, setUser: React.Dispatch<React.SetStateAction<UserProfile>>, subjects: Subject[] }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editAvatar, setEditAvatar] = useState(user.avatar);

  const isStreakBroken = user.streak === 0 && user.xp >= 500;

  const repairStreak = () => {
    if (user.xp >= 500) {
      setUser({ ...user, streak: 1, xp: user.xp - 500, lastActive: new Date().toISOString() });
    }
  };

  const saveProfile = () => {
    setUser({ ...user, name: editName, avatar: editAvatar });
    setIsEditing(false);
  };

  const heatmapData = Array.from({ length: 52 * 7 }, (_, i) => ({
    date: i,
    value: Math.floor(Math.random() * 5)
  }));

  const retentionData = [
    { day: 0, retention: 100 },
    { day: 1, retention: 80 },
    { day: 3, retention: 65 },
    { day: 7, retention: 55 },
    { day: 14, retention: 45 },
    { day: 30, retention: 40 },
  ];

  const focusData = subjects.map(subject => {
    const value = subject.topics.reduce((acc, topic) => acc + (topic.progress * topic.chapters), 0);
    return { name: subject.name.split(' ')[0], value: value > 0 ? value : 10 };
  }).filter(d => d.value > 0).slice(0, 5);

  if (focusData.length === 0) {
    focusData.push({ name: 'None', value: 100 });
  }

  const COLORS = ['#d4ff00', '#ffcc00', '#00ffcc', '#ff00cc'];

  return (
    <div className="pt-24 px-8 pb-20 min-h-screen font-mono">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 border-b border-lumina-border pb-8">
          <h1 className="text-4xl font-bold text-lumina-text mb-2 uppercase tracking-tighter">Neural Dossier</h1>
          <p className="text-xs text-lumina-text/30 uppercase tracking-widest">Subject identification and performance analytics.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Identity Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-lumina-card border border-lumina-border rounded-2xl p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-lumina-accent"></div>
              <div className="relative">
                <div className="relative inline-block mb-6">
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-32 h-32 rounded-xl object-cover border-2 border-lumina-accent p-1 grayscale"
                    referrerPolicy="no-referrer"
                  />
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-lumina-accent text-black rounded flex items-center justify-center shadow-lg">
                      <Camera size={14} />
                    </button>
                  )}
                </div>
                
                {isEditing ? (
                  <div className="space-y-3 mb-6">
                    <input 
                      type="text" 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)}
                      className="input-lumina text-center font-bold text-xs placeholder:uppercase tracking-widest"
                    />
                    <input 
                      type="text" 
                      value={editAvatar} 
                      onChange={(e) => setEditAvatar(e.target.value)}
                      placeholder="AVATAR_URL"
                      className="input-lumina text-center text-[10px] placeholder:uppercase tracking-widest"
                    />
                    <div className="flex gap-2">
                      <button onClick={saveProfile} className="btn-primary flex-1 py-2 text-[10px] uppercase tracking-widest">Save</button>
                      <button onClick={() => setIsEditing(false)} className="bg-lumina-bg border border-lumina-border flex-1 py-2 text-[10px] font-bold text-lumina-text/40 uppercase tracking-widest">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-lumina-text mb-1 uppercase tracking-tighter">{user.name}</h2>
                    <p className="text-lumina-accent font-bold uppercase tracking-[0.3em] text-[10px] mb-6">{user.rank}</p>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="text-[10px] font-bold text-lumina-text/20 hover:text-lumina-accent transition-colors flex items-center gap-2 mx-auto mb-6 uppercase tracking-widest"
                    >
                      <Edit3 size={12} /> Edit_Credentials
                    </button>
                  </>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-lumina-bg border border-lumina-border rounded-xl">
                    <div className="text-[8px] font-bold text-lumina-text/30 uppercase tracking-widest mb-1">Level</div>
                    <div className="text-xl font-bold text-lumina-text">{user.level}</div>
                  </div>
                  <div className="p-4 bg-lumina-bg border border-lumina-border rounded-xl relative">
                    <div className="text-[8px] font-bold text-lumina-text/30 uppercase tracking-widest mb-1">Streak</div>
                    <div className={`text-xl font-bold ${user.streak > 0 ? 'text-lumina-accent' : 'text-red-500'}`}>{user.streak}D</div>
                    {isStreakBroken && (
                      <button 
                        onClick={repairStreak}
                        className="absolute bottom-2 right-2 text-[8px] font-bold bg-lumina-accent/10 text-lumina-accent px-2 py-1 rounded border border-lumina-accent/30 hover:bg-lumina-accent/20 transition-colors uppercase tracking-widest"
                      >
                        Repair (-500 XP)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-lumina-card border border-lumina-border rounded-2xl p-6">
              <h3 className="text-[10px] font-bold text-lumina-text/20 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <TrendingUp size={14} className="text-lumina-accent" />
                Consistency_Heatmap
              </h3>
              <div className="grid grid-cols-52 grid-rows-7 gap-0.5 h-24">
                {heatmapData.map((d) => (
                  <div 
                    key={d.date} 
                    className={`rounded-[1px] transition-colors ${
                      d.value === 0 ? 'bg-white/5' :
                      d.value === 1 ? 'bg-lumina-accent/20' :
                      d.value === 2 ? 'bg-lumina-accent/40' :
                      d.value === 3 ? 'bg-lumina-accent/70' : 'bg-lumina-accent'
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-4 text-[8px] font-bold text-lumina-text/20 uppercase tracking-widest">
                <span>Min</span>
                <div className="flex gap-0.5">
                  {[0.05, 0.2, 0.4, 0.7, 1].map((op, i) => (
                    <div key={i} className="w-2 h-2 rounded-[1px]" style={{ backgroundColor: `rgba(212, 255, 0, ${op})` }} />
                  ))}
                </div>
                <span>Max</span>
              </div>
            </div>
          </div>

          {/* Analytics Main */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-lumina-card border border-lumina-border rounded-2xl p-8">
                <h3 className="text-xl font-bold text-lumina-text mb-8 uppercase tracking-tighter">Retention_Curve</h3>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={retentionData}>
                      <XAxis dataKey="day" hide />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff10', borderRadius: '8px', fontSize: '10px', fontFamily: 'monospace' }}
                        itemStyle={{ color: '#d4ff00' }}
                      />
                      <Area type="monotone" dataKey="retention" stroke="#d4ff00" strokeWidth={2} fill="#d4ff00" fillOpacity={0.1} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[9px] text-lumina-text/30 mt-4 leading-relaxed uppercase tracking-widest">
                  Neural decay monitoring active. Spaced repetition algorithms optimizing for 80% threshold.
                </p>
              </div>

              <div className="bg-lumina-card border border-lumina-border rounded-2xl p-8">
                <h3 className="text-xl font-bold text-lumina-text mb-8 uppercase tracking-tighter">Neural_Load</h3>
                <div className="h-60 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={focusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {focusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff10', borderRadius: '8px', fontSize: '10px', fontFamily: 'monospace' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {focusData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-[8px] font-bold text-lumina-text/40 uppercase tracking-widest">{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-lumina-card border border-lumina-border rounded-2xl p-8">
              <h3 className="text-xl font-bold text-lumina-text mb-8 uppercase tracking-tighter">Mastery_Milestones</h3>
              <div className="space-y-4">
                {[
                  { title: 'Novice Scholar', progress: 100, date: 'MAR_01' },
                  { title: 'Memory Architect', progress: 100, date: 'MAR_05' },
                  { title: 'Focus Master', progress: 45, date: 'IN_PROGRESS' },
                  { title: 'Grandmaster', progress: 0, date: 'LOCKED' },
                ].map((m) => (
                  <div key={m.title} className="flex items-center gap-4 p-4 bg-lumina-bg border border-lumina-border rounded-xl">
                    <div className={`w-10 h-10 rounded flex items-center justify-center ${m.progress === 100 ? 'bg-lumina-accent text-black' : 'bg-white/5 text-lumina-text/10'}`}>
                      <Award size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-bold text-lumina-text uppercase tracking-tight">{m.title}</span>
                        <span className="text-[8px] font-bold text-lumina-text/30 uppercase tracking-widest">{m.date}</span>
                      </div>
                      <div className="h-1 w-full bg-black border border-lumina-border rounded-full overflow-hidden">
                        <div className="h-full bg-lumina-accent transition-all duration-1000" style={{ width: `${m.progress}%` }}></div>
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

const NotificationsView = ({ notifications, setNotifications }: { notifications: Notification[], setNotifications: React.Dispatch<React.SetStateAction<Notification[]>> }) => {
  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="pt-24 px-8 pb-20 min-h-screen font-mono">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 flex justify-between items-end border-b border-lumina-border pb-8">
          <div>
            <h1 className="text-4xl font-bold text-lumina-text mb-2 uppercase tracking-tighter">System Logs</h1>
            <p className="text-xs text-lumina-text/30 uppercase tracking-widest">Real-time event stream and focus updates.</p>
          </div>
          <button 
            onClick={markAllRead}
            className="text-[10px] font-bold text-lumina-accent hover:underline flex items-center gap-2 uppercase tracking-widest"
          >
            <CheckCheck size={14} /> Clear_Flags
          </button>
        </header>

        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-lumina-card border p-6 rounded-xl flex items-start gap-6 relative group transition-all ${!n.isRead ? 'border-lumina-accent/50 shadow-lg' : 'border-lumina-border'}`}
              >
                <div className={`w-12 h-12 rounded flex items-center justify-center shrink-0 ${
                  n.type === 'reminder' ? 'bg-lumina-accent/10 text-lumina-accent' :
                  n.type === 'achievement' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                }`}>
                  {n.type === 'reminder' ? <Clock size={20} /> : n.type === 'achievement' ? <Award size={20} /> : <Zap size={20} />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xs font-bold text-lumina-text uppercase tracking-tight">{n.title}</h3>
                    <span className="text-[10px] font-bold text-lumina-text/20 uppercase tracking-widest">{n.time}</span>
                  </div>
                  <p className="text-[10px] text-lumina-text/60 leading-relaxed uppercase tracking-tight">{n.message}</p>
                </div>
                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => deleteNotification(n.id)}
                    className="w-8 h-8 rounded bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-black transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {!n.isRead && (
                  <div className="absolute top-4 left-4 w-2 h-2 bg-lumina-accent rounded-full animate-pulse"></div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="py-32 text-center text-lumina-text/10">
              <Zap size={48} className="mx-auto mb-6" />
              <p className="text-[10px] uppercase tracking-[0.3em]">All focuses synchronized.</p>
            </div>
          )}
        </div>

        <div className="mt-12 p-8 bg-lumina-card border border-lumina-accent/20 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-lumina-accent"></div>
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded bg-lumina-accent flex items-center justify-center text-black shadow-xl">
              <Brain size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-lumina-text mb-1 uppercase tracking-tight">Memory Decay Alert</h3>
              <p className="text-[10px] text-lumina-text/40 uppercase tracking-widest leading-relaxed">Quantum Physics: Schrödinger's Cat is nearing the forgetting threshold. Review now to maintain 90% retention.</p>
            </div>
            <button className="btn-primary py-2 px-6 text-[10px] uppercase tracking-widest whitespace-nowrap">Review_Now</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CommandPalette = ({ isOpen, setIsOpen, setView }: { isOpen: boolean, setIsOpen: (o: boolean) => void, setView: (v: View) => void }) => {
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
    { name: 'Go to Profile', action: () => { setView('profile'); setIsOpen(false); }, icon: <User size={14} /> },
    { name: 'Go to Vault', action: () => { setView('vault'); setIsOpen(false); }, icon: <Database size={14} /> },
    { name: 'Start Focus Session', action: () => { setView('focus'); setIsOpen(false); }, icon: <Timer size={14} /> },
    { name: 'View Overview', action: () => { setView('overview'); setIsOpen(false); }, icon: <LayoutDashboard size={14} /> },
    { name: 'Log Out', action: () => { setView('auth'); setIsOpen(false); }, icon: <LogOut size={14} /> },
  ];

  const filtered = commands.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-lumina-card border border-lumina-border rounded-xl shadow-2xl overflow-hidden font-mono"
      >
        <div className="p-4 border-b border-lumina-border flex items-center gap-3">
          <Target size={18} className="text-lumina-accent" />
          <input 
            autoFocus
            type="text" 
            placeholder="TYPE COMMAND..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-lumina-text w-full text-xs uppercase tracking-widest placeholder:text-lumina-text/30"
          />
        </div>
        <div className="max-h-64 overflow-y-auto p-2 custom-scrollbar">
          {filtered.map((cmd, i) => (
            <button 
              key={i}
              onClick={cmd.action}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-lumina-bg flex items-center gap-3 text-xs text-lumina-text/70 hover:text-lumina-text uppercase tracking-widest transition-colors"
            >
              <span className="text-lumina-accent">{cmd.icon}</span>
              {cmd.name}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="p-4 text-center text-[10px] text-lumina-text/30 uppercase tracking-widest">No commands found.</div>
          )}
        </div>
        <div className="p-2 border-t border-lumina-border bg-lumina-bg/50 text-[9px] text-lumina-text/30 text-center uppercase tracking-widest">
          Use <span className="text-lumina-accent">↑↓</span> to navigate, <span className="text-lumina-accent">Enter</span> to select, <span className="text-lumina-accent">Esc</span> to close
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
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-lumina-card border border-lumina-border p-8 rounded-2xl relative flex flex-col h-[80vh]">
        <button onClick={onClose} className="absolute top-6 right-6 text-lumina-text/30 hover:text-lumina-text">
          <ArrowLeft size={18} />
        </button>
        <h3 className="text-xl font-bold text-lumina-text mb-1 uppercase tracking-tighter flex items-center gap-2">
          <Brain size={20} className="text-lumina-accent" /> Socratic Interrogation
        </h3>
        <p className="text-[10px] text-lumina-text/30 mb-6 uppercase tracking-widest">Topic: {topic.name}</p>

        <div className="flex-1 overflow-y-auto mb-4 space-y-4 custom-scrollbar pr-2">
          {messages.map((m, i) => (
            <div key={i} className={`p-4 rounded-xl text-xs uppercase tracking-widest leading-relaxed ${m.role === 'ai' ? 'bg-lumina-bg border border-lumina-border text-lumina-text/80' : 'bg-lumina-accent/10 border border-lumina-accent/30 text-lumina-accent ml-8'}`}>
              <span className="font-bold text-[9px] opacity-50 block mb-2">{m.role === 'ai' ? 'SYSTEM' : 'USER'}</span>
              {m.text}
            </div>
          ))}
          {isTyping && <div className="text-[10px] text-lumina-accent animate-pulse uppercase tracking-widest">System is formulating query...</div>}
          {isGrading && <div className="text-[10px] text-lumina-accent animate-pulse uppercase tracking-widest">Analyzing response patterns...</div>}
          
          {grade && (
            <div className="p-6 bg-lumina-bg border border-lumina-accent rounded-xl mt-4">
              <div className="text-2xl font-bold text-lumina-accent mb-2">SCORE: {grade.score}/100</div>
              <div className="text-xs text-lumina-text/80 uppercase tracking-widest leading-relaxed">{grade.feedback}</div>
              <button 
                onClick={() => { onComplete(grade.score * 5); onClose(); }}
                className="btn-primary w-full mt-6 py-3 text-[10px] uppercase tracking-widest"
              >
                Claim {grade.score * 5} XP & Exit
              </button>
            </div>
          )}
        </div>

        {!grade && (
          <div className="flex gap-2">
            <textarea 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="ENTER_RESPONSE..."
              className="input-lumina flex-1 h-20 resize-none text-xs placeholder:uppercase tracking-widest"
              disabled={isTyping || isGrading}
            />
            <button 
              onClick={handleSend}
              disabled={isTyping || isGrading || !input.trim()}
              className="btn-primary px-6 flex items-center justify-center disabled:opacity-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<View>('auth');
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([
    { 
      id: '1', 
      name: 'Quantum Physics', 
      topics: [
        {
          id: 't1',
          name: 'Wave-Particle Duality',
          progress: 65,
          description: 'Exploring the intersection of neural plasticity and spaced repetition algorithms.',
          imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000',
          lastReviewed: '2 days ago',
          nextReview: 'Tomorrow',
          chapters: 8,
          masteryLevel: 4,
          assets: []
        },
        {
          id: 't2',
          name: 'Quantum Entanglement',
          progress: 100,
          description: 'The spooky action at a distance that defines modern physics.',
          imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1000',
          lastReviewed: 'Today',
          nextReview: 'Mar 15',
          chapters: 5,
          masteryLevel: 5,
          assets: []
        }
      ] 
    },
    { 
      id: '2', 
      name: 'Modern History', 
      topics: [
        {
          id: 't3',
          name: 'Industrial Revolution',
          progress: 20,
          description: 'The shift from agrarian societies to industrial powerhouses.',
          imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1000',
          lastReviewed: '1 week ago',
          nextReview: 'Today',
          chapters: 12,
          masteryLevel: 2,
          assets: []
        }
      ] 
    },
    {
      id: '3',
      name: 'Computer Science',
      topics: [
        {
          id: 't4',
          name: 'Data Structures',
          progress: 80,
          description: 'Fundamental ways to organize and store data efficiently.',
          imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1000',
          lastReviewed: 'Yesterday',
          nextReview: 'Tomorrow',
          chapters: 15,
          masteryLevel: 4,
          assets: []
        },
        {
          id: 't5',
          name: 'Machine Learning',
          progress: 10,
          description: 'Algorithms that improve automatically through experience.',
          imageUrl: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&q=80&w=1000',
          lastReviewed: '1 month ago',
          nextReview: 'Today',
          chapters: 20,
          masteryLevel: 1,
          assets: []
        }
      ]
    },
    {
      id: '4',
      name: 'Neuroscience',
      topics: [
        {
          id: 't6',
          name: 'Synaptic Plasticity',
          progress: 55,
          description: 'The ability of synapses to strengthen or weaken over time.',
          imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=1000',
          lastReviewed: '4 days ago',
          nextReview: 'In 2 days',
          chapters: 6,
          masteryLevel: 3,
          assets: []
        }
      ]
    }
  ]);

  const [user, setUser] = useState<UserProfile>({
    name: 'Alex Rivers',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    rank: 'Grandmaster Scholar',
    level: 42,
    xp: 8450,
    streak: 0,
    totalCards: 1240,
    globalRank: 154,
    lastActive: new Date(Date.now() - 86400000 * 2).toISOString()
  });

  const handleJumpToFocus = (topic: Topic) => {
    setActiveTopic(topic);
    setView('focus');
  };

  const handleFinishTopic = (xpGain: number) => {
    if (activeTopic) {
      // Update topic progress
      setSubjects(prev => prev.map(s => ({
        ...s,
        topics: s.topics.map(t => t.id === activeTopic.id ? { ...t, progress: 100, masteryLevel: Math.min(5, t.masteryLevel + 1) } : t)
      })));

      // Update user XP
      setUser(prev => {
        const now = new Date();
        const last = new Date(prev.lastActive);
        const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 3600 * 24));
        
        let newStreak = prev.streak;
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        } else if (prev.streak === 0) {
          newStreak = 1;
        }

        return {
          ...prev,
          xp: prev.xp + xpGain,
          level: Math.floor((prev.xp + xpGain) / 200) + 1,
          streak: newStreak,
          lastActive: now.toISOString()
        };
      });

      setActiveTopic(null);
      if (xpGain > 0) {
        setView('overview');
      }
    }
  };

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Memory Decay Alert',
      message: 'Quantum Physics: Schrödinger\'s Cat is nearing the forgetting threshold. Review now to maintain 90% retention.',
      time: '2h ago',
      type: 'reminder',
      isRead: false
    },
    {
      id: '2',
      title: 'New Achievement!',
      message: 'Focus Master: You completed 5 focus sessions in a row today.',
      time: '5h ago',
      type: 'achievement',
      isRead: true
    },
    {
      id: '3',
      title: 'System Update',
      message: 'MemorEase 2.0 is now live with advanced analytics and RPG journey mode.',
      time: '1d ago',
      type: 'system',
      isRead: true
    }
  ]);

  const [pomodoroSettings] = useState<PomodoroSettings>({
    workTime: 25,
    shortBreak: 5,
    longBreak: 15
  });

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-lumina-bg font-mono text-lumina-text selection:bg-lumina-accent/30">
      <CommandPalette isOpen={isCommandPaletteOpen} setIsOpen={setIsCommandPaletteOpen} setView={setView} />
      <Navbar currentView={view} setView={setView} unreadCount={unreadCount} />
      
      <main className="relative">
        <AnimatePresence mode="wait">
          {view === 'auth' && (
            <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AuthView onLogin={() => setView('overview')} />
            </motion.div>
          )}
          {view === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <OverviewView onJumpBack={handleJumpToFocus} user={user} subjects={subjects} />
            </motion.div>
          )}
          {view === 'focus' && (
            <motion.div key="focus" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FocusView settings={pomodoroSettings} streak={user.streak} activeTopic={activeTopic} onFinish={handleFinishTopic} />
            </motion.div>
          )}
          {view === 'vault' && (
            <motion.div key="vault" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <VaultView subjects={subjects} setSubjects={setSubjects} />
            </motion.div>
          )}
          {view === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProfileView user={user} setUser={setUser} subjects={subjects} />
            </motion.div>
          )}
          {view === 'notifications' && (
            <motion.div key="notifications" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <NotificationsView notifications={notifications} setNotifications={setNotifications} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-lumina-accent/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-lumina-secondary/5 blur-[120px] rounded-full"></div>
      </div>
    </div>
  );
}
