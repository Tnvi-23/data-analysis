import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  BarChart2,
  RefreshCw,
  FileText,
  AlertCircle,
  Sparkles,
  Bot,
  Layers,
  Database,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { datasetService, analysisService, reportService } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import useToast from '../components/Toast';
import { formatNumber, formatPercent } from '../utils/formatters';

const CHART_PALETTE = ['#B6FF4A', '#82D957', '#59C785', '#5CA6FF', '#F2B84B', '#E66C6C', '#C488FF', '#FF8F6B'];

export const DataAnalysisPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [datasets, setDatasets] = useState([]);
  const [selectedId, setSelectedId] = useState(id || '');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [error, setError] = useState('');
  const [aiNotice, setAiNotice] = useState('');
  const [selectedHistCol, setSelectedHistCol] = useState('');
  const [selectedCatCol, setSelectedCatCol] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // 1. Initial Dataset Fetch
  useEffect(() => {
    let isMounted = true;
    datasetService
      .getAll()
      .then((res) => {
        if (!isMounted) return;
        if (res?.success && res.datasets?.length > 0) {
          setDatasets(res.datasets);
          // If URL param id is valid among datasets, use it; else default to first
          const match = res.datasets.find((d) => d._id === id);
          const initialId = match ? match._id : res.datasets[0]._id;
          setSelectedId(initialId);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load datasets.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // 2. Fetch or Compute Analysis for Selected Dataset
  const loadAnalysis = useCallback(
    async (targetId, forceRecompute = false) => {
      if (!targetId) return;
      try {
        setIsAnalyzing(true);
        setError('');
        setAiNotice('');

        let res = null;
        if (forceRecompute) {
          // Force fresh recalculation
          res = await datasetService.analyze(targetId);
        } else {
          // Try fetching existing analysis first (fast 0ms cache or auto-compute)
          res = await analysisService.getByDataset(targetId);
        }

        if (res?.success && res?.analysis) {
          setAnalysis(res.analysis);
          if (res.aiQuotaExceeded || res.aiMessage) {
            setAiNotice(res.aiMessage || 'AI insights temporarily unavailable due to rate limits.');
          }

          // Set default selected histogram column
          if (res.analysis.numericStats?.length > 0) {
            setSelectedHistCol(res.analysis.numericStats[0].column);
          }
          // Set default selected categorical column
          if (res.analysis.categoricalStats?.length > 0) {
            setSelectedCatCol(res.analysis.categoricalStats[0].column);
          }
        } else {
          throw new Error(res?.message || 'Statistical models could not be compiled.');
        }
      } catch (err) {
        setError(err.message || 'Failed to compute statistical analysis.');
      } finally {
        setIsAnalyzing(false);
      }
    },
    []
  );

  useEffect(() => {
    if (selectedId) {
      loadAnalysis(selectedId, false);
    }
  }, [selectedId, loadAnalysis]);

  const handleDatasetChange = (newId) => {
    setSelectedId(newId);
    setAnalysis(null);
    navigate(`/datasets/${newId}/analysis`, { replace: true });
  };

  // 3. Optional On-Demand Gemini AI Commentary
  const handleRequestAiExplanation = async () => {
    if (!selectedId) return;
    try {
      setIsExplaining(true);
      setAiNotice('');
      const res = await datasetService.explain(selectedId);
      if (res?.success) {
        if (res.aiExecutiveSummary) {
          setAnalysis((prev) => (prev ? { ...prev, aiExecutiveSummary: res.aiExecutiveSummary } : prev));
          addToast('AI executive commentary generated successfully!', 'success');
        } else if (res.aiQuotaExceeded || res.aiMessage) {
          setAiNotice(
            res.aiMessage || 'Gemini Free Tier daily rate limit exceeded (HTTP 429). Statistical analysis is unaffected.'
          );
        }
      }
    } catch (err) {
      setAiNotice('AI commentary notice: ' + (err.message || 'Request could not be completed.'));
    } finally {
      setIsExplaining(false);
    }
  };

  // 4. Report Generation
  const handleGenerateReport = async () => {
    if (!analysis) return;
    try {
      setIsGeneratingReport(true);
      const res = await reportService.generate({
        datasetId: selectedId,
        analysisId: analysis._id,
        title: `Executive Analytics Report — ${analysis.datasetName || 'Dataset'}`
      });
      if (res?.success) {
        addToast('Executive PDF report generated and archived!', 'success');
        navigate('/reports');
      }
    } catch (err) {
      addToast('Report generation failed: ' + err.message, 'error');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Loading Skeleton on first load
  if (loading && datasets.length === 0) {
    return <LoadingSkeleton count={4} height="130px" />;
  }

  // Empty State if user has zero datasets
  if (!loading && datasets.length === 0) {
    return (
      <EmptyState
        icon={BarChart2}
        title="No Datasets Ingested"
        description="Upload a CSV or Excel spreadsheet to compute full descriptive statistics, correlations, and IQR distributions."
        actionLabel="Upload Dataset"
        actionTo="/datasets/upload"
      />
    );
  }

  const overview = analysis?.overview || {};
  const numericStats = analysis?.numericStats || [];
  const categoricalStats = analysis?.categoricalStats || [];
  const correlations = analysis?.correlations || [];
  const observations = analysis?.observations || [];

  // Active Histogram Data
  const activeHistData =
    analysis?.chartSummaries?.histograms?.find((h) => h.column === selectedHistCol)?.data || [];

  // Active Categorical Data
  const activeCatStat = categoricalStats.find((c) => c.column === selectedCatCol);
  const activeCatData =
    analysis?.chartSummaries?.categoricalDistributions?.find((c) => c.column === selectedCatCol)?.data || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Selector & Control Ribbon */}
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
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(182, 255, 74, 0.12)',
              border: '1px solid rgba(182, 255, 74, 0.25)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <BarChart2 size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-text-main)', fontFamily: 'var(--font-heading)' }}>
              Statistical Modeling & Distribution Engine
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Deterministic parametric summaries, IQR anomaly audits, and Pearson correlation matrices.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              Dataset:
            </label>
            <select
              className="form-input"
              style={{ width: '250px', padding: '0.5rem 0.75rem', backgroundColor: 'var(--color-bg-secondary)' }}
              value={selectedId}
              onChange={(e) => handleDatasetChange(e.target.value)}
              disabled={isAnalyzing}
            >
              {datasets.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.originalFilename} ({d.rowCount} rows)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => loadAnalysis(selectedId, true)}
            disabled={isAnalyzing}
            className="btn btn-secondary btn-sm"
            title="Re-run statistical analysis on this dataset"
          >
            <RefreshCw size={14} className={isAnalyzing ? 'animate-spin' : ''} />
            <span>{isAnalyzing ? 'Computing...' : 'Re-compute'}</span>
          </button>

          <button
            onClick={handleRequestAiExplanation}
            disabled={isExplaining || isAnalyzing || !analysis}
            className="btn btn-secondary btn-sm"
            title="Generate AI executive commentary with Gemini"
          >
            <Bot size={14} className={isExplaining ? 'animate-spin' : ''} />
            <span>{isExplaining ? 'Analyzing...' : 'AI Commentary'}</span>
          </button>

          <button
            onClick={handleGenerateReport}
            disabled={isGeneratingReport || !analysis}
            className="btn btn-primary btn-sm"
            title="Compile and export executive PDF report"
          >
            <FileText size={14} />
            <span>{isGeneratingReport ? 'Compiling...' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      {/* Primary Error Banner */}
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--color-error-bg)',
            color: 'var(--color-error)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(230, 108, 108, 0.3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadAnalysis(selectedId, true)}
            className="btn btn-secondary btn-sm"
            style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
          >
            Retry Analysis
          </button>
        </div>
      )}

      {/* AI Quota / Notice Banner */}
      {aiNotice && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '0.875rem 1.25rem',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            color: '#F59E0B',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            fontSize: '0.8125rem'
          }}
        >
          <Info size={18} style={{ flexShrink: 0 }} />
          <span>{aiNotice}</span>
        </div>
      )}

      {/* Loading Skeleton during calculation */}
      {isAnalyzing && !analysis ? (
        <LoadingSkeleton count={4} height="130px" />
      ) : analysis ? (
        <>
          {/* Section 1: Overview Metric Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '1rem'
            }}
          >
            <div className="card">
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Sample Size (N)
              </span>
              <p style={{ fontSize: '1.875rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-text-main)', margin: '4px 0' }}>
                {formatNumber(overview.rowCount || 0)}
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Analyzed records</span>
            </div>

            <div className="card">
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Variables Profiled
              </span>
              <p style={{ fontSize: '1.875rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-text-main)', margin: '4px 0' }}>
                {overview.columnCount || 0}
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {numericStats.length} numeric, {categoricalStats.length} categorical
              </span>
            </div>

            <div className="card">
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Completeness Index
              </span>
              <p style={{ fontSize: '1.875rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-primary)', margin: '4px 0' }}>
                {formatPercent(overview.dataCompletenessPercentage || 100)}
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {overview.totalMissingCells || 0} missing cells
              </span>
            </div>

            <div className="card">
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Duplicate Rows
              </span>
              <p
                style={{
                  fontSize: '1.875rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  color: overview.duplicateRows > 0 ? 'var(--color-error)' : 'var(--color-text-main)',
                  margin: '4px 0'
                }}
              >
                {overview.duplicateRows || 0}
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Redundant rows</span>
            </div>
          </div>

          {/* Section 2: AI Executive Commentary (if generated) */}
          {analysis.aiExecutiveSummary && (
            <div
              className="card"
              style={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid rgba(182, 255, 74, 0.3)',
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} style={{ color: 'var(--color-primary)' }} />
                  <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                    Executive AI Commentary & Strategic Guidance
                  </h4>
                </div>
                <span className="badge badge-primary" style={{ fontSize: '0.6875rem' }}>
                  Powered by Gemini 3.8 Flash
                </span>
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.65,
                  whiteSpace: 'pre-line'
                }}
              >
                {analysis.aiExecutiveSummary}
              </div>
            </div>
          )}

          {/* Section 3: Automated Algorithmic Observations */}
          {observations.length > 0 && (
            <div
              className="card"
              style={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--color-primary)' }} />
                <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  Automated Algorithmic Observations ({observations.length})
                </h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {observations.map((obs, idx) => {
                  const isObj = typeof obs === 'object' && obs !== null;
                  const title = isObj ? obs.title || 'Insight' : String(obs);
                  const description = isObj ? obs.description : '';
                  const type = isObj ? (obs.type || 'GENERAL').toUpperCase() : 'NOTE';
                  const impact = isObj ? obs.impact : 'medium';

                  return (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span
                          className={`badge ${
                            impact === 'high'
                              ? 'badge-error'
                              : impact === 'medium'
                              ? 'badge-warning'
                              : 'badge-primary'
                          }`}
                          style={{ fontSize: '0.6875rem' }}
                        >
                          {type}
                        </span>
                        {isObj && obs.column && (
                          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                            {obs.column}
                          </span>
                        )}
                      </div>
                      <strong style={{ fontSize: '0.875rem', color: 'var(--color-text-main)' }}>{title}</strong>
                      {description && (
                        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                          {description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 4: Numerical Descriptive Statistics Table */}
          {numericStats.length > 0 ? (
            <div className="card" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                    Descriptive Numerical Statistics ({numericStats.length} variables)
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                    Sample parametric distributions: Mean, Median, Mode, Variance, Standard Deviation, and IQR bounds
                  </p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Variable</th>
                      <th>Count</th>
                      <th>Mean (μ)</th>
                      <th>Median</th>
                      <th>Mode</th>
                      <th>Std Dev (σ)</th>
                      <th>Variance (σ²)</th>
                      <th>Min</th>
                      <th>Max</th>
                      <th>Range</th>
                      <th>Q1 (25%)</th>
                      <th>Q3 (75%)</th>
                      <th>IQR</th>
                      <th>Outliers (1.5 IQR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {numericStats.map((stat) => {
                      const outlierCount = stat.outliers?.outlierCount ?? stat.outliers?.count ?? 0;
                      const outlierPct = stat.outliers?.outlierPercentage ?? stat.outliers?.percentage ?? 0;

                      return (
                        <tr key={stat.column}>
                          <td style={{ fontWeight: 700, color: 'var(--color-text-main)', fontFamily: 'var(--font-mono)' }}>
                            {stat.column}
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{formatNumber(stat.count)}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 700 }}>
                            {formatNumber(stat.mean)}
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{formatNumber(stat.median)}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{formatNumber(stat.mode)}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{formatNumber(stat.standardDeviation)}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{formatNumber(stat.variance)}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{formatNumber(stat.min)}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{formatNumber(stat.max)}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{formatNumber(stat.range)}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{formatNumber(stat.q1)}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{formatNumber(stat.q3)}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{formatNumber(stat.iqr)}</td>
                          <td>
                            {outlierCount > 0 ? (
                              <span className="badge badge-warning" style={{ fontSize: '0.6875rem' }}>
                                {outlierCount} ({outlierPct.toFixed(1)}%)
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>0</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: 'var(--color-bg-secondary)' }}>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                No continuous numeric variables detected in this dataset. Categorical and nominal distributions are shown below.
              </p>
            </div>
          )}

          {/* Section 5: Binned Frequency Histogram Chart */}
          {numericStats.length > 0 && (
            <div className="card" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                    Binned Frequency Histogram
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                    Frequency distribution bins for selected continuous numeric feature
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Variable:</label>
                  <select
                    className="form-input"
                    style={{ width: '200px', padding: '0.4rem 0.6rem' }}
                    value={selectedHistCol}
                    onChange={(e) => setSelectedHistCol(e.target.value)}
                  >
                    {numericStats.map((s) => (
                      <option key={s.column} value={s.column}>
                        {s.column}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ width: '100%', height: '320px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activeHistData} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--color-text-muted)" tick={{ fontSize: 11 }} />
                    <YAxis stroke="var(--color-text-muted)" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-bg-secondary)',
                        borderColor: 'var(--color-border)',
                        borderRadius: '8px',
                        color: 'var(--color-text-main)'
                      }}
                      itemStyle={{ color: 'var(--color-primary)' }}
                    />
                    <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Section 6: Categorical Frequency Distribution */}
          {categoricalStats.length > 0 && (
            <div className="card" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                    Categorical Frequency Distributions ({categoricalStats.length} nominal attributes)
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                    Unique category counts and top frequency occurrences
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Attribute:</label>
                  <select
                    className="form-input"
                    style={{ width: '220px', padding: '0.4rem 0.6rem' }}
                    value={selectedCatCol}
                    onChange={(e) => setSelectedCatCol(e.target.value)}
                  >
                    {categoricalStats.map((c) => (
                      <option key={c.column} value={c.column}>
                        {c.column} ({c.uniqueCount} distinct)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {activeCatStat && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
                  {/* Category Summary Badges */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <div className="card" style={{ padding: '0.75rem 1rem', flex: 1, backgroundColor: 'var(--color-bg-secondary)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Distinct Categories</span>
                        <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '2px' }}>
                          {activeCatStat.uniqueCount}
                        </p>
                      </div>
                      <div className="card" style={{ padding: '0.75rem 1rem', flex: 1, backgroundColor: 'var(--color-bg-secondary)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Most Frequent</span>
                        <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '2px' }}>
                          {String(activeCatStat.mostCommon?.value || 'N/A')} ({activeCatStat.mostCommon?.count || 0})
                        </p>
                      </div>
                    </div>

                    {/* Frequency Bars */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(activeCatStat.topValues || []).slice(0, 6).map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                            <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{String(item.value)}</span>
                            <span style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                              {item.count} ({item.percentage}%)
                            </span>
                          </div>
                          <div
                            style={{
                              width: '100%',
                              height: '8px',
                              backgroundColor: 'var(--color-bg-secondary)',
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.min(100, item.percentage || 0)}%`,
                                height: '100%',
                                backgroundColor: CHART_PALETTE[idx % CHART_PALETTE.length],
                                borderRadius: '4px',
                                transition: 'width 0.3s ease'
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Horizontal Bar Chart for Categories */}
                  <div style={{ width: '100%', height: '260px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={activeCatData}
                        margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                        <XAxis type="number" stroke="var(--color-text-muted)" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" stroke="var(--color-text-muted)" tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--color-bg-secondary)',
                            borderColor: 'var(--color-border)',
                            borderRadius: '8px',
                            color: 'var(--color-text-main)'
                          }}
                          itemStyle={{ color: 'var(--color-primary)' }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {activeCatData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 7: Pearson Correlation Matrix */}
          {correlations.length > 0 && (
            <div className="card" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  Linear Pearson Correlation Matrix (r)
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                  Pairwise linear dependencies between continuous numeric variables (-1.00 to +1.00)
                </p>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Attribute A</th>
                      <th>Attribute B</th>
                      <th>Correlation (r)</th>
                      <th>Direction</th>
                      <th>Dependence Strength</th>
                    </tr>
                  </thead>
                  <tbody>
                    {correlations.map((pair, idx) => {
                      const r = Number(pair.coefficient ?? pair.correlation ?? 0);
                      const absR = Math.abs(r);
                      const isStrong = absR >= 0.7;
                      const isMod = absR >= 0.35 && absR < 0.7;
                      const direction = r >= 0 ? 'Positive' : 'Negative';

                      return (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600, color: 'var(--color-text-main)', fontFamily: 'var(--font-mono)' }}>
                            {pair.col1 || pair.var1}
                          </td>
                          <td style={{ fontWeight: 600, color: 'var(--color-text-main)', fontFamily: 'var(--font-mono)' }}>
                            {pair.col2 || pair.var2}
                          </td>
                          <td
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 800,
                              color: isStrong
                                ? r > 0
                                  ? 'var(--color-primary)'
                                  : 'var(--color-error)'
                                : isMod
                                ? 'var(--color-warning)'
                                : 'var(--color-text-secondary)'
                            }}
                          >
                            {r.toFixed(4)}
                          </td>
                          <td>
                            <span style={{ fontSize: '0.8125rem', color: r >= 0 ? 'var(--color-primary)' : 'var(--color-error)' }}>
                              {direction}
                            </span>
                          </td>
                          <td>
                            <span className={isStrong ? 'badge badge-primary' : isMod ? 'badge badge-warning' : 'badge badge-ready'}>
                              {isStrong ? 'Strong Linear' : isMod ? 'Moderate' : 'Weak / Negligible'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 8: Anomaly & Missing Data Audit Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {/* Outlier Audit */}
            <div className="card" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                <AlertTriangle size={18} style={{ color: '#F59E0B' }} />
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  IQR 1.5 Anomaly Audit
                </h4>
              </div>
              {numericStats.filter((s) => (s.outliers?.outlierCount ?? s.outliers?.count ?? 0) > 0).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {numericStats
                    .filter((s) => (s.outliers?.outlierCount ?? s.outliers?.count ?? 0) > 0)
                    .map((s) => (
                      <div
                        key={s.column}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: 'var(--color-bg-secondary)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.8125rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                          <span style={{ color: 'var(--color-text-main)' }}>{s.column}</span>
                          <span style={{ color: '#F59E0B' }}>
                            {s.outliers.outlierCount || s.outliers.count} outliers (
                            {(s.outliers.outlierPercentage || s.outliers.percentage || 0).toFixed(1)}%)
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          Bounds: [{s.outliers.lowerBound}, {s.outliers.upperBound}]
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  No extreme anomalies detected outside 1.5 × IQR thresholds across numeric features.
                </p>
              )}
            </div>

            {/* Missing Value Audit */}
            <div className="card" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                <Database size={18} style={{ color: 'var(--color-primary)' }} />
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  Null & Missing Cell Breakdown
                </h4>
              </div>
              {overview.totalMissingCells > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[...numericStats, ...categoricalStats]
                    .filter((s) => s.missing > 0)
                    .map((s) => (
                      <div
                        key={s.column}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: 'var(--color-bg-secondary)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.8125rem',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{s.column}</span>
                        <span style={{ color: 'var(--color-error)' }}>
                          {s.missing} missing ({(((s.missing || 0) / (overview.rowCount || 1)) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  Dataset is 100% complete. Zero missing, NaN, or unpopulated cells identified.
                </p>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Guaranteed Fallback if not loading and no analysis exists */
        <div
          className="card"
          style={{
            padding: '3rem',
            textAlign: 'center',
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <BarChart2 size={36} style={{ color: 'var(--color-text-muted)', margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
            Statistical Models Ready to Compile
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', maxWidth: '420px', margin: '0.5rem auto 1.5rem auto' }}>
            Click below to compute parametric distributions, Pearson linear dependencies, and IQR anomaly audits.
          </p>
          <button
            onClick={() => loadAnalysis(selectedId, true)}
            disabled={isAnalyzing}
            className="btn btn-primary"
          >
            <RefreshCw size={16} className={isAnalyzing ? 'animate-spin' : ''} />
            <span>{isAnalyzing ? 'Compiling Models...' : 'Compute Statistical Analysis'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default DataAnalysisPage;
