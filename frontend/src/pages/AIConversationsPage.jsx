import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Bot,
  Trash2,
  ArrowRight,
  Sparkles,
  Calendar,
  Database,
  RefreshCw,
  Plus
} from 'lucide-react';
import { aiService } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import useToast from '../components/Toast';
import { formatDate } from '../utils/formatters';

export const AIConversationsPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await aiService.getConversations();
      if (res?.success) {
        setConversations(res.conversations || []);
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch AI conversation history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      setDeletingId(id);
      const res = await aiService.deleteConversation(id);
      if (res?.success) {
        setConversations((prev) => prev.filter((c) => c._id !== id));
        addToast('Conversation deleted.', 'info');
      }
    } catch (err) {
      addToast('Failed to delete conversation: ' + err.message, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Header Ribbon */}
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(182, 255, 74, 0.12)',
              border: '1px solid rgba(182, 255, 74, 0.25)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <MessageSquare size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
              AI Analytical Conversations
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              Historical analytical dialogues and Gemini AI insights sessions.
            </p>
          </div>
        </div>

        <Link to="/ai-chat" className="btn btn-primary btn-sm">
          <Plus size={14} />
          <span>New AI Conversation</span>
        </Link>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} height="90px" />
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="No Conversation History"
          description="Start a chat with Insight AI about your datasets to retain questions and discovered findings."
          actionLabel="Start AI Chat"
          actionTo="/ai-chat"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {conversations.map((conv) => (
            <div
              key={conv._id}
              className="card"
              style={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease'
              }}
              onClick={() => navigate('/ai-chat')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(182, 255, 74, 0.1)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Bot size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                    {conv.datasetId?.originalFilename ? `Chat on ${conv.datasetId.originalFilename}` : 'Analytical Exploration Session'}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {conv.messages?.length || 0} messages • Last active {formatDate(conv.updatedAt || conv.createdAt)}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link
                  to="/ai-chat"
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                >
                  <span>Resume</span>
                  <ArrowRight size={12} />
                </Link>

                <button
                  onClick={(e) => handleDelete(conv._id, e)}
                  disabled={deletingId === conv._id}
                  style={{
                    color: 'var(--color-text-muted)',
                    padding: '6px',
                    cursor: 'pointer',
                    transition: 'color 0.15s'
                  }}
                  title="Delete Conversation"
                >
                  {deletingId === conv._id ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIConversationsPage;
