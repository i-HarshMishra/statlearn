'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';

const COMPETENCIES = [
  'Survey Design', 'Sampling', 'National Accounts', 'Price Statistics',
  'Labour Statistics', 'Data Quality Frameworks', 'Python', 'R', 'SQL',
  'Data Visualization', 'AI/ML', 'GIS', 'Cybersecurity', 'Data Privacy',
  'Leadership', 'Communication', 'Project Management',
];

const LEVEL_LABELS: Record<number, string> = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' };

export default function TalentSearchPage() {
  const [competency, setCompetency] = useState('');
  const [level, setLevel] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'score', direction: 'desc' });

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (competency) params.set('competency', competency);
      if (level) params.set('level', level);
      const res = await api.get(`/admin/talent-search?${params.toString()}`);
      setResults(res.data.results);
      setSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedResults = [...results].sort((a, b) => {
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return ' ↕';
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <DashboardLayout title="Talent Search" allowedRoles={['ADMIN']}>
      <div className="animate-fade-in-up">
        <div style={{
          background: 'linear-gradient(135deg, #6366f1, #818cf8)',
          borderRadius: 'var(--radius-xl)', padding: '1.5rem 2rem',
          color: 'white', marginBottom: '1.5rem',
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
            🔍 Talent Search
          </h3>
          <p style={{ opacity: 0.8, fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Find employees by competency and skill level
          </p>
        </div>

        {/* Search Form */}
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label className="input-label">Competency</label>
              <select className="select-field" value={competency}
                onChange={e => setCompetency(e.target.value)}>
                <option value="">All Competencies</option>
                {COMPETENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ width: '200px' }}>
              <label className="input-label">Skill Level</label>
              <select className="select-field" value={level}
                onChange={e => setLevel(e.target.value)}>
                <option value="">All Levels</option>
                <option value="1">1 — Beginner</option>
                <option value="2">2 — Intermediate</option>
                <option value="3">3 — Advanced</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
              {loading ? '...' : '🔍 Search'}
            </button>
          </div>
        </div>

        {/* Results */}
        {searched && (
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--slate-200)' }}>
              <h4 style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                {results.length} employees found
              </h4>
            </div>
            {results.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>Name{getSortIcon('name')}</th>
                    <th onClick={() => handleSort('designation')} style={{ cursor: 'pointer' }}>Designation{getSortIcon('designation')}</th>
                    <th onClick={() => handleSort('department')} style={{ cursor: 'pointer' }}>Department{getSortIcon('department')}</th>
                    <th onClick={() => handleSort('competency')} style={{ cursor: 'pointer' }}>Competency{getSortIcon('competency')}</th>
                    <th onClick={() => handleSort('score')} style={{ cursor: 'pointer' }}>Score{getSortIcon('score')}</th>
                    <th onClick={() => handleSort('level')} style={{ cursor: 'pointer' }}>Level{getSortIcon('level')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{r.name}</td>
                      <td style={{ fontSize: '0.8125rem' }}>{r.designation}</td>
                      <td style={{ fontSize: '0.8125rem' }}>{r.department}</td>
                      <td><span className="badge badge-primary">{r.competency}</span></td>
                      <td style={{ fontWeight: 700 }}>{Math.round(r.score)}</td>
                      <td>
                        <span className={`badge ${r.level >= 3 ? 'badge-ready' : r.level >= 2 ? 'badge-moderate' : 'badge-critical'}`}>
                          {LEVEL_LABELS[r.level]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: 'var(--slate-400)', textAlign: 'center', padding: '2rem' }}>
                No employees match the criteria
              </p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
