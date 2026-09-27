'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    api.get('/admin/users').then(res => {
      setUsers(res.data.users);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const handleRoleChange = async (userId: string, role: string) => {
    setUpdatingId(userId);
    await api.put(`/admin/users/${userId}/role`, { role });
    loadData();
    setUpdatingId(null);
  };

  const roleColors: Record<string, string> = {
    LEARNER: '#6366f1', TRAINER: '#10b981', ADMIN: '#f59e0b', SUPER_ADMIN: '#f43f5e',
  };

  return (
    <DashboardLayout title="User Management" allowedRoles={['ADMIN']}>
      <div className="animate-fade-in-up">
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem' }}>
          All Users ({users.length})
        </h3>

        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Designation</th>
                <th>Role</th>
                <th>Change Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.email}</td>
                  <td>{u.profile?.fullName || '—'}</td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
                    {u.profile?.designation || '—'}
                  </td>
                  <td>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      background: `${roleColors[u.role]}15`,
                      color: roleColors[u.role],
                      border: `1px solid ${roleColors[u.role]}30`,
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <select className="select-field"
                      value={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                      disabled={updatingId === u.id}
                      style={{ padding: '0.375rem 0.5rem', fontSize: '0.8rem', maxWidth: '150px' }}>
                      <option value="LEARNER">Learner</option>
                      <option value="TRAINER">Trainer</option>
                      <option value="ADMIN">Admin</option>
                      
                    </select>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
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
