'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';

export default function DesignationReadinessPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    api.get('/admin/designation-readiness').then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <DashboardLayout title="Designation Readiness" allowedRoles={['ADMIN']}>
        <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-xl)' }} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Designation Readiness" allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <div className="animate-fade-in-up">
        <div style={{
          background: 'linear-gradient(135deg, #d97706, #f59e0b)',
          borderRadius: 'var(--radius-xl)', padding: '1.5rem 2rem',
          color: 'white', marginBottom: '1.5rem',
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
            📈 Designation-wise Readiness Analysis
          </h3>
          <p style={{ opacity: 0.8, fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Compare benchmarks vs actual employee competency levels
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {data.designations.map((d: any) => {
            const avgReadiness = d.employees.length > 0
              ? Math.round(d.employees.reduce((sum: number, e: any) => sum + e.readiness, 0) / d.employees.length)
              : 0;
            const isExpanded = expanded === d.designation;

            return (
              <div key={d.designation} className="glass-card" style={{ padding: '1.5rem', overflow: 'hidden' }}>
                <div
                  onClick={() => setExpanded(isExpanded ? null : d.designation)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    cursor: 'pointer',
                  }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                      {d.designation}
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
                      {d.employees.length} employees • {d.benchmarks.length} benchmarked competencies
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif',
                      color: avgReadiness >= 80 ? '#10b981' : avgReadiness >= 60 ? '#f59e0b' : '#f43f5e',
                    }}>
                      {avgReadiness}%
                    </div>
                    <span style={{ fontSize: '1.25rem', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : '' }}>
                      ▼
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--slate-200)' }}>
                    {/* Benchmarks */}
                    {d.benchmarks.length > 0 && (
                      <div style={{ marginBottom: '1.25rem' }}>
                        <h5 style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary-700)' }}>
                          Required Competencies
                        </h5>
                        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                          {d.benchmarks.map((b: any) => (
                            <span key={b.competency} className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                              {b.competency} (L{b.requiredLevel})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Employees */}
                    <h5 style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                      Employee Readiness
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      {d.employees.map((e: any, i: number) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)',
                          background: 'var(--slate-50)',
                        }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{e.name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                              width: '80px', height: '6px', borderRadius: '3px',
                              background: 'var(--slate-200)', overflow: 'hidden',
                            }}>
                              <div style={{
                                height: '100%', width: `${e.readiness}%`, borderRadius: '3px',
                                background: e.readiness >= 80 ? '#10b981' : e.readiness >= 60 ? '#f59e0b' : '#f43f5e',
                              }} />
                            </div>
                            <span style={{
                              fontSize: '0.8125rem', fontWeight: 700, minWidth: '35px', textAlign: 'right',
                              color: e.readiness >= 80 ? '#10b981' : e.readiness >= 60 ? '#f59e0b' : '#f43f5e',
                            }}>
                              {Math.round(e.readiness)}%
                            </span>
                            {e.criticalGaps > 0 && (
                              <span className="badge badge-critical" style={{ fontSize: '0.65rem' }}>
                                {e.criticalGaps} gaps
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
