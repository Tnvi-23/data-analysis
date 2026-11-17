import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, ArrowRight, User, Mail, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import useAuth from '../hooks/useAuth';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please provide a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      await register(name.trim(), email.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. An account with this email may already exist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text-main)'
      }}
    >
      {/* Brand Editorial Showcase (Desktop Left) */}
      <div
        style={{
          flex: 1,
          backgroundColor: 'var(--color-bg-secondary)',
          borderRight: '1px solid var(--color-border)',
          padding: '4rem 3.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}
        className="auth-brand-panel"
      >
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.svg" alt="SmartData Insight" style={{ width: '38px', height: '38px' }} />
          <div>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.375rem',
                fontWeight: 700,
                color: 'var(--color-text-main)',
                letterSpacing: '-0.02em'
              }}
            >
              SmartData <span style={{ color: 'var(--color-primary)' }}>Insight</span>
            </span>
          </div>
        </Link>

        <div style={{ maxWidth: '480px', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              marginBottom: '1rem',
              fontSize: '0.75rem',
              color: 'var(--color-primary)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}
          >
            <Sparkles size={14} />
            Instant Onboarding
          </div>

          <h2
            style={{
              fontSize: '2.5rem',
              color: 'var(--color-text-main)',
              lineHeight: 1.2,
              fontWeight: 700,
              letterSpacing: '-0.02em'
            }}
          >
            Create your private analytics workspace.
          </h2>

          <p
            style={{
              fontSize: '1rem',
              color: 'var(--color-text-secondary)',
              marginTop: '1.25rem',
              lineHeight: 1.6
            }}
          >
            Upload datasets or test instantly with 6 pre-loaded business samples. Automated cleaning, statistical profiling, and Gemini AI insights ready out of the box.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--color-primary)' }} />
              <span>Full Access to 6 Built-in Business Datasets</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--color-primary)' }} />
              <span>Automated 0–100 Data Quality Profiling</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--color-primary)' }} />
              <span>No Credit Card Required</span>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          Secured with encrypted HTTP-only session cookies.
        </div>
      </div>

      {/* Form Container (Right) */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem 2rem',
          backgroundColor: 'var(--color-bg)'
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1
              style={{
                fontSize: '1.875rem',
                fontWeight: 700,
                color: 'var(--color-text-main)',
                letterSpacing: '-0.02em'
              }}
            >
              Get Started
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem', marginTop: '4px' }}>
              Create an account to begin analyzing your data.
            </p>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: 'var(--color-error-bg)',
                border: '1px solid rgba(230, 108, 108, 0.3)',
                padding: '0.875rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-error)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.875rem',
                marginBottom: '1.5rem'
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)'
                  }}
                />
                <input
                  id="name"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Work Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)'
                  }}
                />
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="analyst@organization.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password (min. 6 characters)
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)'
                  }}
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                    padding: '2px'
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.75rem' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
              <ArrowRight size={18} />
            </button>
          </form>

          <div
            style={{
              marginTop: '2rem',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)',
              borderTop: '1px solid var(--color-border)',
              paddingTop: '1.5rem'
            }}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: 'var(--color-primary)',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
