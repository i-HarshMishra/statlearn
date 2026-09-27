'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/materials').then(res => {
      setMaterials(res.data.materials);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Materials" allowedRoles={['ADMIN']}>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-xl)' }} />)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Learning Materials" allowedRoles={['ADMIN']}>
      <div className="animate-fade-in-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
            Your Uploaded Materials ({materials.length})
          </h3>
          <a href="/admin/upload" className="btn btn-primary">📤 Upload New</a>
        </div>

        {materials.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Materials Yet</h3>
            <p style={{ color: 'var(--slate-500)', marginBottom: '1.5rem' }}>
              Upload your first learning material to get started
            </p>
            <a href="/admin/upload" className="btn btn-primary">📤 Upload Material</a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {materials.map((m: any) => (
              <div key={m.id} className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.375rem' }}>{m.title}</h4>
                    <p style={{
                      fontSize: '0.8125rem', color: 'var(--slate-500)',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any,
                      lineHeight: 1.5, marginBottom: '0.75rem',
                    }}>
                      {m.content.slice(0, 200)}...
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className="badge badge-primary">{m.contentType}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                        {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                      {m.quizzes.length}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>Quizzes</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
