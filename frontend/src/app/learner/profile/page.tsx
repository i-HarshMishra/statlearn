'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/learner/profile').then(res => {
      setProfile(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading || !profile) {
    return (
      <DashboardLayout title="Profile" allowedRoles={['LEARNER']}>
        <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-xl)' }} />
      </DashboardLayout>
    );
  }

  const infoItems = [
    { label: 'Full Name', value: profile.fullName, icon: '👤' },
    { label: 'Employee ID', value: profile.employeeCode || 'N/A', icon: '🪪' },
    { label: 'Designation', value: profile.designation, icon: '💼' },
    { label: 'Department', value: profile.department, icon: '🏛️' },
    { label: 'Current Assignment', value: profile.currentAssignment || 'N/A', icon: '📋' },
    { label: 'Education', value: profile.education || 'N/A', icon: '🎓' },
    { label: 'Experience', value: `${profile.experienceYears} years`, icon: '📅' },
    { label: 'Location', value: profile.location || 'N/A', icon: '📍' },
    { label: 'Language', value: profile.preferredLanguage || 'English', icon: '🌐' },
    { label: 'Learning Hours', value: `${Math.round(profile.totalLearningHours || 0)} hours`, icon: '⏱️' },
  ];

  return (
    <DashboardLayout title="My Profile" allowedRoles={['LEARNER']}>
      <div className="animate-fade-in-up">
        {/* Profile Header */}
        <div style={{
          background: 'linear-gradient(135deg, #4338ca, #6366f1, #818cf8)',
          borderRadius: 'var(--radius-2xl)', padding: '2rem 2.5rem',
          color: 'white', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '1.5rem',
        }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 800, border: '3px solid rgba(255,255,255,0.3)',
          }}>
            {profile.fullName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
              {profile.fullName}
            </h2>
            <p style={{ opacity: 0.85 }}>{profile.designation} — {profile.department}</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <div style={{
                background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--radius-md)',
                padding: '0.25rem 0.75rem', fontSize: '0.8rem',
              }}>
                🎯 {Math.round(profile.overallReadiness || 0)}% Readiness
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--radius-md)',
                padding: '0.25rem 0.75rem', fontSize: '0.8rem',
              }}>
                📅 {profile.experienceYears} yrs exp
              </div>
            </div>
          </div>
        </div>

        {/* AI Profile Summary */}
        {profile.profileSummary && (
          <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>
                ✨ AI Profile Summary
              </h3>
              <span style={{
                fontSize: '0.65rem', fontWeight: 600,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white', padding: '0.25rem 0.75rem', borderRadius: '999px',
              }}>
                AI-Powered
              </span>
            </div>
            <p style={{ fontSize: '1rem', color: 'var(--slate-700)', lineHeight: 1.6 }}>
              {profile.profileSummary}
            </p>
          </div>
        )}

        {/* Info Grid */}
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Employee Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {infoItems.map(item => (
              <div key={item.label} style={{
                padding: '1rem', borderRadius: 'var(--radius-lg)',
                background: 'var(--slate-50)', border: '1px solid var(--slate-100)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span>{item.icon}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {item.label}
                  </span>
                </div>
                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-800)' }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Previous Trainings */}
        {profile.previousTrainings && (
          <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Previous Trainings & Certifications
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', lineHeight: 1.6 }}>
              {profile.previousTrainings}
            </p>
          </div>
        )}

        {/* Self-Rated Skills */}
        {profile.skillRatings && profile.skillRatings.length > 0 && (
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>
              Self-Rated Skills
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              {profile.skillRatings.map((sr: any) => (
                <div key={sr.id} style={{
                  padding: '0.75rem', borderRadius: 'var(--radius-md)',
                  background: 'var(--slate-50)', display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                    {sr.competency.name}
                  </span>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <div key={n} style={{
                        width: '14px', height: '14px', borderRadius: '3px',
                        background: n <= sr.rating ? 'var(--primary-500)' : 'var(--slate-200)',
                      }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
