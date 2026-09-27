'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, getRoleDashboardPath } from '@/lib/auth';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      // Get user from localStorage since state might not update immediately
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const role = userData.role || 'LEARNER';

      // Check if learner needs onboarding
      if (role === 'LEARNER' && userData.profile && !userData.profile.onboardingComplete) {
        router.push('/learner/onboarding');
      } else if (role === 'LEARNER' && !userData.profile) {
        router.push('/learner/onboarding');
      } else {
        router.push(getRoleDashboardPath(role));
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (email: string) => {
    setEmail(email);
    setPassword('password123');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #312e81 0%, #4338ca 30%, #6366f1 60%, #818cf8 85%, #a78bfa 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-5%', width: '400px', height: '400px',
        borderRadius: '50%', background: 'rgba(139, 92, 246, 0.15)', filter: 'blur(80px)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', right: '-5%', width: '500px', height: '500px',
        borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', filter: 'blur(100px)',
      }} />

      <div className="animate-fade-in-up" style={{
        width: '100%', maxWidth: '440px', padding: '0 1.5rem', position: 'relative', zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2.5rem', fontWeight: 800, color: 'white',
            fontFamily: 'Outfit, sans-serif', marginBottom: '0.5rem',
          }}>
            StatLearn<span style={{ color: '#34d399' }}>AI</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: 1.5 }}>
            AI-Powered Learning Platform for India&apos;s Official Statistical System
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card" style={{ padding: '2.5rem 2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>
            Welcome Back
          </h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', textAlign: 'center', marginBottom: '1.75rem' }}>
            Sign in to continue your learning journey
          </p>

          {error && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-lg)', padding: '0.75rem 1rem', marginBottom: '1rem',
              color: '#e11d48', fontSize: '0.875rem', textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="input-label">Email</label>
              <input
                className="input-field"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <label className="input-label">Password</label>
              <input
                className="input-field"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              className="btn btn-primary btn-lg"
              type="submit"
              disabled={loading}
              style={{ width: '100%', fontSize: '0.95rem' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin-slow 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="60" strokeDashoffset="20" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p style={{
            textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--slate-500)',
          }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: 'var(--primary-600)', fontWeight: 600, textDecoration: 'none' }}>
              Register
            </Link>
          </p>
        </div>

        {/* Quick Login Buttons */}
        <div style={{ marginTop: '1.5rem' }}>
          <p style={{
            textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem',
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem',
          }}>
            Demo Quick Login
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {[
              { label: '👨‍🎓 Learner', email: 'learner@test.com' },
              { label: '👨‍💼 Admin', email: 'admin@test.com' },
            ].map((btn) => (
              <button
                key={btn.email}
                type="button"
                onClick={() => quickLogin(btn.email)}
                style={{
                  padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white', fontSize: '0.8rem', cursor: 'pointer',
                  transition: 'all 0.2s', fontWeight: 500,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
