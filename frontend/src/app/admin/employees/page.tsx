'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'overallReadiness', direction: 'desc' });

  useEffect(() => {
    api.get('/admin/employees').then(res => {
      setEmployees(res.data.employees);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFiltered = [...employees]
    .filter(e =>
      (e.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.designation || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.department || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.email || '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return ' ↕';
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  if (loading) {
    return (
      <DashboardLayout title="Employees" allowedRoles={['ADMIN']}>
        <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-xl)' }} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Employee Directory" allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <div className="animate-fade-in-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
            All Employees ({employees.length})
          </h3>
          <input className="input-field" placeholder="🔍 Search by name, designation, department..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: '350px' }} />
        </div>

        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('fullName')} style={{ cursor: 'pointer' }}>Employee{getSortIcon('fullName')}</th>
                <th onClick={() => handleSort('designation')} style={{ cursor: 'pointer' }}>Designation{getSortIcon('designation')}</th>
                <th onClick={() => handleSort('department')} style={{ cursor: 'pointer' }}>Department{getSortIcon('department')}</th>
                <th onClick={() => handleSort('overallReadiness')} style={{ cursor: 'pointer' }}>Readiness{getSortIcon('overallReadiness')}</th>
                <th onClick={() => handleSort('criticalGaps')} style={{ cursor: 'pointer' }}>Critical Gaps{getSortIcon('criticalGaps')}</th>
                <th onClick={() => handleSort('totalLearningHours')} style={{ cursor: 'pointer' }}>Learning Hours{getSortIcon('totalLearningHours')}</th>
              </tr>
            </thead>
            <tbody>
              {sortedAndFiltered.map(emp => (
                <tr key={emp.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                      }}>
                        {emp.fullName?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{emp.fullName}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)' }}>{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8125rem' }}>{emp.designation}</td>
                  <td style={{ fontSize: '0.8125rem' }}>{emp.department}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '50px', height: '6px', borderRadius: '3px',
                        background: 'var(--slate-200)', overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%', width: `${emp.overallReadiness}%`,
                          borderRadius: '3px',
                          background: emp.overallReadiness >= 80 ? '#10b981' : emp.overallReadiness >= 60 ? '#f59e0b' : '#f43f5e',
                        }} />
                      </div>
                      <span style={{
                        fontSize: '0.8125rem', fontWeight: 700,
                        color: emp.overallReadiness >= 80 ? '#10b981' : emp.overallReadiness >= 60 ? '#f59e0b' : '#f43f5e',
                      }}>
                        {Math.round(emp.overallReadiness)}%
                      </span>
                    </div>
                  </td>
                  <td>
                    {emp.criticalGaps > 0 ? (
                      <span className="badge badge-critical">{emp.criticalGaps} Critical</span>
                    ) : (
                      <span className="badge badge-ready">Ready</span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                    {Math.round(emp.totalLearningHours)}h
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
