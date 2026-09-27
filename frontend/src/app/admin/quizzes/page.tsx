'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';

export default function TrainerQuizzesPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);

  useEffect(() => {
    api.get('/admin/quizzes').then(res => {
      setQuizzes(res.data.quizzes);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handlePublish = async (quizId: string) => {
    setPublishing(quizId);
    try {
      await api.put(`/admin/quizzes/${quizId}/publish`);
      setQuizzes(prev => prev.map(q => q.id === quizId ? { ...q, published: true } : q));
    } catch (err) { console.error(err); }
    setPublishing(null);
  };

  if (loading) {
    return (
      <DashboardLayout title="Quizzes" allowedRoles={['ADMIN']}>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-xl)' }} />)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Quiz Management" allowedRoles={['ADMIN']}>
      <div className="animate-fade-in-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Your Quizzes ({quizzes.length})</h3>
          <a href="/admin/upload" className="btn btn-primary">📤 Create New</a>
        </div>

        {quizzes.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Quizzes Yet</h3>
            <p style={{ color: 'var(--slate-500)', marginBottom: '1.5rem' }}>
              Upload learning material to auto-generate quizzes
            </p>
            <a href="/admin/upload" className="btn btn-primary">📤 Upload & Generate</a>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Quiz Title</th>
                  <th>Competency</th>
                  <th>Difficulty</th>
                  <th>Questions</th>
                  <th>Attempts</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map(q => (
                  <tr key={q.id}>
                    <td style={{ fontWeight: 600 }}>{q.title}</td>
                    <td><span className="badge badge-primary">{q.competency}</span></td>
                    <td>
                      <span className={`badge ${
                        q.difficulty === 'Easy' ? 'badge-ready' :
                        q.difficulty === 'Hard' ? 'badge-critical' : 'badge-moderate'
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td>{q.questionCount}</td>
                    <td>{q.attemptCount}</td>
                    <td>
                      <span className={`badge ${q.published ? 'badge-ready' : 'badge-moderate'}`}>
                        {q.published ? '✅ Published' : '📝 Draft'}
                      </span>
                    </td>
                    <td>
                      {!q.published && (
                        <button className="btn btn-primary btn-sm"
                          onClick={() => handlePublish(q.id)}
                          disabled={publishing === q.id}>
                          {publishing === q.id ? '...' : 'Publish'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
