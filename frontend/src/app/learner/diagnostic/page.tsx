'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Question {
  id: string;
  questionText: string;
  options: string[];
  competency: string;
  difficulty: string;
}

export default function DiagnosticPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [designation, setDesignation] = useState('');

  useEffect(() => {
    api.get('/diagnostic/questions').then(res => {
      setQuestions(res.data.questions);
      setDesignation(res.data.designation);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const selectAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.post('/diagnostic/submit', { answers });
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #312e81, #6366f1)',
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{
            width: '48px', height: '48px', border: '3px solid rgba(255,255,255,0.3)',
            borderTopColor: 'white', borderRadius: '50%', margin: '0 auto 1rem',
            animation: 'spin-slow 1s linear infinite',
          }} />
          <p>Preparing your diagnostic assessment...</p>
        </div>
      </div>
    );
  }

  // Results screen
  if (results) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #312e81, #6366f1)',
        padding: '2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: '700px' }}>
          <div className="glass-card" style={{ padding: '2.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎯</div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
                Assessment Complete!
              </h2>
              <p style={{ color: 'var(--slate-500)', marginTop: '0.5rem' }}>
                Your competency profile has been generated
              </p>
            </div>

            {/* Score Summary */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem',
              marginBottom: '2rem',
            }}>
              <div style={{
                textAlign: 'center', padding: '1.25rem', borderRadius: 'var(--radius-lg)',
                background: 'var(--primary-50)',
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                  {results.scorePercent}%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>
                  Quiz Score
                </div>
              </div>
              <div style={{
                textAlign: 'center', padding: '1.25rem', borderRadius: 'var(--radius-lg)',
                background: 'rgba(16,185,129,0.08)',
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--emerald-600)' }}>
                  {results.correctAnswers}/{results.totalQuestions}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>
                  Correct
                </div>
              </div>
              <div style={{
                textAlign: 'center', padding: '1.25rem', borderRadius: 'var(--radius-lg)',
                background: 'rgba(245,158,11,0.08)',
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706' }}>
                  {Math.round(results.overallReadiness)}%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>
                  Readiness
                </div>
              </div>
            </div>

            {/* Skill Gaps Summary */}
            {results.skillGaps && results.skillGaps.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  Identified Skill Gaps
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {results.skillGaps.filter((g: any) => g.gap > 0).slice(0, 8).map((gap: any) => (
                    <div key={gap.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)',
                      background: 'var(--slate-50)',
                    }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                        {gap.competency?.name || 'Unknown'}
                      </span>
                      <span className={`badge ${gap.severity === 'Critical' ? 'badge-critical' : 'badge-moderate'}`}>
                        {gap.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button className="btn btn-primary btn-lg" style={{ width: '100%' }}
              onClick={() => router.push('/learner/dashboard')}>
              📊 Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  if (!currentQ) return null;
  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #312e81, #6366f1)',
      padding: '2rem',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '700px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'white' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
            Diagnostic Assessment
          </h2>
          <p style={{ opacity: 0.7, fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {designation} — Question {currentIdx + 1} of {questions.length}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{
          height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.15)',
          marginBottom: '1.5rem', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: '3px', width: `${progress}%`,
            background: 'linear-gradient(90deg, #34d399, #6366f1)',
            transition: 'width 0.3s ease',
          }} />
        </div>

        {/* Question Card */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          {/* Competency badge */}
          <div style={{ marginBottom: '1rem' }}>
            <span className="badge badge-primary">{currentQ.competency}</span>
            <span className="badge badge-info" style={{ marginLeft: '0.5rem' }}>{currentQ.difficulty}</span>
          </div>

          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', lineHeight: 1.5 }}>
            {currentQ.questionText}
          </h3>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {currentQ.options.map((option: string, i: number) => {
              const isSelected = answers[currentQ.id] === option;
              return (
                <button key={i} type="button" onClick={() => selectAnswer(currentQ.id, option)}
                  style={{
                    textAlign: 'left', padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                    border: isSelected ? '2px solid var(--primary-500)' : '2px solid var(--slate-200)',
                    background: isSelected ? 'var(--primary-50)' : 'white',
                    color: isSelected ? 'var(--primary-800)' : 'var(--slate-700)',
                    fontWeight: isSelected ? 600 : 400,
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                  }}>
                  <span style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    border: isSelected ? '2px solid var(--primary-500)' : '2px solid var(--slate-300)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                    background: isSelected ? 'var(--primary-500)' : 'transparent',
                    color: isSelected ? 'white' : 'var(--slate-400)',
                  }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', marginTop: '2rem',
            paddingTop: '1.5rem', borderTop: '1px solid var(--slate-200)',
          }}>
            <button className="btn btn-secondary"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(currentIdx - 1)}>
              ← Previous
            </button>

            {currentIdx < questions.length - 1 ? (
              <button className="btn btn-primary"
                disabled={!answers[currentQ.id]}
                onClick={() => setCurrentIdx(currentIdx + 1)}>
                Next →
              </button>
            ) : (
              <button className="btn btn-success btn-lg"
                disabled={submitting || Object.keys(answers).length < questions.length}
                onClick={handleSubmit}>
                {submitting ? 'Submitting...' : `✅ Submit (${Object.keys(answers).length}/${questions.length})`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
