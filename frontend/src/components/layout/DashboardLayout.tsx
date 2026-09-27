'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  allowedRoles?: string[];
}

export default function DashboardLayout({ children, title, allowedRoles }: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.push('/login');
      }
    }
  }, [user, loading, router, allowedRoles]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--slate-50)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px', height: '48px',
            border: '3px solid var(--slate-200)',
            borderTopColor: 'var(--primary-500)',
            borderRadius: '50%',
            margin: '0 auto 1rem',
            animation: 'spin-slow 1s linear infinite',
          }} />
          <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--slate-50)' }}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main style={{
        flex: 1,
        marginLeft: isSidebarOpen ? '260px' : '80px',
        transition: 'margin-left 0.2s ease-out',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        willChange: 'margin-left'
      }}>
        <TopBar title={title} />
        <div className="gradient-mesh" style={{
          flex: 1,
          padding: '1.5rem 2rem 2rem',
        }}>
          {children}
        </div>
      </main>
    </div>
  );
}
