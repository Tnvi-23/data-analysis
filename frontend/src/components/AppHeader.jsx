import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, UploadCloud, Bot, Sparkles } from 'lucide-react';
import useAuth from '../hooks/useAuth';

export const AppHeader = ({ title, subtitle, onMenuToggle }) => {
  const { user } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'var(--color-bg-secondary)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        backdropFilter: 'blur(8px)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <button
          onClick={onMenuToggle}
          style={{
            display: 'none',
            padding: '8px',
            color: 'var(--color-text-main)',
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer'
          }}
          className="mobile-menu-btn"
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <h2
            style={{
              fontSize: '1.25rem',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              color: 'var(--color-text-main)',
              letterSpacing: '-0.01em',
              lineHeight: 1.2
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--color-text-secondary)',
                marginTop: '2px'
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        {/* Quick Link to Insight AI */}
        <Link
          to="/ai-chat"
          className="btn btn-secondary btn-sm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            border: '1px solid rgba(182, 255, 74, 0.25)',
            color: 'var(--color-primary)'
          }}
          title="Open Insight AI Copilot"
        >
          <Sparkles size={14} style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Ask AI</span>
        </Link>

        {/* Upload Dataset Button */}
        <Link
          to="/datasets/upload"
          className="btn btn-primary btn-sm"
          style={{ textDecoration: 'none' }}
        >
          <UploadCloud size={16} />
          <span>Upload Dataset</span>
        </Link>

        {/* User Avatar Mini Profile */}
        <Link
          to="/settings"
          title={`Signed in as ${user?.name || user?.email || 'User'}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-primary)',
            fontWeight: 700,
            fontSize: '0.8125rem',
            marginLeft: '0.5rem',
            transition: 'border-color 0.2s ease'
          }}
        >
          {getInitials(user?.name || user?.email)}
        </Link>
      </div>
    </header>
  );
};

export default AppHeader;
