'use client';

import { useState, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import Link from 'next/link';

export default function LearnerQuizGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'upload' | 'generating' | 'quiz' | 'results'>('upload');
  
  const [quizData, setQuizData] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleGenerate = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }
    
    setLoading(true);
    setError('');
    setStep('generating');

    const formData = new FormData();
    formData.append('material', file);
    formData.append('questionCount', questionCount.toString());

    try {
      const res = await api.post('/learner/generate-quiz', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setQuizData(res.data.quiz);
      setStep('quiz');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to generate quiz.');
      setStep('upload');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (questionIndex: number, option: string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: option }));
  };

  const submitQuiz = () => {
    let currentScore = 0;
    quizData.questions.forEach((q: any, i: number) => {
      if (answers[i] === q.correctAnswer) currentScore++;
    });
    setScore(currentScore);
    setStep('results');
  };

  return (
    <DashboardLayout title="AI Quiz Generator" allowedRoles={['LEARNER']}>
      <div className="animate-fade-in-up" style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {step === 'upload' && (
          <>
            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6, #c084fc)',
              borderRadius: 'var(--radius-xl)', padding: '2rem',
              color: 'white', marginBottom: '2rem', textAlign: 'center'
            }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', marginBottom: '0.5rem' }}>
                ✨ AI Study Buddy
              </h2>
              <p style={{ opacity: 0.9, fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
                Upload your lecture notes, PDFs, or study materials. Our Gemini AI will instantly generate a personalized quiz to help you learn faster.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <div 
                style={{
                  border: '2px dashed var(--slate-300)', borderRadius: 'var(--radius-lg)',
                  padding: '3rem 2rem', marginBottom: '1.5rem', background: 'var(--slate-50)',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                <h4 style={{ fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.5rem' }}>
                  {file ? file.name : 'Click to select a file'}
                </h4>
                <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>
                  Supported formats: PDF, PPTX, TXT
                </p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept=".pdf,.pptx,.txt"
                  onChange={handleFileChange}
                />
              </div>

              {error && <div style={{ color: '#ef4444', marginBottom: '1rem', fontWeight: 500 }}>{error}</div>}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <label style={{ fontWeight: 500, color: 'var(--slate-700)' }}>Number of Questions:</label>
                <select 
                  className="select-field" 
                  style={{ width: '100px' }}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                </select>
              </div>

              <button 
                className="btn btn-primary btn-lg" 
                style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}
                onClick={handleGenerate}
                disabled={!file}
              >
                🪄 Generate Magic Quiz
              </button>
            </div>
          </>
        )}

        {step === 'generating' && (
          <div className="glass-card" style={{ padding: '5rem', textAlign: 'center' }}>
            <div style={{
              width: '64px', height: '64px', border: '4px solid var(--slate-100)',
              borderTopColor: '#8b5cf6', borderRadius: '50%',
              margin: '0 auto 1.5rem', animation: 'spin-slow 1s linear infinite',
            }} />
            <h2 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.5rem', color: '#8b5cf6' }}>Reading your material...</h2>
            <p style={{ color: 'var(--slate-500)' }}>Gemini AI is analyzing your document and crafting questions.</p>
          </div>
        )}

        {step === 'quiz' && quizData && (
          <>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-800)' }}>📝 {quizData.title}</h2>
                <p style={{ color: 'var(--slate-500)', marginTop: '0.25rem' }}>Answer all {quizData.questionCount} questions to see your results.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {quizData.questions.map((q: any, i: number) => (
                <div key={i} className="glass-card" style={{ padding: '2rem' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--slate-800)', lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--primary-600)', marginRight: '0.5rem' }}>{i + 1}.</span>
                    {q.questionText}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {q.options.map((opt: string, j: number) => (
                      <div 
                        key={j} 
                        onClick={() => handleOptionSelect(i, opt)}
                        style={{
                          padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)',
                          border: answers[i] === opt ? '2px solid var(--primary-500)' : '1px solid var(--slate-200)',
                          background: answers[i] === opt ? 'rgba(99, 102, 241, 0.05)' : 'white',
                          cursor: 'pointer', transition: 'all 0.2s',
                          display: 'flex', alignItems: 'center', gap: '1rem',
                          fontWeight: answers[i] === opt ? 600 : 400,
                          color: answers[i] === opt ? 'var(--primary-700)' : 'var(--slate-700)'
                        }}
                      >
                        <div style={{
                          width: '24px', height: '24px', borderRadius: '50%',
                          border: answers[i] === opt ? '6px solid var(--primary-500)' : '2px solid var(--slate-300)',
                        }} />
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button 
                className="btn btn-primary btn-lg" 
                onClick={submitQuiz}
                disabled={Object.keys(answers).length < quizData.questionCount}
                style={{ padding: '1rem 4rem', fontSize: '1.1rem' }}
              >
                Submit Answers
              </button>
            </div>
          </>
        )}

        {step === 'results' && quizData && (
          <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: score / quizData.questionCount >= 0.7 ? '#10b981' : '#f59e0b',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.5rem', fontWeight: 800, margin: '0 auto 1.5rem',
            }}>
              {Math.round((score / quizData.questionCount) * 100)}%
            </div>
            
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              {score / quizData.questionCount >= 0.7 ? 'Great Job!' : 'Keep Practicing!'}
            </h2>
            <p style={{ color: 'var(--slate-600)', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
              You got {score} out of {quizData.questionCount} correct.
            </p>

            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {quizData.questions.map((q: any, i: number) => {
                const isCorrect = answers[i] === q.correctAnswer;
                return (
                  <div key={i} style={{ 
                    padding: '1.5rem', borderRadius: 'var(--radius-lg)', 
                    background: isCorrect ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                    border: isCorrect ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                  }}>
                    <h5 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>{i + 1}. {q.questionText}</h5>
                    <p style={{ color: isCorrect ? '#059669' : '#dc2626', fontWeight: 500, marginBottom: '0.5rem' }}>
                      Your Answer: {answers[i]} {isCorrect ? '✓' : '✗'}
                    </p>
                    {!isCorrect && (
                      <p style={{ color: '#059669', fontWeight: 500, marginBottom: '0.5rem' }}>
                        Correct Answer: {q.correctAnswer}
                      </p>
                    )}
                    <div style={{ 
                      marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.7)', 
                      borderRadius: 'var(--radius-md)', fontSize: '0.9rem', color: 'var(--slate-700)'
                    }}>
                      <strong>💡 AI Explanation:</strong> {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="btn btn-primary" onClick={() => { setStep('upload'); setFile(null); setAnswers({}); setScore(0); }}>
              Generate Another Quiz
            </button>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
