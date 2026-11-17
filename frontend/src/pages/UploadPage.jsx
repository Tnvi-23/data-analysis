import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  Sparkles,
  Database,
  Plus,
  RefreshCw,
  Cpu,
  Sliders,
  BarChart2
} from 'lucide-react';
import { datasetService } from '../services/api';
import { formatFileSize } from '../utils/formatters';
import useToast from '../components/Toast';

export const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const [samples, setSamples] = useState([]);
  const [loadingSamples, setLoadingSamples] = useState(true);
  const [loadingSampleKey, setLoadingSampleKey] = useState(null);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    datasetService
      .getSamples()
      .then((res) => {
        if (res?.success) {
          setSamples(res.samples || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSamples(false));
  }, []);

  const handleLoadSample = async (sampleKey, sampleName) => {
    try {
      setLoadingSampleKey(sampleKey);
      const res = await datasetService.loadSample(sampleKey);
      if (res?.success && res.dataset) {
        addToast(`Sample "${sampleName}" loaded into your workspace!`, 'success');
        navigate(`/datasets/${res.dataset._id}/intelligence`);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load sample dataset', 'error');
    } finally {
      setLoadingSampleKey(null);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    if (!selectedFile) return;

    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileName = selectedFile.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setError('Unsupported file type. Please upload a CSV (.csv) or Excel (.xlsx, .xls) file.');
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      setError('File is too large. Maximum supported file size is 20 MB.');
      return;
    }

    setFile(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      setError('');
      setUploadProgress(0);

      const res = await datasetService.upload(file, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      if (res?.success && res?.dataset) {
        setSuccessData(res.dataset);
        addToast('Dataset uploaded and schema indexed successfully!', 'success');
      }
    } catch (err) {
      setError(err.message || 'File upload failed. Please verify the spreadsheet format.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2
          style={{
            fontSize: '1.75rem',
            color: 'var(--color-text-main)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            letterSpacing: '-0.02em'
          }}
        >
          Import Dataset
        </h2>
        <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          Upload your local CSV or Excel files, or instantly load pre-curated business samples.
        </p>
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
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Drag & Drop Area or Success Card */}
      {successData ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '3rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-success)'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h3 style={{ fontSize: '1.5rem', color: 'var(--color-text-main)', fontWeight: 700 }}>
            Dataset Ingested Successfully
          </h3>
          <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', maxWidth: '520px' }}>
            <strong>{successData.originalFilename}</strong> has been indexed: parsed{' '}
            <strong>{successData.rowCount}</strong> rows across <strong>{successData.columnCount}</strong> attributes.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => {
                setSuccessData(null);
                setFile(null);
                setUploadProgress(0);
              }}
              className="btn btn-secondary"
            >
              Upload Another
            </button>
            <button
              onClick={() => navigate(`/datasets/${successData._id}/intelligence`)}
              className="btn btn-primary"
            >
              <Cpu size={16} />
              <span>Dataset Intelligence</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate(`/datasets/${successData._id}/cleaning`)}
              className="btn btn-outline"
            >
              <Sliders size={16} />
              <span>Cleaning Studio</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '2.5rem', backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: isDragging ? 'rgba(182, 255, 74, 0.05)' : 'var(--color-bg-secondary)',
              padding: '3.5rem 2rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'rgba(182, 255, 74, 0.12)',
                border: '1px solid rgba(182, 255, 74, 0.25)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <UploadCloud size={30} />
            </div>

            <div>
              <p style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                Drag and drop your spreadsheet here, or <span style={{ color: 'var(--color-primary)' }}>browse</span>
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Supports CSV (.csv) and Microsoft Excel (.xlsx, .xls) up to 20 MB
              </p>
            </div>
          </div>

          {/* Selected File Details */}
          {file && (
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1.25rem',
                backgroundColor: 'var(--color-bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(182, 255, 74, 0.1)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FileSpreadsheet size={22} />
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                    {file.name}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>

              {!isUploading && (
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  style={{ color: 'var(--color-text-muted)', padding: '6px' }}
                  title="Remove selected file"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          )}

          {/* Progress Bar */}
          {isUploading && (
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>Uploading and parsing spreadsheet...</span>
                <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{uploadProgress}%</span>
              </div>
              <div
                style={{
                  height: '8px',
                  width: '100%',
                  backgroundColor: 'var(--color-border)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${uploadProgress}%`,
                    backgroundColor: 'var(--color-primary)',
                    transition: 'width 0.2s ease'
                  }}
                />
              </div>
            </div>
          )}

          {/* Trigger Button */}
          {file && !isUploading && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="btn btn-primary"
              >
                <UploadCloud size={16} />
                <span>Upload & Ingest</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 1-Click Sample Datasets Hub */}
      <div
        className="card"
        style={{
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          padding: '1.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: 'var(--color-primary)' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                1-Click Sample Datasets
              </h3>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Don't have a dataset ready? Load one of our curated business sample datasets into your workspace immediately.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {samples.map((s) => (
            <div
              key={s.key}
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-main)' }}>
                    {s.name}
                  </span>
                  <span className="badge badge-ready" style={{ fontSize: '0.6875rem' }}>
                    CSV
                  </span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '6px', lineHeight: 1.4 }}>
                  {s.description}
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                  {s.rows} rows • {s.columns} columns
                </div>
              </div>

              <button
                onClick={() => handleLoadSample(s.key, s.name)}
                disabled={loadingSampleKey === s.key}
                className="btn btn-outline btn-sm"
                style={{ width: '100%' }}
              >
                {loadingSampleKey === s.key ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <>
                    <Plus size={14} />
                    <span>Load into Workspace</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Guidelines Card */}
      <div
        className="card"
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)'
        }}
      >
        <h4 style={{ fontSize: '0.9375rem', color: 'var(--color-text-main)', fontWeight: 700, marginBottom: '0.75rem' }}>
          Data Formatting Best Practices
        </h4>
        <ul style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.7, paddingLeft: '1.25rem' }}>
          <li>Column headers must be clean and present in the first row of your spreadsheet.</li>
          <li>Missing values can be left empty, null, or NA — our cleaning studio provides instant imputation.</li>
          <li>All uploaded files are stored strictly within your private account workspace.</li>
          <li>Uploaded data can be fully restored at any time via the one-click rollback undo history.</li>
        </ul>
      </div>
    </div>
  );
};

export default UploadPage;
