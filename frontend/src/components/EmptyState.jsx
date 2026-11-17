import React from 'react';
import { Link } from 'react-router-dom';
import { Database, Plus } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Database,
  title = 'No Data Found',
  description = 'You currently have no records in this view.',
  actionLabel,
  actionTo,
  onAction
}) => {
  return (
    <div
      className="card"
      style={{
        textAlign: 'center',
        padding: '3.5rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        backgroundColor: 'var(--color-card)',
        border: '1px dashed var(--color-border)',
        borderRadius: 'var(--radius-lg)'
      }}
    >
      <div
        style={{
          width: '54px',
          height: '54px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(182, 255, 74, 0.1)',
          border: '1px solid rgba(182, 255, 74, 0.2)',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Icon size={26} />
      </div>

      <div style={{ maxWidth: '420px' }}>
        <h3
          style={{
            fontSize: '1.1875rem',
            fontFamily: 'var(--font-heading)',
            color: 'var(--color-text-main)',
            marginBottom: '0.35rem',
            fontWeight: 700
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5
          }}
        >
          {description}
        </p>
      </div>

      {(actionLabel && (actionTo || onAction)) && (
        <div style={{ marginTop: '0.5rem' }}>
          {actionTo ? (
            <Link to={actionTo} className="btn btn-primary btn-sm">
              <Plus size={16} />
              <span>{actionLabel}</span>
            </Link>
          ) : (
            <button onClick={onAction} className="btn btn-primary btn-sm">
              <Plus size={16} />
              <span>{actionLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
