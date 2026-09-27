'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Legend,
} from 'recharts';

const LEVEL_LABELS: Record<number, string> = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' };

export default function CompetenciesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [domainFilter, setDomainFilter] = useState('All');

  useEffect(() => {
    api.get('/learner/competencies').then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <DashboardLayout title="Competencies" allowedRoles={['LEARNER']}>
        <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-xl)' }} />
      </DashboardLayout>
    );
  }

  const domains = ['All', ...Array.from(new Set(data.competencies.map((c: any) => c.domain)))];
  const filtered = domainFilter === 'All'
    ? data.competencies
    : data.competencies.filter((c: any) => c.domain === domainFilter);

  // Radar per domain
  const domainGroups: Record<string, any[]> = {};
  for (const c of data.competencies) {
    if (!domainGroups[c.domain]) domainGroups[c.domain] = [];
    domainGroups[c.domain].push({
      competency: c.competencyName.length > 15 ? c.competencyName.slice(0, 15) + '..' : c.competencyName,
      score: c.score,
      required: c.requiredLevel * 33.33,
    });
  }

  return (
    <DashboardLayout title="Competency Profile" allowedRoles={['LEARNER']}>
      <div className="animate-fade-in-up">
        {/* Readiness banner */}
        <div style={{
          background: data.overallReadiness >= 80 ? 'linear-gradient(135deg, #059669, #10b981)'
            : data.overallReadiness >= 60 ? 'linear-gradient(135deg, #d97706, #f59e0b)'
            : 'linear-gradient(135deg, #e11d48, #f43f5e)',
          borderRadius: 'var(--radius-xl)', padding: '1.5rem 2rem',
          color: 'white', marginBottom: '1.5rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Overall Readiness</h3>
            <p style={{ opacity: 0.85, fontSize: '0.875rem' }}>
              {data.overallReadiness >= 80 ? 'High Readiness' : data.overallReadiness >= 60 ? 'Moderate Readiness' : 'Low Readiness'}
            </p>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
            {Math.round(data.overallReadiness)}%
          </div>
        </div>

        {/* Radar Charts by Domain */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {Object.entries(domainGroups).map(([domain, items]) => (
            <div key={domain} className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>{domain}</h3>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={items}>
                  <PolarGrid stroke="var(--slate-200)" />
                  <PolarAngleAxis dataKey="competency" tick={{ fontSize: 9, fill: 'var(--slate-600)' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8 }} />
                  <Radar name="Current" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                  <Radar name="Required" dataKey="required" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.05} strokeWidth={1.5} strokeDasharray="4 4" />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {domains.map(d => (
            <button key={d as string} onClick={() => setDomainFilter(d as string)}
              className={`btn ${domainFilter === d ? 'btn-primary' : 'btn-secondary'} btn-sm`}>
              {d as string}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Competency</th>
                <th>Domain</th>
                <th>Score</th>
                <th>Current Level</th>
                <th>Required Level</th>
                <th>Gap</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c: any) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.competencyName}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>{c.domain}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '60px', height: '6px', borderRadius: '3px', background: 'var(--slate-200)',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%', borderRadius: '3px', width: `${c.score}%`,
                          background: c.score >= 71 ? '#10b981' : c.score >= 41 ? '#f59e0b' : '#f43f5e',
                        }} />
                      </div>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{Math.round(c.score)}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-primary">{LEVEL_LABELS[c.currentLevel]}</span></td>
                  <td><span className="badge badge-info">{LEVEL_LABELS[c.requiredLevel] || 'N/A'}</span></td>
                  <td style={{ fontWeight: 700 }}>{c.gap}</td>
                  <td>
                    <span className={`badge ${
                      c.severity === 'Critical' ? 'badge-critical' :
                      c.severity === 'Moderate' ? 'badge-moderate' : 'badge-ready'
                    }`}>
                      {c.severity}
                    </span>
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
