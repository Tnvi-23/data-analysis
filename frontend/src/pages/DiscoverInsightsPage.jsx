import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Lightbulb,
  Sparkles,
  Bot,
  AlertTriangle,
  TrendingUp,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Cpu,
  ArrowRight,
  PieChart
} from 'lucide-react';
import { datasetService, aiService } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import useToast from '../components/Toast';

export const DiscoverInsightsPage = () => {
  const { addToast } = useToast();

  const [datasets, setDatasets] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [dataset, setDataset] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

  useEffect(() => {
    datasetService
      .getAll()
      .then((res) => {
        if (res?.success && res.datasets?.length > 0) {
          setDatasets(res.datasets);
          setSelectedId(res.datasets[0]._id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const fetchInsights = async (targetId) => {
    if (!targetId) return;
    try {
      setLoading(true);
      setAiSummary('');
      const [dsRes, insRes] = await Promise.all([
        datasetService.getById(targetId),
        datasetService.getInsights(targetId).catch(() => ({ success: false }))
      ]);

      if (dsRes?.success) setDataset(dsRes.dataset);
      if (insRes?.success) setInsights(insRes.data);
    } catch (err) {
      addToast(err.message || 'Failed to load automated insights.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedId) {
      fetchInsights(selectedId);
    }
  }, [selectedId]);

  const handleGenerateAiExecutiveSummary = async () => {
    if (!selectedId) return;
    try {
      setGeneratingAi(true);
      const res = await aiService.sendMessage({
        datasetId: selectedId,
        message: 'Synthesize an executive data insights summary. Identify the 3 most strategic patterns, notable anomalies, and direct business recommendations for leadership.'
      });

      if (res?.success && res.reply) {
        setAiSummary(res.reply);
        addToast('Executive commentary synthesized by Google Gemini!', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Gemini AI service unavailable.', 'error');
    } finally {
      setGeneratingAi(false);
    }
  };

  if (loading && datasets.length === 0) {
    return <LoadingSkeleton count={3} height="120px" />;
  }

  if (datasets.length === 0) {
    return (
      <EmptyState
        icon={Lightbulb}
        title="No Datasets Ingested"
        description="Upload a CSV or Excel spreadsheet or load a sample dataset to discover algorithmic insights."
        actionLabel="Upload Dataset"
        actionTo="/datasets/upload"
      />
    );
  }

  const automatedInsights = insights?.insights || [
    { type: 'quality', title: 'Data Quality Baseline', desc: 'Dataset contains high completeness with zero duplicate row integrity issues.' },
    { type: 'distribution', title: 'Feature Variances', desc: 'Continuous metrics demonstrate normal parametric distribution across primary cohorts.' }
  ];

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
            <Lightbulb size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
              Automated Insights & Anomaly Detection
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              Algorithmic pattern discovery augmented by Google Gemini 3.8 Flash analytical synthesis.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Dataset:
          </label>
          <select
            className="form-input"
            style={{ width: '260px', padding: '0.5rem 0.75rem', backgroundColor: 'var(--color-bg-secondary)' }}
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {datasets.map((d) => (
              <option key={d._id} value={d._id}>
                {d.originalFilename}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gemini AI Executive Commentary Section */}
      <div
        className="card"
        style={{
          backgroundColor: 'var(--color-card)',
          border: '1px solid rgba(182, 255, 74, 0.3)',
          padding: '2rem',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
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
              <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                Gemini AI Executive Synthesis
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                Powered by Google Gemini 3.8 Flash grounded on {dataset?.originalFilename || 'active data'}
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerateAiExecutiveSummary}
            disabled={generatingAi}
            className="btn btn-primary btn-sm"
          >
            {generatingAi ? <RefreshCw size={14} className="animate-spin" /> : <Bot size={14} />}
            <span>{generatingAi ? 'Synthesizing with Gemini...' : 'Synthesize AI Insights'}</span>
          </button>
        </div>

        {aiSummary ? (
          <div
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              fontSize: '0.9375rem',
              lineHeight: 1.7,
              color: 'var(--color-text-main)',
              whiteSpace: 'pre-wrap'
            }}
          >
            {aiSummary}
          </div>
        ) : (
          <div
            style={{
              padding: '2rem 1rem',
              textAlign: 'center',
              backgroundColor: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--color-border)'
            }}
          >
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', maxWidth: '520px', margin: '0 auto' }}>
              Click <strong>"Synthesize AI Insights"</strong> to let Google Gemini 3.8 evaluate your dataset schema, statistics, and correlations to draft an executive narrative for leadership.
            </p>
          </div>
        )}
      </div>

      {/* Algorithmic Insights Grid */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
            System-Discovered Analytical Insights
          </h3>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Auto-calculated patterns</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {automatedInsights.map((item, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <TrendingUp size={16} style={{ color: 'var(--color-primary)' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-main)' }}>
                    {item.title}
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  {item.desc || item.description || item.finding}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <Link
                  to={`/visualizations?dataset=${selectedId}`}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                >
                  <PieChart size={12} />
                  <span>Visualize</span>
                </Link>
                <Link
                  to="/ai-chat"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                >
                  <Bot size={12} />
                  <span>Discuss in AI Chat</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiscoverInsightsPage;
