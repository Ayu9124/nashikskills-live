import React from 'react';

const MOCK_CANDIDATES = [
  {
    name: 'Aarav Patil',
    college: 'K.K. Wagh Engineering College',
    sector: 'Auto & Manufacturing',
    match: 96,
    availability: 'Immediate',
    skills: ['ERP basics', 'Excel / Sheets', 'Inventory tools']
  },
  {
    name: 'Riya Shinde',
    college: 'MET Bhujbal Knowledge City',
    sector: 'SME / Retail / Services',
    match: 91,
    availability: 'Within 2 weeks',
    skills: ['Tally / GST', 'Digital marketing', 'CRM']
  },
  {
    name: 'Pranav Kale',
    college: 'Government Polytechnic Nashik',
    sector: 'Logistics & Supply chain',
    match: 88,
    availability: 'Immediate',
    skills: ['Digital tracking', 'Shipment SW', 'Data entry']
  },
  {
    name: 'Sneha Jadhav',
    college: 'Sandip University',
    sector: 'Agri / Vineyards / Food processing',
    match: 84,
    availability: 'Within 1 month',
    skills: ['Excel / Sheets', 'WhatsApp Business', 'Inventory mgmt']
  }
];

export const IndustryCandidatesPage = () => (
  <div className="max-w-7xl mx-auto px-8 py-16">
    <div className="mono-label text-lime mb-2">Industry</div>
    <h1 className="section-h2 text-3xl mb-3">Candidates</h1>
    <p className="text-sm text-muted mb-6">Shortlisted profiles based on current sector demand and digital skill relevance.</p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
      {[
        { label: 'Open candidates', value: '42' },
        { label: 'High-match (85%+)', value: '19' },
        { label: 'Avg. response time', value: '11h' },
      ].map((metric) => (
        <div key={metric.label} className="p-4 rounded-xl bg-s1 border border-b1">
          <div className="font-mono text-2xl text-lime">{metric.value}</div>
          <div className="text-xs text-muted">{metric.label}</div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {MOCK_CANDIDATES.map((candidate) => (
        <div key={candidate.name} className="p-5 bg-s1 border border-b1 rounded-2xl hover:border-lime transition-all">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-base font-semibold">{candidate.name}</h3>
              <p className="text-xs text-muted">{candidate.college}</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-mono text-lime">{candidate.match}%</div>
              <div className="text-[10px] text-muted">Match score</div>
            </div>
          </div>
          <div className="text-[11px] text-muted mb-3">{candidate.sector} • {candidate.availability}</div>
          <div className="flex flex-wrap gap-1.5">
            {candidate.skills.map((skill) => (
              <span key={skill} className="px-2 py-1 bg-s2 border border-b1 rounded text-[10px] text-muted">
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);
