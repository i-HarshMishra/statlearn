'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';

const COMPETENCIES = [
  'Survey Design', 'Sampling', 'National Accounts', 'Price Statistics',
  'Labour Statistics', 'Data Quality Frameworks', 'Python', 'R', 'SQL',
  'Data Visualization', 'AI/ML', 'GIS', 'Cybersecurity', 'Data Privacy',
  'Leadership', 'Communication', 'Project Management', 'General',
];

export default function UploadMaterialPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [competency, setCompetency] = useState('General');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'upload' | 'generating' | 'preview'>('upload');
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);
  const [materialId, setMaterialId] = useState('');
  const [extracting, setExtracting] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selected = e.target.files[0];
    
    setExtracting(true);
    try {
      const formData = new FormData();
      formData.append('file', selected);
      
      const res = await api.post('/admin/extract-text', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setContent(res.data.text);
      if (!title) setTitle(selected.name.replace(/\.[^/.]+$/, ""));
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to extract text from file');
    } finally {
      setExtracting(false);
    }
  };

  const handleUpload = async () => {
    if (!title || !content) return;
    setLoading(true);
    try {
      const res = await api.post('/admin/upload', { title, content, contentType: 'text' });
      setMaterialId(res.data.material.id);
      setStep('generating');

      // Auto-generate quiz
      const quizRes = await api.post('/admin/generate-quiz', {
        materialId: res.data.material.id,
        title: `Quiz: ${title}`,
        competency,
        difficulty,
        questionCount,
      });
      setGeneratedQuiz(quizRes.data.quiz);
      setStep('preview');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!generatedQuiz) return;
    try {
      await api.put(`/admin/quizzes/${generatedQuiz.id}/publish`);
      router.push('/admin/quizzes');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout title="Upload Learning Material" allowedRoles={['ADMIN']}>
      <div className="animate-fade-in-up" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {step === 'upload' && (
          <>
            <div style={{
              background: 'linear-gradient(135deg, #059669, #10b981)',
              borderRadius: 'var(--radius-xl)', padding: '1.5rem 2rem',
              color: 'white', marginBottom: '1.5rem',
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
                📤 Upload & Generate Quiz
              </h3>
              <p style={{ opacity: 0.8, fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Paste or type your learning content — MCQs will be auto-generated
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="input-label">Material Title *</label>
                <input className="input-field" placeholder="e.g., Introduction to Sampling Methods"
                  value={title} onChange={e => setTitle(e.target.value)} />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="input-label">Upload File (Auto-extracts text)</label>
                <input type="file" accept=".pdf,.pptx,.txt" onChange={handleFileSelect} disabled={extracting} className="input-field" style={{ padding: '0.5rem' }} />
                {extracting && <p style={{ fontSize: '0.85rem', color: 'var(--primary-600)', marginTop: '0.35rem', fontWeight: 500 }}>📄 Extracting text... please wait.</p>}
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="input-label">Learning Content *</label>
                <textarea className="input-field" rows={12}
                  placeholder="Paste your learning material here (text, notes, chapter content)...

Example: Sampling is the process of selecting a subset of individuals from a population to estimate characteristics of the whole population. There are two main types: probability sampling and non-probability sampling..."
                  value={content} onChange={e => setContent(e.target.value)}
                  style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} />
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '0.25rem' }}>
                  {content.length} characters • ~{content.split(/\s+/).filter(Boolean).length} words
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label className="input-label">Competency</label>
                  <select className="select-field" value={competency}
                    onChange={e => setCompetency(e.target.value)}>
                    {COMPETENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Difficulty</label>
                  <select className="select-field" value={difficulty}
                    onChange={e => setDifficulty(e.target.value)}>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Questions to Generate</label>
                  <input className="input-field" type="number" min="3" max="20"
                    value={questionCount} onChange={e => setQuestionCount(parseInt(e.target.value) || 5)} />
                </div>
              </div>

              <button className="btn btn-primary btn-lg" style={{ width: '100%' }}
                onClick={handleUpload} disabled={loading || !title || !content}>
                {loading ? '⚙️ Uploading & Generating...' : '🚀 Upload & Generate Quiz'}
              </button>
            </div>
          </>
        )}

        {step === 'generating' && (
          <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
            <div style={{
              width: '48px', height: '48px', border: '3px solid var(--slate-200)',
              borderTopColor: 'var(--primary-500)', borderRadius: '50%',
              margin: '0 auto 1rem', animation: 'spin-slow 1s linear infinite',
            }} />
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Generating MCQs...</h3>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>
              Analyzing content and creating questions
            </p>
          </div>
        )}

        {step === 'preview' && generatedQuiz && (
          <>
            <div style={{
              background: 'linear-gradient(135deg, #059669, #10b981)',
              borderRadius: 'var(--radius-xl)', padding: '1.5rem 2rem',
              color: 'white', marginBottom: '1.5rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
                  ✅ Quiz Generated!
                </h3>
                <p style={{ opacity: 0.8, fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {generatedQuiz.questionCount} questions • Review and publish
                </p>
              </div>
              <button className="btn" onClick={handlePublish}
                style={{
                  background: 'rgba(255,255,255,0.2)', color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}>
                📢 Publish Now
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {generatedQuiz.questions.map((q: any, i: number) => (
                <div key={q.id} className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: 'var(--primary-600)', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
                    }}>
                      {i + 1}
                    </span>
                    <p style={{ fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.5 }}>
                      {q.questionText}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginLeft: '2.25rem' }}>
                    {q.options.map((opt: string, j: number) => (
                      <div key={j} style={{
                        padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)',
                        fontSize: '0.85rem',
                        background: opt === q.correctAnswer ? 'rgba(16,185,129,0.08)' : 'var(--slate-50)',
                        border: opt === q.correctAnswer ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--slate-100)',
                        color: opt === q.correctAnswer ? '#059669' : 'var(--slate-700)',
                        fontWeight: opt === q.correctAnswer ? 600 : 400,
                      }}>
                        {String.fromCharCode(65 + j)}. {opt}
                        {opt === q.correctAnswer && ' ✓'}
                      </div>
                    ))}
                  </div>

                  {q.explanation && (
                    <div style={{
                      marginTop: '0.75rem', marginLeft: '2.25rem',
                      padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)',
                      background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)',
                      fontSize: '0.8rem', color: 'var(--slate-600)',
                    }}>
                      💡 {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'center' }}>
              <button className="btn btn-primary btn-lg" onClick={handlePublish}>
                📢 Publish Quiz
              </button>
              <button className="btn btn-secondary" onClick={() => router.push('/admin/dashboard')}>
                Save as Draft
              </button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
