import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Layers,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { datasetService, reportService } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import useToast from '../components/Toast';

export const ReportBuilderPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState('');
  const [reportTitle, setReportTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Sections included
  const [includeExecutiveSummary, setIncludeExecutiveSummary] = useState(true);
  const [includeQualityScore, setIncludeQualityScore] = useState(true);
  const [includeDescriptiveStats, setIncludeDescriptiveStats] = useState(true);
  const [includeOutliers, setIncludeOutliers] = useState(true);
  const [includeCorrelations, setIncludeCorrelations] = useState(true);

  useEffect(() => {
    datasetService
      .getAll()
      .then((res) => {
        if (res?.success && res.datasets?.length > 0) {
          setDatasets(res.datasets);
          setSelectedDatasetId(res.datasets[0]._id);
          setReportTitle(`Executive Analytics Report — ${res.datasets[0].originalFilename}`);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDatasetChange = (id) => {
    setSelectedDatasetId(id);
    const match = datasets.find((d) => d._id === id);
    if (match) {
      setReportTitle(`Executive Analytics Report — ${match.originalFilename}`);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedDatasetId) {
      addToast('Please select a dataset to compile a report for.', 'error');
      return;
    }

    try {
      setIsGenerating(true);

      // Step 1: Ensure statistical models are fresh
      let analysisId = null;
      try {
        const analysisRes = await datasetService.analyze(selectedDatasetId);
        if (analysisRes?.success && analysisRes.analysis) {
          analysisId = analysisRes.analysis._id;
        }
      } catch (analyzeErr) {
        console.warn('Pre-analysis note:', analyzeErr.message);
      }

      // Step 2: Generate PDF report
      const reportRes = await reportService.generate({
        datasetId: selectedDatasetId,
        analysisId,
        title: reportTitle.trim() || 'Executive Analytics Report'
      });

      if (reportRes?.success) {
        addToast('Multi-page executive PDF report compiled successfully!', 'success');
        navigate('/reports');
      }
    } catch (err) {
      addToast(err.message || 'Report generation failed.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading && datasets.length === 0) {
    return <LoadingSkeleton count={3} height="120px" />;
  }

  if (datasets.length === 0) {
    return (
      <EmptyState
        icon={FileSpreadsheet}
        title="No Datasets Available"
        description="Ingest or load a sample dataset before building executive reports."
        actionLabel="Upload Dataset"
        actionTo="/datasets/upload"
      />
    );
  }

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
          <FileSpreadsheet size={22} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
            Publication Report Builder
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            Design and generate professional multi-page executive PDF analytical summaries.
          </p>
        </div>
      </div>

      {/* Main Builder Form */}
      <form onSubmit={handleGenerate} className="card" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Target Dataset</label>
          <select
            className="form-input"
            value={selectedDatasetId}
            onChange={(e) => handleDatasetChange(e.target.value)}
          >
            {datasets.map((d) => (
              <option key={d._id} value={d._id}>
                {d.originalFilename} ({d.rowCount} rows, {d.columnCount} columns)
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Report Title</label>
          <input
            type="text"
            className="form-input"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            placeholder="e.g. Q4 Executive Data Audit & Outlier Analysis"
            required
          />
        </div>

        <div>
          <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>
            Sections to Compile
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px 14px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <input
                type="checkbox"
                checked={includeExecutiveSummary}
                onChange={(e) => setIncludeExecutiveSummary(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
              />
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-main)' }}>Executive Cover Page & Platform Header</span>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Includes dataset metadata, author timestamp, and summary statistics.</p>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px 14px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <input
                type="checkbox"
                checked={includeQualityScore}
                onChange={(e) => setIncludeQualityScore(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
              />
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-main)' }}>0–100 Data Quality Health Score</span>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Scores completeness, uniqueness, and format validity.</p>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px 14px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <input
                type="checkbox"
                checked={includeDescriptiveStats}
                onChange={(e) => setIncludeDescriptiveStats(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
              />
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-main)' }}>Descriptive Parametric Statistics</span>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Full numerical distribution: Mean, Median, Mode, Variance, and StdDev.</p>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px 14px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <input
                type="checkbox"
                checked={includeOutliers}
                onChange={(e) => setIncludeOutliers(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
              />
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-main)' }}>IQR Anomaly & Outlier Audit</span>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Quantifies high/low anomalies using 1.5 IQR bounds.</p>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px 14px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <input
                type="checkbox"
                checked={includeCorrelations}
                onChange={(e) => setIncludeCorrelations(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
              />
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-main)' }}>Pearson Correlation Matrix</span>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Linear dependence and correlation magnitude pairs.</p>
              </div>
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
          <button
            type="submit"
            disabled={isGenerating}
            className="btn btn-primary btn-lg"
          >
            {isGenerating ? <RefreshCw size={18} className="animate-spin" /> : <Download size={18} />}
            <span>{isGenerating ? 'Compiling PDF Report...' : 'Generate & Download PDF Report'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportBuilderPage;
