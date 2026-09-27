'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const DESIGNATIONS = [
  'Statistical Officer', 'Senior Statistical Officer', 'Data Processing Assistant',
  'Field Investigator', 'Deputy Director', 'Director',
];

const DEPARTMENTS = [
  'National Statistical Office', 'Price Statistics Division', 'Labour Statistics Division',
  'National Accounts Division', 'Agricultural Statistics Division', 'Data Processing Division',
];

const LOCATIONS = ['Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Bengaluru', 'Lucknow', 'Patna', 'Jaipur'];

const SKILL_CATEGORIES = [
  {
    domain: 'Statistical',
    skills: ['Survey Design', 'Sampling', 'National Accounts', 'Price Statistics', 'Labour Statistics', 'Data Quality Frameworks'],
  },
  {
    domain: 'Technical',
    skills: ['Python', 'R', 'SQL', 'Data Visualization', 'AI/ML', 'GIS'],
  },
  {
    domain: 'Digital & Managerial',
    skills: ['Cybersecurity', 'Data Privacy', 'Leadership', 'Communication', 'Project Management'],
  },
];

const STEPS = ['Personal Info', 'Professional Details', 'Skill Self-Assessment'];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    fullName: '', employeeCode: '', designation: DESIGNATIONS[0],
    department: DEPARTMENTS[0], currentAssignment: '', education: '',
    experienceYears: '', location: LOCATIONS[0], preferredLanguage: 'English',
    previousTrainings: '',
  });

  const [skillRatings, setSkillRatings] = useState<Record<string, number>>({});

  const updateForm = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const updateRating = (skill: string, rating: number) => {
    setSkillRatings(prev => ({ ...prev, [skill]: rating }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/learner/onboarding', { ...form, skillRatings });
      router.push('/learner/diagnostic');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Onboarding failed');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 0) return form.fullName && form.designation && form.department;
    if (step === 1) return form.experienceYears;
    return true;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #312e81 0%, #4338ca 30%, #6366f1 60%, #818cf8 100%)',
      padding: '2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: '700px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', color: 'white' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
            Welcome to StatLearn<span style={{ color: '#34d399' }}>AI</span>
          </h1>
          <p style={{ opacity: 0.8, marginTop: '0.5rem' }}>
            Let&apos;s set up your competency profile
          </p>
        </div>

        {/* Step indicator */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '0.5rem',
          marginBottom: '2rem',
        }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700,
                background: i <= step ? 'white' : 'rgba(255,255,255,0.15)',
                color: i <= step ? 'var(--primary-700)' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.3s',
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              <span style={{
                color: i <= step ? 'white' : 'rgba(255,255,255,0.4)',
                fontSize: '0.8125rem', fontWeight: 500,
                display: i === STEPS.length - 1 ? 'inline' : undefined,
              }}>
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div style={{
                  width: '40px', height: '2px',
                  background: i < step ? 'white' : 'rgba(255,255,255,0.2)',
                  margin: '0 0.25rem',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          {error && (
            <div style={{
              background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
              borderRadius: 'var(--radius-lg)', padding: '0.75rem', marginBottom: '1rem',
              color: '#e11d48', fontSize: '0.875rem',
            }}>
              {error}
            </div>
          )}

          {/* Step 0: Personal Info */}
          {step === 0 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Personal Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="input-label">Full Name *</label>
                  <input className="input-field" placeholder="Enter your full name"
                    value={form.fullName} onChange={e => updateForm('fullName', e.target.value)} />
                </div>
                <div>
                  <label className="input-label">Employee ID</label>
                  <input className="input-field" placeholder="e.g., EMP001"
                    value={form.employeeCode} onChange={e => updateForm('employeeCode', e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="input-label">Designation *</label>
                  <select className="select-field" value={form.designation}
                    onChange={e => updateForm('designation', e.target.value)}>
                    {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Department *</label>
                  <select className="select-field" value={form.department}
                    onChange={e => updateForm('department', e.target.value)}>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="input-label">Education Qualification</label>
                <input className="input-field" placeholder="e.g., M.Sc. Statistics"
                  value={form.education} onChange={e => updateForm('education', e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 1: Professional Details */}
          {step === 1 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Professional Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="input-label">Years of Experience *</label>
                  <input className="input-field" type="number" placeholder="e.g., 5" min="0"
                    value={form.experienceYears} onChange={e => updateForm('experienceYears', e.target.value)} />
                </div>
                <div>
                  <label className="input-label">Location</label>
                  <select className="select-field" value={form.location}
                    onChange={e => updateForm('location', e.target.value)}>
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="input-label">Current Assignment</label>
                <input className="input-field" placeholder="e.g., Census Operations - Delhi"
                  value={form.currentAssignment} onChange={e => updateForm('currentAssignment', e.target.value)} />
              </div>
              <div>
                <label className="input-label">Preferred Language</label>
                <select className="select-field" value={form.preferredLanguage}
                  onChange={e => updateForm('preferredLanguage', e.target.value)}>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>
              <div>
                <label className="input-label">Previous Trainings / Certifications</label>
                <textarea className="input-field" rows={3}
                  placeholder="e.g., NSSTA Basic Statistics, iGOT Data Analytics, Python Certification..."
                  value={form.previousTrainings} onChange={e => updateForm('previousTrainings', e.target.value)}
                  style={{ resize: 'vertical' }} />
              </div>
            </div>
          )}

          {/* Step 2: Self-Assessment */}
          {step === 2 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Skill Self-Assessment
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
                  Rate your proficiency from 1 (Beginner) to 5 (Expert)
                </p>
              </div>

              {SKILL_CATEGORIES.map(cat => (
                <div key={cat.domain}>
                  <h4 style={{
                    fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary-700)',
                    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem',
                    paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary-100)',
                  }}>
                    {cat.domain}
                  </h4>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {cat.skills.map(skill => (
                      <div key={skill} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)',
                        background: 'var(--slate-50)',
                      }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{skill}</span>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          {[1, 2, 3, 4, 5].map(n => (
                            <button key={n} type="button" onClick={() => updateRating(skill, n)}
                              style={{
                                width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
                                border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
                                background: (skillRatings[skill] || 0) >= n
                                  ? 'var(--primary-600)' : 'var(--slate-200)',
                                color: (skillRatings[skill] || 0) >= n
                                  ? 'white' : 'var(--slate-500)',
                                transition: 'all 0.15s',
                              }}>
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', marginTop: '2rem',
            paddingTop: '1.5rem', borderTop: '1px solid var(--slate-200)',
          }}>
            {step > 0 ? (
              <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>
                ← Back
              </button>
            ) : <div />}

            {step < STEPS.length - 1 ? (
              <button className="btn btn-primary" onClick={() => setStep(step + 1)}
                disabled={!canProceed()}>
                Continue →
              </button>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={handleSubmit}
                disabled={loading}>
                {loading ? 'Saving...' : '🚀 Start Diagnostic Assessment'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
