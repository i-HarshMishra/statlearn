'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';

const DESIGNATIONS = [
  'Statistical Officer', 'Senior Statistical Officer', 'Data Processing Assistant',
  'Field Investigator', 'Deputy Director', 'Director',
];

export default function BenchmarksPage() {
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ designation: DESIGNATIONS[0], competencyId: '', requiredLevel: '2' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [b, c] = await Promise.all([
      api.get('/admin/benchmarks'),
      api.get('/admin/competencies'),
    ]);
    setBenchmarks(b.data.benchmarks);
    setCompetencies(c.data.competencies);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!form.competencyId) return;
    await api.post('/admin/benchmarks', form);
    setShowForm(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this benchmark?')) return;
    await api.delete(`/super-admin/benchmarks/${id}`);
    loadData();
  };

  const LEVEL_LABELS: Record<number, string> = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' };

  return (
    <DashboardLayout title="Benchmarks" allowedRoles={['ADMIN']}>
      <div className="animate-fade-in-up">
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem',
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
            Role Benchmarks ({benchmarks.length})
          </h3>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            ➕ Add Benchmark
          </button>
        </div>

        {showForm && (
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="input-label">Designation</label>
                <select className="select-field" value={form.designation}
                  onChange={e => setForm({ ...form, designation: e.target.value })}>
                  {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Competency</label>
                <select className="select-field" value={form.competencyId}
                  onChange={e => setForm({ ...form, competencyId: e.target.value })}>
                  <option value="">Select...</option>
                  {competencies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Required Level</label>
                <select className="select-field" value={form.requiredLevel}
                  onChange={e => setForm({ ...form, requiredLevel: e.target.value })}>
                  <option value="1">1 — Beginner</option>
                  <option value="2">2 — Intermediate</option>
                  <option value="3">3 — Advanced</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" onClick={handleCreate}>Create</button>
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Designation</th>
                <th>Competency</th>
                <th>Domain</th>
                <th>Required Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {benchmarks.map((b: any) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 600 }}>{b.designation}</td>
                  <td><span className="badge badge-primary">{b.competency.name}</span></td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>{b.competency.domain}</td>
                  <td>
                    <span className={`badge ${b.requiredLevel >= 3 ? 'badge-critical' : b.requiredLevel >= 2 ? 'badge-moderate' : 'badge-ready'}`}>
                      L{b.requiredLevel} — {LEVEL_LABELS[b.requiredLevel]}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(b.id)}
                      style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer' }}>
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
