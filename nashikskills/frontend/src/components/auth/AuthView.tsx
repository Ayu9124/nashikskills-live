import React, { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { UserRole } from '../../firebase';

interface AuthViewProps {
  onGoogleLogin: () => Promise<void>;
  onEmailLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string, role: UserRole) => Promise<void>;
}

export const AuthView = ({ onGoogleLogin, onEmailLogin, onRegister }: AuthViewProps) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await onEmailLogin(email, password);
      } else {
        await onRegister(email, password, role);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleClick = async () => {
    setError('');
    setSubmitting(true);
    try {
      await onGoogleLogin();
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="bg-s1 border border-b1 rounded-2xl p-6">
        <div className="flex gap-2 mb-6">
          <button
            className={`flex-1 py-2 rounded-lg text-sm ${mode === 'login' ? 'bg-lime text-bg font-bold' : 'bg-s2 text-muted'}`}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 rounded-lg text-sm ${mode === 'register' ? 'bg-lime text-bg font-bold' : 'bg-s2 text-muted'}`}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mono-label text-muted">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-s2 border border-b2 rounded-lg px-4 py-2.5 text-[13px] outline-none focus:border-lime"
            />
          </div>

          <div>
            <label className="mono-label text-muted">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-s2 border border-b2 rounded-lg px-4 py-2.5 text-[13px] outline-none focus:border-lime"
            />
          </div>

          {mode === 'register' ? (
            <div>
              <label className="mono-label text-muted">Select role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-s2 border border-b2 rounded-lg px-4 py-2.5 text-[13px] outline-none focus:border-lime"
              >
                <option value="student">Student</option>
                <option value="industry">Industry</option>
                <option value="academic">Academic Institute</option>
              </select>
            </div>
          ) : null}

          {error ? <div className="text-coral text-xs">{error}</div> : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-lime text-bg rounded-lg text-sm font-bold hover:opacity-85 transition-opacity disabled:opacity-60"
          >
            {mode === 'login' ? <span className="inline-flex items-center gap-2"><LogIn size={14} /> Login with email</span> : <span className="inline-flex items-center gap-2"><UserPlus size={14} /> Register</span>}
          </button>
        </form>

        <div className="my-4 h-px bg-b1" />

        <button
          onClick={handleGoogleClick}
          disabled={submitting}
          className="w-full py-2.5 bg-s2 border border-b2 rounded-lg text-sm font-medium hover:border-lime transition-all disabled:opacity-60"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
};
