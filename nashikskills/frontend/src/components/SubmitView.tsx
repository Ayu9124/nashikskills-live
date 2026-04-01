import React, { useState } from 'react';
import { motion } from "framer-motion";
import { CheckCircle2, Building2, Users, Briefcase } from 'lucide-react';
import { cn } from '../lib/utils';
import { ALL_SKILLS_LIST } from '../data';
import { User, db, collection, addDoc, serverTimestamp, setDoc, doc, handleFirestoreError, OperationType, query, where, getDocs, limit } from '../firebase';

interface SubmitViewProps {
  user: User | null;
  profile: any;
  onProfileUpdate: (data: any) => void;
  key?: string;
}

export const SubmitView = ({ user, profile, onProfileUpdate }: SubmitViewProps) => {
  const [type, setType] = useState<'ind' | 'stu'>('stu');
  const [subType, setSubType] = useState<'form' | 'search'>('form');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [indErrors, setIndErrors] = useState<Record<string, string>>({});
  const [stuErrors, setStuErrors] = useState<Record<string, string>>({});

  // Search State
  const [searchQuery, setSearchQuery] = useState({
    sector: 'auto',
    skill: ''
  });
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Industry Form State
  const [indForm, setIndForm] = useState({
    companyName: '',
    sector: 'auto',
    missingSkills: [] as string[],
    hiringTarget: '1–5',
    message: ''
  });

  // Student Form State
  const [stuForm, setStuForm] = useState({
    college: '',
    targetSector: 'auto',
    mySkills: [] as string[]
  });

  // Sync with profile prop
  React.useEffect(() => {
    if (profile) {
      setStuForm({
        college: profile.college || '',
        targetSector: profile.targetSector || 'auto',
        mySkills: profile.mySkills || []
      });
    }
  }, [profile]);

  const handleIndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!indForm.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    if (!indForm.sector) {
      newErrors.sector = 'Sector is required';
    }
    if (indForm.missingSkills.length === 0) {
      newErrors.missingSkills = 'Please select at least one missing skill';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setIndErrors(newErrors);
      return;
    }
    
    setIndErrors({});
    setLoading(true);
    try {
      // Calculate a pseudo-gap based on number of missing skills
      const gap = 50 + (indForm.missingSkills.length * 5) + Math.floor(Math.random() * 10);
      
      const path = 'industry_responses';
      await addDoc(collection(db, 'industry_responses'), {
        co: indForm.companyName,
        sec: indForm.sector === 'auto' ? 'Auto & Mfg' : indForm.sector === 'agri' ? 'Agri' : indForm.sector === 'sme' ? 'SME' : 'Logistics',
        gap: Math.min(gap, 95),
        missingSkills: indForm.missingSkills,
        hiringTarget: indForm.hiringTarget,
        message: indForm.message,
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
      setIndForm({
        companyName: '',
        sector: 'auto',
        missingSkills: [],
        hiringTarget: '1–5',
        message: ''
      });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'industry_responses');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    try {
      let q = query(
        collection(db, 'student_public_profiles'),
        where('targetSector', '==', searchQuery.sector),
        limit(20)
      );

      if (searchQuery.skill) {
        q = query(
          collection(db, 'student_public_profiles'),
          where('targetSector', '==', searchQuery.sector),
          where('mySkills', 'array-contains', searchQuery.skill),
          limit(20)
        );
      }

      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => doc.data());
      setSearchResults(results);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'student_public_profiles');
    } finally {
      setSearching(false);
    }
  };

  const handleStuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    if (stuForm.mySkills.length === 0) {
      newErrors.mySkills = 'Please select at least one skill you currently have';
    }

    if (Object.keys(newErrors).length > 0) {
      setStuErrors(newErrors);
      return;
    }

    setStuErrors({});
    setLoading(true);
    try {
      if (user) {
        const updatedProfile = {
          ...profile,
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          college: stuForm.college,
          targetSector: stuForm.targetSector,
          mySkills: stuForm.mySkills,
          updatedAt: serverTimestamp()
        };

        const publicProfile = {
          uid: user.uid,
          displayName: user.displayName,
          college: stuForm.college,
          targetSector: stuForm.targetSector,
          mySkills: stuForm.mySkills,
          updatedAt: serverTimestamp()
        };

        await setDoc(doc(db, 'student_profiles', user.uid), updatedProfile);
        await setDoc(doc(db, 'student_public_profiles', user.uid), publicProfile);
        onProfileUpdate(updatedProfile);
      } else {
        // Anonymous submission
        await addDoc(collection(db, 'anonymous_student_responses'), {
          college: stuForm.college,
          targetSector: stuForm.targetSector,
          mySkills: stuForm.mySkills,
          createdAt: serverTimestamp()
        });
      }
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, user ? `student_profiles/${user.uid}` : 'anonymous_student_responses');
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skill: string, isInd: boolean) => {
    if (isInd) {
      setIndForm(prev => {
        const newSkills = prev.missingSkills.includes(skill)
          ? prev.missingSkills.filter(s => s !== skill)
          : [...prev.missingSkills, skill];
        
        if (newSkills.length > 0) {
          setIndErrors(errs => {
            const { missingSkills, ...rest } = errs;
            return rest;
          });
        }
        
        return { ...prev, missingSkills: newSkills };
      });
    } else {
      setStuForm(prev => {
        const newSkills = prev.mySkills.includes(skill)
          ? prev.mySkills.filter(s => s !== skill)
          : [...prev.mySkills, skill];
        
        if (newSkills.length > 0) {
          setStuErrors(errs => {
            const { mySkills, ...rest } = errs;
            return rest;
          });
        }
        
        return { ...prev, mySkills: newSkills };
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-80px)]"
    >
      <div className="p-10 border-r border-b1">
        <div className="flex gap-1 p-1 bg-s2 rounded-lg w-fit mb-8">
          <button 
            onClick={() => setType('ind')}
            className={cn("px-4 py-1.5 rounded-md text-[12px] transition-all", type === 'ind' ? "bg-bg text-text border border-b2 shadow-sm" : "text-muted")}
          >
            I'm an Employer
          </button>
          <button 
            onClick={() => setType('stu')}
            className={cn("px-4 py-1.5 rounded-md text-[12px] transition-all", type === 'stu' ? "bg-bg text-text border border-b2 shadow-sm" : "text-muted")}
          >
            I'm a Student
          </button>
        </div>

        {type === 'ind' ? (
          <div className="space-y-8">
            <div className="flex gap-4 border-b border-b1">
              <button 
                onClick={() => setSubType('form')}
                className={cn("pb-2 text-[13px] font-medium transition-all border-b-2", subType === 'form' ? "border-lime text-text" : "border-transparent text-muted")}
              >
                Post Industry Needs
              </button>
              <button 
                onClick={() => setSubType('search')}
                className={cn("pb-2 text-[13px] font-medium transition-all border-b-2", subType === 'search' ? "border-lime text-text" : "border-transparent text-muted")}
              >
                Search Nashik Talent
              </button>
            </div>

            {subType === 'form' ? (
              <form onSubmit={handleIndSubmit}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="px-2 py-0.5 bg-lime/10 text-lime text-[9px] font-mono font-bold rounded uppercase tracking-wider border border-lime/20">
                    Join 50+ Nashik Companies
                  </div>
                </div>
                <h2 className="font-serif text-2xl font-bold mb-1 tracking-tight">Industry intake</h2>
                <p className="text-muted text-[13px] mb-4 leading-relaxed">Your data feeds the live city dashboard and helps us bridge the Nashik talent gap.</p>
                
                <div className="flex flex-col gap-2 mb-8">
                  {[
                    { text: 'Get skilled candidates faster', sub: 'Direct access to job-ready students' },
                    { text: 'Reduce hiring cost', sub: 'Save ₹20k+ per fresher hire' },
                    { text: 'Get visibility among students', sub: 'Featured as a top Nashik employer' }
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={12} className="text-lime mt-0.5" />
                      <div>
                        <div className="text-[11px] text-text font-bold leading-none">{benefit.text}</div>
                        <div className="text-[9px] text-muted mt-0.5">{benefit.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="mono-label text-muted">Company name</label>
                      {indErrors.companyName && <span className="text-[10px] text-coral font-medium">{indErrors.companyName}</span>}
                    </div>
                    <input 
                      className={cn(
                        "w-full bg-s2 border rounded-lg px-4 py-2.5 text-[13px] outline-none transition-colors",
                        indErrors.companyName ? "border-coral/50 focus:border-coral" : "border-b2 focus:border-lime"
                      )}
                      placeholder="e.g. Mahindra & Mahindra, Nashik MIDC" 
                      value={indForm.companyName}
                      onChange={e => {
                        setIndForm({...indForm, companyName: e.target.value});
                        if (e.target.value.trim()) {
                          setIndErrors(prev => {
                            const { companyName, ...rest } = prev;
                            return rest;
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="mono-label text-muted">Sector</label>
                      {indErrors.sector && <span className="text-[10px] text-coral font-medium">{indErrors.sector}</span>}
                    </div>
                    <select 
                      className={cn(
                        "w-full bg-s2 border rounded-lg px-4 py-2.5 text-[13px] outline-none transition-colors",
                        indErrors.sector ? "border-coral/50 focus:border-coral" : "border-b2 focus:border-lime"
                      )}
                      value={indForm.sector}
                      onChange={e => {
                        setIndForm({...indForm, sector: e.target.value});
                        if (e.target.value) {
                          setIndErrors(prev => {
                            const { sector, ...rest } = prev;
                            return rest;
                          });
                        }
                      }}
                    >
                      <option value="auto">Auto & Manufacturing</option>
                      <option value="agri">Agri / Vineyards / Food processing</option>
                      <option value="sme">SME / Retail / Services</option>
                      <option value="logi">Logistics & Supply chain</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="mono-label text-muted">Digital skills missing in fresher hires</label>
                      {indErrors.missingSkills && <span className="text-[10px] text-coral font-medium">{indErrors.missingSkills}</span>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ALL_SKILLS_LIST.slice(0, 12).map(s => (
                        <div 
                          key={s} 
                          onClick={() => toggleSkill(s, true)}
                          className={cn(
                            "px-3 py-1.5 rounded-md border text-[11px] cursor-pointer transition-all",
                            indForm.missingSkills.includes(s) 
                              ? "border-lime bg-lime/10 text-lime" 
                              : indErrors.missingSkills ? "border-coral/30 bg-s2 text-muted hover:border-coral" : "border-b2 bg-s2 text-muted hover:border-lime"
                          )}
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="mono-label text-muted">Message for students (optional)</label>
                    <textarea 
                      className="w-full bg-s2 border border-b2 rounded-lg px-4 py-2.5 text-[13px] outline-none focus:border-lime min-h-[100px]" 
                      placeholder="Open roles, specific requirements, or advice for students..."
                      value={indForm.message}
                      onChange={e => setIndForm({...indForm, message: e.target.value})}
                    ></textarea>
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full mt-6 py-3 bg-lime text-bg rounded-lg text-[13px] font-bold hover:opacity-85 transition-opacity disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Join the Nashik Talent Network →'}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold mb-1 tracking-tight">Talent Search</h2>
                  <p className="text-muted text-[13px] mb-6 leading-relaxed">Search Nashik's student talent pool by sector and specific skills.</p>
                  
                  <form onSubmit={handleSearch} className="space-y-4 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="mono-label text-muted">Target Sector</label>
                        <select 
                          className="w-full bg-s2 border border-b2 rounded-lg px-4 py-2.5 text-[13px] outline-none focus:border-lime"
                          value={searchQuery.sector}
                          onChange={e => setSearchQuery({...searchQuery, sector: e.target.value})}
                        >
                          <option value="auto">Auto & Manufacturing</option>
                          <option value="agri">Agri / Vineyards / Food processing</option>
                          <option value="sme">SME / Retail / Services</option>
                          <option value="logi">Logistics & Supply chain</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="mono-label text-muted">Specific Skill (Optional)</label>
                        <select 
                          className="w-full bg-s2 border border-b2 rounded-lg px-4 py-2.5 text-[13px] outline-none focus:border-lime"
                          value={searchQuery.skill}
                          onChange={e => setSearchQuery({...searchQuery, skill: e.target.value})}
                        >
                          <option value="">All Skills</option>
                          {ALL_SKILLS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <button 
                      type="submit"
                      disabled={searching}
                      className="w-full py-3 bg-lime text-bg rounded-lg text-[13px] font-bold hover:opacity-85 transition-opacity flex items-center justify-center gap-2"
                    >
                      {searching ? 'Searching...' : 'Search Talent Pool →'}
                    </button>
                  </form>

                  <div className="space-y-4">
                    <div className="mono-label text-muted mb-2">Search Results ({searchResults.length})</div>
                    {searchResults.length === 0 && !searching && (
                      <div className="p-8 text-center border border-dashed border-b1 rounded-xl text-muted text-[12px]">
                        No students found matching your criteria. Try a broader search.
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-3">
                      {searchResults.map((res, i) => (
                        <div key={i} className="p-4 bg-s1 border border-b1 rounded-xl hover:border-lime transition-all">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="text-[14px] font-bold">{res.displayName}</div>
                              <div className="text-[11px] text-muted">{res.college}</div>
                            </div>
                            <div className="px-2 py-0.5 bg-teal/10 text-teal text-[9px] font-mono font-bold rounded uppercase tracking-wider">
                              {res.targetSector}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {res.mySkills.map((s: string) => (
                              <span key={s} className="px-2 py-0.5 bg-s2 border border-b1 rounded text-[9px] text-muted">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleStuSubmit}>
            <h2 className="font-serif text-2xl font-bold mb-1 tracking-tight">Student profile</h2>
            {!user && <p className="text-coral text-[11px] mb-4">Please login to save your profile.</p>}
            <p className="text-muted text-[13px] mb-4 leading-relaxed">Tell us where you are. We'll map your gap vs what Nashik's industry needs from you right now.</p>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="mono-label text-muted">College</label>
                <input 
                  className="w-full bg-s2 border border-b2 rounded-lg px-4 py-2.5 text-[13px] outline-none focus:border-lime" 
                  placeholder="e.g. K.K. Wagh Engineering College" 
                  value={stuForm.college}
                  onChange={e => setStuForm({...stuForm, college: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-1.5">
                <label className="mono-label text-muted">Target sector</label>
                <select 
                  className="w-full bg-s2 border border-b2 rounded-lg px-4 py-2.5 text-[13px] outline-none focus:border-lime"
                  value={stuForm.targetSector}
                  onChange={e => setStuForm({...stuForm, targetSector: e.target.value})}
                >
                  <option value="auto">Auto & Manufacturing</option>
                  <option value="agri">Agri / Vineyards</option>
                  <option value="sme">SME / Retail</option>
                  <option value="logi">Logistics</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="mono-label text-muted">Skills you currently have</label>
                  {stuErrors.mySkills && <span className="text-[10px] text-coral font-medium">{stuErrors.mySkills}</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {ALL_SKILLS_LIST.map(s => (
                    <div 
                      key={s} 
                      onClick={() => toggleSkill(s, false)}
                      className={cn(
                        "px-3 py-1.5 rounded-md border text-[11px] cursor-pointer transition-all",
                        stuForm.mySkills.includes(s) 
                          ? "border-teal bg-teal/10 text-teal" 
                          : stuErrors.mySkills ? "border-coral/30 bg-s2 text-muted hover:border-coral" : "border-b2 bg-s2 text-muted hover:border-teal"
                      )}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-6 py-3 bg-teal text-bg rounded-lg text-[13px] font-bold hover:opacity-85 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Saving...' : user ? 'Build My Nashik Career Profile →' : 'Submit My Skills to Nashik Data →'}
            </button>
          </form>
        )}
        
        {submitted && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-lime/5 border border-lime/20 rounded-lg text-[12px] text-lime leading-relaxed"
          >
            Success! {type === 'ind' ? 'Your response is now live.' : 'Your profile has been updated.'}
          </motion.div>
        )}
      </div>

      <div className="p-10 bg-s1">
        <div className="mono-label text-lime mb-2">What you get</div>
        <h2 className="section-h2 text-2xl mb-2">Join Nashik's largest talent network.</h2>
        <p className="text-muted text-[13px] mb-8 leading-relaxed">By sharing your skill gaps, you're not just providing data — you're building your future workforce.</p>
      </div>
    </motion.div>
  );
};
