import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Database,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { aiService, datasetService } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import useToast from '../components/Toast';

export const InsightAIPage = () => {
  const { addToast } = useToast();

  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState('');
  const [activeDataset, setActiveDataset] = useState(null);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Greetings! I am Insight AI, your data science copilot powered by Google Gemini 3.8 Flash. I am grounded directly in your dataset. How can I assist your analysis today?',
      timestamp: new Date(),
      suggestedQuestions: [
        'What are the strongest correlations in this data?',
        'Which variables have significant outliers?',
        'How can I improve the overall data quality score?',
        'Provide a 3-bullet executive summary of key metrics.'
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [loadingDatasets, setLoadingDatasets] = useState(true);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    datasetService
      .getAll()
      .then((res) => {
        if (res?.success && res.datasets?.length > 0) {
          setDatasets(res.datasets);
          setSelectedDatasetId(res.datasets[0]._id);
          setActiveDataset(res.datasets[0]);
        }
      })
      .finally(() => setLoadingDatasets(false));
  }, []);

  useEffect(() => {
    if (selectedDatasetId) {
      const match = datasets.find((d) => d._id === selectedDatasetId);
      setActiveDataset(match || null);
    }
  }, [selectedDatasetId, datasets]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSendMessage = async (textToSend) => {
    const query = typeof textToSend === 'string' ? textToSend : inputMessage;
    if (!query.trim() || isSending) return;

    const userMsg = {
      sender: 'user',
      text: query.trim(),
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const res = await aiService.sendMessage({
        datasetId: selectedDatasetId || undefined,
        conversationId: activeConversationId || undefined,
        message: query.trim()
      });

      if (res?.success) {
        if (res.conversationId) {
          setActiveConversationId(res.conversationId);
        }

        const aiMsg = {
          sender: 'ai',
          text: res.reply || 'Analysis completed.',
          timestamp: new Date(),
          suggestedQuestions: res.suggestedQuestions || []
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(res?.message || 'Failed to get AI response');
      }
    } catch (err) {
      const errorMsg = {
        sender: 'ai',
        text: 'Apologies, I encountered an error communicating with Google Gemini: ' + err.message,
        timestamp: new Date(),
        isError: true
      };
      setMessages((prev) => [...prev, errorMsg]);
      addToast('AI service response error.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    addToast('Response copied to clipboard!', 'info');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        sender: 'ai',
        text: 'Conversation cleared. Select a dataset and ask any analytical questions!',
        timestamp: new Date(),
        suggestedQuestions: [
          'What are the strongest correlations in this data?',
          'Which variables have significant outliers?'
        ]
      }
    ]);
    setActiveConversationId(null);
    addToast('Chat session reset.', 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', gap: '1rem' }}>
      {/* Top Studio Controls */}
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          padding: '1rem 1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(182, 255, 74, 0.15)',
              border: '1px solid rgba(182, 255, 74, 0.3)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.1875rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                Insight AI Studio
              </h2>
              <span className="badge badge-primary" style={{ fontSize: '0.6875rem' }}>
                Gemini 3.8 Flash
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              Grounded conversational analytics • Server-side API key secured
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Database size={14} style={{ color: 'var(--color-text-muted)' }} />
            <select
              className="form-input"
              style={{ width: '240px', padding: '0.4rem 0.6rem', fontSize: '0.8125rem', backgroundColor: 'var(--color-bg-secondary)' }}
              value={selectedDatasetId}
              onChange={(e) => setSelectedDatasetId(e.target.value)}
            >
              <option value="">General Knowledge (No Dataset)</option>
              {datasets.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.originalFilename} ({d.rowCount} rows)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleClearChat}
            className="btn btn-outline btn-sm"
            title="Clear Chat Conversation"
          >
            <Trash2 size={13} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div
        className="card"
        style={{
          flex: 1,
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: 0
        }}
      >
        {/* Messages Scroll Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          {messages.map((msg, index) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start'
                }}
              >
                {!isUser && (
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(182, 255, 74, 0.15)',
                      border: '1px solid rgba(182, 255, 74, 0.3)',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    <Bot size={16} />
                  </div>
                )}

                <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                  <div
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: isUser ? 'var(--color-surface)' : 'var(--color-bg-secondary)',
                      color: isUser ? 'var(--color-text-main)' : 'var(--color-text-main)',
                      border: `1px solid ${isUser ? 'var(--color-border)' : 'var(--color-border)'}`,
                      lineHeight: 1.6,
                      fontSize: '0.9375rem',
                      whiteSpace: 'pre-wrap',
                      position: 'relative'
                    }}
                  >
                    {msg.text}

                    {/* Copy Button for AI Messages */}
                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.text, index)}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          color: 'var(--color-text-muted)',
                          padding: '4px',
                          borderRadius: 'var(--radius-xs)'
                        }}
                        title="Copy Response"
                      >
                        {copiedIndex === index ? <Check size={13} style={{ color: 'var(--color-primary)' }} /> : <Copy size={13} />}
                      </button>
                    )}
                  </div>

                  {/* Suggested Question Chips */}
                  {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                      {msg.suggestedQuestions.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => handleSendMessage(q)}
                          style={{
                            fontSize: '0.75rem',
                            padding: '4px 10px',
                            backgroundColor: 'var(--color-card)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-full)',
                            color: 'var(--color-primary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Sparkles size={11} />
                          <span>{q}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isSending && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(182, 255, 74, 0.15)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Bot size={16} />
              </div>
              <div
                style={{
                  padding: '10px 16px',
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '0.875rem',
                  color: 'var(--color-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <RefreshCw size={14} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
                <span>Insight AI is analyzing your dataset...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-secondary)'
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{ display: 'flex', gap: '10px' }}
          >
            <input
              type="text"
              className="form-input"
              placeholder={activeDataset ? `Ask Insight AI about ${activeDataset.originalFilename}...` : 'Ask any general data science question...'}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isSending}
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              disabled={isSending || !inputMessage.trim()}
              className="btn btn-primary"
            >
              <Send size={16} />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InsightAIPage;
