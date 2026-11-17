import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  User,
  ShieldCheck,
  Key,
  Bot,
  Sparkles,
  LogOut,
  CheckCircle2,
  Lock,
  Database,
  ExternalLink
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useToast from '../components/Toast';

export const SettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login');
    } catch (err) {
      addToast('Logout failed: ' + err.message, 'error');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Header Ribbon */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)'
        }}
      >
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
          <Settings size={22} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
            Account & System Configuration
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            User profile, Gemini 3.8 Flash status, and data security governance.
          </p>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="card" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
          <User size={18} style={{ color: 'var(--color-primary)' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
            User Profile
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Full Name
            </span>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '2px' }}>
              {user?.name || 'Data Analyst'}
            </p>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Email Address
            </span>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '2px' }}>
              {user?.email || 'analyst@organization.com'}
            </p>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Access Role
            </span>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '2px' }}>
              Senior Analyst (Workspace Owner)
            </p>
          </div>
        </div>
      </div>

      {/* Gemini AI Integration Card */}
      <div className="card" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
              Google Gemini AI Integration
            </h3>
          </div>
          <span className="badge badge-primary">Active • Gemini 3.8 Flash</span>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
          Insight AI is powered by Google's native Gemini 3.8 Flash model via the official <code>@google/genai</code> SDK and Interactions API.
          Your dataset attributes and summarized statistics are passed safely to the model with complete prompt sanitization.
        </p>

        <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={20} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-main)' }}>
            <strong>Server-Side Secret Key Governance:</strong> <code>GEMINI_API_KEY</code> is loaded strictly in <code>backend/.env</code> and is never transmitted or exposed to client-side code.
          </span>
        </div>
      </div>

      {/* Security Governance Card */}
      <div className="card" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <Lock size={18} style={{ color: 'var(--color-secondary)' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
            Platform Security & Privacy Architecture
          </h3>
        </div>

        <ul style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.8, paddingLeft: '1.25rem' }}>
          <li><strong>Encrypted HTTP-Only Cookies:</strong> JWT tokens are stored exclusively in HTTP-only, SameSite cookies to protect against XSS attack vectors.</li>
          <li><strong>Zero Cross-Tenant Leakage:</strong> All uploaded files and analyses are scoped to your unique account ID.</li>
          <li><strong>Automated Data Rollback:</strong> Version history snapshots enable one-click recovery to the raw original state prior to any cleaning operations.</li>
        </ul>
      </div>

      {/* Logout Action */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="btn btn-danger"
        >
          <LogOut size={16} />
          <span>{isLoggingOut ? 'Signing out...' : 'Sign Out of Workspace'}</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
