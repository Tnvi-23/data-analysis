import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  Sparkles,
  X,
  Send,
  Maximize2,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Database,
  ArrowRight
} from 'lucide-react';
import { aiService, datasetService } from '../services/api';
import useToast from './Toast';

export const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am Insight AI, your data science copilot. Select an active dataset or ask me any general analytical questions.',
      timestamp: new Date(),
      suggestedQuestions: [
        'How do I calculate a data quality score?',
        'What statistical models are available?',
        'How do I detect outliers with IQR?'
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeConversationId, setActiveConversationId] = useState(null);

  const messagesEndRef = useRef(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      datasetService.getAll().then((res) => {
        if (res?.success) {
          setDatasets(res.datasets || []);
          if (res.datasets?.length > 0 && !selectedDatasetId) {
            setSelectedDatasetId(res.datasets[0]._id);
          }
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend = inputMessage) => {
    const text = (textToSend || '').trim();
    if (!text || isSending) return;

    const userMsg = {
      sender: 'user',
      text,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const res = await aiService.chat({
        message: text,
        datasetId: selectedDatasetId || undefined,
        conversationId: activeConversationId || undefined
      });

      if (res?.success) {
        if (res.conversationId) setActiveConversationId(res.conversationId);
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: res.reply,
            timestamp: new Date(),
            suggestedQuestions: res.suggestedQuestions || []
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Error: ${err.message || 'Unable to communicate with AI service. Please verify server connection.'}`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    addToast('Copied AI response to clipboard');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        sender: 'ai',
        text: 'Conversation cleared. How can I assist your analysis next?',
        timestamp: new Date(),
        suggestedQuestions: [
          'Summarize the selected dataset.',
          'Identify unusual outliers.',
          'Suggest charts for this data.'
        ]
      }
    ]);
    setActiveConversationId(null);
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '58px',
            height: '58px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-text-inverse)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-accent)',
            cursor: 'pointer',
            border: 'none',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          title="Open Insight AI Copilot"
        >
          <Bot size={28} />
        </button>
      )}

      {/* Expandable Chat Panel */}
      {isOpen && (
        <div
          style={{
            width: '420px',
            maxWidth: 'calc(100vw - 32px)',
            height: '620px',
            maxHeight: 'calc(100vh - 48px)',
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-dropdown)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease forwards'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: 'var(--color-bg-secondary)',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(182, 255, 74, 0.15)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                    Insight AI
                  </h4>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
                </div>
                <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                  Dataset Intelligence Copilot
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Link
                to="/ai-chat"
                onClick={() => setIsOpen(false)}
                style={{ color: 'var(--color-text-secondary)', padding: '6px' }}
                title="Expand to Full Page Chat"
              >
                <Maximize2 size={16} />
              </Link>
              <button
                onClick={handleClear}
                style={{ color: 'var(--color-text-secondary)', padding: '6px' }}
                title="Clear Conversation"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{ color: 'var(--color-text-secondary)', padding: '6px' }}
                title="Close Chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Dataset Selector Context Strip */}
          <div
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--color-surface)',
              borderBottom: '1px solid var(--color-border-light)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Database size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', flexShrink: 0 }}>
              Grounded on:
            </span>
            <select
              className="form-input"
              style={{
                padding: '3px 8px',
                fontSize: '0.75rem',
                height: '28px',
                backgroundColor: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)'
              }}
              value={selectedDatasetId}
              onChange={(e) => setSelectedDatasetId(e.target.value)}
            >
              <option value="">None (General Data Science Mode)</option>
              {datasets.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.originalFilename} ({d.rowCount} rows)
                </option>
              ))}
            </select>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              padding: '1rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            {messages.map((msg, idx) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    gap: '4px'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '10px 14px',
                      borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      backgroundColor: isUser ? 'var(--color-primary)' : 'var(--color-surface)',
                      color: isUser ? 'var(--color-text-inverse)' : 'var(--color-text-main)',
                      fontSize: '0.875rem',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    {msg.text}
                  </div>

                  {/* Actions & Timestamp */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.6875rem',
                      color: 'var(--color-text-muted)',
                      padding: '0 4px'
                    }}
                  >
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.text, idx)}
                        style={{ color: 'var(--color-text-muted)', padding: '2px' }}
                        title="Copy Response"
                      >
                        {copiedIndex === idx ? <Check size={12} style={{ color: 'var(--color-primary)' }} /> : <Copy size={12} />}
                      </button>
                    )}
                  </div>

                  {/* Suggested follow-up questions */}
                  {!isUser && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                      {msg.suggestedQuestions.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => handleSendMessage(q)}
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--color-text-secondary)',
                            backgroundColor: 'var(--color-bg-secondary)',
                            border: '1px solid var(--color-border)',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            textAlign: 'left',
                            transition: 'border-color 0.15s ease'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {isSending && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontSize: '0.8125rem' }}>
                <Sparkles size={16} className="animate-spin" />
                <span>Insight AI is analyzing dataset context...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--color-bg-secondary)',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              gap: '8px'
            }}
          >
            <input
              type="text"
              className="form-input"
              style={{
                fontSize: '0.875rem',
                padding: '8px 12px',
                height: '40px',
                backgroundColor: 'var(--color-card)'
              }}
              placeholder="Ask Insight AI about patterns, metrics, charts..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
              className="btn btn-primary"
              style={{ width: '40px', height: '40px', padding: 0 }}
              title="Send Query"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default FloatingChatbot;
