import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface HomeViewProps {
  setView: (v: string) => void;
  key?: string;
}

export const HomeView = ({ setView }: HomeViewProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="max-w-7xl mx-auto px-8 py-16"
  >
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-14 items-center mb-24">
      <div>
        <div className="mono-label text-lime mb-4 flex items-center gap-2">
          <div className="w-6 h-px bg-lime" />
          Nashik's first live skill intelligence platform
        </div>
        <h1 className="hero-h1 text-5xl md:text-6xl mb-6">
          Bridge the gap between<br />Nashik's <em className="italic text-lime not-italic">industries</em><br />and its students.
        </h1>
        <p className="text-muted text-base max-w-md mb-8 leading-relaxed">
          Real-time skill demand data from Nashik's factories, vineyards, SMEs, and logistics companies — showing every student exactly what to learn, updated live.
        </p>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setView('dashboard')}
            className="px-6 py-3 bg-lime text-bg rounded-lg text-[13px] font-semibold hover:opacity-85 transition-opacity flex items-center gap-2"
          >
            View Live Dashboard <ArrowRight size={16} />
          </button>
          <button 
            onClick={() => setView('student')}
            className="px-6 py-3 border border-b2 rounded-lg text-[13px] hover:bg-s2 transition-all"
          >
            Check My Skill Match
          </button>
          <button 
            onClick={() => setView('resources')}
            className="px-6 py-3 border border-b2 rounded-lg text-[13px] hover:bg-s2 transition-all text-teal"
          >
            Find Learning Resources
          </button>
        </div>

        <div className="flex flex-wrap gap-8 py-8 border-y border-b1 mt-12 overflow-hidden">
          {[
            { l: 'Live Industry Responses', v: '142' },
            { l: 'Students Matched', v: '1,204' },
            { l: 'Nashik Skill Gap Index', v: '74%' },
            { l: 'Active Resources', v: '48' },
          ].map(stat => (
            <div key={stat.l} className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted">{stat.l}</div>
              <div className="font-serif text-xl font-black">{stat.v}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-s1 border border-b1 rounded-2xl p-6">
        <div className="mono-label text-muted mb-4">Live skill gap — top 5 right now</div>
        <div className="space-y-3">
          {[
            { label: 'ERP basics', val: 87, color: 'bg-coral', text: 'text-coral' },
            { label: 'Excel / Sheets', val: 74, color: 'bg-amber', text: 'text-amber' },
            { label: 'Tally / GST', val: 71, color: 'bg-amber', text: 'text-amber' },
            { label: 'Digital tracking', val: 68, color: 'bg-teal', text: 'text-teal' },
            { label: 'CAD basics', val: 65, color: 'bg-purple', text: 'text-purple' },
          ].map((item) => (
            <div key={item.label} className="grid grid-cols-[130px_1fr_36px] gap-3 items-center">
              <span className="text-[11px]">{item.label}</span>
              <div className="h-1.5 bg-s3 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${item.val}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={cn("h-full rounded-full", item.color)} 
                />
              </div>
              <span className={cn("font-mono text-[10px] text-right", item.text)}>{item.val}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* How it works */}
    <div className="bg-s1 border-y border-b1 -mx-8 px-8 py-20 mb-20">
      <div className="max-w-5xl mx-auto">
        <div className="mono-label text-lime mb-3">How it works</div>
        <h2 className="section-h2 text-3xl mb-2">A two-sided marketplace for skills intelligence.</h2>
        <p className="text-muted text-sm mb-10">Industries tell us what they need. Students see exactly where the gap is. The city closes it.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { n: '01', t: 'Industries respond', d: 'Nashik manufacturers, vineyards, and SMEs fill a 2-min form listing their top digital skill shortages.' },
            { n: '02', t: 'Data goes live', d: 'Every response instantly updates the city dashboard — a public, real-time skill gap index.' },
            { n: '03', t: 'Students act', d: 'Students select their target sector and see exactly what skills are in shortage — with free resources.' },
            { n: '04', t: 'Gap closes', d: 'Skilled students reach industry partners. Companies hire locally. Nashik builds a talent pipeline.' },
          ].map((step, i) => (
            <div key={step.n} className="bg-s2 border border-b1 rounded-xl p-5 relative group">
              <div className="font-serif text-4xl font-black text-b2 leading-none mb-3 tracking-tighter group-hover:text-b3 transition-colors">{step.n}</div>
              <div className="text-[13px] font-semibold mb-2">{step.t}</div>
              <div className="text-[12px] text-muted leading-relaxed">{step.d}</div>
              {i < 3 && <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-b3 z-10">→</div>}
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Impact */}
    <div className="max-w-5xl mx-auto mb-20">
      <div className="mono-label text-lime mb-3">The problem scale</div>
      <h2 className="section-h2 text-3xl mb-8">Nashik's skill gap — by the numbers.</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 border border-b1 rounded-2xl overflow-hidden">
        {[
          { n: '1,400+', l: 'Registered industries in Nashik MIDC', c: 'text-coral', s: 'Source: MIDC Nashik' },
          { n: '6 in 10', l: 'Engineering graduates unable to find local placement', c: 'text-amber', s: 'Nashik college avg.' },
          { n: '₹340Cr', l: 'Estimated annual cost of unfilled skilled roles', c: 'text-teal', s: 'Productivity loss estimate' },
          { n: '0', l: 'Existing live, hyper-local skill demand dashboards', c: 'text-purple', s: 'Until now.' },
        ].map((stat) => (
          <div key={stat.n} className="p-7 bg-s1 border-r border-b1 last:border-r-0">
            <div className={cn("font-serif text-4xl font-black tracking-tighter leading-none mb-2", stat.c)}>{stat.n}</div>
            <div className="text-[12px] text-muted leading-relaxed mb-1">{stat.l}</div>
            <div className="font-mono text-[9px] text-b3">{stat.s}</div>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);
