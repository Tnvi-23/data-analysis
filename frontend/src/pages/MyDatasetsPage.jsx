import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Database,
  Search,
  UploadCloud,
  FileSpreadsheet,
  Trash2,
  BarChart2,
  ArrowRight,
  Sliders,
  AlertCircle,
  Cpu,
  PieChart,
  Sparkles
} from 'lucide-react';
import { datasetService } from '../services/api';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ConfirmModal from '../components/ConfirmModal';
import useToast from '../components/Toast';
import { formatDate, formatNumber } from '../utils/formatters';

export const MyDatasetsPage = () => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [datasetToDelete, setDatasetToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();
  const { addToast } = useToast();

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await datasetService.getAll();
      if (res?.success) {
        setDatasets(res.datasets || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load datasets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!datasetToDelete) return;
    try {
      setIsDeleting(true);
      await datasetService.delete(datasetToDelete._id);
      setDatasets((prev) => prev.filter((d) => d._id !== datasetToDelete._id));
      setDeleteModalOpen(false);
      setDatasetToDelete(null);
      addToast('Dataset permanently deleted.', 'info');
    } catch (err) {
      addToast('Failed to delete dataset: ' + err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDatasets = datasets.filter((d) =>
    d.originalFilename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header & Search Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ position: 'relative', width: '340px' }}>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search datasets by filename..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)'
            }}
          />
        </div>

        <Link to="/datasets/upload" className="btn btn-primary btn-sm">
          <UploadCloud size={16} />
          <span>Import Dataset</span>
        </Link>
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

      {/* Dataset Grid */}
      {loading ? (
        <LoadingSkeleton count={3} height="120px" />
      ) : filteredDatasets.length === 0 ? (
        <EmptyState
          icon={Database}
          title={searchTerm ? 'No matching datasets found' : 'No datasets uploaded yet'}
          description={searchTerm ? 'Try searching with a different filename.' : 'Upload your first CSV or Excel file or load a sample dataset.'}
          actionLabel={searchTerm ? null : 'Upload Dataset'}
          actionTo="/datasets/upload"
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {filteredDatasets.map((ds) => {
            const score = ds.qualityScore?.overallScore !== undefined ? ds.qualityScore.overallScore : 92;
            const grade = ds.qualityScore?.grade || (score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'D');

            return (
              <div
                key={ds._id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'rgba(182, 255, 74, 0.1)',
                          color: 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <FileSpreadsheet size={20} />
                      </div>
                      <div>
                        <h4
                          style={{
                            fontSize: '1rem',
                            color: 'var(--color-text-main)',
                            fontWeight: 700,
                            wordBreak: 'break-word',
                            lineHeight: 1.3
                          }}
                        >
                          {ds.originalFilename}
                        </h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          Uploaded {formatDate(ds.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span className={`badge ${ds.status === 'cleaned' ? 'badge-cleaned' : 'badge-ready'}`}>
                        {ds.status} (v{ds.version || 1})
                      </span>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: score >= 85 ? 'var(--color-primary)' : score >= 70 ? 'var(--color-warning)' : 'var(--color-error)'
                        }}
                      >
                        Score: {score}/100 ({grade})
                      </span>
                    </div>
                  </div>

                  {/* Metrics Ribbon */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      backgroundColor: 'var(--color-bg-secondary)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      margin: '1.25rem 0',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Total Rows
                      </span>
                      <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)', fontFamily: 'var(--font-mono)' }}>
                        {formatNumber(ds.rowCount)}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Attributes
                      </span>
                      <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)', fontFamily: 'var(--font-mono)' }}>
                        {ds.columnCount} columns
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: '1rem',
                    flexWrap: 'wrap',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => navigate(`/datasets/${ds._id}/intelligence`)}
                      className="btn btn-primary btn-sm"
                      title="Inspect quality score and profiling"
                    >
                      <Cpu size={13} />
                      <span>Intelligence</span>
                    </button>

                    <button
                      onClick={() => navigate(`/datasets/${ds._id}/cleaning`)}
                      className="btn btn-secondary btn-sm"
                      title="Data cleaning and imputation"
                    >
                      <Sliders size={13} />
                      <span>Clean</span>
                    </button>

                    <button
                      onClick={() => navigate(`/datasets/${ds._id}/analysis`)}
                      className="btn btn-outline btn-sm"
                      title="Compute statistical models"
                    >
                      <BarChart2 size={13} />
                      <span>Analyze</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setDatasetToDelete(ds);
                      setDeleteModalOpen(true);
                    }}
                    style={{
                      color: 'var(--color-text-muted)',
                      padding: '6px',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'color 0.15s ease'
                    }}
                    title="Delete dataset"
                  >
                    <Trash2 size={16} />
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
        title="Delete Dataset?"
        message={`Are you sure you want to permanently delete "${datasetToDelete?.originalFilename}"? All associated files, analysis, and cached data will be removed.`}
        confirmLabel="Delete Permanently"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDatasetToDelete(null);
        }}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default MyDatasetsPage;
