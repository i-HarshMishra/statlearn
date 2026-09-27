'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
      router.push('/learner/onboarding');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
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
      <div style={{
        position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px',
        borderRadius: '50%', background: 'rgba(16, 185, 129, 0.12)', filter: 'blur(80px)',
      }} />

      <div className="animate-fade-in-up" style={{
        width: '100%', maxWidth: '440px', padding: '0 1.5rem', position: 'relative', zIndex: 1,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2.5rem', fontWeight: 800, color: 'white',
            fontFamily: 'Outfit, sans-serif', marginBottom: '0.5rem',
          }}>
            StatLearn<span style={{ color: '#34d399' }}>AI</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
            Create your account to get started
          </p>
        </div>

        <div className="glass-card" style={{ padding: '2.5rem 2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
            Create Account
          </h2>

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
              <input className="input-field" type="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="input-label">Password</label>
              <input className="input-field" type="password" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <label className="input-label">Confirm Password</label>
              <input className="input-field" type="password" placeholder="••••••••"
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>

            <button className="btn btn-primary btn-lg" type="submit" disabled={loading}
              style={{ width: '100%' }}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--slate-500)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--primary-600)', fontWeight: 600, textDecoration: 'none' }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
