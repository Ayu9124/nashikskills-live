import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { cn } from '../lib/utils';
import { SECTORS, TREND_DATA, ALL_SKILLS_LIST } from '../data';
import { Response as IndustryResponse } from '../types';

interface DashboardViewProps {
  responses: IndustryResponse[];
  counts: { ind: number; stu: number };
  key?: string;
}

export const DashboardView = ({ responses, counts }: DashboardViewProps) => {
  // Calculate some dynamic stats from responses
  const avgGap = responses.length > 0 
    ? Math.round(responses.reduce((acc, r) => acc + r.gap, 0) / responses.length) 
    : 74;

  const autoResponses = responses.filter(r => r.sec === 'Auto & Mfg');
  const autoGap = autoResponses.length > 0
    ? Math.round(autoResponses.reduce((acc, r) => acc + r.gap, 0) / autoResponses.length)
    : 87;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-20"
    >
      <div className="px-8 py-10 border-b border-b1 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <div className="mono-label text-lime mb-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
            Nashik Skill Gap Index — live
          </div>
          <h1 className="section-h2 text-4xl mb-2">City Dashboard</h1>
          <p className="text-muted text-sm max-w-md">Real data from Nashik industries and students. Every form response updates this page instantly.</p>
        </div>
        <div className="flex flex-col items-end gap-4">
          <button className="px-4 py-2 bg-s1 border border-b1 rounded-lg text-[11px] font-mono hover:border-lime transition-all flex items-center gap-2">
            Download Q1 Report
          </button>
          <div className="flex gap-8">
          {[
            { v: counts.ind, l: 'Industry responses' },
            { v: counts.stu, l: 'Student responses' },
            { v: 4, l: 'Sectors' },
            { v: ALL_SKILLS_LIST.length, l: 'Skills tracked' },
          ].map(item => (
            <div key={item.l} className="flex flex-col">
              <span className="font-mono text-xl font-medium">{item.v}</span>
              <span className="text-[11px] text-muted">{item.l}</span>
            </div>
          ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-b border-b1">
        {[
          { n: `${autoGap}%`, l: 'ERP gap — Auto & Mfg', c: 'text-coral', i: TrendingUp, it: 'Highest in city', ic: 'text-coral' },
          { n: `${avgGap}%`, l: 'Avg gap — all sectors', c: 'text-amber', i: TrendingUp, it: 'Cross-sector problem', ic: 'text-coral' },
          { n: (counts.ind / (counts.stu || 1)).toFixed(1) + '×', l: 'Demand vs supply ratio', c: 'text-teal', i: TrendingDown, it: 'Improving slowly', ic: 'text-teal' },
          { n: '61%', l: 'Students unaware of local jobs', c: 'text-purple', i: TrendingUp, it: 'Awareness gap', ic: 'text-coral' },
        ].map(stat => (
          <div key={stat.l} className="p-6 border-r border-b1 last:border-r-0 hover:bg-s1 transition-colors">
            <div className={cn("font-serif text-3xl font-black tracking-tighter mb-1", stat.c)}>{stat.n}</div>
            <div className="text-[11px] text-muted mb-1">{stat.l}</div>
            <div className={cn("font-mono text-[9px] flex items-center gap-1", stat.ic)}>
              <stat.i size={10} /> {stat.it}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px]">
        <div className="p-8 border-r border-b1">
          <div className="mono-label text-muted mb-4 flex items-center gap-3">
            Skill gap trend — last 8 weeks
            <div className="flex-1 h-px bg-b1" />
          </div>
          <div className="bg-s1 border border-b1 rounded-xl p-6 mb-8 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1c" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#5a5a5a" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  fontFamily="DM Mono"
                />
                <YAxis 
                  stroke="#5a5a5a" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(v) => `${v}%`}
                  fontFamily="DM Mono"
                  domain={[50, 100]}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#161616', border: '1px solid #2a2a2a', borderRadius: '8px', fontSize: '11px' }}
                  itemStyle={{ padding: '2px 0' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontFamily: 'DM Mono', paddingTop: '20px' }} />
                <Line type="monotone" dataKey="erp" name="ERP basics" stroke="#ff6b4a" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="excel" name="Excel / Sheets" stroke="#f0a500" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="tally" name="Tally / GST" stroke="#a78bfa" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="tracking" name="Digital tracking" stroke="#3dd9a4" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mono-label text-muted mb-4 flex items-center gap-3">
            Top skill gaps — all sectors
            <div className="flex-1 h-px bg-b1" />
          </div>
          <div className="space-y-2 mb-12">
            {[
              { name: 'ERP basics', sub: 'Auto & Mfg', gap: 87, color: 'bg-coral' },
              { name: 'Excel / Sheets', sub: 'All sectors', gap: 74, color: 'bg-amber' },
              { name: 'Tally / GST', sub: 'SME sector', gap: 71, color: 'bg-amber' },
              { name: 'Digital tracking', sub: 'Logistics', gap: 68, color: 'bg-teal' },
              { name: 'CAD basics', sub: 'Auto & Mfg', gap: 65, color: 'bg-teal' },
            ].map((s, i) => (
              <div key={s.name} className={cn("grid grid-cols-[160px_1fr_46px] items-center gap-4 p-3 rounded-lg border border-transparent transition-all", i === 0 ? "bg-s1 border-b2" : "hover:bg-s2 hover:border-b2")}>
                <div className="text-[12px]">
                  <div className="font-medium">{s.name}</div>
                  <div className="text-[10px] text-muted">{s.sub}</div>
                </div>
                <div className="h-1.5 bg-s3 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${s.gap}%` }}
                    className={cn("h-full rounded-full", s.color)} 
                  />
                </div>
                <div className={cn("font-mono text-[11px] text-right", s.gap >= 75 ? "text-coral" : s.gap >= 55 ? "text-amber" : "text-teal")}>{s.gap}%</div>
              </div>
            ))}
          </div>

          <div className="mono-label text-muted mb-4 flex items-center gap-3">
            Top resources for these gaps
            <div className="flex-1 h-px bg-b1" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { t: 'Industrial ERP Basics', p: 'Mahindra Academy', g: '87% gap', c: 'text-coral' },
              { t: 'Advanced Excel', p: 'Nashik SME Assoc.', g: '74% gap', c: 'text-amber' },
              { t: 'Tally Prime & GST', p: 'ICAI Nashik', g: '71% gap', c: 'text-amber' },
              { t: 'AutoCAD for Nashik', p: 'Govt Poly Nashik', g: '65% gap', c: 'text-teal' },
            ].map(res => (
              <div key={res.t} className="p-4 bg-s1 border border-b1 rounded-xl hover:border-lime transition-all group cursor-pointer">
                <div className={cn("font-mono text-[9px] mb-1 uppercase tracking-wider", res.c)}>{res.g}</div>
                <div className="text-[13px] font-bold mb-1 group-hover:text-lime transition-colors">{res.t}</div>
                <div className="text-[10px] text-muted">{res.p}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="mono-label text-muted mb-4 flex items-center gap-3">
            Live activity feed
            <div className="flex-1 h-px bg-b1" />
          </div>
          <div className="space-y-4 mb-8">
            {[
              { t: 'New Industry Response', d: 'Mahindra & Mahindra just logged a critical ERP gap.', time: '2m ago', c: 'text-lime' },
              { t: 'Student Match', d: 'A student from K.K. Wagh just hit 95% match for Auto sector.', time: '14m ago', c: 'text-teal' },
              { t: 'Resource Added', d: 'New AutoCAD workshop added by Govt Poly Nashik.', time: '1h ago', c: 'text-purple' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5", item.c)} />
                <div>
                  <div className="text-[11px] font-bold">{item.t}</div>
                  <div className="text-[10px] text-muted leading-relaxed">{item.d}</div>
                  <div className="text-[9px] text-muted font-mono mt-1">{item.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mono-label text-muted mb-4 flex items-center gap-3">
            Sector heat index
            <div className="flex-1 h-px bg-b1" />
          </div>
          <div className="space-y-2 mb-8">
            {SECTORS.map(s => (
              <div key={s.key} className={cn("p-4 border border-b1 rounded-xl cursor-pointer transition-all hover:bg-s2 hover:border-b2", s.hot && "border-coral/30")}>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-[12px] font-medium">{s.name}</div>
                  <span className={cn("font-mono text-[9px] px-2 py-0.5 rounded-sm tracking-wider", s.bc)}>{s.badge}</span>
                </div>
                <div className="h-1 bg-s3 rounded-full mb-2 overflow-hidden">
                  <div className="h-full rounded-full" style={{ backgroundColor: s.fill, width: `${s.pct}%` }} />
                </div>
                <div className="flex justify-between font-mono text-[10px] text-muted">
                  <span>{s.co} companies</span>
                  <span>Gap: {s.gap}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mono-label text-muted mb-4 flex items-center gap-3">
            Recent responses
            <div className="flex-1 h-px bg-b1" />
          </div>
          <div className="space-y-0">
            {responses.map((r, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-b1 last:border-b-0">
                <div>
                  <div className="text-[12px] font-medium">{r.co}</div>
                  <div className="text-[10px] text-muted">{r.sec}</div>
                </div>
                <div className="text-right">
                  <div className={cn("font-mono text-[11px]", r.gap >= 80 ? "text-coral" : r.gap >= 70 ? "text-amber" : "text-teal")}>{r.gap}%</div>
                  <div className="text-[10px] text-muted font-mono">{r.t}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
