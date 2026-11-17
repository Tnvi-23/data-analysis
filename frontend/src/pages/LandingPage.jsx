import React from 'react';
import { Link } from 'react-router-dom';
import {
  UploadCloud,
  Sparkles,
  BarChart3,
  FileCheck2,
  Sliders,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Bot,
  SplitSquareVertical,
  Layers,
  ChevronRight,
  Star
} from 'lucide-react';
import useAuth from '../hooks/useAuth';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Cpu,
      title: 'Dataset Intelligence & Quality Profiling',
      description: 'Instant 0–100 Data Quality Scoring based on missingness, duplicate rows, skewness and type uniformity with actionable recommendations.'
    },
    {
      icon: Sliders,
      title: 'Interactive Cleaning Studio',
      description: 'Audit anomalies, impute missing values with mean/median/mode, drop duplicates, rename attributes, and preview live transformations before applying.'
    },
    {
      icon: BarChart3,
      title: 'Visualization Studio',
      description: 'Generate high-fidelity Bar, Line, Area, Pie, Donut, Scatter, and Histogram charts with customizable axes, aggregations, and high-res PNG export.'
    },
    {
      icon: Bot,
      title: 'Insight AI with Google Gemini',
      description: 'Grounded natural language conversational analytics. Ask complex business queries and get precise answers backed directly by your dataset.'
    },
    {
      icon: TrendingUp,
      title: 'Advanced Statistical Modeling',
      description: 'Automated Pearson correlation matrix, IQR 1.5 outlier detection, variance, skewness indicators, and executive findings.'
    },
    {
      icon: FileSpreadsheet,
      title: 'Executive PDF Reports',
      description: 'Produce publication-ready multi-page analytical summaries complete with cover page, quality index, outlier audit, and Cloudinary storage.'
    }
  ];

  const sampleDatasets = [
    { title: 'Global SaaS Sales', rows: '1,000 rows', cols: '10 cols', type: 'Revenue & Churn' },
    { title: 'Student Academic Scores', rows: '500 rows', cols: '9 cols', type: 'Education & Testing' },
    { title: 'E-commerce Orders', rows: '850 rows', cols: '11 cols', type: 'Fulfillment & LTV' },
    { title: 'Employee Performance', rows: '400 rows', cols: '8 cols', type: 'HR Analytics' },
    { title: 'Customer Segmentation', rows: '600 rows', cols: '7 cols', type: 'RFM Marketing' },
    { title: 'Financial Transactions', rows: '1,200 rows', cols: '9 cols', type: 'Risk & Fraud' }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-main)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header
        style={{
          height: '76px',
          backgroundColor: 'rgba(23, 27, 24, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.svg" alt="SmartData Insight Logo" style={{ width: '36px', height: '36px' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--color-text-main)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1
              }}
            >
              SmartData <span style={{ color: 'var(--color-primary)' }}>Insight</span>
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', letterSpacing: '0.04em' }}>
              DECISION INTELLIGENCE
            </span>
          </div>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <a href="#features" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', transition: 'color 0.2s' }}>
            Features
          </a>
          <a href="#capabilities" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
            Capabilities
          </a>
          <a href="#samples" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
            Sample Data
          </a>

          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary btn-sm">
              Dashboard <ArrowRight size={15} />
            </Link>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started Free
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '5.5rem 2rem 4rem',
          maxWidth: '1240px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        {/* Subtle decorative glow */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '280px',
            background: 'radial-gradient(circle, rgba(182, 255, 74, 0.12) 0%, rgba(16, 18, 17, 0) 70%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              marginBottom: '1.75rem'
            }}
          >
            <Sparkles size={15} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)' }}>
              Next-Gen Data Science & Gemini AI Copilot
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4.25rem)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.12,
              marginBottom: '1.5rem',
              color: 'var(--color-text-main)'
            }}
          >
            Your Data Has Answers.<br />
            <span style={{ color: 'var(--color-primary)' }}>Let's Discover Them.</span>
          </h1>

          <p
            style={{
              fontSize: '1.1875rem',
              color: 'var(--color-text-secondary)',
              maxWidth: '740px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.65
            }}
          >
            Transform messy spreadsheets into executive business intelligence with automated cleaning,
            statistical profiling, interactive chart studios, and dataset-grounded Google Gemini AI analytics.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to={isAuthenticated ? '/dashboard' : '/register'} className="btn btn-primary btn-lg">
              <span>{isAuthenticated ? 'Open Workspace' : 'Get Started'}</span>
              <ArrowRight size={18} />
            </Link>
            <a href="#features" className="btn btn-secondary btn-lg">
              <span>Explore Platform</span>
            </a>
          </div>

          {/* Key Metric Badges */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2.5rem',
              marginTop: '3.5rem',
              paddingTop: '2rem',
              borderTop: '1px solid var(--color-border)',
              flexWrap: 'wrap'
            }}
          >
            <div>
              <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
                100%
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Automated Profiling
              </div>
            </div>
            <div style={{ width: '1px', backgroundColor: 'var(--color-border)' }} />
            <div>
              <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)' }}>
                0–100
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Data Quality Scoring
              </div>
            </div>
            <div style={{ width: '1px', backgroundColor: 'var(--color-border)' }} />
            <div>
              <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-text-main)', fontFamily: 'var(--font-mono)' }}>
                8+
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Chart Visualizations
              </div>
            </div>
            <div style={{ width: '1px', backgroundColor: 'var(--color-border)' }} />
            <div>
              <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
                Gemini 3.8
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                AI Conversational Copilot
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Platform Mockup */}
        <div
          style={{
            marginTop: '3.5rem',
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-lg)',
            textAlign: 'left',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Mock Window Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '1.25rem',
              borderBottom: '1px solid var(--color-border)',
              marginBottom: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-error)' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-warning)' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
              <span style={{ marginLeft: '12px', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                workspace / global_saas_sales.csv — Quality Score: 94/100 (Grade A)
              </span>
            </div>
            <span className="badge badge-success">Live Analysis</span>
          </div>

          {/* Mock Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div style={{ backgroundColor: 'var(--color-bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Data Quality Health
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
                    94.2
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-success)' }}>
                    Excellent — 0 duplicate rows detected
                  </div>
                </div>
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    border: '4px solid var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    color: 'var(--color-primary)'
                  }}
                >
                  A
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--color-bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                IQR Outlier Detection
              </div>
              <div style={{ marginTop: '10px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-warning)', fontFamily: 'var(--font-mono)' }}>
                  14
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                  Anomalies isolated in ARR & Deal Size
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--color-bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--color-primary)', textTransform: 'uppercase', fontWeight: 600 }}>
                <Sparkles size={14} />
                Insight AI Synthesis
              </div>
              <div style={{ marginTop: '10px', fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                "Enterprise tier accounts show +38% expansion velocity with a strong Pearson correlation (r = 0.81) to customer success touches."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" style={{ padding: '5rem 2rem', backgroundColor: 'var(--color-bg-secondary)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Engineered For Modern Analysts
            </span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginTop: '8px', letterSpacing: '-0.02em' }}>
              Comprehensive Intelligence Stack
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '8px auto 0', fontSize: '1rem' }}>
              Everything needed to profile, sanitize, visualize, and extract strategic insights from raw data.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem' }}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="card"
                  style={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    padding: '2rem',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    transition: 'border-color 0.2s, transform 0.2s'
                  }}
                >
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(182, 255, 74, 0.12)',
                      border: '1px solid rgba(182, 255, 74, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-primary)'
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sample Datasets Hub Section */}
      <section id="samples" style={{ padding: '5rem 2rem', maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Instant Testing Hub
          </span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginTop: '8px', letterSpacing: '-0.02em' }}>
            6 Built-in Datasets Ready in 1-Click
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '640px', margin: '8px auto 0', fontSize: '1rem' }}>
            No files on hand? Instantly spin up realistic business datasets with one click inside your workspace.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {sampleDatasets.map((sample, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: 'var(--color-text-main)', fontSize: '1rem' }}>
                  {sample.title}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  {sample.rows} • {sample.cols} • {sample.type}
                </div>
              </div>
              <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                Ready
              </span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <Link to={isAuthenticated ? '/datasets/upload' : '/register'} className="btn btn-primary">
            Explore All Datasets <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: 'auto',
          backgroundColor: 'var(--color-bg-secondary)',
          borderTop: '1px solid var(--color-border)',
          padding: '3rem 2.5rem 2rem'
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.svg" alt="SmartData Insight" style={{ width: '28px', height: '28px' }} />
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-main)' }}>
              SmartData Insight
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginLeft: '12px' }}>
              © 2026 SmartData Insight. All rights reserved.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            <Link to="/login" style={{ color: 'var(--color-text-secondary)' }}>Sign In</Link>
            <Link to="/register" style={{ color: 'var(--color-text-secondary)' }}>Create Account</Link>
            <a href="#features" style={{ color: 'var(--color-text-secondary)' }}>Capabilities</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
