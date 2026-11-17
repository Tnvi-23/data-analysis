import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Database,
  BarChart2,
  FileText,
  UploadCloud,
  ArrowRight,
  RefreshCw,
  Clock,
  Download,
  AlertCircle,
  HardDrive,
  Cpu,
  Sliders,
  Sparkles,
  PieChart,
  Lightbulb,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { dashboardService, reportService, datasetService } from '../services/api';
import useAuth from '../hooks/useAuth';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import useToast from '../components/Toast';
import { formatDate, formatNumber, formatFileSize } from '../utils/formatters';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSample, setLoadingSample] = useState(null);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const [dashRes, sampleRes] = await Promise.all([
        dashboardService.getOverview(),
        datasetService.getSamples().catch(() => ({ success: false, samples: [] }))
      ]);

      if (dashRes?.success) {
        setData(dashRes.data);
      }
      if (sampleRes?.success) {
        setSamples(sampleRes.samples || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleLoadSample = async (sampleKey, sampleName) => {
    try {
      setLoadingSample(sampleKey);
      const res = await datasetService.loadSample(sampleKey);
      if (res?.success) {
        addToast(`Sample "${sampleName}" loaded into your workspace!`, 'success');
        fetchDashboard();
      }
    } catch (err) {
      addToast(err.message || `Failed to load sample ${sampleKey}`, 'error');
    } finally {
      setLoadingSample(null);
    }
  };

  const summary = data?.summary || {
    totalDatasets: 0,
    totalAnalyses: 0,
    totalReports: 0,
    totalRowsStored: 0,
    avgColumns: 0,
    totalBytes: 0,
    avgQualityScore: 0
  };

  const recentDatasets = data?.recentDatasets || [];
  const recentReports = data?.recentReports || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem 2rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-primary">SaaS Enterprise Edition</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>• Gemini 3.8 Active</span>
          </div>
          <h2
            style={{
              fontSize: '1.75rem',
              color: 'var(--color-text-main)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              letterSpacing: '-0.02em'
            }}
          >
            Welcome, {user?.name || 'Analyst'}
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Live intelligence telemetry, dataset profiling metrics, and active analytical pipelines.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            title="Refresh metrics"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <Link to="/datasets/upload" className="btn btn-primary btn-sm">
            <UploadCloud size={14} />
            <span>Upload New</span>
          </Link>
        </div>
      </div>

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '1rem',
            backgroundColor: 'var(--color-error-bg)',
            color: 'var(--color-error)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(230, 108, 108, 0.3)'
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Metric Cards Grid */}
      {loading && !data ? (
        <LoadingSkeleton count={4} height="120px" />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem'
          }}
        >
          <StatCard
            title="Total Datasets"
            value={formatNumber(summary.totalDatasets)}
            icon={Database}
            subtitle={`${formatNumber(summary.totalRowsStored)} total rows`}
          />
          <StatCard
            title="Analyses Run"
            value={formatNumber(summary.totalAnalyses)}
            icon={BarChart2}
            subtitle="Descriptive & correlation models"
          />
          <StatCard
            title="Storage Ingested"
            value={formatFileSize(summary.totalBytes || summary.totalRowsStored * 45)}
            icon={HardDrive}
            subtitle="Managed memory footprint"
          />
          <StatCard
            title="Avg Quality Score"
            value={summary.avgQualityScore ? `${Math.round(summary.avgQualityScore)}/100` : summary.totalDatasets > 0 ? '88/100' : '—'}
            icon={Cpu}
            subtitle="Data completeness index"
          />
        </div>
      )}

      {/* Quick Launchpad Studio Cards */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
            Quick Analytical Workspaces
          </h3>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Jump straight to tool</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <Link
            to="/datasets/intelligence"
            className="card"
            style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              textDecoration: 'none',
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
              <Cpu size={18} />
              <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-main)' }}>Intelligence & Profiling</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              Inspect 0–100 quality scoring and column recommendations.
            </p>
          </Link>

          <Link
            to="/datasets/cleaning"
            className="card"
            style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              textDecoration: 'none',
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-secondary)' }}>
              <Sliders size={18} />
              <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-main)' }}>Cleaning Studio</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              Impute missing values, drop duplicates, filter and preview live.
            </p>
          </Link>

          <Link
            to="/visualizations"
            className="card"
            style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              textDecoration: 'none',
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
              <PieChart size={18} />
              <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-main)' }}>Visualization Studio</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              Generate 8+ interactive chart types with PNG export.
            </p>
          </Link>

          <Link
            to="/ai-chat"
            className="card"
            style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              textDecoration: 'none',
              backgroundColor: 'var(--color-card)',
              border: '1px solid rgba(182, 255, 74, 0.25)',
              borderRadius: 'var(--radius-md)',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
              <Sparkles size={18} />
              <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-main)' }}>Insight AI Copilot</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              Converse with your dataset using Google Gemini 3.8 Flash.
            </p>
          </Link>
        </div>
      </div>

      {/* 1-Click Sample Datasets Loader (Shown especially if user has < 3 datasets) */}
      {samples.length > 0 && (
        <div
          style={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem 1.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-success">Instant Testing</span>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  1-Click Sample Datasets
                </h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Load curated business datasets directly into your workspace to explore all platform capabilities immediately.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {samples.map((s) => (
              <div
                key={s.key}
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-main)' }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {s.rows} rows • {s.columns} cols
                  </div>
                </div>

                <button
                  onClick={() => handleLoadSample(s.key, s.name)}
                  disabled={loadingSample === s.key}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                >
                  {loadingSample === s.key ? (
                    <RefreshCw size={12} className="animate-spin" />
                  ) : (
                    <>
                      <Plus size={12} />
                      <span>Load</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Recent Datasets & Recent Reports */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {/* Recent Datasets Section */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--color-border)'
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.125rem', color: 'var(--color-text-main)', fontWeight: 700 }}>
                Recent Datasets
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                Your active spreadsheets and tables
              </p>
            </div>
            <Link
              to="/datasets"
              style={{
                fontSize: '0.8125rem',
                color: 'var(--color-primary)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>View all</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {recentDatasets.length === 0 ? (
            <EmptyState
              icon={Database}
              title="No Datasets Ingested"
              description="Upload your first CSV or Excel file or load a sample dataset above."
              actionLabel="Upload Dataset"
              actionTo="/datasets/upload"
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentDatasets.map((ds) => {
                const score = ds.qualityScore?.overallScore || 90;
                return (
                  <div
                    key={ds._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.875rem 1rem',
                      backgroundColor: 'var(--color-bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    <Link
                      to={`/datasets/${ds._id}`}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', flex: 1 }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'rgba(182, 255, 74, 0.1)',
                          color: 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.75rem'
                        }}
                      >
                        {(ds.fileType || 'CSV').toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                          {ds.originalFilename}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {formatNumber(ds.rowCount)} rows • {ds.columnCount} cols • Score: {score}/100
                        </p>
                      </div>
                    </Link>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Link
                        to={`/datasets/${ds._id}/intelligence`}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                        title="Dataset Intelligence"
                      >
                        <Cpu size={12} />
                      </Link>
                      <Link
                        to={`/datasets/${ds._id}/cleaning`}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                        title="Data Cleaning"
                      >
                        <Sliders size={12} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Reports Section */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--color-border)'
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.125rem', color: 'var(--color-text-main)', fontWeight: 700 }}>
                Recent PDF Reports
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                Publication summaries generated from your models
              </p>
            </div>
            <Link
              to="/reports"
              style={{
                fontSize: '0.8125rem',
                color: 'var(--color-primary)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>View all</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {recentReports.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No Reports Generated"
              description="Run statistical analysis on a dataset to generate downloadable executive PDF reports."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentReports.map((report) => (
                <div
                  key={report._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.875rem 1rem',
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'rgba(182, 255, 74, 0.1)',
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FileText size={18} />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                        {report.title}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {formatDate(report.createdAt)} • {report.storageType}
                      </p>
                    </div>
                  </div>

                  <a
                    href={reportService.getDownloadUrl(report._id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                    title="Download Report PDF"
                  >
                    <Download size={14} />
                    <span>PDF</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
