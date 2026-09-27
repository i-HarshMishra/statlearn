'use client';

import { useAuth } from '@/lib/auth';

export default function TopBar({ title }: { title?: string }) {
  const { user } = useAuth();

  return (
    <header style={{
      height: '64px',
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--slate-200)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      <div>
        {title && (
          <h2 style={{
            fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-900)',
            fontFamily: 'Outfit, sans-serif',
          }}>
            {title}
          </h2>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Notification bell */}
        <button style={{
          width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--slate-200)', background: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
        }}>
          🔔
          <span style={{
            position: 'absolute', top: '-2px', right: '-2px',
            width: '8px', height: '8px', borderRadius: '50%',
            background: 'var(--rose-500)', border: '2px solid white',
          }} />
        </button>

        {user?.profile && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            padding: '0.375rem 0.75rem 0.375rem 0.375rem',
            borderRadius: '9999px', background: 'var(--slate-50)',
            border: '1px solid var(--slate-200)',
          }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '0.75rem', fontWeight: 700,
            }}>
              {user.profile.fullName?.[0]?.toUpperCase() || 'U'}
            </div>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-700)' }}>
              {user.profile.fullName || user.email}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
