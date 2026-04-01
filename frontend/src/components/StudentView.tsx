import React, { useState, useMemo, useEffect } from 'react';
import { motion } from "framer-motion";
import { ExternalLink, ArrowRight, Lock, TrendingUp, History } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { cn } from '../lib/utils';
import { SECTORS, SKILLS } from '../data';
import { SectorKey } from '../types';
import { 
  User, 
  db, 
  collection, 
  addDoc, 
  serverTimestamp, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  handleFirestoreError, 
  OperationType 
} from '../firebase';

interface StudentViewProps {
  user: User | null;
  profile: any;
  onLogin: () => void;
  key?: string;
}

export const StudentView = ({ user, profile, onLogin }: StudentViewProps) => {
  const [selectedSector, setSelectedSector] = useState<SectorKey>((profile?.targetSector as SectorKey) || 'auto');
  const skills = SKILLS[selectedSector];
  
  const matchPercentage = useMemo(() => {
    if (!profile?.mySkills || profile.mySkills.length === 0) return 0;
    
    const mySkills = profile.mySkills.map((s: string) => s.toLowerCase());
    
    const demandWeights: Record<string, number> = {
      critical: 10,
      high: 5,
      medium: 2,
      low: 1
    };

    let totalWeight = 0;
    let matchedWeight = 0;

    skills.forEach(sk => {
      const weight = demandWeights[sk.demand] || 1;
      totalWeight += weight;
      if (mySkills.includes(sk.name.toLowerCase())) {
        matchedWeight += weight;
      }
    });

    return Math.round((matchedWeight / totalWeight) * 100);
  }, [profile, skills]);

  const hasProfile = profile && profile.mySkills && profile.mySkills.length > 0;

  const topSkill = skills[0];

  const [logs, setLogs] = useState<any[]>([]);
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    if (!user) return;
    const path = `student_profiles/${user.uid}/skill_logs`;
    const q = query(collection(db, path), orderBy('timestamp', 'asc'), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().timestamp?.toDate().toLocaleDateString([], { month: 'short', day: 'numeric' }) || '...'
      }));
      setLogs(newLogs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return () => unsubscribe();
  }, [user]);

  const logProgress = async () => {
    if (!user) return;
    setLogging(true);
    const path = `student_profiles/${user.uid}/skill_logs`;
    try {
      await addDoc(collection(db, path), {
        uid: user.uid,
        matchPercentage,
        sector: selectedSector,
        skillsCount: profile?.mySkills?.length || 0,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setLogging(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-20"
    >
      <div className="px-8 py-12 border-b border-b1">
        <div className="mono-label text-teal mb-3">For students in Nashik</div>
        <h1 className="section-h2 text-4xl mb-3 leading-tight">
          See what Nashik<br /><em className="italic text-teal not-italic">actually needs</em> from you.
        </h1>
        <p className="text-muted text-sm max-w-lg leading-relaxed">
          Pick your target industry. We show you the live skill gap — and the fastest free path to close it.
        </p>
      </div>

      <div className="px-8 py-8 max-w-5xl">
        {!user ? (
          <div className="mb-8 p-6 bg-s1 border border-dashed border-b2 rounded-2xl text-center">
            <Lock className="mx-auto mb-3 text-muted" size={24} />
            <h3 className="text-sm font-medium mb-1">Login to track your progress</h3>
            <p className="text-xs text-muted mb-4">Save your skills and get a personalized match score.</p>
            <button 
              onClick={onLogin}
              className="px-6 py-2 bg-teal text-bg rounded-lg text-[12px] font-bold hover:opacity-85 transition-opacity"
            >
              Login with Google
            </button>
          </div>
        ) : !hasProfile ? (
          <div className="mb-8 p-6 bg-teal/5 border border-dashed border-teal/30 rounded-2xl text-center">
            <h3 className="text-sm font-medium mb-1 text-teal">Complete your profile</h3>
            <p className="text-xs text-muted mb-4">Tell us your skills to see your match percentage.</p>
            <div className="text-[10px] font-mono text-muted uppercase tracking-widest mb-4">
              Go to "Submit Data" → "I am a Student"
            </div>
          </div>
        ) : null}

        <div className="mono-label text-muted mb-4 flex items-center gap-3">
          Select your target sector
          <div className="flex-1 h-px bg-b1" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
          {SECTORS.map(s => (
            <button
              key={s.key}
              onClick={() => setSelectedSector(s.key)}
              className={cn(
                "p-4 rounded-xl border transition-all text-center",
                selectedSector === s.key 
                  ? "border-teal bg-teal/5" 
                  : "border-b2 bg-s1 hover:border-teal"
              )}
            >
              <div className="text-2xl mb-2">
                {s.key === 'auto' ? '⚙️' : s.key === 'agri' ? '🌿' : s.key === 'sme' ? '🏪' : '📦'}
              </div>
              <div className="text-[12px] font-medium">{s.name}</div>
              <div className="text-[10px] text-muted font-mono mt-1">{s.co} companies hiring</div>
            </button>
          ))}
        </div>

        <div className="bg-gradient-to-br from-teal/5 to-purple/5 border border-b2 rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-start mb-1">
            <div>
              <div className="text-[13px] font-medium">Your skill match for {SECTORS.find(s => s.key === selectedSector)?.name}</div>
              <div className="text-[12px] text-muted">Weighted scoring based on real-time industry demand</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-serif font-black text-teal leading-none">{matchPercentage}%</div>
              <div className="text-[9px] font-mono text-muted uppercase tracking-wider">Match Score</div>
            </div>
          </div>
          <div className="h-2 bg-s3 rounded-full overflow-hidden mb-2 mt-4">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${matchPercentage}%` }}
              className="h-full rounded-full bg-gradient-to-r from-teal to-purple" 
            />
          </div>
          <div className="flex justify-between font-mono text-[9px] text-muted">
            <span>0% (No critical skills)</span>
            <span>Critical skills carry 5x more weight than medium skills</span>
            <span>100% (All gaps closed)</span>
          </div>
          
          {user && hasProfile && (
            <div className="mt-6 pt-6 border-t border-b1 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] text-muted">
                <TrendingUp size={14} className="text-teal" />
                <span>Log your current progress to track improvement</span>
              </div>
              <button 
                onClick={logProgress}
                disabled={logging}
                className="px-4 py-1.5 bg-bg border border-b2 rounded-lg text-[11px] font-bold hover:border-teal transition-all disabled:opacity-50"
              >
                {logging ? 'Logging...' : 'Log Progress Snapshot'}
              </button>
            </div>
          )}
        </div>

        {user && logs.length > 1 && (
          <div className="bg-s1 border border-b2 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-6">
              <History size={16} className="text-purple" />
              <div className="mono-label text-muted">Skill Progression Over Time</div>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={logs}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    fontSize={10} 
                    tick={{ fill: '#8E9299' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    fontSize={10} 
                    tick={{ fill: '#8E9299' }} 
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#151619', border: '1px solid #2A2C32', borderRadius: '8px', fontSize: '11px' }}
                    itemStyle={{ color: '#00FF00' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="matchPercentage" 
                    stroke="#00FF00" 
                    strokeWidth={2} 
                    dot={{ fill: '#00FF00', r: 4 }}
                    activeDot={{ r: 6, stroke: '#151619', strokeWidth: 2 }}
                    name="Match %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="bg-s1 border border-b2 rounded-2xl p-6 mb-6">
          <div className="mono-label text-muted mb-3">Most wanted skill in your sector right now</div>
          <div className="flex flex-wrap items-baseline gap-3 mb-4">
            <div className="font-serif text-3xl font-black text-teal tracking-tight">{topSkill.name}</div>
            <div className="font-mono text-[12px] text-muted">{topSkill.gap}% gap — critical shortage in Nashik</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {[
              { tag: 'Free course', title: 'Coursera / NPTEL', meta: '4–6 hrs · free', link: topSkill.link },
              { tag: 'Government', title: 'Skill India Portal', meta: 'Certification · free', link: 'https://www.skillindiadigital.gov.in/' },
              { tag: 'YouTube', title: 'Hindi tutorials', meta: 'Self-paced · free', link: `https://www.youtube.com/results?search_query=${encodeURIComponent(topSkill.name + ' tutorial hindi')}` },
            ].map((res, i) => (
              <a 
                key={i} 
                href={res.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 border border-b1 rounded-lg bg-bg hover:border-teal transition-all group"
              >
                <div className="text-[9px] font-mono text-muted uppercase tracking-wider mb-1 group-hover:text-teal transition-colors">{res.tag}</div>
                <div className="text-[12px] font-medium mb-1 flex items-center justify-between">
                  {res.title}
                  <ExternalLink size={10} className="text-muted group-hover:text-teal" />
                </div>
                <div className="text-[11px] text-teal">{res.meta}</div>
              </a>
            ))}
          </div>
        </div>

        <div className="mono-label text-muted mb-4 flex items-center gap-3">
          All skill demands — your sector
          <div className="flex-1 h-px bg-b1" />
        </div>
        <div className="hidden md:grid grid-cols-[1fr_100px_80px_60px_90px] gap-3 px-4 py-2 font-mono text-[9px] text-muted uppercase tracking-widest border-b border-b1 mb-1">
          <span>Skill</span>
          <span>Demand level</span>
          <span className="text-right">Gap score</span>
          <span className="text-right">Match</span>
          <span className="text-right">Learn free</span>
        </div>
        <div className="space-y-1">
          {skills.map((sk, i) => {
            const isMatched = profile?.mySkills?.some((s: string) => s.toLowerCase() === sk.name.toLowerCase());
            return (
              <div key={i} className={cn(
                "grid grid-cols-1 md:grid-cols-[1fr_100px_80px_60px_90px] gap-3 items-center p-4 border rounded-xl transition-all",
                isMatched ? "bg-teal/5 border-teal/20" : "border-transparent hover:bg-s1 hover:border-b1"
              )}>
                <div>
                  <div className="text-[13px] font-medium">{sk.name}</div>
                  <div className="text-[10px] text-muted mt-0.5">{sk.sub}</div>
                </div>
                <div className="flex md:block">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-mono font-medium",
                    sk.demand === 'critical' ? "bg-coral/10 text-coral" : sk.demand === 'high' ? "bg-amber/10 text-amber" : "bg-teal/10 text-teal"
                  )}>
                    {sk.demand}
                  </span>
                </div>
                <div className="font-mono text-[12px] font-medium text-right" style={{ color: sk.color }}>{sk.gap}%</div>
                <div className="text-right">
                  {isMatched ? (
                    <span className="text-teal text-[10px] font-bold">✓</span>
                  ) : (
                    <span className="text-muted text-[10px] opacity-30">—</span>
                  )}
                </div>
                <a 
                  href={sk.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-teal text-[11px] font-mono text-right hover:underline flex items-center justify-end gap-1"
                >
                  learn free <ArrowRight size={10} />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
