import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Sliders,
  Database,
  RotateCcw,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Filter,
  Type,
  Trash2,
  RefreshCw,
  Plus,
  X,
  Sparkles,
  Cpu,
  BarChart2
} from 'lucide-react';
import { datasetService } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import useToast from '../components/Toast';
import { formatNumber } from '../utils/formatters';

export const DataCleaningPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [datasets, setDatasets] = useState([]);
  const [selectedId, setSelectedId] = useState(id || '');
  const [dataset, setDataset] = useState(null);
  const [audit, setAudit] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [previewSummary, setPreviewSummary] = useState(null);

  // Cleaning Form States
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [missingStrategy, setMissingStrategy] = useState('fill_mean');
  const [customMissingValue, setCustomMissingValue] = useState('');
  const [imputeColumns, setImputeColumns] = useState([]);
  const [dropColumns, setDropColumns] = useState([]);

  // Renaming State
  const [renameColumnOld, setRenameColumnOld] = useState('');
  const [renameColumnNew, setRenameColumnNew] = useState('');

  // Filtering State
  const [filterColumn, setFilterColumn] = useState('');
  const [filterOperator, setFilterOperator] = useState('>');
  const [filterValue, setFilterValue] = useState('');

  // Sorting State
  const [sortColumn, setSortColumn] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  // Load all datasets
  useEffect(() => {
    datasetService
      .getAll()
      .then((res) => {
        if (res?.success && res.datasets?.length > 0) {
          setDatasets(res.datasets);
          if (!selectedId) {
            setSelectedId(res.datasets[0]._id);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loadDatasetDetails = useCallback(async (targetId) => {
    if (!targetId) return;
    try {
      setLoading(true);
      const [dsRes, auditRes, dataRes] = await Promise.all([
        datasetService.getById(targetId),
        datasetService.getAudit(targetId),
        datasetService.getData(targetId, 1, 25)
      ]);

      if (dsRes?.success) setDataset(dsRes.dataset);
      if (auditRes?.success) setAudit(auditRes.audit);
      if (dataRes?.success) {
        setPreviewData(dataRes.data || []);
        setIsPreviewActive(false);
        setPreviewSummary(null);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load dataset for cleaning.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (selectedId) {
      loadDatasetDetails(selectedId);
    }
  }, [selectedId, loadDatasetDetails]);

  const handleDatasetChange = (newId) => {
    setSelectedId(newId);
    navigate(`/datasets/${newId}/cleaning`, { replace: true });
  };

  const buildOperationsPayload = () => {
    const ops = {};

    if (removeDuplicates) {
      ops.removeDuplicates = true;
    }

    if (missingStrategy) {
      ops.handleMissing = {
        strategy: missingStrategy,
        columns: imputeColumns.length > 0 ? imputeColumns : undefined,
        customValue: missingStrategy === 'fill_custom' ? customMissingValue : undefined
      };
    }

    if (dropColumns.length > 0) {
      ops.dropColumns = dropColumns;
    }

    if (renameColumnOld && renameColumnNew && renameColumnOld !== renameColumnNew) {
      ops.renameColumns = {
        [renameColumnOld]: renameColumnNew
      };
    }

    if (filterColumn && filterValue !== '') {
      ops.filterRows = {
        column: filterColumn,
        operator: filterOperator,
        value: filterValue
      };
    }

    if (sortColumn) {
      ops.sortBy = {
        column: sortColumn,
        order: sortOrder
      };
    }

    return ops;
  };

  // Preview before applying
  const handlePreview = async () => {
    try {
      setIsProcessing(true);
      const ops = buildOperationsPayload();
      const res = await datasetService.previewClean(selectedId, ops);

      if (res?.success) {
        setPreviewData(res.previewData || []);
        setPreviewSummary(res.summary);
        setIsPreviewActive(true);
        addToast('Live preview generated. Review modifications before saving.', 'info');
      }
    } catch (err) {
      addToast(err.message || 'Preview generation failed.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Apply Changes and commit version
  const handleApply = async () => {
    try {
      setIsProcessing(true);
      const ops = buildOperationsPayload();
      const res = await datasetService.clean(selectedId, ops);

      if (res?.success) {
        addToast(
          `Changes committed! Ingested ${res.summary.afterRowCount} rows (Version ${res.summary.version}).`,
          'success'
        );
        setIsPreviewActive(false);
        setPreviewSummary(null);
        // Reset specific single-use fields
        setRenameColumnOld('');
        setRenameColumnNew('');
        setFilterColumn('');
        setFilterValue('');
        loadDatasetDetails(selectedId);
      }
    } catch (err) {
      addToast(err.message || 'Failed to apply cleaning operations.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Rollback Undo
  const handleUndo = async () => {
    try {
      setIsProcessing(true);
      const res = await datasetService.undoClean(selectedId);

      if (res?.success) {
        addToast('Dataset successfully rolled back to previous version.', 'success');
        setIsPreviewActive(false);
        setPreviewSummary(null);
        loadDatasetDetails(selectedId);
      }
    } catch (err) {
      addToast(err.message || 'Undo rollback failed. No previous snapshot found.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading && datasets.length === 0) {
    return <LoadingSkeleton count={3} height="120px" />;
  }

  if (datasets.length === 0) {
    return (
      <EmptyState
        icon={Sliders}
        title="No Datasets Ingested"
        description="Upload a CSV or Excel spreadsheet or load a sample dataset to clean and format records."
        actionLabel="Upload Dataset"
        actionTo="/datasets/upload"
      />
    );
  }

  const columns = dataset?.columns || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Selector Ribbon */}
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
            <Sliders size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
              Data Cleaning & Transformation Studio
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              Live sanitization engine with preview-before-commit and one-click rollback snapshot.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Select Dataset:
          </label>
          <select
            className="form-input"
            style={{ width: '260px', padding: '0.5rem 0.75rem', backgroundColor: 'var(--color-bg-secondary)' }}
            value={selectedId}
            onChange={(e) => handleDatasetChange(e.target.value)}
          >
            {datasets.map((d) => (
              <option key={d._id} value={d._id}>
                {d.originalFilename} (v{d.version || 1})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dataset Health Overview Bar */}
      {dataset && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}
        >
          <div className="card" style={{ padding: '1rem 1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Current Version</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-text-main)', marginTop: '2px' }}>
              v{dataset.version || 1}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Status: {dataset.status}</span>
          </div>

          <div className="card" style={{ padding: '1rem 1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Ingested Rows</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-text-main)', marginTop: '2px' }}>
              {formatNumber(dataset.rowCount)}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{dataset.columnCount} columns</span>
          </div>

          <div className="card" style={{ padding: '1rem 1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Duplicate Rows</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: audit?.duplicateRowCount > 0 ? 'var(--color-error)' : 'var(--color-text-main)', marginTop: '2px' }}>
              {audit?.duplicateRowCount || 0}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{audit?.duplicateRowCount > 0 ? 'Removable below' : 'Clean'}</span>
          </div>

          <div className="card" style={{ padding: '1rem 1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Missing Cells</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--color-mono)', color: audit?.totalMissingCells > 0 ? 'var(--color-warning)' : 'var(--color-text-main)', marginTop: '2px' }}>
              {audit?.totalMissingCells || 0}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{audit?.totalMissingCells > 0 ? 'Imputable below' : '0 missing'}</span>
          </div>
        </div>
      )}

      {/* Main Cleaning Controls Card */}
      <div
        className="card"
        style={{
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}
      >
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
          Configurable Operations Pipeline
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Deduplication & Missing Imputation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                backgroundColor: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer'
              }}
            >
              <input
                type="checkbox"
                checked={removeDuplicates}
                onChange={(e) => setRemoveDuplicates(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-main)' }}>
                  Drop Duplicate Rows
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  Removes exact duplicate rows across all attributes
                </div>
              </div>
            </label>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Missing Value Strategy</label>
              <select
                className="form-input"
                value={missingStrategy}
                onChange={(e) => setMissingStrategy(e.target.value)}
              >
                <option value="fill_mean">Impute with Column Mean (Numeric)</option>
                <option value="fill_median">Impute with Column Median (Numeric)</option>
                <option value="fill_mode">Impute with Most Common Mode</option>
                <option value="fill_custom">Fill with Custom Value</option>
                <option value="drop_rows">Drop Rows Containing Missing Values</option>
              </select>
            </div>

            {missingStrategy === 'fill_custom' && (
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Custom Replacement Value</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Unknown or 0"
                  value={customMissingValue}
                  onChange={(e) => setCustomMissingValue(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Column Rename & Filtering */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="form-label">Rename Column</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  className="form-input"
                  style={{ flex: 1 }}
                  value={renameColumnOld}
                  onChange={(e) => setRenameColumnOld(e.target.value)}
                >
                  <option value="">Select column...</option>
                  {columns.map((col) => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder="New column name"
                  value={renameColumnNew}
                  onChange={(e) => setRenameColumnNew(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Filter Records</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  className="form-input"
                  style={{ flex: 1.2 }}
                  value={filterColumn}
                  onChange={(e) => setFilterColumn(e.target.value)}
                >
                  <option value="">Filter column...</option>
                  {columns.map((col) => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
                <select
                  className="form-input"
                  style={{ width: '80px' }}
                  value={filterOperator}
                  onChange={(e) => setFilterOperator(e.target.value)}
                >
                  <option value=">">&gt;</option>
                  <option value="<">&lt;</option>
                  <option value="=">=</option>
                  <option value="!=">!=</option>
                  <option value="contains">contains</option>
                </select>
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder="Value"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Sorting & Drop Columns */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="form-label">Sort By Attribute</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  className="form-input"
                  style={{ flex: 2 }}
                  value={sortColumn}
                  onChange={(e) => setSortColumn(e.target.value)}
                >
                  <option value="">None (Keep original order)</option>
                  {columns.map((col) => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
                <select
                  className="form-input"
                  style={{ flex: 1 }}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="asc">Ascending (A-Z, 0-9)</option>
                  <option value="desc">Descending (Z-A, 9-0)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Drop Unwanted Columns</label>
              <div
                style={{
                  maxHeight: '110px',
                  overflowY: 'auto',
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px'
                }}
              >
                {columns.map((col) => (
                  <label
                    key={col.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.8125rem',
                      color: 'var(--color-text-main)',
                      padding: '3px 6px',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={dropColumns.includes(col.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setDropColumns((prev) => [...prev, col.name]);
                        } else {
                          setDropColumns((prev) => prev.filter((c) => c !== col.name));
                        }
                      }}
                    />
                    <span>{col.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--color-border)',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <button
            onClick={handleUndo}
            disabled={isProcessing || !dataset?.previousDataPath}
            className="btn btn-outline btn-sm"
            title={dataset?.previousDataPath ? 'Rollback to version snapshot before last clean' : 'No previous version snapshot available'}
          >
            <RotateCcw size={14} />
            <span>Undo Last Clean</span>
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handlePreview}
              disabled={isProcessing}
              className="btn btn-secondary"
            >
              <Eye size={16} />
              <span>Preview Transformations</span>
            </button>

            <button
              onClick={handleApply}
              disabled={isProcessing}
              className="btn btn-primary"
            >
              {isProcessing ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              <span>Apply & Save Version</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Notification Banner */}
      {isPreviewActive && previewSummary && (
        <div
          style={{
            backgroundColor: 'rgba(182, 255, 74, 0.1)',
            border: '1px solid var(--color-primary)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} style={{ color: 'var(--color-primary)' }} />
            <div>
              <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                Live Transformation Preview Active
              </span>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Rows: {previewSummary.beforeRowCount} → {previewSummary.afterRowCount} ({previewSummary.rowsRemoved || 0} removed) • Cells modified: {previewSummary.cellsModified || 0}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                setIsPreviewActive(false);
                loadDatasetDetails(selectedId);
              }}
              className="btn btn-secondary btn-sm"
            >
              Exit Preview
            </button>
            <button onClick={handleApply} className="btn btn-primary btn-sm">
              Commit Changes
            </button>
          </div>
        </div>
      )}

      {/* Tabular Dataset Live View */}
      <div className="card" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
              {isPreviewActive ? 'Transformed Preview Grid' : 'Current Active Dataset Grid'}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              Showing first {previewData.length} records
            </p>
          </div>

          <span className={isPreviewActive ? 'badge badge-primary' : 'badge badge-ready'}>
            {isPreviewActive ? 'Simulation Mode' : 'Persisted Mode'}
          </span>
        </div>

        <div className="table-responsive" style={{ maxHeight: '440px', overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                {previewData.length > 0 &&
                  Object.keys(previewData[0]).map((colName) => (
                    <th key={colName}>{colName}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, rIdx) => (
                <tr key={rIdx}>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>{rIdx + 1}</td>
                  {Object.keys(previewData[0]).map((colName) => {
                    const val = row[colName];
                    const isMissing = val === null || val === undefined || val === '';
                    return (
                      <td key={colName} style={{ color: isMissing ? 'var(--color-text-muted)' : 'var(--color-text-main)', fontStyle: isMissing ? 'italic' : 'normal' }}>
                        {isMissing ? 'null' : String(val)}
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

export default DataCleaningPage;
