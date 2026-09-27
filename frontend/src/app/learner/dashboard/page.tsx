'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  PieChart, Pie, Legend,
} from 'recharts';

const LEVEL_LABELS: Record<number, string> = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' };
const SEVERITY_COLORS: Record<string, string> = {
  'Critical': '#f43f5e', 'Moderate': '#f59e0b', 'No Gap': '#10b981',
};

export default function LearnerDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/learner/dashboard').then(res => {
      setData(res.data);
      if (res.data.needsOnboarding) router.push('/learner/onboarding');
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [router]);

  if (loading || !data) {
    return (
      <DashboardLayout title="Dashboard" allowedRoles={['LEARNER']}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-xl)' }} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {[1,2].map(i => <div key={i} className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-xl)' }} />)}
        </div>
      </DashboardLayout>
    );
  }

  if (data.needsDiagnostic) {
    return (
      <DashboardLayout title="Dashboard" allowedRoles={['LEARNER']}>
        <div className="animate-fade-in-up" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Complete Your Diagnostic Assessment
          </h2>
          <p style={{ color: 'var(--slate-500)', maxWidth: '500px', margin: '0 auto 2rem' }}>
            Take a quick assessment to evaluate your current competency levels and receive personalized recommendations.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => router.push('/learner/diagnostic')}>
            🚀 Start Assessment
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const { stats, competencyScores, skillGaps, radarData, recommendations, recentQuizzes, profile } = data;
  const readinessColor = stats.overallReadiness >= 80 ? '#10b981' : stats.overallReadiness >= 60 ? '#f59e0b' : '#f43f5e';

  // Prepare radar chart data
  const radarChartData = competencyScores.slice(0, 10).map((cs: any) => ({
    competency: cs.competencyName.length > 12 ? cs.competencyName.slice(0, 12) + '...' : cs.competencyName,
    score: cs.score,
    fullMark: 100,
  }));

  // Gap distribution for pie chart
  const gapPieData = [
    { name: 'Critical', value: stats.criticalGaps, fill: '#f43f5e' },
    { name: 'Moderate', value: stats.moderateGaps, fill: '#f59e0b' },
    { name: 'Ready', value: stats.readyCount, fill: '#10b981' },
  ].filter(d => d.value > 0);

  // Score bar chart
  const scoreBarData = competencyScores.slice(0, 8).map((cs: any) => ({
    name: cs.competencyName.length > 10 ? cs.competencyName.slice(0, 10) + '..' : cs.competencyName,
    score: Math.round(cs.score),
    level: cs.currentLevel,
  }));

  return (
    <DashboardLayout title="Dashboard" allowedRoles={['LEARNER']}>
      <div className="animate-fade-in-up">
        {/* Welcome Card */}
        <div style={{
          background: 'linear-gradient(135deg, #4338ca, #6366f1, #818cf8)',
          borderRadius: 'var(--radius-2xl)', padding: '2rem 2.5rem',
          color: 'white', marginBottom: '1.5rem',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-20%', right: '-5%',
            width: '200px', height: '200px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', marginBottom: '0.25rem' }}>
                Welcome back, {profile.fullName} 👋
              </h2>
              <p style={{ opacity: 0.85 }}>
                {profile.designation} — {profile.department}
              </p>
            </div>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              border: `4px solid ${readinessColor}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', background: 'rgba(255,255,255,0.15)',
            }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{Math.round(stats.overallReadiness)}%</span>
              <span style={{ fontSize: '0.6rem', fontWeight: 600, opacity: 0.8 }}>Readiness</span>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Readiness Score', value: `${Math.round(stats.overallReadiness)}%`, color: 'primary', icon: '🎯' },
            { label: 'Critical Gaps', value: stats.criticalGaps, color: 'danger', icon: '🔴' },
            { label: 'Courses Completed', value: stats.completedCourses, color: 'success', icon: '📚' },
            { label: 'Learning Hours', value: `${Math.round(stats.totalLearningHours)}h`, color: 'warning', icon: '⏱️' },
          ].map((stat, i) => (
            <div key={stat.label} className={`stat-card ${stat.color} animate-fade-in-up stagger-${i + 1}`}
              style={{ opacity: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', fontWeight: 500, marginBottom: '0.25rem' }}>
                    {stat.label}
                  </p>
                  <p style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
                    {stat.value}
                  </p>
                </div>
                <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Radar Chart */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Competency Radar
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarChartData}>
                <PolarGrid stroke="var(--slate-200)" />
                <PolarAngleAxis dataKey="competency" tick={{ fontSize: 10, fill: 'var(--slate-600)' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Gap Distribution */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Skill Gap Distribution
            </h3>
            {gapPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={gapPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                    dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {gapPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate-400)' }}>
                No gaps identified
              </div>
            )}
          </div>
        </div>

        {/* Competency Scores Bar Chart */}
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Competency Scores
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={scoreBarData} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
              <Tooltip formatter={(val: number) => [`${val}/100`, 'Score']} />
              <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                {scoreBarData.map((entry: any, i: number) => (
                  <Cell key={i} fill={entry.score >= 71 ? '#10b981' : entry.score >= 41 ? '#f59e0b' : '#f43f5e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Row: Recommendations + Recent Quizzes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Recommended Courses */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recommended Courses</h3>
              <a href="/learner/recommendations" className="btn btn-ghost btn-sm" style={{ fontSize: '0.8rem' }}>
                View All →
              </a>
            </div>
            {recommendations.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {recommendations.slice(0, 4).map((course: any) => (
                  <div key={course.id} style={{
                    padding: '0.75rem', borderRadius: 'var(--radius-md)',
                    background: 'var(--slate-50)', border: '1px solid var(--slate-100)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.125rem' }}>
                        {course.title}
                      </div>
                      <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '0.7rem', fontWeight: 600,
                          color: course.provider.includes('iGOT') ? 'var(--primary-700)' : '#059669',
                        }}>
                          {course.provider}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--slate-400)' }}>•</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>{course.level}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--slate-400)' }}>•</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>{course.durationHours}h</span>
                      </div>
                    </div>
                    <span className={`badge ${course.gapSeverity === 'Critical' ? 'badge-critical' : 'badge-moderate'}`}
                      style={{ fontSize: '0.65rem', flexShrink: 0 }}>
                      {course.matchedCompetency}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--slate-400)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>
                No recommendations yet
              </p>
            )}
          </div>

          {/* Recent Quiz Attempts */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
              Recent Quiz Attempts
            </h3>
            {recentQuizzes.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {recentQuizzes.map((qa: any) => (
                  <div key={qa.id} style={{
                    padding: '0.75rem', borderRadius: 'var(--radius-md)',
                    background: 'var(--slate-50)', display: 'flex',
                    justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{qa.quizTitle}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>
                        {qa.correctAnswers}/{qa.totalQuestions} correct
                      </div>
                    </div>
                    <div style={{
                      fontSize: '1rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif',
                      color: qa.score >= 70 ? '#10b981' : qa.score >= 50 ? '#f59e0b' : '#f43f5e',
                    }}>
                      {qa.score}%
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--slate-400)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>
                No quiz attempts yet. <a href="/learner/quizzes" style={{ color: 'var(--primary-600)' }}>Browse quizzes</a>
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
