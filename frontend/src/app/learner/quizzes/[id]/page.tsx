'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';

interface Question {
  id: string;
  questionText: string;
  options: string[];
  difficulty?: string;
  competency?: string;
  bloomsLevel?: string;
}

export default function QuizAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    api.get(`/learner/quizzes/${quizId}`).then(res => {
      setQuiz(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [quizId]);

  const selectAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.post(`/learner/quizzes/${quizId}/attempt`, { answers });
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !quiz) {
    return (
      <DashboardLayout title="Quiz" allowedRoles={['LEARNER']}>
        <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-xl)' }} />
      </DashboardLayout>
    );
  }

  // Results screen
  if (results) {
    return (
      <DashboardLayout title="Quiz Results" allowedRoles={['LEARNER']}>
        <div className="animate-fade-in-up" style={{ maxWidth: '750px', margin: '0 auto' }}>
          {/* Score Card */}
          <div className="glass-card" style={{ padding: '2.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
              {results.score >= 80 ? '🏆' : results.score >= 60 ? '👏' : results.score >= 40 ? '📖' : '💪'}
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', marginBottom: '0.5rem' }}>
              {results.score >= 80 ? 'Excellent!' : results.score >= 60 ? 'Good Job!' : results.score >= 40 ? 'Keep Learning!' : 'Needs Improvement'}
            </h2>
            <div style={{
              display: 'inline-flex', gap: '2rem', padding: '1rem 2rem',
              borderRadius: 'var(--radius-xl)', background: 'var(--slate-50)',
              margin: '1rem 0',
            }}>
              <div>
                <div style={{
                  fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif',
                  color: results.score >= 70 ? '#10b981' : results.score >= 50 ? '#f59e0b' : '#f43f5e',
                }}>
                  {results.score}%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Score</div>
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'var(--primary-700)' }}>
                  {results.correctAnswers}/{results.totalQuestions}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Correct</div>
              </div>
            </div>
          </div>

          {/* Answer Review */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Answer Review
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {results.results.map((r: any, i: number) => (
                <div key={r.questionId} style={{
                  padding: '1.25rem', borderRadius: 'var(--radius-lg)',
                  background: r.isCorrect ? 'rgba(16,185,129,0.05)' : 'rgba(244,63,94,0.05)',
                  border: `1px solid ${r.isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}`,
                }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <span style={{
                      width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                      background: r.isCorrect ? '#10b981' : '#f43f5e', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 700, marginTop: '2px',
                    }}>
                      {r.isCorrect ? '✓' : '✗'}
                    </span>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        Q{i + 1}. {r.questionText}
                      </p>
                      <div style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                        <span style={{ color: 'var(--slate-500)' }}>Your answer: </span>
                        <span style={{
                          fontWeight: 600,
                          color: r.isCorrect ? '#10b981' : '#f43f5e',
                        }}>
                          {r.userAnswer || 'Not answered'}
                        </span>
                      </div>
                      {!r.isCorrect && (
                        <div style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                          <span style={{ color: 'var(--slate-500)' }}>Correct answer: </span>
                          <span style={{ fontWeight: 600, color: '#10b981' }}>{r.correctAnswer}</span>
                        </div>
                      )}
                      {r.explanation && (
                        <div style={{
                          marginTop: '0.5rem', padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-sm)', background: 'rgba(99,102,241,0.05)',
                          border: '1px solid rgba(99,102,241,0.1)', fontSize: '0.8rem',
                          color: 'var(--slate-600)',
                        }}>
                          💡 {r.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button className="btn btn-primary" onClick={() => router.push('/learner/quizzes')}>
                ← Back to Quizzes
              </button>
              <button className="btn btn-secondary" onClick={() => router.push('/learner/dashboard')}>
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Quiz taking screen
  const currentQ = quiz.questions[currentIdx] as Question;
  if (!currentQ) return null;
  const progress = ((currentIdx + 1) / quiz.questions.length) * 100;

  return (
    <DashboardLayout title={quiz.title} allowedRoles={['LEARNER']}>
      <div className="animate-fade-in" style={{ maxWidth: '750px', margin: '0 auto' }}>
        {/* Progress */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-600)' }}>
              Question {currentIdx + 1} of {quiz.questions.length}
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
              {Object.keys(answers).length} answered
            </span>
          </div>
          <div style={{
            height: '8px', borderRadius: '4px', background: 'var(--slate-200)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: '4px', width: `${progress}%`,
              background: 'linear-gradient(90deg, #6366f1, #34d399)',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* Question Card */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {currentQ.competency && <span className="badge badge-primary">{currentQ.competency}</span>}
            {currentQ.difficulty && <span className="badge badge-info">{currentQ.difficulty}</span>}
            {currentQ.bloomsLevel && (
              <span className="badge" style={{
                background: 'rgba(139,92,246,0.1)', color: '#7c3aed',
                border: '1px solid rgba(139,92,246,0.2)',
              }}>
                {currentQ.bloomsLevel}
              </span>
            )}
          </div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', lineHeight: 1.5 }}>
            {currentQ.questionText}
          </h3>

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
                    fontWeight: isSelected ? 600 : 400, fontSize: '0.9rem',
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

          <div style={{
            display: 'flex', justifyContent: 'space-between', marginTop: '2rem',
            paddingTop: '1.5rem', borderTop: '1px solid var(--slate-200)',
          }}>
            <button className="btn btn-secondary"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(currentIdx - 1)}>
              ← Previous
            </button>
            {currentIdx < quiz.questions.length - 1 ? (
              <button className="btn btn-primary"
                disabled={!answers[currentQ.id]}
                onClick={() => setCurrentIdx(currentIdx + 1)}>
                Next →
              </button>
            ) : (
              <button className="btn btn-success btn-lg"
                disabled={submitting || Object.keys(answers).length < quiz.questions.length}
                onClick={handleSubmit}>
                {submitting ? 'Submitting...' : `✅ Submit Quiz`}
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
