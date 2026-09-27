'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navConfig: Record<string, NavItem[]> = {
  LEARNER: [
    { label: 'Dashboard', href: '/learner/dashboard', icon: '📊' },
    { label: 'Profile', href: '/learner/profile', icon: '👤' },
    { label: 'Competencies', href: '/learner/competencies', icon: '🎯' },
    { label: 'Recommendations', href: '/learner/recommendations', icon: '📚' },
    { label: 'Quizzes', href: '/learner/quizzes', icon: '✅' },
    { label: 'AI Quiz Generator', href: '/learner/quiz-generator', icon: '🪄' },
  ],
  ADMIN: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { label: 'Framework', href: '/admin/framework', icon: '🏗️' },
    { label: 'Benchmarks', href: '/admin/benchmarks', icon: '📏' },
    { label: 'Courses', href: '/admin/courses', icon: '📚' },
    { label: 'Upload Material', href: '/admin/upload', icon: '📤' },
    { label: 'Materials', href: '/admin/materials', icon: '📁' },
    { label: 'Quizzes', href: '/admin/quizzes', icon: '✅' },
    { label: 'Employees', href: '/admin/employees', icon: '👥' },
    { label: 'Talent Search', href: '/admin/talent-search', icon: '🔍' },
    { label: 'Users', href: '/admin/users', icon: '👥' },
  ],
};

const roleLabels: Record<string, string> = {
  LEARNER: 'Learner',
  TRAINER: 'Trainer',
  ADMIN: 'Administrator',
};

const roleColors: Record<string, string> = {
  LEARNER: '#6366f1',
  ADMIN: '#f59e0b',
};

export default function Sidebar({ isOpen = true, setIsOpen }: { isOpen?: boolean, setIsOpen?: (v: boolean) => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const navItems = navConfig[user.role] || [];
  const roleLabel = roleLabels[user.role] || user.role;
  const roleColor = roleColors[user.role] || '#6366f1';

  return (
    <aside className="sidebar" style={{
      width: isOpen ? '260px' : '80px',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 1rem',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 40,
      transition: 'width 0.2s ease-out',
      overflowX: 'hidden',
      willChange: 'width'
    }}>
      {/* Toggle Button */}
      {setIsOpen && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: 'absolute', top: '1.5rem', right: '1rem',
            background: 'rgba(255,255,255,0.1)', border: 'none',
            color: 'white', cursor: 'pointer',
            padding: '0.25rem', borderRadius: '4px',
          }}
        >
          {isOpen ? '◀' : '▶'}
        </button>
      )}
      {/* Logo */}
      <div style={{ 
        marginBottom: '2rem', 
        padding: '0 0.5rem', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: isOpen ? 'flex-start' : 'center',
        height: '60px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        transition: 'align-items 0.2s ease-out'
      }}>
        <h1 style={{
          fontSize: '1.5rem', fontWeight: 800, color: 'white',
          fontFamily: 'Outfit, sans-serif', margin: 0,
          display: 'flex', alignItems: 'center'
        }}>
          S
          <span style={{
            display: 'inline-block',
            maxWidth: isOpen ? '150px' : '0px',
            opacity: isOpen ? 1 : 0,
            overflow: 'hidden',
            transition: 'max-width 0.2s ease-out, opacity 0.2s ease-out'
          }}>tatLearn</span>
          <span style={{ color: '#34d399' }}>AI</span>
        </h1>
        
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
          marginTop: '0.25rem',
          borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 600,
          background: `${roleColor}22`, color: roleColor,
          textTransform: 'uppercase', letterSpacing: '0.05em',
          maxWidth: isOpen ? '200px' : '0px',
          maxHeight: isOpen ? '30px' : '0px',
          opacity: isOpen ? 1 : 0,
          overflow: 'hidden',
          padding: isOpen ? '0.15rem 0.5rem' : '0px',
          border: isOpen ? `1px solid ${roleColor}44` : 'none',
          transition: 'max-width 0.2s ease-out, opacity 0.2s ease-out, padding 0.2s ease-out',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: roleColor, flexShrink: 0 }} />
          {roleLabel}
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.25rem',
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingRight: '0.25rem',
        minHeight: 0
      }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              title={item.label}
              style={{ 
                justifyContent: 'flex-start', 
                padding: '0.625rem 1rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden'
              }}
            >
              <span style={{ 
                fontSize: '1.1rem', 
                minWidth: '1.5rem', 
                display: 'inline-block', 
                textAlign: 'center' 
              }}>
                {item.icon}
              </span>
              <span style={{ 
                marginLeft: isOpen ? '0.75rem' : '0px',
                opacity: isOpen ? 1 : 0,
                maxWidth: isOpen ? '150px' : '0px',
                transition: 'max-width 0.2s ease-out, opacity 0.2s ease-out, padding 0.2s ease-out',
                display: 'inline-block',
                overflow: 'hidden'
              }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User section at bottom */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingTop: '1rem',
        marginTop: '1rem',
        overflow: 'hidden',
        whiteSpace: 'nowrap'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: isOpen ? '0.75rem' : '0px',
          padding: isOpen ? '0.75rem' : '0.5rem', borderRadius: 'var(--radius-lg)',
          justifyContent: isOpen ? 'flex-start' : 'center',
          transition: 'max-width 0.2s ease-out, opacity 0.2s ease-out, padding 0.2s ease-out'
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '0.875rem', fontWeight: 700, flexShrink: 0,
          }} title={user.profile?.fullName || user.email}>
            {(user.profile?.fullName || user.email)[0].toUpperCase()}
          </div>
          <div style={{ 
            flex: 1, 
            minWidth: 0,
            opacity: isOpen ? 1 : 0,
            maxWidth: isOpen ? '150px' : '0px',
            transition: 'max-width 0.2s ease-out, opacity 0.2s ease-out, padding 0.2s ease-out',
            overflow: 'hidden'
          }}>
            <div style={{
              fontSize: '0.8125rem', fontWeight: 600, color: 'white',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user.profile?.fullName || user.email.split('@')[0]}
            </div>
            <div style={{
              fontSize: '0.7rem', color: 'var(--slate-400)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user.email}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          style={{
            width: '100%', marginTop: '0.5rem',
            padding: '0.625rem', borderRadius: 'var(--radius-lg)',
            background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.15)',
            color: '#fb7185', fontSize: '0.8125rem', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isOpen ? '0.5rem' : '0px',
            overflow: 'hidden', whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(244, 63, 94, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)';
          }}
          title="Sign Out"
        >
          <span style={{ fontSize: '1.1rem' }}>🚪</span>
          <span style={{ 
            opacity: isOpen ? 1 : 0,
            maxWidth: isOpen ? '60px' : '0px',
            transition: 'max-width 0.2s ease-out, opacity 0.2s ease-out, padding 0.2s ease-out',
            overflow: 'hidden',
            display: 'inline-block'
          }}>
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
}
