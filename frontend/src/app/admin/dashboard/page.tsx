'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <DashboardLayout title="Admin Dashboard" allowedRoles={['ADMIN']}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr) repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-xl)' }} />)}
        </div>
      </DashboardLayout>
    );
  }

  const { stats, designationReadiness, departmentReadiness, criticalGapsByComp, domainDistribution, futureSkillsForecast } = data;
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#14b8a6'];

  return (
    <DashboardLayout title="Workforce Intelligence" allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <div className="animate-fade-in-up">
        {/* Welcome Card */}
        <div style={{
          background: 'linear-gradient(135deg, #d97706, #f59e0b, #fbbf24)',
          borderRadius: 'var(--radius-2xl)', padding: '2rem 2.5rem',
          color: 'white', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-20%', right: '-5%',
            width: '200px', height: '200px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', marginBottom: '0.25rem' }}>
                Workforce Intelligence Dashboard 📈
              </h2>
              <p style={{ opacity: 0.85 }}>Organization-wide competency analytics and readiness metrics</p>
            </div>
            <button
              onClick={() => window.print()}
              style={{
                background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)',
                padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.875rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', backdropFilter: 'blur(10px)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Report (PDF)
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Employees', value: stats.totalEmployees, icon: '👥', color: 'primary' },
            { label: 'Avg Readiness', value: `${stats.avgReadiness}%`, icon: '🎯', color: 'success' },
            { label: 'Critical Gaps', value: stats.criticalGaps, icon: '⚠️', color: 'danger' },
            { label: 'Trainings Done', value: stats.completedTrainings, icon: '📚', color: 'warning' },
            { label: 'High Readiness', value: stats.highReadiness, icon: '✅', color: 'success' },
            { label: 'Low Readiness', value: stats.lowReadiness, icon: '🔻', color: 'danger' },
          ].map((stat, i) => (
            <div key={stat.label} className={`stat-card ${stat.color} animate-fade-in-up stagger-${i + 1}`} style={{ opacity: 0 }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--slate-500)', fontWeight: 600, marginBottom: '0.25rem' }}>{stat.label}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* System Administration Quick Actions */}
        <div className="hide-on-print" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Competency Framework', href: '/admin/framework', icon: '🏗️', desc: `${stats.totalCompetencies || 0} total competencies` },
            { label: 'Role Benchmarks', href: '/admin/benchmarks', icon: '📏', desc: `${stats.totalBenchmarks || 0} active benchmarks` },
            { label: 'Course Catalog', href: '/admin/courses', icon: '📚', desc: `${stats.totalCourses || 0} external courses` },
            { label: 'User Management', href: '/admin/users', icon: '👥', desc: `${stats.totalUsers || 0} registered users` },
          ].map((action, i) => (
            <a key={action.href} href={action.href} className={`glass-card animate-fade-in-up stagger-${i + 1}`} style={{
              padding: '1.25rem', textDecoration: 'none', textAlign: 'center', transition: 'all 0.2s', opacity: 0
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{action.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.125rem' }}>{action.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{action.desc}</div>
            </a>
          ))}
        </div>

        {/* ── Future Skills Forecast (AI Predictive Analytics) ────────── */}
        {futureSkillsForecast && futureSkillsForecast.length > 0 && (
          <div className="glass-card animate-fade-in-up" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                  🔮 Future Skills Forecast
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', margin: '0.125rem 0 0' }}>
                  AI-predicted emerging skills needed over the next 2 years
                </p>
              </div>
              <span style={{
                fontSize: '0.65rem', fontWeight: 600,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white', padding: '0.25rem 0.75rem', borderRadius: '999px',
              }}>
                AI-Powered
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {futureSkillsForecast.map((item: any, idx: number) => {
                const colors = [
                  { bg: 'rgba(99, 102, 241, 0.08)', border: 'rgba(99, 102, 241, 0.25)', accent: '#6366f1' },
                  { bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.25)', accent: '#10b981' },
                  { bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.25)', accent: '#f59e0b' },
                ];
                const c = colors[idx % 3];
                return (
                  <div key={idx} style={{
                    background: c.bg,
                    border: `1px solid ${c.border}`,
                    borderRadius: 'var(--radius-xl)',
                    padding: '1.25rem',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{
                        background: c.accent, color: 'white', width: '24px', height: '24px',
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 800, flexShrink: 0,
                      }}>
                        {idx + 1}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{item.skill}</span>
                    </div>
                    <p style={{ fontSize: '0.775rem', color: 'var(--slate-500)', lineHeight: 1.5, margin: 0 }}>
                      {item.rationale}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Charts Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Designation Readiness */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Designation-wise Readiness</h3>
            {designationReadiness.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={designationReadiness} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="designation" tick={{ fontSize: 10 }} width={120} />
                  <Tooltip formatter={(v: number) => [`${v}%`, 'Avg Readiness']} />
                  <Bar dataKey="avgReadiness" radius={[0, 6, 6, 0]}>
                    {designationReadiness.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <p style={{ color: 'var(--slate-400)', textAlign: 'center', padding: '2rem' }}>No data</p>}
          </div>

          {/* Department Readiness */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Department-wise Readiness</h3>
            {departmentReadiness.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={departmentReadiness} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="department" tick={{ fontSize: 9 }} width={130} />
                  <Tooltip formatter={(v: number) => [`${v}%`, 'Avg Readiness']} />
                  <Bar dataKey="avgReadiness" radius={[0, 6, 6, 0]}>
                    {departmentReadiness.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <p style={{ color: 'var(--slate-400)', textAlign: 'center', padding: '2rem' }}>No data</p>}
          </div>
        </div>

        {/* Charts Row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Critical Gaps by Competency */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Critical Gaps by Competency</h3>
            {criticalGapsByComp.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={criticalGapsByComp.slice(0, 8)} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="competency" tick={{ fontSize: 10 }} width={100} />
                  <Tooltip formatter={(v: number) => [v, 'Employees']} />
                  <Bar dataKey="count" fill="#f43f5e" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p style={{ color: 'var(--slate-400)', textAlign: 'center', padding: '2rem' }}>No critical gaps</p>}
          </div>

          {/* Domain Distribution */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Domain Competency Scores</h3>
            {domainDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={domainDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                    dataKey="avgScore" nameKey="domain" label={({ domain, avgScore }) => `${domain}: ${avgScore}`}>
                    {domainDistribution.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p style={{ color: 'var(--slate-400)', textAlign: 'center', padding: '2rem' }}>No data</p>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

