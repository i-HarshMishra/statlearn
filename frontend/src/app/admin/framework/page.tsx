'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';

export default function SuperAdminFramework() {
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', domain: 'Statistical Methodology', description: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    api.get('/admin/competencies').then(res => {
      setCompetencies(res.data.competencies);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const handleCreate = async () => {
    if (!form.name || !form.domain) return;
    await api.post('/admin/competencies', form);
    setForm({ name: '', domain: 'Statistical Methodology', description: '' });
    setShowForm(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this competency?')) return;
    await api.delete(`/super-admin/competencies/${id}`);
    loadData();
  };

  const domains = Array.from(new Set(competencies.map(c => c.domain)));

  return (
    <DashboardLayout title="Competency Framework" allowedRoles={['ADMIN']}>
      <div className="animate-fade-in-up">
        <div style={{
          background: 'linear-gradient(135deg, #e11d48, #f43f5e, #fb7185)',
          borderRadius: 'var(--radius-xl)', padding: '1.5rem 2rem',
          color: 'white', marginBottom: '1.5rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
              🏗️ Competency Framework
            </h3>
            <p style={{ opacity: 0.8, fontSize: '0.875rem' }}>
              {competencies.length} competencies across {domains.length} domains
            </p>
          </div>
          <button className="btn" onClick={() => setShowForm(!showForm)}
            style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
            ➕ Add Competency
          </button>
        </div>

        {showForm && (
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>New Competency</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="input-label">Name *</label>
                <input className="input-field" placeholder="e.g., Big Data Analytics"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="input-label">Domain *</label>
                <select className="select-field" value={form.domain}
                  onChange={e => setForm({ ...form, domain: e.target.value })}>
                  <option>Statistical Methodology</option>
                  <option>Technical Skills</option>
                  <option>Digital Literacy</option>
                  <option>Managerial Skills</option>
                  <option>Domain-Specific</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label className="input-label">Description</label>
              <textarea className="input-field" rows={2} placeholder="Brief description..."
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" onClick={handleCreate}>Create</button>
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Grouped by domain */}
        {domains.map(domain => (
          <div key={domain} style={{ marginBottom: '1.5rem' }}>
            <h4 style={{
              fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary-700)',
              textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem',
              paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary-100)',
            }}>
              {domain} ({competencies.filter(c => c.domain === domain).length})
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              {competencies.filter(c => c.domain === domain).map(c => (
                <div key={c.id} className="glass-card" style={{
                  padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.name}</div>
                    {c.description && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.125rem' }}>
                        {c.description}
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleDelete(c.id)}
                    style={{
                      background: 'none', border: 'none', color: '#f43f5e',
                      cursor: 'pointer', fontSize: '0.9rem', padding: '0.25rem',
                    }}>
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
