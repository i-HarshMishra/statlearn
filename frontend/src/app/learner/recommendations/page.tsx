'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Certificate Upload State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedCourseForUpload, setSelectedCourseForUpload] = useState<string | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  useEffect(() => {
    api.get('/learner/recommendations').then(res => {
      setRecommendations(res.data.recommendations);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleEnroll = async (courseId: string, courseUrl?: string) => {
    setActionLoading(courseId);
    try {
      await api.post(`/learner/course/${courseId}/enroll`);
      setRecommendations(prev => prev.map(r =>
        r.id === courseId ? { ...r, status: 'enrolled' } : r
      ));
      if (courseUrl) {
        window.open(courseUrl, '_blank');
      }
    } catch (err) { console.error(err); }
    setActionLoading(null);
  };

  const handleUploadCertificate = async () => {
    if (!selectedCourseForUpload || !certificateFile) return;
    
    setActionLoading('uploading');
    setUploadMessage(null);
    
    const formData = new FormData();
    formData.append('certificate', certificateFile);

    try {
      const res = await api.post(`/learner/course/${selectedCourseForUpload}/verify-certificate`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setUploadMessage({ type: 'success', text: res.data.message || 'Certificate verified successfully!' });
      
      // Update local state
      setRecommendations(prev => prev.map(r =>
        r.id === selectedCourseForUpload ? { ...r, status: 'completed' } : r
      ));
      
      // Close modal after delay
      setTimeout(() => {
        setUploadModalOpen(false);
        setCertificateFile(null);
        setSelectedCourseForUpload(null);
        setUploadMessage(null);
      }, 2000);
      
    } catch (err: any) {
      setUploadMessage({ 
        type: 'error', 
        text: err.response?.data?.error || err.response?.data?.details || 'Verification failed. Please ensure the certificate image is clear.' 
      });
    }
    setActionLoading(null);
  };

  if (loading) {
    return (
      <DashboardLayout title="Recommendations" allowedRoles={['LEARNER']}>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '140px', borderRadius: 'var(--radius-xl)' }} />)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Personalized Learning Path" allowedRoles={['LEARNER']}>
      <div className="animate-fade-in-up">
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #4338ca, #6366f1)',
          borderRadius: 'var(--radius-xl)', padding: '1.5rem 2rem',
          color: 'white', marginBottom: '1.5rem',
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
            📚 Your Learning Path
          </h3>
          <p style={{ opacity: 0.8, fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Courses recommended based on your skill gaps — prioritized by severity
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.8rem', padding: '0 0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary-500)' }}></span>
            <span style={{ color: 'var(--slate-600)' }}><b>iGOT Karmayogi:</b> Integration-ready (pending G2G access)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></span>
            <span style={{ color: 'var(--slate-600)' }}><b>NSSTA TPAC:</b> Live data from published training calendar</span>
          </div>
        </div>

        {recommendations.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              No Gaps Found!
            </h3>
            <p style={{ color: 'var(--slate-500)' }}>
              Your competencies meet or exceed the requirements for your role.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recommendations.map((course, index) => (
              <div key={course.id} className="glass-card animate-fade-in-up"
                style={{ padding: '1.5rem', opacity: 0, animationDelay: `${index * 0.05}s` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{
                        fontSize: '0.8rem', fontWeight: 800, color: 'white',
                        background: 'var(--primary-600)', borderRadius: '50%',
                        width: '24px', height: '24px', display: 'inline-flex',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        {index + 1}
                      </span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{course.title}</h4>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                      {course.description}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        background: course.provider.includes('iGOT') ? 'var(--primary-50)' : 'rgba(16,185,129,0.08)',
                        color: course.provider.includes('iGOT') ? 'var(--primary-700)' : '#059669',
                        border: course.provider.includes('iGOT') ? '1px solid var(--primary-200)' : '1px solid rgba(16,185,129,0.2)',
                      }}>
                        {course.provider}
                      </span>
                      <span className="badge badge-info">{course.level}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>⏱ {course.durationHours}h</span>
                      <span className={`badge ${course.gapSeverity === 'Critical' ? 'badge-critical' : 'badge-moderate'}`}>
                        {course.matchedCompetency} — {course.gapSeverity}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
                    {course.status === 'completed' ? (
                      <span className="badge badge-ready" style={{ padding: '0.5rem 1rem' }}>✅ Completed</span>
                    ) : course.status === 'enrolled' ? (
                      <button className="btn btn-success btn-sm"
                        onClick={() => {
                          setSelectedCourseForUpload(course.id);
                          setUploadModalOpen(true);
                          setUploadMessage(null);
                          setCertificateFile(null);
                        }}>
                        Upload Certificate
                      </button>
                    ) : (
                      <button className="btn btn-primary btn-sm"
                        onClick={() => handleEnroll(course.id, course.url)}
                        disabled={actionLoading === course.id}>
                        {actionLoading === course.id ? '...' : 'Enroll'}
                      </button>
                    )}
                    {course.url && (
                      <a href={course.url} target="_blank" rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem' }}>
                        Open Course ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certificate Upload Modal */}
      {uploadModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
        }}>
          <div className="glass-card animate-fade-in-up" style={{ padding: '2rem', width: '100%', maxWidth: '400px', background: 'white' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>AI Certificate Verification</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Upload your course completion certificate. Our AI will verify your name and course details automatically.
            </p>
            
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
              style={{ 
                display: 'block', width: '100%', marginBottom: '1rem',
                padding: '0.5rem', border: '1px dashed var(--slate-300)', borderRadius: 'var(--radius-md)'
              }}
            />
            
            {uploadMessage && (
              <div style={{
                padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem',
                background: uploadMessage.type === 'error' ? '#fef2f2' : '#ecfdf5',
                color: uploadMessage.type === 'error' ? '#b91c1c' : '#047857',
                border: `1px solid ${uploadMessage.type === 'error' ? '#f87171' : '#34d399'}`
              }}>
                {uploadMessage.text}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setUploadModalOpen(false)}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleUploadCertificate}
                disabled={!certificateFile || actionLoading === 'uploading'}
              >
                {actionLoading === 'uploading' ? 'Verifying AI...' : 'Verify Certificate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
