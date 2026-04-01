import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface AboutViewProps {
  key?: string;
}

export const AboutView = (_props: AboutViewProps) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="max-w-4xl mx-auto px-8 py-16"
  >
    <div className="mono-label text-lime mb-3">About NashikSkills Live</div>
    <h1 className="font-serif text-5xl font-black tracking-tighter mb-6 leading-[1.05]">
      Built for Nashik.<br /><em className="italic text-lime not-italic">By Nashik.</em>
    </h1>
    <div className="space-y-6 text-muted text-sm leading-relaxed max-w-2xl mb-12">
      <p>NashikSkills Live is a civic technology platform that makes Nashik's skill gap visible in real time. Built for IDS 6.0 — Young Indians' student innovation challenge — to address one specific, local, measurable problem: students don't know what industries need, and industries can't find skilled local hires.</p>
      <p>The insight driving this project: the problem isn't the absence of jobs or willing students. It's the absence of a signal. No platform existed that told a Nashik student, in real time, that the Auto & Manufacturing sector has an 87% ERP skills gap this month. NashikSkills Live is that signal.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
      {[
        { t: 'The problem we solve', d: 'Despite Nashik having 1,400+ industries, placement rates are low because students and industry speak different skill languages. We translate between them.', c: 'bg-lime' },
        { t: 'How we\'re different', d: 'Unlike national platforms, we are hyper-local. Our data is from Nashik\'s specific industries — vineyards, auto component plants, MIDC SMEs.', c: 'bg-teal' },
        { t: 'The vision', d: 'Every Tier-2 Indian city deserves its own live skill gap index. NashikSkills Live is the pilot. The model is replicable by any Yi chapter.', c: 'bg-amber' },
        { t: 'Built with', d: 'React, Tailwind, and Recharts. Powered by Firebase for real-time data and user profiles.', c: 'bg-purple' },
      ].map(card => (
        <div key={card.t} className="bg-s1 border border-b1 rounded-xl p-6">
          <div className="text-[13px] font-semibold mb-2 flex items-center gap-2">
            <div className={cn("w-1.5 h-1.5 rounded-full", card.c)} />
            {card.t}
          </div>
          <div className="text-[12px] text-muted leading-relaxed">{card.d}</div>
        </div>
      ))}
    </div>

    <div className="bg-s1 border border-b1 rounded-2xl p-8">
      <div className="mono-label text-muted mb-4">Built by</div>
      <div className="text-xl font-medium mb-1">Engineering student, Nashik</div>
      <div className="text-[12px] text-muted mb-4">IDS 6.0 participant — Young Indians, Yi Nashik Chapter & CII</div>
      <div className="flex flex-wrap gap-2">
        {['Engineering student', 'Nashik', 'IDS 6.0', 'Yi Nashik', 'CII'].map(tag => (
          <div key={tag} className="px-3 py-1 bg-s2 border border-b1 rounded-md text-[10px] text-muted font-medium">
            {tag}
          </div>
        ))}
      </div>
    </div>

    <div className="mt-20">
      <div className="mono-label text-lime mb-4">Project Roadmap</div>
      <div className="space-y-4">
        {[
          { status: 'Completed', t: 'Live Skill Gap Index', d: 'Real-time data intake from Nashik industries and student matching engine.' },
          { status: 'Completed', t: 'Skill Resources Marketplace', d: 'Curated learning paths mapped to the top 5 Nashik skill gaps.' },
          { status: 'In Progress', t: 'Employer Talent Search', d: 'Anonymized talent pool search for Nashik companies to find skilled students.' },
          { status: 'Planned', t: 'Yi Chapter Expansion', d: 'Replicating the Nashik model for other Yi chapters across India.' },
        ].map((item, i) => (
          <div key={i} className="flex gap-6 items-start group">
            <div className="flex flex-col items-center pt-1">
              <div className={cn("w-3 h-3 rounded-full border-2", item.status === 'Completed' ? "bg-lime border-lime" : item.status === 'In Progress' ? "bg-bg border-lime animate-pulse" : "bg-bg border-b2")} />
              {i < 3 && <div className="w-px h-12 bg-b1 mt-1" />}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="text-[14px] font-bold group-hover:text-lime transition-colors">{item.t}</div>
                <div className={cn("px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider", item.status === 'Completed' ? "bg-lime/10 text-lime" : item.status === 'In Progress' ? "bg-teal/10 text-teal" : "bg-s2 text-muted")}>
                  {item.status}
                </div>
              </div>
              <div className="text-[12px] text-muted leading-relaxed">{item.d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);
