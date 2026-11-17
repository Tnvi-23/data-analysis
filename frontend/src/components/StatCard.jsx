import React from 'react';

export const StatCard = ({ title, value, icon: Icon, changeText, trend = 'neutral', subtitle }) => {
  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        backgroundColor: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
          }}
        >
          {title}
        </span>
        {Icon && (
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(182, 255, 74, 0.1)',
              border: '1px solid rgba(182, 255, 74, 0.2)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon size={18} />
          </div>
        )}
      </div>

      <div
        style={{
          fontSize: '2rem',
          fontWeight: 800,
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-text-main)',
          lineHeight: 1.1
        }}
      >
        {value}
      </div>

      {(subtitle || changeText) && (
        <div
          style={{
            fontSize: '0.8125rem',
            color: trend === 'positive' ? 'var(--color-success)' : trend === 'negative' ? 'var(--color-error)' : 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {changeText && <span style={{ fontWeight: 600 }}>{changeText}</span>}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
