'use client';

import { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export default function ChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'bot',
      content: "👋 Hi! I'm the **StatLearnAI Assistant**. Ask me about your readiness, skill gaps, course recommendations, or quizzes!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) return null;

  const sendMessage = async (textMsg?: string) => {
    const msgToSend = textMsg || input;
    if (!msgToSend.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: msgToSend,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chatbot/message', { message: msgToSend });
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: res.data.reply,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: "Sorry, I'm having trouble right now. Please try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  const quickActions = [
    "What's my readiness score?",
    "Show my skill gaps",
    "Recommend courses",
    "Available quizzes",
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem',
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #4338ca, #6366f1)',
          color: 'white', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', zIndex: 1000,
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
          transition: 'all 0.3s',
          transform: isOpen ? 'rotate(45deg) scale(0.9)' : 'scale(1)',
        }}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '5.5rem', right: '1.5rem',
          width: '380px', height: '520px',
          borderRadius: 'var(--radius-2xl)',
          background: 'white',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', zIndex: 999,
          animation: 'fadeInUp 0.3s ease-out',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #4338ca, #6366f1)',
            padding: '1rem 1.25rem', color: 'white',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem',
            }}>
              🤖
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>StatLearnAI Assistant</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Rule-based • Always available</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '1rem',
            display: 'flex', flexDirection: 'column', gap: '0.75rem',
          }}>
            {messages.map(msg => (
              <div key={msg.id} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '85%', padding: '0.75rem 1rem',
                  borderRadius: msg.role === 'user'
                    ? '1rem 1rem 0.25rem 1rem'
                    : '1rem 1rem 1rem 0.25rem',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #4338ca, #6366f1)'
                    : 'var(--slate-100)',
                  color: msg.role === 'user' ? 'white' : 'var(--slate-700)',
                  fontSize: '0.8125rem', lineHeight: 1.5,
                }}>
                  <div dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '0.75rem 1rem', borderRadius: '1rem 1rem 1rem 0.25rem',
                  background: 'var(--slate-100)', fontSize: '0.8125rem',
                }}>
                  <span style={{ display: 'inline-flex', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--slate-400)', animation: 'pulse-glow 1s ease-in-out infinite' }} />
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--slate-400)', animation: 'pulse-glow 1s ease-in-out infinite 0.2s' }} />
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--slate-400)', animation: 'pulse-glow 1s ease-in-out infinite 0.4s' }} />
                  </span>
                </div>
              </div>
            )}

            {/* Quick Actions (show only if few messages) */}
            {messages.length <= 2 && !loading && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.5rem' }}>
                {quickActions.map(action => (
                  <button key={action} onClick={() => { sendMessage(action); }}
                    style={{
                      padding: '0.375rem 0.75rem', borderRadius: '9999px',
                      background: 'var(--primary-50)', color: 'var(--primary-700)',
                      border: '1px solid var(--primary-200)',
                      fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}>
                    {action}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '0.75rem', borderTop: '1px solid var(--slate-200)',
            display: 'flex', gap: '0.5rem',
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
              placeholder="Ask me anything..."
              style={{
                flex: 1, padding: '0.625rem 0.875rem',
                borderRadius: '9999px', border: '1.5px solid var(--slate-200)',
                fontSize: '0.8125rem', outline: 'none',
                transition: 'border-color 0.2s',
              }}
              disabled={loading}
            />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
              style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: input.trim() ? 'linear-gradient(135deg, #4338ca, #6366f1)' : 'var(--slate-200)',
                color: input.trim() ? 'white' : 'var(--slate-400)',
                border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', transition: 'all 0.2s',
              }}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
