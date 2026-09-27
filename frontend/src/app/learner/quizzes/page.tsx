'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import Link from 'next/link';

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/learner/quizzes').then(res => {
      setQuizzes(res.data.quizzes);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Quizzes" allowedRoles={['LEARNER']}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '180px', borderRadius: 'var(--radius-xl)' }} />)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Available Quizzes" allowedRoles={['LEARNER']}>
      <div className="animate-fade-in-up">
        <div style={{
          background: 'linear-gradient(135deg, #4338ca, #6366f1)',
          borderRadius: 'var(--radius-xl)', padding: '1.5rem 2rem',
          color: 'white', marginBottom: '1.5rem',
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
            ✅ Quizzes & Assessments
          </h3>
          <p style={{ opacity: 0.8, fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Test your knowledge and improve your competency scores
          </p>
        </div>

        {quizzes.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              No Quizzes Available
            </h3>
            <p style={{ color: 'var(--slate-500)' }}>
              Trainers haven&apos;t published any quizzes yet. Check back soon!
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {quizzes.map((quiz, i) => (
              <div key={quiz.id} className="glass-card animate-fade-in-up"
                style={{ padding: '1.5rem', opacity: 0, animationDelay: `${i * 0.05}s` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                      {quiz.title}
                    </h4>
                    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                      {quiz.competency && <span className="badge badge-primary">{quiz.competency}</span>}
                      {quiz.difficulty && (
                        <span className={`badge ${
                          quiz.difficulty === 'Easy' ? 'badge-ready' :
                          quiz.difficulty === 'Hard' ? 'badge-critical' : 'badge-moderate'
                        }`}>
                          {quiz.difficulty}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: 'var(--radius-lg)',
                    background: 'var(--primary-50)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
                  }}>
                    📝
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
                  <span>📊 {quiz.questionCount} questions</span>
                  <span>👥 {quiz.totalAttempts} attempts</span>
                </div>

                <Link href={`/learner/quizzes/${quiz.id}`} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  Start Quiz →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
