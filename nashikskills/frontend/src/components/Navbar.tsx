import React from 'react';
import { Home as HomeIcon, LayoutDashboard, GraduationCap, Send, Info, LogIn, LogOut, User as UserIcon, BookOpen, Moon, Sun } from 'lucide-react';
import { cn } from '../lib/utils';
import { User } from '../firebase';

interface NavbarProps {
  currentView: string;
  setView: (v: string) => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Navbar = ({ currentView, setView, user, onLogin, onLogout, isDarkMode, onToggleTheme }: NavbarProps) => (
  <nav className="fixed top-0 left-0 right-0 z-[200] h-[52px] flex items-center justify-between px-8 bg-bg/95 backdrop-blur-xl border-b border-b1">
    <div className="logo-serif text-[17px] cursor-pointer" onClick={() => setView('home')}>
      Nashik<span className="text-lime">Skills</span>
      <sub className="font-mono text-[10px] text-muted ml-1 align-middle tracking-widest font-normal">LIVE</sub>
    </div>
    
    <div className="hidden md:flex items-center gap-2 px-4 py-1 bg-lime/5 border border-lime/15 rounded-full">
      <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
      <span className="font-mono text-[10px] text-lime tracking-widest">LIVE — Updated now</span>
    </div>

    <div className="flex items-center gap-4">
      <div className="flex gap-1">
        {[
          { id: 'home', label: 'Home', icon: HomeIcon },
          { id: 'dashboard', label: 'City Dashboard', icon: LayoutDashboard },
          { id: 'student', label: 'For Students', icon: GraduationCap },
          { id: 'resources', label: 'Skill Resources', icon: BookOpen },
          { id: 'submit', label: 'Submit Data', icon: Send },
          { id: 'about', label: 'About', icon: Info },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={cn(
              "px-3 py-1.5 rounded-md text-[12px] transition-all flex items-center gap-1.5",
              currentView === item.id 
                ? "bg-lime text-bg font-medium" 
                : "text-muted hover:text-text hover:bg-s2"
            )}
          >
            <item.icon size={14} />
            <span className="hidden lg:inline">{item.label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onToggleTheme}
        className="p-2 rounded-md border border-b2 bg-s2 text-muted hover:text-text hover:border-lime transition-all"
        title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
      </button>

      <div className="h-6 w-px bg-b1 mx-2 hidden sm:block" />

      {user ? (
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <div className="text-[11px] font-medium leading-none">{user.displayName}</div>
            <div className="text-[9px] text-muted font-mono">Student</div>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 text-muted hover:text-coral transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      ) : (
        <button 
          onClick={onLogin}
          className="flex items-center gap-2 px-3 py-1.5 bg-s2 border border-b2 rounded-md text-[11px] hover:border-lime transition-all"
        >
          <LogIn size={14} />
          <span>Login</span>
        </button>
      )}
    </div>
  </nav>
);
