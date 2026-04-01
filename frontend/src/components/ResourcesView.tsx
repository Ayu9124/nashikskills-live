import React, { useState } from 'react';
import { motion } from "framer-motion";
import { 
  Search, 
  Filter, 
  ExternalLink, 
  PlayCircle, 
  BookOpen, 
  Award, 
  ArrowRight,
  Clock,
  Star
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ALL_SKILLS_LIST } from '../data';

const RESOURCES = [
  {
    id: 1,
    title: 'Industrial ERP Basics',
    provider: 'Mahindra & Mahindra Academy',
    type: 'Certification',
    duration: '12 hrs',
    level: 'Beginner',
    rating: 4.9,
    students: 1240,
    skills: ['ERP basics', 'Inventory Management'],
    image: 'https://picsum.photos/seed/erp/400/200',
    link: 'https://www.mahindra.com/careers',
    isLocal: true
  },
  {
    id: 2,
    title: 'Advanced Excel for Manufacturing',
    provider: 'Nashik SME Association',
    type: 'Workshop',
    duration: '6 hrs',
    level: 'Intermediate',
    rating: 4.8,
    students: 850,
    skills: ['Excel / Sheets', 'Data Analysis'],
    image: 'https://picsum.photos/seed/excel/400/200',
    link: 'https://www.coursera.org/specializations/excel',
    isLocal: true
  },
  {
    id: 3,
    title: 'Tally Prime & GST Compliance',
    provider: 'ICAI Nashik Chapter',
    type: 'Course',
    duration: '24 hrs',
    level: 'Beginner',
    rating: 4.7,
    students: 2100,
    skills: ['Tally / GST', 'Accounting'],
    image: 'https://picsum.photos/seed/tally/400/200',
    link: 'https://tallysolutions.com/learning-hub/',
    isLocal: true
  },
  {
    id: 4,
    title: 'Digital Supply Chain Tracking',
    provider: 'Logistics Institute of India',
    type: 'Certification',
    duration: '18 hrs',
    level: 'Intermediate',
    rating: 4.6,
    students: 560,
    skills: ['Digital tracking', 'Logistics'],
    image: 'https://picsum.photos/seed/logistics/400/200',
    link: 'https://www.edx.org/learn/supply-chain-management',
    isLocal: false
  },
  {
    id: 5,
    title: 'AutoCAD for Nashik Industries',
    provider: 'Government Polytechnic Nashik',
    type: 'Certification',
    duration: '40 hrs',
    level: 'Beginner',
    rating: 4.9,
    students: 3200,
    skills: ['CAD basics', 'Engineering Design'],
    image: 'https://picsum.photos/seed/cad/400/200',
    link: 'https://www.autodesk.com/certification/learning-pathways/autocad-mechanical-design',
    isLocal: true
  },
  {
    id: 6,
    title: 'E-commerce for Local Retailers',
    provider: 'Digital Nashik Initiative',
    type: 'Workshop',
    duration: '4 hrs',
    level: 'Beginner',
    rating: 4.5,
    students: 420,
    skills: ['SME / Retail', 'Digital Marketing'],
    image: 'https://picsum.photos/seed/retail/400/200',
    link: 'https://grow.google/intl/en_in/digital-unlocked/',
    isLocal: true
  }
];

export const ResourcesView = () => {
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const filteredResources = RESOURCES.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(search.toLowerCase()) || 
                         res.provider.toLowerCase().includes(search.toLowerCase());
    const matchesSkill = !selectedSkill || res.skills.includes(selectedSkill);
    return matchesSearch && matchesSkill;
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-20"
    >
      <div className="px-8 py-12 border-b border-b1 bg-s1">
        <div className="mono-label text-lime mb-3">Skill Marketplace</div>
        <h1 className="section-h2 text-4xl mb-3 leading-tight">
          Close your gap with<br /><em className="italic text-lime not-italic">curated Nashik-first</em> learning.
        </h1>
        <p className="text-muted text-sm max-w-lg leading-relaxed">
          We've mapped the top skill gaps to the best free and local resources. No fluff, just the skills Nashik employers are asking for right now.
        </p>
      </div>

      <div className="px-8 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Search by skill, provider, or course name..."
              className="w-full bg-s2 border border-b2 rounded-xl pl-10 pr-4 py-3 text-[13px] outline-none focus:border-lime transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <button 
              onClick={() => setSelectedSkill(null)}
              className={cn(
                "px-4 py-2 rounded-xl border text-[11px] whitespace-nowrap transition-all",
                !selectedSkill ? "bg-lime text-bg border-lime font-bold" : "bg-s2 border-b2 text-muted hover:border-lime"
              )}
            >
              All Skills
            </button>
            {ALL_SKILLS_LIST.slice(0, 8).map(skill => (
              <button 
                key={skill}
                onClick={() => setSelectedSkill(skill)}
                className={cn(
                  "px-4 py-2 rounded-xl border text-[11px] whitespace-nowrap transition-all",
                  selectedSkill === skill ? "bg-lime text-bg border-lime font-bold" : "bg-s2 border-b2 text-muted hover:border-lime"
                )}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res, i) => (
            <motion.div 
              key={res.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-s2 border border-b1 rounded-2xl overflow-hidden group hover:border-lime/30 transition-all flex flex-col"
            >
              <div className="relative h-40 overflow-hidden">
                <img 
                  src={res.image} 
                  alt={res.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2 py-1 bg-bg/80 backdrop-blur-md rounded text-[9px] font-mono font-bold uppercase tracking-wider text-lime border border-lime/20">
                    {res.type}
                  </span>
                  {res.isLocal && (
                    <span className="px-2 py-1 bg-teal/80 backdrop-blur-md rounded text-[9px] font-mono font-bold uppercase tracking-wider text-bg border border-teal/20">
                      Local Nashik
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-[10px] font-mono text-muted uppercase tracking-widest">{res.provider}</div>
                  <div className="flex items-center gap-1 text-[10px] text-amber">
                    <Star size={10} fill="currentColor" />
                    <span>{res.rating}</span>
                  </div>
                </div>
                
                <h3 className="text-[15px] font-bold mb-3 leading-tight group-hover:text-lime transition-colors">{res.title}</h3>
                
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {res.skills.map(skill => (
                    <span key={skill} className="px-2 py-0.5 bg-bg border border-b1 rounded text-[9px] text-muted">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-4 border-t border-b1 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] text-muted">
                      <Clock size={12} />
                      <span>{res.duration}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted">
                      <Award size={12} />
                      <span>{res.level}</span>
                    </div>
                  </div>
                  <a 
                    href={res.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[11px] font-bold text-lime hover:underline"
                  >
                    Start Learning <ArrowRight size={12} />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="py-20 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium mb-1">No resources found</h3>
            <p className="text-muted text-sm">Try adjusting your search or skill filters.</p>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto mt-12 px-8">
        <div className="bg-gradient-to-r from-lime/10 to-teal/10 border border-lime/20 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl font-serif font-bold mb-2">Are you a Nashik training provider?</h2>
            <p className="text-muted text-[13px] max-w-md">List your courses on NashikSkills Live and help us bridge the digital gap for 10,000+ local students.</p>
          </div>
          <button className="px-8 py-3 bg-lime text-bg rounded-xl text-[13px] font-bold hover:opacity-85 transition-opacity whitespace-nowrap">
            Partner with us →
          </button>
        </div>
      </div>
    </motion.div>
  );
};
