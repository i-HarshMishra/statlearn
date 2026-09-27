'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';

export default function NSSTAAdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [ingesting, setIngesting] = useState(false);
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [progRes, compRes] = await Promise.all([
        api.get('/admin/nssta/programmes'),
        api.get('/admin/competencies')
      ]);
      setProgrammes(progRes.data);
      setCompetencies(compRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleIngest = async () => {
    if (!file) return;
    setIngesting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      await api.post('/admin/nssta/ingest', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setFile(null);
      await fetchData();
      alert('NSSTA calendar ingested successfully!');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to ingest NSSTA calendar');
    } finally {
      setIngesting(false);
    }
  };

  const updateCompetency = async (id: string, tags: string) => {
    try {
      await api.put(`/admin/nssta/programmes/${id}`, { competencyTags: tags });
      // Update local state
      setProgrammes(programmes.map(p => p.id === id ? { ...p, competencyTags: tags } : p));
    } catch (err) {
      console.error(err);
      alert('Failed to update competency mapping');
    }
  };

  return (
    <DashboardLayout title="NSSTA TPAC Integration" allowedRoles={['ADMIN']}>
      <div className="animate-fade-in-up">
        
        <div style={{
          background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
          borderRadius: 'var(--radius-xl)', padding: '1.5rem 2rem',
          color: 'white', marginBottom: '2rem',
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
            🏛️ NSSTA Training Calendar Ingestion
          </h3>
          <p style={{ opacity: 0.9, fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Upload the official NSSTA TPAC PDF calendar to auto-extract training programmes and make them available for learner recommendations.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h4 style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--slate-800)' }}>Upload Calendar PDF</h4>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input 
              type="file" 
              accept=".pdf" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="input-field"
              style={{ maxWidth: '400px' }}
            />
            <button 
              className="btn btn-primary"
              onClick={handleIngest}
              disabled={!file || ingesting}
            >
              {ingesting ? 'Ingesting...' : 'Ingest Calendar'}
            </button>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h4 style={{ fontWeight: 600, color: 'var(--slate-800)' }}>Ingested Training Programmes ({programmes.length})</h4>
            <button className="btn btn-outline" onClick={fetchData}>Refresh</button>
          </div>

          {loading ? (
            <p style={{ color: 'var(--slate-500)' }}>Loading programmes...</p>
          ) : programmes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--slate-500)' }}>
              No programmes ingested yet. Upload a calendar to begin.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--slate-200)', textAlign: 'left', color: 'var(--slate-500)', fontSize: '0.875rem' }}>
                    <th style={{ padding: '1rem' }}>Title</th>
                    <th style={{ padding: '1rem' }}>Duration / Batch</th>
                    <th style={{ padding: '1rem' }}>Target Audience</th>
                    <th style={{ padding: '1rem' }}>Map Competency</th>
                  </tr>
                </thead>
                <tbody>
                  {programmes.map((prog) => (
                    <tr key={prog.id} style={{ borderBottom: '1px solid var(--slate-100)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 500, color: 'var(--slate-800)' }}>{prog.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                          Venue: {prog.venue || 'N/A'} • {prog.weekOrDate || 'N/A'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--slate-600)' }}>
                        {prog.durationDays ? \`\${prog.durationDays} days\` : 'N/A'} 
                        <br/>
                        <span style={{ fontSize: '0.8rem' }}>Batch: {prog.batchSize || 'N/A'}</span>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--slate-600)' }}>{prog.targetAudience || 'Any'}</td>
                      <td style={{ padding: '1rem' }}>
                        <select 
                          className="select-field"
                          style={{ width: '100%', fontSize: '0.875rem', padding: '0.5rem' }}
                          value={prog.competencyTags || ''}
                          onChange={(e) => updateCompetency(prog.id, e.target.value)}
                        >
                          <option value="">-- Select Competency --</option>
                          {competencies.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
