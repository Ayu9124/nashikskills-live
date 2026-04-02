import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Timer, Sparkles, CircleCheck, AlertTriangle, ChevronRight, RotateCcw, ClipboardCheck, Target } from 'lucide-react';
import { SECTORS, SKILLS } from '../../data';
import { SectorKey } from '../../types';
import { cn } from '../../lib/utils';

type InterviewCategory = 'technical' | 'problem-solving' | 'communication' | 'execution';
type QualificationLevel = 'foundation' | 'industry-ready' | 'advanced';

interface InterviewQuestion {
  id: string;
  category: InterviewCategory;
  prompt: string;
  idealKeywords: string[];
  weight: number;
  timeLimitSec: number;
}

interface DraftAnswer {
  text: string;
  confidence: number;
  timeTakenSec: number;
}

interface ScoreBreakdown {
  overall: number;
  byCriteria: {
    relevance: number;
    innovation: number;
    feasibility: number;
    execution: number;
  };
  qualificationVerdict: string;
  meetsTarget: boolean;
  targetScore: number;
  missingKeywords: string[];
}

interface HistoryEntry {
  id: string;
  createdAt: string;
  roleTitle: string;
  sector: string;
  target: QualificationLevel;
  score: number;
  verdict: string;
}

const HISTORY_KEY = 'student-ai-interview-history-v1';

const ROLE_TRACKS: Record<SectorKey, { title: string; focus: string[] }[]> = {
  auto: [
    { title: 'Production Data Associate', focus: ['excel', 'erp', 'quality', 'tracking'] },
    { title: 'Junior CAD Support', focus: ['cad', 'drawing', 'reporting', 'machine'] },
  ],
  agri: [
    { title: 'Vineyard Operations Assistant', focus: ['inventory', 'excel', 'dispatch', 'coordination'] },
    { title: 'Agri Sales Digital Associate', focus: ['whatsapp', 'crm', 'marketing', 'analytics'] },
  ],
  sme: [
    { title: 'SME Operations Coordinator', focus: ['tally', 'gst', 'invoicing', 'communication'] },
    { title: 'Local Business Growth Intern', focus: ['digital marketing', 'content', 'sheets', 'client'] },
  ],
  logi: [
    { title: 'Logistics Dispatch Trainee', focus: ['tracking', 'shipment', 'excel', 'escalation'] },
    { title: 'Warehouse Process Assistant', focus: ['erp', 'inventory', 'data entry', 'handover'] },
  ],
};

const LEVEL_TARGET: Record<QualificationLevel, number> = {
  foundation: 55,
  'industry-ready': 70,
  advanced: 82,
};

const CATEGORY_WEIGHT: Record<InterviewCategory, number> = {
  technical: 1.1,
  'problem-solving': 1.25,
  communication: 0.9,
  execution: 1.05,
};

const buildInterviewQuestions = (
  sector: SectorKey,
  roleTitle: string,
  focus: string[],
  count: number,
): InterviewQuestion[] => {
  const topSkills = SKILLS[sector].slice(0, 5);
  const categoryCycle: InterviewCategory[] = ['technical', 'problem-solving', 'communication', 'execution'];

  return Array.from({ length: count }).map((_, index) => {
    const skill = topSkills[index % topSkills.length];
    const category = categoryCycle[index % categoryCycle.length];
    const promptBank: Record<InterviewCategory, string> = {
      technical: `You are applying for ${roleTitle}. Explain how you would use ${skill.name} in a real Nashik workday. Mention tools, data, and expected output quality.`,
      'problem-solving': `A local company in ${SECTORS.find((s) => s.key === sector)?.name} reports delays and skill gaps. Give a 7-day action plan using ${skill.name} to improve outcomes.`,
      communication: `How would you explain a technical issue about ${skill.name} to a non-technical supervisor and then align your team on next steps?`,
      execution: `Create a practical mini-project you can complete in 2 weeks to prove you are job-ready for ${roleTitle}. Include milestones and validation metrics.`,
    };

    const keywordSet = [
      ...focus,
      skill.name.toLowerCase(),
      skill.sub.toLowerCase(),
      'timeline',
      'quality',
      'outcome',
    ];

    return {
      id: `${sector}-${index + 1}`,
      category,
      prompt: promptBank[category],
      idealKeywords: keywordSet,
      weight: CATEGORY_WEIGHT[category],
      timeLimitSec: category === 'problem-solving' || category === 'execution' ? 120 : 90,
    };
  });
};

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

const scoreAnswer = (question: InterviewQuestion, answer: DraftAnswer) => {
  const normalized = answer.text.toLowerCase();
  const words = normalized.split(/\s+/).filter(Boolean).length;
  const keywordHits = question.idealKeywords.filter((key) => normalized.includes(key)).length;
  const keywordScore = (keywordHits / Math.max(question.idealKeywords.length, 1)) * 55;

  const depthScore = words >= 90 ? 25 : words >= 55 ? 18 : words >= 30 ? 12 : words >= 15 ? 8 : 3;
  const structureSignals = ['because', 'step', 'plan', 'measure', 'timeline', 'track', 'report'];
  const structureScore = structureSignals.some((token) => normalized.includes(token)) ? 10 : 4;
  const confidenceScore = (answer.confidence / 100) * 10;
  const timingScore = answer.timeTakenSec <= question.timeLimitSec ? 10 : answer.timeTakenSec <= question.timeLimitSec + 20 ? 6 : 3;

  return clamp(keywordScore + depthScore + structureScore + confidenceScore + timingScore);
};

const verdictLabel = (score: number) => {
  if (score >= 82) return 'Highly Qualified';
  if (score >= 70) return 'Qualified';
  if (score >= 55) return 'Emerging';
  return 'Needs Upskilling';
};

export const StudentInterviewPage = () => {
  const [sector, setSector] = useState<SectorKey>('auto');
  const [roleIndex, setRoleIndex] = useState(0);
  const [questionCount, setQuestionCount] = useState(8);
  const [targetLevel, setTargetLevel] = useState<QualificationLevel>('industry-ready');

  const [phase, setPhase] = useState<'setup' | 'interview' | 'result'>('setup');
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionStartedAt, setQuestionStartedAt] = useState(Date.now());

  const [answers, setAnswers] = useState<Record<string, DraftAnswer>>({});
  const [draftText, setDraftText] = useState('');
  const [draftConfidence, setDraftConfidence] = useState(60);

  const [result, setResult] = useState<ScoreBreakdown | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const roleOptions = ROLE_TRACKS[sector];
  const selectedRole = roleOptions[roleIndex];

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as HistoryEntry[];
      setHistory(parsed.slice(0, 5));
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    setRoleIndex(0);
  }, [sector]);

  useEffect(() => {
    if (phase !== 'interview') return;
    const active = questions[currentIndex];
    if (!active) return;

    const existing = answers[active.id];
    setDraftText(existing?.text || '');
    setDraftConfidence(existing?.confidence ?? 60);
    setTimeLeft(active.timeLimitSec);
    setQuestionStartedAt(Date.now());
  }, [phase, currentIndex, questions, answers]);

  useEffect(() => {
    if (phase !== 'interview' || timeLeft <= 0) return;
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase, timeLeft]);

  useEffect(() => {
    if (phase !== 'interview' || timeLeft > 0) return;
    handleNextQuestion();
  }, [timeLeft]);

  const saveCurrentAnswer = () => {
    const active = questions[currentIndex];
    if (!active) return;

    const elapsed = Math.max(1, Math.round((Date.now() - questionStartedAt) / 1000));
    setAnswers((prev) => ({
      ...prev,
      [active.id]: {
        text: draftText.trim(),
        confidence: draftConfidence,
        timeTakenSec: elapsed,
      },
    }));
  };

  const startInterview = () => {
    const generated = buildInterviewQuestions(sector, selectedRole.title, selectedRole.focus, questionCount);
    setQuestions(generated);
    setCurrentIndex(0);
    setAnswers({});
    setResult(null);
    setPhase('interview');
  };

  const handleNextQuestion = () => {
    saveCurrentAnswer();
    if (currentIndex >= questions.length - 1) {
      finalizeInterview();
      return;
    }
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePreviousQuestion = () => {
    saveCurrentAnswer();
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const finalizeInterview = () => {
    const mergedAnswers: Record<string, DraftAnswer> = { ...answers };
    const active = questions[currentIndex];
    if (active) {
      const elapsed = Math.max(1, Math.round((Date.now() - questionStartedAt) / 1000));
      mergedAnswers[active.id] = {
        text: draftText.trim(),
        confidence: draftConfidence,
        timeTakenSec: elapsed,
      };
    }

    let weightedTotal = 0;
    let totalWeight = 0;

    const buckets: Record<InterviewCategory, number[]> = {
      technical: [],
      'problem-solving': [],
      communication: [],
      execution: [],
    };

    const consolidatedText = Object.values(mergedAnswers)
      .map((a) => a.text.toLowerCase())
      .join(' ');

    questions.forEach((q) => {
      const answer = mergedAnswers[q.id] || { text: '', confidence: 50, timeTakenSec: q.timeLimitSec + 20 };
      const score = scoreAnswer(q, answer);
      weightedTotal += score * q.weight;
      totalWeight += q.weight;
      buckets[q.category].push(score);
    });

    const avg = (arr: number[]) => (arr.length ? arr.reduce((acc, val) => acc + val, 0) / arr.length : 0);

    const relevance = clamp((avg(buckets.technical) * 0.6) + (avg(buckets.execution) * 0.4));
    const innovation = clamp(avg(buckets['problem-solving']));
    const feasibility = clamp((avg(buckets.technical) * 0.5) + (avg(buckets.execution) * 0.5));
    const execution = clamp((avg(buckets.communication) * 0.4) + (avg(buckets.execution) * 0.6));

    const overall = clamp(Math.round(weightedTotal / Math.max(totalWeight, 1)));
    const targetScore = LEVEL_TARGET[targetLevel];
    const allKeywords: string[] = questions.flatMap((q) => q.idealKeywords);
    const missingKeywords: string[] = Array.from(
      new Set(allKeywords.filter((keyword) => !consolidatedText.includes(keyword.toLowerCase()))),
    ).slice(0, 8);

    const finalResult: ScoreBreakdown = {
      overall,
      byCriteria: {
        relevance: Math.round(relevance),
        innovation: Math.round(innovation),
        feasibility: Math.round(feasibility),
        execution: Math.round(execution),
      },
      qualificationVerdict: verdictLabel(overall),
      meetsTarget: overall >= targetScore,
      targetScore,
      missingKeywords,
    };

    const newHistoryEntry: HistoryEntry = {
      id: String(Date.now()),
      createdAt: new Date().toLocaleString(),
      roleTitle: selectedRole.title,
      sector: SECTORS.find((s) => s.key === sector)?.name || sector,
      target: targetLevel,
      score: overall,
      verdict: finalResult.qualificationVerdict,
    };

    const nextHistory = [newHistoryEntry, ...history].slice(0, 5);
    setHistory(nextHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));

    setAnswers(mergedAnswers);
    setResult(finalResult);
    setPhase('result');
  };

  const readinessColor = useMemo(() => {
    if (!result) return 'text-muted';
    if (result.overall >= 82) return 'text-teal';
    if (result.overall >= 70) return 'text-lime';
    if (result.overall >= 55) return 'text-amber';
    return 'text-coral';
  }, [result]);

  const restartInterview = () => {
    setPhase('setup');
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers({});
    setResult(null);
    setDraftText('');
    setDraftConfidence(60);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-16">
      <div className="px-8 py-10 border-b border-b1 bg-gradient-to-r from-lime/10 via-teal/5 to-blue/10">
        <div className="mono-label text-lime mb-3 flex items-center gap-2">
          <Bot size={14} />
          AI Interview Qualification Lab
        </div>
        <h1 className="section-h2 text-4xl leading-tight mb-3">Verify student readiness before hiring.</h1>
        <p className="text-sm text-muted max-w-3xl leading-relaxed">
          Simulate a practical AI-led interview for Nashik industries and score candidates on relevance, innovation, feasibility, and execution. This is frontend-only and optimized for hackathon demos.
        </p>
      </div>

      <div className="px-8 py-8 max-w-6xl mx-auto">
        {phase === 'setup' && (
          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
            <div className="bg-s1 border border-b2 rounded-2xl p-6">
              <div className="mono-label text-muted mb-4">Interview Setup</div>

              <div className="mb-6">
                <label className="text-[12px] font-medium mb-2 block">Target Sector</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {SECTORS.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setSector(item.key)}
                      className={cn(
                        'p-3 border rounded-lg text-left transition-all',
                        sector === item.key ? 'border-lime bg-lime/10' : 'border-b2 hover:border-lime/40',
                      )}
                    >
                      <div className="text-[12px] font-semibold leading-tight">{item.name}</div>
                      <div className="text-[10px] text-muted mt-1">Gap: {item.gap}%</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="text-[12px] font-medium mb-2 block">Interview Role Track</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {roleOptions.map((track, index) => (
                    <button
                      key={track.title}
                      onClick={() => setRoleIndex(index)}
                      className={cn(
                        'p-3 border rounded-lg text-left transition-all',
                        roleIndex === index ? 'border-teal bg-teal/10' : 'border-b2 hover:border-teal/40',
                      )}
                    >
                      <div className="text-[13px] font-semibold">{track.title}</div>
                      <div className="text-[10px] text-muted mt-1">Focus: {track.focus.join(', ')}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 border border-b2 rounded-xl">
                  <label className="text-[12px] font-medium block mb-2">Qualification Benchmark</label>
                  <div className="space-y-2">
                    {(['foundation', 'industry-ready', 'advanced'] as QualificationLevel[]).map((level) => (
                      <button
                        key={level}
                        onClick={() => setTargetLevel(level)}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-lg border text-[11px] transition-all',
                          targetLevel === level ? 'border-coral bg-coral/10' : 'border-b2 hover:border-coral/35',
                        )}
                      >
                        <div className="font-semibold uppercase tracking-wide">{level.replace('-', ' ')}</div>
                        <div className="text-muted">Target score: {LEVEL_TARGET[level]}+</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 border border-b2 rounded-xl">
                  <label className="text-[12px] font-medium block mb-2">Question Count</label>
                  <input
                    type="range"
                    min={6}
                    max={12}
                    step={1}
                    value={questionCount}
                    onChange={(event) => setQuestionCount(Number(event.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-muted mt-1">
                    <span>Fast demo: 6</span>
                    <span className="font-semibold text-text">{questionCount} questions</span>
                    <span>Deep check: 12</span>
                  </div>
                </div>
              </div>

              <button
                onClick={startInterview}
                className="w-full md:w-auto inline-flex items-center gap-2 px-5 py-2.5 bg-lime text-bg rounded-lg text-[12px] font-bold hover:opacity-90 transition-opacity"
              >
                <Sparkles size={14} />
                Start AI Interview
              </button>
            </div>

            <div className="bg-s1 border border-b2 rounded-2xl p-6">
              <div className="mono-label text-muted mb-4">What It Verifies</div>
              <div className="space-y-3 text-[12px] text-muted">
                <div className="p-3 rounded-lg border border-b1 bg-bg">
                  <div className="font-semibold text-text mb-1">Relevance to Problem</div>
                  Measures local sector understanding and role-fit clarity.
                </div>
                <div className="p-3 rounded-lg border border-b1 bg-bg">
                  <div className="font-semibold text-text mb-1">Innovation Simplicity</div>
                  Evaluates practical solution thinking over complex theory.
                </div>
                <div className="p-3 rounded-lg border border-b1 bg-bg">
                  <div className="font-semibold text-text mb-1">Feasibility and Scalability</div>
                  Checks whether plans can work in real Nashik constraints.
                </div>
                <div className="p-3 rounded-lg border border-b1 bg-bg">
                  <div className="font-semibold text-text mb-1">On-ground Execution</div>
                  Verifies communication, milestones, and validation mindset.
                </div>
              </div>
            </div>
          </div>
        )}

        {phase === 'interview' && questions[currentIndex] && (
          <div className="bg-s1 border border-b2 rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <div className="mono-label text-muted">Live Interview</div>
                <div className="text-[13px] font-medium mt-1">
                  Question {currentIndex + 1} of {questions.length} - {selectedRole.title}
                </div>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-b2 bg-bg text-[11px] font-mono">
                <Timer size={14} className={timeLeft < 15 ? 'text-coral' : 'text-teal'} />
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </div>
            </div>

            <div className="h-2 bg-s3 rounded-full overflow-hidden mb-5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                className="h-full bg-gradient-to-r from-lime to-teal"
              />
            </div>

            <div className="mb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-teal">
                {questions[currentIndex].category.replace('-', ' ')}
              </span>
              <p className="text-[14px] leading-relaxed mt-2">{questions[currentIndex].prompt}</p>
            </div>

            <textarea
              value={draftText}
              onChange={(event) => setDraftText(event.target.value)}
              rows={8}
              className="w-full rounded-xl border border-b2 bg-bg px-4 py-3 text-[13px] outline-none focus:border-lime"
              placeholder="Type your answer. Mention concrete tools, steps, and measurable outcomes."
            />

            <div className="flex flex-wrap items-center justify-between gap-3 mt-3 mb-5">
              <div className="text-[10px] text-muted font-mono">{draftText.split(/\s+/).filter(Boolean).length} words</div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-muted">Confidence</span>
                <input
                  type="range"
                  min={20}
                  max={100}
                  step={5}
                  value={draftConfidence}
                  onChange={(event) => setDraftConfidence(Number(event.target.value))}
                />
                <span className="font-semibold w-10 text-right">{draftConfidence}%</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-3">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentIndex === 0}
                className="px-4 py-2 border border-b2 rounded-lg text-[12px] hover:border-lime disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={handleNextQuestion}
                className="inline-flex items-center gap-2 px-5 py-2 bg-lime text-bg rounded-lg text-[12px] font-bold"
              >
                {currentIndex === questions.length - 1 ? 'Submit Interview' : 'Next Question'}
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {phase === 'result' && result && (
          <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6">
            <div className="bg-s1 border border-b2 rounded-2xl p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                <div>
                  <div className="mono-label text-muted mb-1">Interview Result</div>
                  <h2 className="section-h2 text-3xl leading-tight">{selectedRole.title}</h2>
                  <div className="text-[12px] text-muted mt-1">{SECTORS.find((item) => item.key === sector)?.name}</div>
                </div>
                <div className="text-right">
                  <div className={cn('text-4xl font-serif font-black leading-none', readinessColor)}>{result.overall}</div>
                  <div className="text-[10px] font-mono text-muted uppercase tracking-wider">Readiness Score</div>
                </div>
              </div>

              <div className={cn('mb-5 p-4 rounded-xl border', result.meetsTarget ? 'border-teal/30 bg-teal/10' : 'border-coral/30 bg-coral/10')}>
                <div className="flex items-center gap-2 text-[13px] font-semibold">
                  {result.meetsTarget ? <CircleCheck size={16} className="text-teal" /> : <AlertTriangle size={16} className="text-coral" />}
                  {result.qualificationVerdict}
                </div>
                <p className="text-[12px] text-muted mt-1">
                  Target benchmark: {result.targetScore}+ ({targetLevel.replace('-', ' ')}). {result.meetsTarget ? 'Candidate clears the selected qualification level.' : 'Candidate does not yet clear the selected qualification level.'}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="p-3 rounded-lg border border-b1 bg-bg">
                  <div className="text-[10px] text-muted font-mono uppercase">Relevance</div>
                  <div className="text-xl font-semibold">{result.byCriteria.relevance}</div>
                </div>
                <div className="p-3 rounded-lg border border-b1 bg-bg">
                  <div className="text-[10px] text-muted font-mono uppercase">Innovation</div>
                  <div className="text-xl font-semibold">{result.byCriteria.innovation}</div>
                </div>
                <div className="p-3 rounded-lg border border-b1 bg-bg">
                  <div className="text-[10px] text-muted font-mono uppercase">Feasibility</div>
                  <div className="text-xl font-semibold">{result.byCriteria.feasibility}</div>
                </div>
                <div className="p-3 rounded-lg border border-b1 bg-bg">
                  <div className="text-[10px] text-muted font-mono uppercase">Execution</div>
                  <div className="text-xl font-semibold">{result.byCriteria.execution}</div>
                </div>
              </div>

              <div className="mb-6">
                <div className="mono-label text-muted mb-2">Detected Gaps</div>
                {result.missingKeywords.length ? (
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords.map((keyword) => (
                      <span key={keyword} className="px-2 py-1 text-[10px] font-mono uppercase rounded bg-s2 border border-b2">
                        {keyword}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-muted">No major keyword gaps detected in your responses.</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={restartInterview}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-b2 rounded-lg text-[12px] hover:border-lime"
                >
                  <RotateCcw size={14} />
                  Retake Interview
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-s1 border border-b2 rounded-2xl p-6">
                <div className="mono-label text-muted mb-3 flex items-center gap-2">
                  <Target size={14} />
                  Suggested Upskilling Tracks
                </div>
                <div className="space-y-2">
                  {SKILLS[sector].slice(0, 4).map((skill) => (
                    <a
                      key={skill.name}
                      href={skill.link}
                      target="_blank"
                      rel="noreferrer"
                      className="block p-3 rounded-lg border border-b1 bg-bg hover:border-lime transition-all"
                    >
                      <div className="text-[12px] font-semibold">{skill.name}</div>
                      <div className="text-[10px] text-muted">{skill.sub} · gap {skill.gap}%</div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="bg-s1 border border-b2 rounded-2xl p-6">
                <div className="mono-label text-muted mb-3 flex items-center gap-2">
                  <ClipboardCheck size={14} />
                  Last 5 Attempts
                </div>
                {history.length === 0 ? (
                  <p className="text-[12px] text-muted">No attempts yet.</p>
                ) : (
                  <div className="space-y-2">
                    {history.map((entry) => (
                      <div key={entry.id} className="p-3 rounded-lg border border-b1 bg-bg">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-[12px] font-semibold">{entry.roleTitle}</div>
                            <div className="text-[10px] text-muted">{entry.createdAt}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[16px] font-semibold">{entry.score}</div>
                            <div className="text-[9px] uppercase font-mono text-muted">{entry.verdict}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
