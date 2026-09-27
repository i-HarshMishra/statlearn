'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', provider: 'iGOT Karmayogi', description: '', level: 'Beginner',
    durationHours: '2', language: 'English', url: '', competencyTags: '',
  });

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    api.get('/admin/courses').then(res => {
      setCourses(res.data.courses);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const handleCreate = async () => {
    if (!form.title || !form.provider) return;
    await api.post('/admin/courses', form);
    setShowForm(false);
    setForm({ title: '', provider: 'iGOT Karmayogi', description: '', level: 'Beginner', durationHours: '2', language: 'English', url: '', competencyTags: '' });
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course?')) return;
    await api.delete(`/super-admin/courses/${id}`);
    loadData();
  };

  return (
    <DashboardLayout title="Course Management" allowedRoles={['ADMIN']}>
      <div className="animate-fade-in-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Courses ({courses.length})</h3>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>➕ Add Course</button>
        </div>

        {showForm && (
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>New Course</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="input-label">Title *</label>
                <input className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="input-label">Provider *</label>
                <select className="select-field" value={form.provider} onChange={e => setForm({ ...form, provider: e.target.value })}>
                  <option>iGOT Karmayogi</option>
                  <option>NSSTA</option>
                  <option>Internal</option>
                  <option>External</option>
                </select>
              </div>
              <div>
                <label className="input-label">Level</label>
                <select className="select-field" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                </select>
              </div>
              <div>
                <label className="input-label">Duration (hours)</label>
                <input className="input-field" type="number" value={form.durationHours} onChange={e => setForm({ ...form, durationHours: e.target.value })} />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label className="input-label">Competency Tags (comma-separated)</label>
              <input className="input-field" placeholder="e.g., Python, Data Visualization" value={form.competencyTags} onChange={e => setForm({ ...form, competencyTags: e.target.value })} />
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
                <th>Title</th>
                <th>Provider</th>
                <th>Level</th>
                <th>Duration</th>
                <th>Tags</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.title}</td>
                  <td>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      background: c.provider.includes('iGOT') ? 'var(--primary-50)' : 'rgba(16,185,129,0.08)',
                      color: c.provider.includes('iGOT') ? 'var(--primary-700)' : '#059669',
                    }}>
                      {c.provider}
                    </span>
                  </td>
                  <td><span className="badge badge-info">{c.level}</span></td>
                  <td>{c.durationHours}h</td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--slate-500)', maxWidth: '200px' }}>
                    {c.competencyTags}
                  </td>
                  <td>
                    <button onClick={() => handleDelete(c.id)}
                      style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer' }}>
                      🗑️
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
