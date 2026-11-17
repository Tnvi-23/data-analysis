import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Download,
  Trash2,
  ExternalLink,
  Calendar,
  Database,
  ArrowRight,
  AlertCircle,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  Cloud,
  HardDrive
} from 'lucide-react';
import { reportService, datasetService } from '../services/api';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ConfirmModal from '../components/ConfirmModal';
import useToast from '../components/Toast';
import { formatDate, formatFileSize } from '../utils/formatters';

export const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportToDelete, setReportToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick generation modal/drawer state
  const [isQuickGenOpen, setIsQuickGenOpen] = useState(false);
  const [quickDatasetId, setQuickDatasetId] = useState('');
  const [quickTitle, setQuickTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const { addToast } = useToast();

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await reportService.getAll();
      if (res?.success) {
        setReports(res.reports || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load report history.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDatasets = async () => {
    try {
      const res = await datasetService.getAll();
      if (res?.success && res.datasets?.length > 0) {
        setDatasets(res.datasets);
        setQuickDatasetId(res.datasets[0]._id);
        setQuickTitle(`Executive Analytics Report — ${res.datasets[0].originalFilename}`);
      }
    } catch (e) {
      // Non-critical background load
    }
  };

  useEffect(() => {
    fetchReports();
    fetchDatasets();
  }, []);

  const handleQuickGenerate = async (e) => {
    e.preventDefault();
    if (!quickDatasetId) {
      addToast('Please select a dataset to generate a report.', 'error');
      return;
    }

    try {
      setIsGenerating(true);
      const res = await reportService.generate(quickDatasetId, quickTitle.trim() || undefined);

      if (res?.success) {
        addToast('Executive PDF report generated successfully!', 'success');
        setIsQuickGenOpen(false);
        // Automatically refresh report history list
        await fetchReports();
      }
    } catch (err) {
      addToast(err.message || 'Report generation failed.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!reportToDelete) return;
    try {
      setIsDeleting(true);
      await reportService.delete(reportToDelete._id);
      setReports((prev) => prev.filter((r) => r._id !== reportToDelete._id));
      setDeleteModalOpen(false);
      setReportToDelete(null);
      addToast('Report deleted successfully.', 'info');
    } catch (err) {
      addToast('Failed to delete report: ' + err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--color-text-main)', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
            Executive Reports History
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Publication-grade PDF summaries generated from your statistical modeling workflows.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setIsQuickGenOpen(!isQuickGenOpen)}
            className="btn btn-secondary btn-sm"
          >
            <Plus size={14} />
            <span>Quick Generate</span>
          </button>
          <Link to="/reports/builder" className="btn btn-primary btn-sm">
            <FileSpreadsheet size={14} />
            <span>Report Builder</span>
          </Link>
        </div>
      </div>

      {/* Quick Generate Panel */}
      {isQuickGenOpen && (
        <div
          className="card"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-primary)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <form onSubmit={handleQuickGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
              Generate Report Directly
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Select Target Dataset</label>
                <select
                  className="form-input"
                  value={quickDatasetId}
                  onChange={(e) => {
                    setQuickDatasetId(e.target.value);
                    const match = datasets.find((d) => d._id === e.target.value);
                    if (match) {
                      setQuickTitle(`Executive Analytics Report — ${match.originalFilename}`);
                    }
                  }}
                  disabled={isGenerating}
                >
                  {datasets.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.originalFilename} ({d.rowCount} rows)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Report Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  placeholder="e.g. Executive Performance Audit"
                  disabled={isGenerating}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setIsQuickGenOpen(false)}
                className="btn btn-secondary btn-sm"
                disabled={isGenerating}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGenerating || !quickDatasetId}
                className="btn btn-primary btn-sm"
              >
                {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                <span>{isGenerating ? 'Compiling PDF...' : 'Generate Report'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

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

      {loading ? (
        <LoadingSkeleton count={3} height="90px" />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Reports Generated Yet"
          description="Use the Report Builder or Quick Generate above to produce your first executive PDF report from your datasets."
          actionLabel="Launch Report Builder"
          actionTo="/reports/builder"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reports.map((report) => {
            const datasetName = report.dataset?.originalFilename || 'Uploaded Dataset';
            const generationDate = report.generationDate || report.createdAt;

            return (
              <div
                key={report._id}
                className="card"
                style={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(182, 255, 74, 0.1)',
                      border: '1px solid rgba(182, 255, 74, 0.2)',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <FileText size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', color: 'var(--color-text-main)', fontWeight: 700 }}>
                      {report.title}
                    </h4>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginTop: '4px',
                        fontSize: '0.75rem',
                        color: 'var(--color-text-secondary)',
                        flexWrap: 'wrap'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-main)', fontWeight: 600 }}>
                        <Database size={12} />
                        {datasetName}
                      </span>
                      <span>•</span>
                      <span>Generated: {formatDate(generationDate)}</span>
                      <span>•</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {report.storageType === 'cloudinary' ? (
                          <>
                            <Cloud size={12} style={{ color: '#0EA5E9' }} />
                            <span>Cloudinary</span>
                          </>
                        ) : (
                          <>
                            <HardDrive size={12} style={{ color: '#10B981' }} />
                            <span>Local Storage</span>
                          </>
                        )}
                      </span>
                      <span>•</span>
                      <span>{formatFileSize(report.fileSize)}</span>
                    </div>
                  </div>
                </div>

                {/* View, Download, and Delete Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <a
                    href={reportService.getViewUrl(report)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    title="View PDF report in new tab"
                  >
                    <ExternalLink size={14} />
                    <span>View PDF</span>
                  </a>

                  <a
                    href={reportService.getDownloadUrl(report)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                    title="Download PDF report to computer"
                  >
                    <Download size={14} />
                    <span>Download</span>
                  </a>

                  <button
                    onClick={() => {
                      setReportToDelete(report);
                      setDeleteModalOpen(true);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--color-error)', padding: '7px 10px' }}
                    title="Delete report"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Report?"
        message={`Are you sure you want to delete "${reportToDelete?.title}"? The associated PDF document will be permanently removed.`}
        confirmLabel="Delete Report"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalOpen(false);
          setReportToDelete(null);
        }}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ReportsPage;
