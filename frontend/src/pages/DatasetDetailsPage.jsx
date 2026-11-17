import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Database,
  Sliders,
  BarChart2,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Trash2,
  Table,
  Columns,
  Layers,
  Sparkles,
  X,
  Cpu,
  PieChart,
  Bot
} from 'lucide-react';
import { datasetService } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import useToast from '../components/Toast';
import { formatDate, formatNumber, formatFileSize } from '../utils/formatters';

export const DatasetDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [dataset, setDataset] = useState(null);
  const [audit, setAudit] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cleaning Modal State
  const [cleanModalOpen, setCleanModalOpen] = useState(false);
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [missingStrategy, setMissingStrategy] = useState('fill_mean');
  const [customValue, setCustomValue] = useState('');
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [columnsToDrop, setColumnsToDrop] = useState([]);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanSuccessMsg, setCleanSuccessMsg] = useState('');

  const fetchDatasetDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [dsRes, auditRes, dataRes] = await Promise.all([
        datasetService.getById(id),
        datasetService.getAudit(id),
        datasetService.getData(id, 1, 20)
      ]);

      if (dsRes?.success) setDataset(dsRes.dataset);
      if (auditRes?.success) setAudit(auditRes.audit);
      if (dataRes?.success) setTableData(dataRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load dataset inspection details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDatasetDetails();
  }, [fetchDatasetDetails]);

  const handleExecuteClean = async (e) => {
    e.preventDefault();
    try {
      setIsCleaning(true);
      setError('');

      const operations = {
        removeDuplicates,
        handleMissing: {
          strategy: missingStrategy,
          columns: selectedColumns,
          customValue: missingStrategy === 'fill_custom' ? customValue : undefined
        },
        dropColumns: columnsToDrop
      };

      const res = await datasetService.clean(id, operations);

      if (res?.success) {
        addToast(
          `Cleaning complete! Before: ${res.summary.beforeRowCount} rows | After: ${res.summary.afterRowCount} rows (v${res.summary.version}).`,
          'success'
        );
        setCleanModalOpen(false);
        fetchDatasetDetails();
      }
    } catch (err) {
      setError(err.message || 'Cleaning execution failed.');
    } finally {
      setIsCleaning(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton count={4} height="120px" />;
  }

  if (error && !dataset) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--color-card)' }}>
        <p style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>{error}</p>
        <Link to="/datasets" className="btn btn-outline">Back to Datasets</Link>
      </div>
    );
  }

  const score = dataset?.qualityScore?.overallScore || 92;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Header Card */}
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1.25rem',
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className={`badge ${dataset.status === 'cleaned' ? 'badge-cleaned' : 'badge-ready'}`}>
              {dataset.status.toUpperCase()}
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              Version {dataset.version || 1}
            </span>
            <span className="badge badge-primary">
              Score: {score}/100
            </span>
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
            {dataset.originalFilename}
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Imported on {formatDate(dataset.createdAt)} • Size: {formatFileSize(dataset.fileSize)} • Type: {dataset.fileType.toUpperCase()}
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(`/datasets/${dataset._id}/intelligence`)}
            className="btn btn-secondary btn-sm"
          >
            <Cpu size={14} style={{ color: 'var(--color-primary)' }} />
            <span>Intelligence Profiling</span>
          </button>

          <button
            onClick={() => navigate(`/datasets/${dataset._id}/cleaning`)}
            className="btn btn-secondary btn-sm"
          >
            <Sliders size={14} style={{ color: 'var(--color-secondary)' }} />
            <span>Cleaning Studio</span>
          </button>

          <button
            onClick={() => navigate(`/datasets/${dataset._id}/analysis`)}
            className="btn btn-primary btn-sm"
          >
            <BarChart2 size={14} />
            <span>Statistical Analysis</span>
          </button>

          <button
            onClick={() => navigate(`/visualizations?dataset=${dataset._id}`)}
            className="btn btn-outline btn-sm"
          >
            <PieChart size={14} />
            <span>Visualizations</span>
          </button>
        </div>
      </div>

      {/* Anomaly Audit Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}
      >
        <div className="card" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
            Total Ingested Rows
          </span>
          <p style={{ fontSize: '1.875rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-text-main)', margin: '0.4rem 0' }}>
            {formatNumber(dataset.rowCount)}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Active row entries
          </span>
        </div>

        <div className="card" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
            Attributes (Columns)
          </span>
          <p style={{ fontSize: '1.875rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-text-main)', margin: '0.4rem 0' }}>
            {dataset.columnCount}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Detected schema attributes
          </span>
        </div>

        <div
          className="card"
          style={{
            backgroundColor: audit?.duplicateRowCount > 0 ? 'var(--color-error-bg)' : 'var(--color-card)',
            border: `1px solid ${audit?.duplicateRowCount > 0 ? 'rgba(230, 108, 108, 0.4)' : 'var(--color-border)'}`
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: audit?.duplicateRowCount > 0 ? 'var(--color-error)' : 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
            Duplicate Rows
          </span>
          <p style={{ fontSize: '1.875rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: audit?.duplicateRowCount > 0 ? 'var(--color-error)' : 'var(--color-text-main)', margin: '0.4rem 0' }}>
            {audit?.duplicateRowCount || 0}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            {audit?.duplicateRowCount > 0 ? 'Removable via cleaning studio' : 'Zero duplicates detected'}
          </span>
        </div>

        <div
          className="card"
          style={{
            backgroundColor: audit?.totalMissingCells > 0 ? 'rgba(242, 184, 75, 0.1)' : 'var(--color-card)',
            border: `1px solid ${audit?.totalMissingCells > 0 ? 'rgba(242, 184, 75, 0.3)' : 'var(--color-border)'}`
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: audit?.totalMissingCells > 0 ? 'var(--color-warning)' : 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
            Missing Cells
          </span>
          <p style={{ fontSize: '1.875rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: audit?.totalMissingCells > 0 ? 'var(--color-warning)' : 'var(--color-text-main)', margin: '0.4rem 0' }}>
            {audit?.totalMissingCells || 0}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            {audit?.totalMissingCells > 0 ? 'Imputable with Mean/Median/Mode' : '100% complete cells'}
          </span>
        </div>
      </div>

      {/* Inferred Columns & Schema */}
      <div className="card" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
        <h3 style={{ fontSize: '1.125rem', color: 'var(--color-text-main)', fontWeight: 700, marginBottom: '1rem' }}>
          Detected Schema & Attributes ({dataset.columns.length})
        </h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Column Name</th>
                <th>Inferred Type</th>
                <th>Missing Values</th>
                <th>Sample Values</th>
              </tr>
            </thead>
            <tbody>
              {dataset.columns.map((col) => {
                const missingInCol = audit?.missingByColumn?.[col.name] || 0;
                return (
                  <tr key={col.name}>
                    <td style={{ fontWeight: 600, color: 'var(--color-text-main)', fontFamily: 'var(--font-mono)' }}>{col.name}</td>
                    <td>
                      <span className="badge badge-ready">{col.inferredType}</span>
                    </td>
                    <td style={{ color: missingInCol > 0 ? 'var(--color-warning)' : 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {missingInCol > 0 ? `${missingInCol} missing` : '0 missing'}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {col.sampleValues?.slice(0, 3).join(', ') || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Data Preview */}
      <div className="card" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', color: 'var(--color-text-main)', fontWeight: 700 }}>
              Tabular Preview (First {tableData.length} Records)
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              Live spreadsheet inspection
            </p>
          </div>
        </div>

        <div className="table-responsive" style={{ maxHeight: '420px', overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                {dataset.columns.map((col) => (
                  <th key={col.name}>{col.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, rIdx) => (
                <tr key={rIdx}>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>{rIdx + 1}</td>
                  {dataset.columns.map((col) => {
                    const cellVal = row[col.name];
                    const isMissing = cellVal === null || cellVal === undefined || cellVal === '';
                    return (
                      <td key={col.name} style={{ color: isMissing ? 'var(--color-text-muted)' : 'var(--color-text-main)', fontStyle: isMissing ? 'italic' : 'normal' }}>
                        {isMissing ? 'null' : String(cellVal)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DatasetDetailsPage;
