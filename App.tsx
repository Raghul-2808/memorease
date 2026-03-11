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
  Cell
} from 'recharts';

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
    <nav className="fixed top-0 left-0 right-0 h-20 glass-lumina z-50 flex items-center justify-between px-10">
      <div className="flex items-center gap-12">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('overview')}>
          <div className="relative w-8 h-8 flex items-center justify-center">
            <Brain size={28} className="text-lumina-text" strokeWidth={1.5} />
          </div>
          <span className="text-lumina-text font-serif font-bold text-2xl tracking-tight">MemorEase</span>
        </div>
        
        <div className="hidden md:flex items-center gap-2">
          <NavLink active={currentView === 'overview'} onClick={() => setView('overview')} icon={<LayoutDashboard size={20} />} label="Journey" />
          <NavLink active={currentView === 'focus'} onClick={() => setView('focus')} icon={<Timer size={20} />} label="Focus" />
          <NavLink active={currentView === 'vault'} onClick={() => setView('vault')} icon={<Database size={20} />} label="Vault" />
          <NavLink active={currentView === 'profile'} onClick={() => setView('profile')} icon={<User size={20} />} label="Profile" />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={() => setView('notifications')}
          className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            currentView === 'notifications' ? 'bg-lumina-text text-white' : 'text-lumina-text/40 hover:bg-lumina-text/5'
          }`}
        >
          <Zap size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-lumina-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              {unreadCount}
            </span>
          )}
        </button>
        <div className="flex items-center gap-2 text-lumina-text/60 font-medium text-sm border-l border-lumina-text/10 pl-6">
          <Clock size={16} />
          <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
        </div>
        <button 
          onClick={() => setView('auth')}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lumina-text/40 hover:text-lumina-secondary hover:bg-lumina-secondary/10 transition-all"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
};

const NavLink = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-300 ${
      active 
        ? 'text-white bg-lumina-text shadow-md' 
        : 'text-lumina-text/50 hover:text-lumina-text hover:bg-lumina-text/5'
    }`}
  >
    {icon}
    <span className="text-sm font-semibold">{label}</span>
  </button>
);

// --- Views ---

const AuthView = ({ onLogin }: { onLogin: () => void }) => {
  const [mode, setMode] = useState<'landing' | 'login' | 'signup' | 'forgot'>('landing');
  const [showInfoModal, setShowInfoModal] = useState<'about' | 'contact' | null>(null);

  return (
    <div className="min-h-screen bg-lumina-bg relative overflow-hidden flex flex-col">
      {/* Top Navigation for Landing Page */}
      <nav className="relative z-20 flex items-center justify-between px-12 py-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <Brain size={28} className="text-lumina-text" strokeWidth={1.5} />
            </div>
            <span className="text-lumina-text font-serif font-bold text-2xl tracking-tight">MemorEase</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => setShowInfoModal('about')}
            className="text-sm font-bold text-lumina-text/60 hover:text-lumina-text transition-colors flex items-center gap-2"
          >
            <Info size={16} />
            About
          </button>
          <button 
            onClick={() => setShowInfoModal('contact')}
            className="text-sm font-bold text-lumina-text/60 hover:text-lumina-text transition-colors flex items-center gap-2"
          >
            <MessageCircle size={16} />
            Contact
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center relative z-10 -mt-20">
        <div className="absolute top-1/4 left-10 opacity-10 animate-pulse hidden lg:block">
          <Target size={120} className="text-lumina-accent" />
        </div>
        <div className="absolute bottom-1/4 right-10 opacity-10 animate-bounce hidden lg:block">
          <Rocket size={100} className="text-lumina-secondary" />
        </div>
        <div className="absolute top-1/3 right-20 opacity-10 animate-pulse hidden lg:block">
          <ShieldCheck size={80} className="text-lumina-text" />
        </div>
        <div className="absolute top-1/2 left-20 opacity-5 hidden lg:block">
          <Brain size={150} className="text-lumina-accent" />
        </div>
        <div className="absolute bottom-1/3 left-1/4 opacity-5 hidden lg:block">
          <Zap size={100} className="text-lumina-secondary" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-5xl"
        >
          <div className="flex justify-center mb-6">
            <div className="glass-lumina px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold text-lumina-accent uppercase tracking-widest">
              <Zap size={14} />
              The Future of Productivity
            </div>
          </div>
          <h1 className="text-6xl lg:text-8xl font-serif font-bold text-lumina-text leading-[1.05] tracking-tight mb-8">
            Master your mind, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lumina-accent to-lumina-secondary italic">effortlessly.</span>
          </h1>
          <div className="space-y-6 mb-12">
            <p className="text-xl lg:text-2xl text-lumina-text/60 max-w-3xl mx-auto leading-relaxed">
              Transform your notes into an immersive RPG experience. Use AI-powered spaced repetition to build a second brain that never forgets.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-12">
              {[
                { title: 'Smart Spacing', desc: 'AI repetition cycles', icon: <Clock className="text-lumina-accent" /> },
                { title: 'Deep Focus', icon: <Timer className="text-lumina-secondary" />, desc: 'Distraction-free zones' },
                { title: 'RPG Mastery', icon: <Award className="text-lumina-text" />, desc: 'Level up as you learn' },
                { title: 'Vault Storage', icon: <Database className="text-lumina-accent" />, desc: 'Secure your knowledge' }
              ].map((f, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -10 }}
                  className="glass-lumina p-8 rounded-[2.5rem] text-left border border-white/10 hover:border-lumina-accent/30 transition-all shadow-lg"
                >
                  <div className="w-12 h-12 rounded-2xl bg-lumina-bg flex items-center justify-center mb-6 shadow-inner">
                    {f.icon}
                  </div>
                  <div className="font-bold text-lumina-text text-lg mb-2">{f.title}</div>
                  <div className="text-sm text-lumina-text/40 leading-snug">{f.desc}</div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-8">
              <button 
                onClick={() => setMode('login')}
                className="px-10 py-4 bg-lumina-text text-white rounded-full font-bold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
              >
                Login
              </button>
              <button 
                onClick={() => setMode('signup')}
                className="px-10 py-4 glass-lumina rounded-full font-bold text-lg hover:bg-white transition-all"
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
            className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-lumina-text/20 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg glass-lumina p-12 rounded-[3rem] relative"
            >
              <button 
                onClick={() => setShowInfoModal(null)}
                className="absolute top-8 right-8 text-lumina-text/30 hover:text-lumina-text transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              
              {showInfoModal === 'about' ? (
                <div>
                  <h2 className="text-4xl font-serif font-bold text-lumina-text mb-4">About MemorEase</h2>
                  <p className="text-lumina-text/60 leading-relaxed mb-6">
                    MemorEase was born from the idea that learning shouldn't be a chore. By combining the principles of spaced repetition with the engaging mechanics of RPGs, we've created a sanctuary for deep work and long-term retention.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-lumina-accent/10 flex items-center justify-center text-lumina-accent">
                        <Star size={16} />
                      </div>
                      <span className="text-sm font-bold text-lumina-text">Founded in 2024</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-lumina-secondary/10 flex items-center justify-center text-lumina-secondary">
                        <User size={16} />
                      </div>
                      <span className="text-sm font-bold text-lumina-text">Used by 50,000+ Students</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-4xl font-serif font-bold text-lumina-text mb-4">Get in Touch</h2>
                  <p className="text-lumina-text/60 leading-relaxed mb-8">
                    Have questions or feedback? We'd love to hear from you. Our team is dedicated to making MemorEase the best study companion for you.
                  </p>
                  <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowInfoModal(null); }}>
                    <input type="text" placeholder="Your Name" className="input-lumina w-full" required />
                    <input type="email" placeholder="Email Address" className="input-lumina w-full" required />
                    <textarea placeholder="Your Message" className="input-lumina w-full h-32 resize-none" required />
                    <button type="submit" className="btn-primary w-full py-4 font-bold">Send Message</button>
                  </form>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Organic Wave Background (Landscape Style) */}
      <div className="absolute bottom-0 left-0 w-full h-[60%] z-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-lumina-accent/10 to-transparent"></div>
        <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="none">
          <motion.path 
            animate={{ 
              d: [
                "M0,600 C480,400 960,800 1440,600 L1440,800 L0,800 Z",
                "M0,600 C480,800 960,400 1440,600 L1440,800 L0,800 Z",
                "M0,600 C480,400 960,800 1440,600 L1440,800 L0,800 Z"
              ]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            fill="url(#wave-gradient)" 
            opacity="0.6"
          />
          <defs>
            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#ec4899" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.4" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Auth Modals (Overlay) */}
      <AnimatePresence>
        {mode !== 'landing' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-lumina-text/20 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg glass-lumina p-12 rounded-[3rem] relative"
            >
              <button 
                onClick={() => setMode('landing')}
                className="absolute top-8 right-8 text-lumina-text/30 hover:text-lumina-text transition-colors"
              >
                <ArrowLeft size={20} />
              </button>

              {mode === 'login' && (
                <motion.div key="login">
                  <h2 className="text-4xl font-serif font-bold text-lumina-text mb-2">Welcome Back</h2>
                  <p className="text-lumina-text/50 mb-10">Continue your journey of mastery.</p>
                  <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
                    <div className="relative"><input type="email" placeholder="Email Address" className="input-lumina" required /></div>
                    <div className="relative"><input type="password" placeholder="Password" className="input-lumina" required /></div>
                    <div className="flex justify-end">
                      <button type="button" onClick={() => setMode('forgot')} className="text-sm font-bold text-lumina-accent hover:underline">Forgot Password?</button>
                    </div>
                    <button type="submit" className="btn-primary w-full py-4 text-lg mt-4">Login</button>
                  </form>
                </motion.div>
              )}

              {mode === 'signup' && (
                <motion.div key="signup">
                  <h2 className="text-4xl font-serif font-bold text-lumina-text mb-2">Join the Journey</h2>
                  <p className="text-lumina-text/50 mb-10">Start your path to effortless mastery.</p>
                  <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
                    <div className="relative"><input type="text" placeholder="Full Name" className="input-lumina" required /></div>
                    <div className="relative"><input type="email" placeholder="Email Address" className="input-lumina" required /></div>
                    <div className="relative"><input type="password" placeholder="Create Password" className="input-lumina" required /></div>
                    <button type="submit" className="btn-primary w-full py-4 text-lg mt-4">Create Account</button>
                  </form>
                </motion.div>
              )}

              {mode === 'forgot' && (
                <motion.div key="forgot">
                  <h2 className="text-4xl font-serif font-bold text-lumina-text mb-2">Reset Password</h2>
                  <p className="text-lumina-text/50 mb-10">Enter your email to receive a recovery link.</p>
                  <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setMode('login'); }}>
                    <div className="relative"><input type="email" placeholder="Email Address" className="input-lumina" required /></div>
                    <button type="submit" className="btn-primary w-full py-4 text-lg">Send Reset Link</button>
                    <button type="button" onClick={() => setMode('login')} className="w-full text-sm font-bold text-lumina-text/40 hover:text-lumina-text transition-colors">Back to Login</button>
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
    <div className="pt-32 px-12 pb-20 min-h-screen relative">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-6xl font-serif font-bold text-lumina-text mb-4">Your Journey</h1>
            <p className="text-xl text-lumina-text/50">Progress through checkpoints to unlock new artifacts.</p>
          </div>
          <div className="flex items-center gap-6">
            {/* Duolingo-style Streak */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="glass-lumina px-6 py-4 rounded-2xl flex items-center gap-4 border-2 border-lumina-accent shadow-lg relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-lumina-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <Flame size={40} className="text-lumina-accent animate-bounce" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-lumina-accent rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              </div>
              <div className="relative">
                <div className="text-[10px] font-black text-lumina-accent uppercase tracking-[0.2em]">Active Streak</div>
                <div className="text-3xl font-black text-lumina-text leading-tight">{user.streak} Days</div>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5, 6, 7].map(d => (
                    <div key={d} className={`w-1.5 h-1.5 rounded-full ${d <= (user.streak % 7 || 7) ? 'bg-lumina-accent' : 'bg-lumina-text/10'}`} />
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="glass-lumina px-8 py-4 rounded-2xl flex items-center gap-4 border border-lumina-text/5">
              <div className="text-right">
                <div className="text-xs font-bold text-lumina-text/40 uppercase tracking-widest">Current Rank</div>
                <div className="text-xl font-bold text-lumina-text">{user.rank}</div>
              </div>
              <div className="w-12 h-12 bg-lumina-accent rounded-xl flex items-center justify-center text-white shadow-lg">
                <Award size={24} />
              </div>
            </div>
          </div>
        </header>

        {/* Jump Back In (Checkpoint Preview) */}
        {currentTopic && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 relative group cursor-pointer"
            onClick={() => onJumpBack(currentTopic)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-lumina-accent/20 to-lumina-secondary/20 blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <div className="relative glass-lumina rounded-[3rem] overflow-hidden flex flex-col md:flex-row">
              <div className="md:w-1/2 h-64 md:h-auto relative overflow-hidden">
                <img 
                  src={currentTopic.imageUrl} 
                  alt={currentTopic.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-lumina-text/80 to-transparent"></div>
                <div className="absolute inset-0 flex flex-col justify-center p-12">
                  <span className="text-lumina-accent font-bold uppercase tracking-[0.3em] text-xs mb-2">Jump Back In</span>
                  <h2 className="text-4xl font-serif font-bold text-white mb-4">{currentTopic.name}</h2>
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-48 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-lumina-accent" style={{ width: `${currentTopic.progress}%` }}></div>
                    </div>
                    <span className="text-white/60 text-sm font-bold">{currentTopic.progress}% Complete</span>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2 p-12 flex flex-col justify-center">
                <p className="text-lumina-text/60 text-lg mb-8 leading-relaxed">
                  {currentTopic.description}
                </p>
                <button className="btn-primary self-start flex items-center gap-3">
                  <Play size={18} fill="currentColor" />
                  Continue Checkpoint
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Topic Path */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {allTopics.map((topic, i) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative glass-lumina p-8 rounded-[2.5rem] border-2 transition-all ${
                topic.progress > 0 && topic.progress < 100 ? 'border-lumina-accent shadow-xl scale-105 z-10' : 
                topic.progress === 100 ? 'border-green-500/30' : 'border-lumina-border opacity-50'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  topic.progress === 100 ? 'bg-green-500/10 text-green-500' :
                  topic.progress > 0 ? 'bg-lumina-accent/10 text-lumina-accent' : 'bg-lumina-bg text-lumina-text/20'
                }`}>
                  {topic.progress === 100 ? <Award size={24} /> : <Zap size={24} />}
                </div>
                <span className="text-xs font-bold text-lumina-text/30 uppercase tracking-widest">LVL {topic.masteryLevel}</span>
              </div>
              <h3 className="text-xl font-bold text-lumina-text mb-2">{topic.name}</h3>
              <p className="text-sm text-lumina-text/50 mb-6 line-clamp-2">{topic.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-lumina-accent">+{topic.chapters * 100} XP</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-lumina-text/40">{topic.progress}%</span>
                  <div className="w-12 h-1 bg-lumina-bg rounded-full overflow-hidden">
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

  const handleFinish = () => {
    setShowFinishModal(true);
    setIsActive(false);
  };

  const confirmFinish = () => {
    onFinish(500); // Award 500 XP
    setShowFinishModal(false);
  };

  return (
    <div className="pt-32 px-12 pb-20 min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ 
            scale: isActive ? [1, 1.2, 1] : 1,
            opacity: isActive ? [0.1, 0.2, 0.1] : 0.05
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-lumina-accent rounded-full blur-[120px]"
        />
      </div>

      <div className="relative z-10 text-center max-w-4xl w-full">
        {activeTopic && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="text-xs font-bold text-lumina-accent uppercase tracking-[0.2em] mb-2">Currently Studying</div>
            <h2 className="text-4xl font-serif font-bold text-lumina-text">{activeTopic.name}</h2>
          </motion.div>
        )}

        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="glass-lumina px-4 py-2 rounded-full flex items-center gap-2">
            <Flame size={16} className="text-lumina-accent" />
            <span className="text-sm font-bold text-lumina-text">{streak} Day Streak</span>
          </div>
          <div className="glass-lumina px-4 py-2 rounded-full flex items-center gap-2">
            <Volume2 size={16} className="text-lumina-text/40" />
            <span className="text-sm font-bold text-lumina-text">{selectedMusic}</span>
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-12">
          {[
            { id: 'work', label: 'Focus' },
            { id: 'short', label: 'Short Break' },
            { id: 'long', label: 'Long Break' }
          ].map(m => (
            <button 
              key={m.id}
              onClick={() => switchMode(m.id as any)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                mode === m.id ? 'bg-lumina-text text-white' : 'text-lumina-text/40 hover:bg-lumina-text/5'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        
        <div className="relative flex items-center justify-center mb-16">
          {/* Breathing Circle */}
          <motion.div 
            animate={{ 
              scale: isActive ? (phase === 'inhale' ? 1.4 : phase === 'hold' ? 1.4 : 1) : 1,
              opacity: isActive ? 0.3 : 0.1
            }}
            transition={{ duration: 4, ease: "easeInOut" }}
            className="absolute w-96 h-96 rounded-full border-4 border-lumina-accent"
          />
          <motion.div 
            animate={{ 
              scale: isActive ? (phase === 'inhale' ? 1.2 : phase === 'hold' ? 1.2 : 1) : 1,
              opacity: isActive ? 0.5 : 0.2
            }}
            transition={{ duration: 4, ease: "easeInOut" }}
            className="absolute w-80 h-80 rounded-full border-2 border-lumina-secondary"
          />

          <div className="relative">
            <div className="text-[14rem] font-serif font-bold text-lumina-text leading-none tracking-tighter select-none">
              {formatTime(timeLeft)}
            </div>
            {isActive && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-serif italic text-lumina-accent mt-4"
              >
                {phase === 'inhale' ? 'Breathe In...' : phase === 'hold' ? 'Hold...' : 'Breathe Out...'}
              </motion.div>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-8 mb-20">
          <button 
            onClick={() => setIsActive(!isActive)}
            className="w-24 h-24 rounded-full bg-lumina-text text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
          >
            {isActive ? <Pause size={40} /> : <Play size={40} className="ml-2" />}
          </button>
          <button 
            onClick={() => { setIsActive(false); switchMode(mode); }}
            className="w-24 h-24 rounded-full glass-lumina text-lumina-text/40 flex items-center justify-center hover:text-lumina-text transition-all"
          >
            <RotateCcw size={40} />
          </button>
          {activeTopic && (
            <button 
              onClick={handleFinish}
              className="w-24 h-24 rounded-full bg-lumina-accent text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
            >
              <CheckCheck size={40} />
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
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-lumina-text/20 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-md glass-lumina p-12 rounded-[3rem] text-center"
              >
                <div className="w-20 h-20 bg-lumina-accent rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-xl">
                  <Award size={40} />
                </div>
                <h3 className="text-4xl font-serif font-bold text-lumina-text mb-4">Topic Mastered!</h3>
                <p className="text-lumina-text/50 mb-10">You've completed your focus session for <span className="text-lumina-text font-bold">{activeTopic?.name}</span>.</p>
                
                <div className="bg-lumina-bg p-6 rounded-2xl mb-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap size={24} className="text-lumina-accent" />
                    <span className="font-bold text-lumina-text">XP Gained</span>
                  </div>
                  <span className="text-2xl font-bold text-lumina-accent">+500</span>
                </div>

                <button 
                  onClick={confirmFinish}
                  className="btn-primary w-full py-4 text-lg"
                >
                  Claim Rewards
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {[
            { name: 'Rainfall', icon: '🌧️' },
            { name: 'Lo-Fi Beats', icon: '🎧' },
            { name: 'Forest Birds', icon: '🐦' }
          ].map((music) => (
            <button 
              key={music.name} 
              onClick={() => setSelectedMusic(music.name)}
              className={`glass-lumina p-8 rounded-[2.5rem] transition-all group text-left border-2 ${
                selectedMusic === music.name ? 'border-lumina-accent' : 'border-transparent hover:border-lumina-accent/30'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-lumina-bg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-2xl">
                {music.icon}
              </div>
              <div className="font-bold text-lumina-text">{music.name}</div>
              <div className="text-xs text-lumina-text/40 mt-1">Ambient Soundscape</div>
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

  const addSubject = () => {
    if (newSubjectName.trim() && subjects.length < 10) {
      const newId = Date.now().toString();
      setSubjects(prev => [...prev, { id: newId, name: newSubjectName.trim(), topics: [] }]);
      setNewSubjectName('');
      setActiveSubjectId(newId); // Automatically select the new subject
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
        
        // Add asset to active subject's first topic for demo
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
    <div className="pt-32 px-12 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 flex justify-between items-end">
          <div>
            <h1 className="text-6xl font-serif font-bold text-lumina-text mb-4">The Vault</h1>
            <p className="text-xl text-lumina-text/50">Preview and manage your intellectual assets. Max 10 subjects.</p>
          </div>
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="New Subject Name..." 
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              className="input-lumina w-64"
            />
            <button 
              onClick={addSubject}
              disabled={subjects.length >= 10}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <Plus size={20} /> Add Subject
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Subject List */}
          <div className="space-y-4">
            {subjects.map(subject => (
              <button
                key={subject.id}
                onClick={() => setActiveSubjectId(subject.id)}
                className={`w-full p-8 rounded-[2.5rem] border text-left transition-all flex items-center justify-between group ${
                  activeSubjectId === subject.id ? 'bg-lumina-text text-white shadow-xl' : 'glass-lumina hover:border-lumina-accent/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activeSubjectId === subject.id ? 'bg-white/10' : 'bg-lumina-bg'}`}>
                    <BookOpen size={24} className={activeSubjectId === subject.id ? 'text-white' : 'text-lumina-accent'} />
                  </div>
                  <div>
                    <div className="font-bold">{subject.name}</div>
                    <div className={`text-xs ${activeSubjectId === subject.id ? 'text-white/60' : 'text-lumina-text/40'}`}>{subject.topics.length} Topics</div>
                  </div>
                </div>
                <ChevronRight size={20} className={activeSubjectId === subject.id ? 'text-white/40' : 'text-lumina-text/20'} />
              </button>
            ))}
          </div>

          {/* Topic Management & Preview */}
          <div className="lg:col-span-2">
            {activeSubjectId ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-lumina p-12 rounded-[4rem] min-h-[500px] relative"
              >
                <div className="flex justify-between items-center mb-12">
                  <h2 className="text-4xl font-serif font-bold text-lumina-text">
                    {subjects.find(s => s.id === activeSubjectId)?.name}
                  </h2>
                  <div className="flex gap-4">
                    <div className="relative group">
                      <button 
                        onClick={() => setShowUploadModal(true)}
                        className="w-12 h-12 rounded-2xl glass-lumina flex items-center justify-center text-lumina-text/40 hover:text-lumina-accent transition-all"
                      >
                        <Upload size={20} />
                      </button>
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 glass-lumina px-3 py-1 rounded-lg text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        Upload PDF/Notes
                      </div>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Add topic..." 
                      value={newTopicName}
                      onChange={(e) => setNewTopicName(e.target.value)}
                      className="input-lumina w-64"
                    />
                    <button onClick={() => addTopic(activeSubjectId)} className="btn-primary py-2 px-6">Add</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {subjects.find(s => s.id === activeSubjectId)?.topics.map((topic) => (
                    <div 
                      key={topic.id} 
                      className="p-6 bg-lumina-bg rounded-3xl border border-lumina-border flex items-center justify-between group hover:border-lumina-accent/30 transition-all cursor-pointer"
                      onClick={() => setPreviewTopic(topic)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-lumina-accent"></div>
                        <span className="font-semibold text-lumina-text">{topic.name}</span>
                      </div>
                      <button className="text-lumina-text/20 group-hover:text-lumina-accent transition-colors">
                        <TrendingUp size={18} />
                      </button>
                    </div>
                  ))}
                  {subjects.find(s => s.id === activeSubjectId)?.topics.length === 0 && (
                    <div className="col-span-2 flex flex-col items-center justify-center py-20 text-lumina-text/30">
                      <Database size={48} className="mb-4 opacity-20" />
                      <p>No topics added yet. Start by adding a key concept.</p>
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
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-lumina-text/20 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-md glass-lumina p-10 rounded-[3rem] relative"
              >
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="absolute top-8 right-8 text-lumina-text/30 hover:text-lumina-text transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <h3 className="text-3xl font-serif font-bold text-lumina-text mb-2">Upload Assets</h3>
                <p className="text-lumina-text/50 mb-8 text-sm">Add PDFs, notes, or text files to your vault.</p>

                {isUploading ? (
                  <div className="space-y-6 py-8">
                    <div className="flex justify-between text-sm font-bold text-lumina-text/40 mb-2 uppercase tracking-widest">
                      <span>Processing {uploadType}...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-3 w-full bg-lumina-bg rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        className="h-full bg-lumina-accent"
                      />
                    </div>
                    <p className="text-center text-xs text-lumina-text/40 italic">AI is extracting key concepts from your {uploadType?.toLowerCase()}...</p>
                  </div>
                ) : uploadType === 'Text' ? (
                  <div className="space-y-6">
                    <textarea 
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Paste your notes or text here..."
                      className="input-lumina w-full h-48 resize-none p-6 text-sm"
                    />
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setUploadType(null)}
                        className="flex-1 py-4 glass-lumina rounded-2xl font-bold text-lumina-text/40 hover:text-lumina-text transition-all"
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
                        className="flex-2 py-4 btn-primary rounded-2xl font-bold"
                      >
                        Analyze Text
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    <button 
                      onClick={() => { setUploadType('PDF'); simulateUpload('Lecture_Notes.pdf', 'PDF'); }}
                      className="p-6 rounded-2xl border border-lumina-border hover:border-lumina-accent transition-all flex items-center gap-4 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                        <FileText size={20} />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-lumina-text">Upload PDF</div>
                        <div className="text-xs text-lumina-text/40">Research papers, textbooks</div>
                      </div>
                    </button>
                    <button 
                      onClick={() => setUploadType('Text')}
                      className="p-6 rounded-2xl border border-lumina-border hover:border-lumina-accent transition-all flex items-center gap-4 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                        <Edit3 size={20} />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-lumina-text">Paste Text</div>
                        <div className="text-xs text-lumina-text/40">Quick notes, snippets</div>
                      </div>
                    </button>
                    <button 
                      onClick={() => { setUploadType('Notes'); simulateUpload('Handwritten_Notes.jpg', 'Notes'); }}
                      className="p-6 rounded-2xl border border-lumina-border hover:border-lumina-accent transition-all flex items-center gap-4 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                        <Camera size={20} />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-lumina-text">Upload Notes</div>
                        <div className="text-xs text-lumina-text/40">Photos of handwritten notes</div>
                      </div>
                    </button>
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
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute inset-0 z-20 glass-lumina rounded-[4rem] p-12 flex flex-col"
                    >
                      <button 
                        onClick={() => setPreviewTopic(null)}
                        className="absolute top-8 right-8 text-lumina-text/30 hover:text-lumina-text transition-colors"
                      >
                        <ArrowLeft size={24} />
                      </button>
                      <span className="text-lumina-accent font-bold uppercase tracking-[0.3em] text-xs mb-4">Topic Preview</span>
                      <h3 className="text-5xl font-serif font-bold text-lumina-text mb-8">{previewTopic.name}</h3>
                      <div className="flex-1 overflow-y-auto pr-4 space-y-6">
                        <div className="p-8 bg-lumina-bg rounded-3xl border border-lumina-border">
                          <h4 className="font-bold text-lumina-text mb-4 flex items-center gap-2">
                            <Zap size={18} className="text-lumina-accent" />
                            Key Insights
                          </h4>
                          <p className="text-lumina-text/60 leading-relaxed">
                            {previewTopic.description}
                            This topic has {previewTopic.chapters} chapters. Completing them will grant you {previewTopic.chapters * 100} XP.
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="p-6 glass-lumina rounded-2xl">
                            <div className="text-xs font-bold text-lumina-text/40 uppercase mb-2">Last Reviewed</div>
                            <div className="font-bold text-lumina-text">{previewTopic.lastReviewed}</div>
                          </div>
                          <div className="p-6 glass-lumina rounded-2xl">
                            <div className="text-xs font-bold text-lumina-text/40 uppercase mb-2">Next Checkpoint</div>
                            <div className="font-bold text-lumina-accent">{previewTopic.nextReview}</div>
                          </div>
                        </div>
                      </div>
                      <button className="btn-primary mt-8 w-full py-4">Start Deep Focus Session</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center glass-lumina rounded-[4rem] text-lumina-text/30">
                <LayoutDashboard size={64} className="mb-6 opacity-10" />
                <p className="text-xl">Select a subject to manage topics</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileView = ({ user, setUser }: { user: UserProfile, setUser: React.Dispatch<React.SetStateAction<UserProfile>> }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editAvatar, setEditAvatar] = useState(user.avatar);

  const saveProfile = () => {
    setUser({ ...user, name: editName, avatar: editAvatar });
    setIsEditing(false);
  };

  // Mock data for heatmap
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

  const focusData = [
    { name: 'Quantum', value: 400 },
    { name: 'History', value: 300 },
    { name: 'Logic', value: 200 },
    { name: 'Design', value: 100 },
  ];

  const COLORS = ['#f59e0b', '#ec4899', '#8b5cf6', '#10b981'];

  return (
    <div className="pt-32 px-12 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Profile Sidebar */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-lumina p-10 rounded-[3rem] text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-lumina-accent/20 to-lumina-secondary/20"></div>
              <div className="relative">
                <div className="relative inline-block mb-6">
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-32 h-32 rounded-[2rem] object-cover border-4 border-white shadow-2xl mx-auto"
                    referrerPolicy="no-referrer"
                  />
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 w-10 h-10 bg-lumina-text text-white rounded-xl flex items-center justify-center shadow-lg">
                      <Camera size={18} />
                    </button>
                  )}
                </div>
                
                {isEditing ? (
                  <div className="space-y-4 mb-6">
                    <input 
                      type="text" 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)}
                      className="input-lumina text-center font-bold text-xl"
                    />
                    <input 
                      type="text" 
                      value={editAvatar} 
                      onChange={(e) => setEditAvatar(e.target.value)}
                      placeholder="Avatar URL"
                      className="input-lumina text-center text-sm"
                    />
                    <div className="flex gap-2">
                      <button onClick={saveProfile} className="btn-primary flex-1 py-2">Save</button>
                      <button onClick={() => setIsEditing(false)} className="glass-lumina flex-1 py-2 text-sm font-bold">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-3xl font-serif font-bold text-lumina-text mb-2">{user.name}</h2>
                    <p className="text-lumina-accent font-bold uppercase tracking-widest text-xs mb-8">{user.rank}</p>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="text-xs font-bold text-lumina-text/30 hover:text-lumina-accent transition-colors flex items-center gap-2 mx-auto mb-8"
                    >
                      <Edit3 size={14} /> Edit Profile
                    </button>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-lumina-bg rounded-2xl">
                    <div className="text-[10px] font-bold text-lumina-text/40 uppercase mb-1">Level</div>
                    <div className="text-xl font-bold text-lumina-text">{user.level}</div>
                  </div>
                  <div className="p-4 bg-lumina-bg rounded-2xl">
                    <div className="text-[10px] font-bold text-lumina-text/40 uppercase mb-1">Streak</div>
                    <div className="text-xl font-bold text-lumina-accent">{user.streak}d</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="glass-lumina p-8 rounded-[2.5rem]">
              <h3 className="font-bold text-lumina-text mb-6 flex items-center gap-2">
                <TrendingUp size={18} className="text-lumina-accent" />
                Consistency Heatmap
              </h3>
              <div className="grid grid-cols-52 grid-rows-7 gap-1 h-32">
                {heatmapData.map((d) => (
                  <div 
                    key={d.date} 
                    className={`rounded-sm transition-colors ${
                      d.value === 0 ? 'bg-lumina-bg' :
                      d.value === 1 ? 'bg-lumina-accent/20' :
                      d.value === 2 ? 'bg-lumina-accent/40' :
                      d.value === 3 ? 'bg-lumina-accent/70' : 'bg-lumina-accent'
                    }`}
                    title={`Activity level: ${d.value}`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-4 text-[10px] font-bold text-lumina-text/30 uppercase tracking-widest">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-lumina-bg rounded-sm" />
                  <div className="w-2 h-2 bg-lumina-accent/20 rounded-sm" />
                  <div className="w-2 h-2 bg-lumina-accent/40 rounded-sm" />
                  <div className="w-2 h-2 bg-lumina-accent/70 rounded-sm" />
                  <div className="w-2 h-2 bg-lumina-accent rounded-sm" />
                </div>
                <span>More</span>
              </div>
            </div>
          </div>

          {/* Analytics Main */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-lumina p-10 rounded-[3rem]">
                <h3 className="text-2xl font-serif font-bold text-lumina-text mb-8">Retention Curve</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={retentionData}>
                      <defs>
                        <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" hide />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                        labelFormatter={(day) => `Day ${day}`}
                      />
                      <Area type="monotone" dataKey="retention" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorRetention)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-lumina-text/40 mt-4 leading-relaxed">
                  Your memory retention follows a standard decay curve. MemorEase schedules reviews at the optimal moments to keep you above 80%.
                </p>
              </div>

              <div className="glass-lumina p-10 rounded-[3rem]">
                <h3 className="text-2xl font-serif font-bold text-lumina-text mb-8">Focus Distribution</h3>
                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={focusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {focusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {focusData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-[10px] font-bold text-lumina-text/60 uppercase tracking-widest">{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-lumina p-10 rounded-[3rem]">
              <h3 className="text-2xl font-serif font-bold text-lumina-text mb-8">Mastery Milestones</h3>
              <div className="space-y-6">
                {[
                  { title: 'Novice Scholar', progress: 100, date: 'Mar 01' },
                  { title: 'Memory Architect', progress: 100, date: 'Mar 05' },
                  { title: 'Focus Master', progress: 45, date: 'In Progress' },
                  { title: 'Grandmaster', progress: 0, date: 'Locked' },
                ].map((m) => (
                  <div key={m.title} className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${m.progress === 100 ? 'bg-lumina-accent text-white' : 'bg-lumina-bg text-lumina-text/20'}`}>
                      <Award size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-2">
                        <span className="font-bold text-lumina-text">{m.title}</span>
                        <span className="text-xs text-lumina-text/40">{m.date}</span>
                      </div>
                      <div className="h-2 w-full bg-lumina-bg rounded-full overflow-hidden">
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
    <div className="pt-32 px-12 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-6xl font-serif font-bold text-lumina-text mb-4">Reminders</h1>
            <p className="text-xl text-lumina-text/50">Timely prompts to prevent memory decay.</p>
          </div>
          <button 
            onClick={markAllRead}
            className="text-sm font-bold text-lumina-accent hover:underline flex items-center gap-2"
          >
            <CheckCheck size={18} /> Mark all as read
          </button>
        </header>

        <div className="space-y-6">
          {notifications.length > 0 ? (
            notifications.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`glass-lumina p-8 rounded-[2.5rem] flex items-start gap-6 relative group transition-all ${!n.isRead ? 'border-lumina-accent shadow-lg' : ''}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  n.type === 'reminder' ? 'bg-lumina-accent/10 text-lumina-accent' :
                  n.type === 'achievement' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                }`}>
                  {n.type === 'reminder' ? <Clock size={28} /> : n.type === 'achievement' ? <Award size={28} /> : <Zap size={28} />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-lumina-text">{n.title}</h3>
                    <span className="text-xs font-bold text-lumina-text/30 uppercase tracking-widest">{n.time}</span>
                  </div>
                  <p className="text-lumina-text/60 leading-relaxed">{n.message}</p>
                </div>
                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => deleteNotification(n.id)}
                    className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                {!n.isRead && (
                  <div className="absolute top-4 left-4 w-3 h-3 bg-lumina-accent rounded-full border-2 border-white shadow-sm"></div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="py-32 text-center text-lumina-text/20">
              <Zap size={64} className="mx-auto mb-6 opacity-10" />
              <p className="text-xl">All caught up! Your memory is secure.</p>
            </div>
          )}
        </div>

        <div className="mt-16 p-10 glass-lumina rounded-[3rem] border-2 border-lumina-accent/20">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[2rem] bg-lumina-accent flex items-center justify-center text-white shadow-xl">
              <Brain size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-serif font-bold text-lumina-text mb-1">Memory Decay Alert</h3>
              <p className="text-lumina-text/60">Quantum Physics: Schrödinger's Cat is nearing the forgetting threshold. Review now to maintain 90% retention.</p>
            </div>
            <button className="btn-primary ml-auto whitespace-nowrap">Review Now</button>
          </div>
        </div>
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
  ]);

  const [user, setUser] = useState<UserProfile>({
    name: 'Alex Rivers',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    rank: 'Grandmaster Scholar',
    level: 42,
    xp: 8450,
    streak: 12,
    totalCards: 1240,
    globalRank: 154
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
      setUser(prev => ({
        ...prev,
        xp: prev.xp + xpGain,
        level: Math.floor((prev.xp + xpGain) / 200) + 1
      }));

      setActiveTopic(null);
      setView('overview');
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

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-lumina-bg font-sans text-lumina-text selection:bg-lumina-accent/30">
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
              <ProfileView user={user} setUser={setUser} />
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
