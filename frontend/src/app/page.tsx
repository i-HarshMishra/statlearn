'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, getRoleDashboardPath } from '@/lib/auth';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push(getRoleDashboardPath(user.role));
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #312e81 0%, #4338ca 25%, #6366f1 50%, #818cf8 75%, #a78bfa 100%)',
      }}>
        <div className="animate-float" style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', marginBottom: '0.5rem' }}>
            StatLearn<span style={{ color: '#34d399' }}>AI</span>
          </div>
          <div style={{
            marginTop: '1.5rem', width: '40px', height: '40px', margin: '1.5rem auto 0',
            border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%',
            animation: 'spin-slow 1s linear infinite',
          }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--slate-50)',
    }}>
      {/* Navigation */}
      <nav style={{
        padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'var(--primary-700)' }}>
          StatLearn<span style={{ color: 'var(--success-500)' }}>AI</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => router.push('/login')} className="btn btn-ghost">Log In</button>
          <button onClick={() => router.push('/register')} className="btn btn-primary">Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '800px', textAlign: 'center' }} className="animate-fade-in-up">
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'var(--slate-900)', lineHeight: 1.1, marginBottom: '1.5rem' }}>
            AI-Enabled Capacity Building for <span style={{ color: 'var(--primary-600)' }}>Official Statistics</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--slate-600)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Empowering MoSPI officials with personalized learning paths, AI-driven competency gap analysis, and predictive workforce intelligence.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={() => router.push('/register')} className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
              Start Learning Journey →
            </button>
            <button onClick={() => router.push('/login')} className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
              Admin Access
            </button>
          </div>
          
          <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', textAlign: 'left' }}>
            <div className="glass-card" style={{ padding: '1.5rem', background: 'white' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎯</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Smart Diagnostics</h3>
              <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>Identify skill gaps with role-specific assessments and self-ratings.</p>
            </div>
            <div className="glass-card" style={{ padding: '1.5rem', background: 'white' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🤖</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>AI Insights</h3>
              <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>Predict future statistical skills and automate certificate verification.</p>
            </div>
            <div className="glass-card" style={{ padding: '1.5rem', background: 'white' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📈</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Workforce Analytics</h3>
              <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>Comprehensive dashboards for tracking organizational readiness.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
