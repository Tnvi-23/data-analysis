import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  PieChart as PieIcon,
  BarChart3,
  LineChart as LineIcon,
  TrendingUp,
  Download,
  Filter,
  Sparkles,
  RefreshCw,
  Sliders,
  Layers,
  ChevronDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import html2canvas from 'html2canvas';
import { datasetService } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import useToast from '../components/Toast';

const SAAS_PALETTE = ['#B6FF4A', '#82D957', '#59C785', '#5CA6FF', '#F2B84B', '#E66C6C', '#C488FF', '#FF8F6B'];

export const VisualizationStudioPage = () => {
  const [searchParams] = useSearchParams();
  const datasetParam = searchParams.get('dataset');
  const { addToast } = useToast();

  const [datasets, setDatasets] = useState([]);
  const [selectedId, setSelectedId] = useState(datasetParam || '');
  const [dataset, setDataset] = useState(null);
  const [rawRows, setRawRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Visualization Controls
  const [chartType, setChartType] = useState('bar'); // bar, hbar, line, area, pie, donut, scatter, histogram
  const [xAxisCol, setXAxisCol] = useState('');
  const [yAxisCol, setYAxisCol] = useState('');
  const [aggregation, setAggregation] = useState('sum'); // none, sum, avg, count, max, min

  const chartRef = useRef(null);

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
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;

    setLoading(true);
    Promise.all([
      datasetService.getById(selectedId),
      datasetService.getData(selectedId, 1, 200) // load sample for client chart
    ])
      .then(([dsRes, dataRes]) => {
        if (dsRes?.success) {
          setDataset(dsRes.dataset);
          const cols = dsRes.dataset.columns || [];
          const numCols = cols.filter((c) => c.inferredType === 'numeric');
          const catCols = cols.filter((c) => c.inferredType !== 'numeric');

          // Sensible defaults
          if (catCols.length > 0) setXAxisCol(catCols[0].name);
          else if (cols.length > 0) setXAxisCol(cols[0].name);

          if (numCols.length > 0) setYAxisCol(numCols[0].name);
          else if (cols.length > 1) setYAxisCol(cols[1].name);
        }
        if (dataRes?.success) {
          setRawRows(dataRes.data || []);
        }
      })
      .catch((err) => {
        addToast(err.message || 'Failed to load dataset records.', 'error');
      })
      .finally(() => setLoading(false));
  }, [selectedId, addToast]);

  // Aggregate data based on X, Y, and Aggregation method
  const chartData = useMemo(() => {
    if (!rawRows || rawRows.length === 0 || !xAxisCol) return [];

    const numeric = (value) => {
      const parsed = typeof value === 'number' ? value : Number(String(value ?? '').replace(/,/g, ''));
      return Number.isFinite(parsed) ? parsed : null;
    };

    // Pie/doughnut charts need positive numeric slices. When the selected
    // value column is categorical, use actual category frequencies.
    if (chartType === 'pie' || chartType === 'donut') {
      const groups = {};
      rawRows.forEach((row) => {
        const label = String(row[xAxisCol] ?? '').trim() || 'Unknown';
        const value = yAxisCol ? numeric(row[yAxisCol]) : null;
        if (!groups[label]) groups[label] = { label, value: 0, count: 0 };
        groups[label].count += 1;
        groups[label].value += value === null ? 0 : value;
      });
      return Object.values(groups).map((group) => ({
        label: group.label,
        value: Number((group.value || group.count).toFixed(2))
      })).filter((item) => item.value > 0).slice(0, 12);
    }

    if (chartType === 'scatter') {
      return rawRows.map((row) => ({
        x: numeric(row[xAxisCol]),
        y: numeric(row[yAxisCol])
      })).filter((point) => point.x !== null && point.y !== null).slice(0, 200);
    }

    if (aggregation === 'none' || !yAxisCol) {
      return rawRows.slice(0, 30).map((r) => ({
        label: String(r[xAxisCol] ?? ''),
        value: yAxisCol ? Number(r[yAxisCol]) || 0 : 1
      }));
    }

    // Group by X attribute
    const groups = {};
    rawRows.forEach((row) => {
      const key = String(row[xAxisCol] ?? 'Unknown');
      const val = numeric(row[yAxisCol]);
      if (val === null) return;

      if (!groups[key]) {
        groups[key] = { key, count: 0, sum: 0, min: val, max: val };
      }

      groups[key].count += 1;
      groups[key].sum += val;
      if (val < groups[key].min) groups[key].min = val;
      if (val > groups[key].max) groups[key].max = val;
    });

    return Object.values(groups)
      .slice(0, 20)
      .map((g) => {
        let finalVal = 0;
        if (aggregation === 'sum') finalVal = g.sum;
        else if (aggregation === 'avg') finalVal = g.sum / g.count;
        else if (aggregation === 'count') finalVal = g.count;
        else if (aggregation === 'max') finalVal = g.max;
        else if (aggregation === 'min') finalVal = g.min;

        return {
          label: g.key,
          value: Number(finalVal.toFixed(2))
        };
      });
  }, [rawRows, xAxisCol, yAxisCol, aggregation, chartType]);

  // Download high-resolution PNG using html2canvas
  const handleDownloadPNG = async () => {
    if (!chartRef.current) return;
    try {
      setIsExporting(true);
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#1D231F',
        scale: 2
      });
      const link = document.createElement('a');
      link.download = `${dataset?.originalFilename || 'chart'}_${chartType}_visualization.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      addToast('Visualization exported as high-res PNG!', 'success');
    } catch (err) {
      addToast('PNG export failed: ' + err.message, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Export aggregated data as CSV
  const handleExportCSV = () => {
    if (chartData.length === 0) return;
    const headers = [xAxisCol || 'Category', yAxisCol || 'Value'];
    const csvContent = [
      headers.join(','),
      ...chartData.map((d) => `"${d.label}",${d.value}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${dataset?.originalFilename || 'data'}_aggregated.csv`;
    link.click();
    addToast('Aggregated chart records exported as CSV!', 'success');
  };

  if (loading && datasets.length === 0) {
    return <LoadingSkeleton count={3} height="120px" />;
  }

  if (datasets.length === 0) {
    return (
      <EmptyState
        icon={PieIcon}
        title="No Datasets Ingested"
        description="Upload a CSV or Excel file or load a sample dataset to build interactive charts."
        actionLabel="Upload Dataset"
        actionTo="/datasets/upload"
      />
    );
  }

  const columns = dataset?.columns || [];
  const numericColumns = columns.filter((c) => c.inferredType === 'numeric');

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
            <PieIcon size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
              Interactive Visualization Studio
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              Explore data shapes across 8 chart engines, custom aggregations, and high-res PNG export.
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

      {/* Control Bar: Chart Types & Axes Configuration */}
      <div
        className="card"
        style={{
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
      >
        {/* Chart Type Selector Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { id: 'bar', label: 'Vertical Bar', icon: BarChart3 },
            { id: 'hbar', label: 'Horizontal Bar', icon: BarChart3 },
            { id: 'line', label: 'Line Chart', icon: LineIcon },
            { id: 'area', label: 'Area Chart', icon: TrendingUp },
            { id: 'pie', label: 'Pie Chart', icon: PieIcon },
            { id: 'donut', label: 'Donut Chart', icon: PieIcon },
            { id: 'scatter', label: 'Scatter Plot', icon: BarChart3 },
            { id: 'histogram', label: 'Histogram', icon: BarChart3 }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setChartType(type.id)}
              className={chartType === type.id ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
              style={{ padding: '0.45rem 0.85rem' }}
            >
              <type.icon size={14} />
              <span>{type.label}</span>
            </button>
          ))}
        </div>

        {/* Axes and Aggregation Controls Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">X-Axis (Dimension)</label>
            <select
              className="form-input"
              value={xAxisCol}
              onChange={(e) => setXAxisCol(e.target.value)}
            >
              {columns.map((c) => (
                <option key={c.name} value={c.name}>{c.name} ({c.inferredType})</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Y-Axis (Metric)</label>
            <select
              className="form-input"
              value={yAxisCol}
              onChange={(e) => setYAxisCol(e.target.value)}
            >
              {numericColumns.map((c) => (
                <option key={c.name} value={c.name}>{c.name} (Numeric)</option>
              ))}
              {numericColumns.length === 0 &&
                columns.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Aggregation</label>
            <select
              className="form-input"
              value={aggregation}
              onChange={(e) => setAggregation(e.target.value)}
            >
              <option value="sum">Sum of Values</option>
              <option value="avg">Average (Mean)</option>
              <option value="count">Record Count</option>
              <option value="max">Maximum</option>
              <option value="min">Minimum</option>
              <option value="none">Raw Records (No Grouping)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleDownloadPNG}
              disabled={isExporting}
              className="btn btn-outline btn-sm"
              style={{ flex: 1 }}
            >
              <Download size={14} />
              <span>{isExporting ? 'Exporting...' : 'PNG Image'}</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="btn btn-outline btn-sm"
              style={{ flex: 1 }}
            >
              <Download size={14} />
              <span>CSV Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Chart Display Area */}
      <div
        ref={chartRef}
        className="card"
        style={{
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
              {yAxisCol ? `${yAxisCol} by ${xAxisCol}` : xAxisCol}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              Aggregation: {aggregation.toUpperCase()} • Showing {chartData.length} data points
            </p>
          </div>

          <span className="badge badge-primary">{chartType.toUpperCase()}</span>
        </div>

        {chartData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-text-muted)' }}>
            No visual points available for the selected axes configuration.
          </div>
        ) : (
          <div style={{ width: '100%', height: '420px' }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' && (
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252D28" vertical={false} />
                  <XAxis dataKey="label" stroke="#A3ACA4" tick={{ fontSize: 12 }} angle={-25} textAnchor="end" />
                  <YAxis stroke="#A3ACA4" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#171B18', borderColor: '#303A32', borderRadius: '8px', color: '#F5F7F2' }}
                    itemStyle={{ color: '#B6FF4A' }}
                  />
                  <Bar dataKey="value" fill="#B6FF4A" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}

              {chartType === 'hbar' && (
                <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252D28" horizontal={false} />
                  <XAxis type="number" stroke="#A3ACA4" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="label" type="category" stroke="#A3ACA4" tick={{ fontSize: 12 }} width={100} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#171B18', borderColor: '#303A32', borderRadius: '8px', color: '#F5F7F2' }}
                    itemStyle={{ color: '#B6FF4A' }}
                  />
                  <Bar dataKey="value" fill="#82D957" radius={[0, 4, 4, 0]} />
                </BarChart>
              )}

              {chartType === 'line' && (
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252D28" vertical={false} />
                  <XAxis dataKey="label" stroke="#A3ACA4" tick={{ fontSize: 12 }} angle={-25} textAnchor="end" />
                  <YAxis stroke="#A3ACA4" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#171B18', borderColor: '#303A32', borderRadius: '8px', color: '#F5F7F2' }}
                    itemStyle={{ color: '#B6FF4A' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#B6FF4A" strokeWidth={3} dot={{ fill: '#101211', stroke: '#B6FF4A', strokeWidth: 2, r: 4 }} />
                </LineChart>
              )}

              {chartType === 'area' && (
                <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                  <defs>
                    <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B6FF4A" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#B6FF4A" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252D28" vertical={false} />
                  <XAxis dataKey="label" stroke="#A3ACA4" tick={{ fontSize: 12 }} angle={-25} textAnchor="end" />
                  <YAxis stroke="#A3ACA4" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#171B18', borderColor: '#303A32', borderRadius: '8px', color: '#F5F7F2' }}
                    itemStyle={{ color: '#B6FF4A' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#B6FF4A" strokeWidth={2} fillOpacity={1} fill="url(#colorArea)" />
                </AreaChart>
              )}

              {(chartType === 'pie' || chartType === 'donut') && (
                <PieChart>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#171B18', borderColor: '#303A32', borderRadius: '8px', color: '#F5F7F2' }}
                  />
                  <Legend wrapperStyle={{ color: '#A3ACA4', fontSize: '12px' }} />
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={chartType === 'donut' ? 70 : 0}
                    outerRadius={130}
                    paddingAngle={3}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SAAS_PALETTE[index % SAAS_PALETTE.length]} stroke="#171B18" strokeWidth={2} />
                    ))}
                  </Pie>
                </PieChart>
              )}

              {chartType === 'scatter' && (
                <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252D28" />
                  <XAxis type="number" dataKey="x" stroke="#A3ACA4" tick={{ fontSize: 12 }} />
                  <YAxis type="number" dataKey="y" stroke="#A3ACA4" tick={{ fontSize: 12 }} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ backgroundColor: '#171B18', borderColor: '#303A32', borderRadius: '8px', color: '#F5F7F2' }}
                    itemStyle={{ color: '#B6FF4A' }}
                  />
                  <Scatter data={chartData} fill="#B6FF4A" />
                </ScatterChart>
              )}

              {chartType === 'histogram' && (
                <BarChart data={(() => {
                  const values = rawRows.map((row) => Number(row[yAxisCol])).filter(Number.isFinite);
                  if (!values.length) return [];
                  const min = Math.min(...values); const max = Math.max(...values);
                  const width = (max - min || 1) / 8;
                  return Array.from({ length: 8 }, (_, index) => ({
                    label: `${(min + index * width).toFixed(1)}–${(min + (index + 1) * width).toFixed(1)}`,
                    value: values.filter((value) => value >= min + index * width && (index === 7 ? value <= max : value < min + (index + 1) * width)).length
                  }));
                })()} margin={{ top: 20, right: 30, left: 20, bottom: 55 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252D28" vertical={false} />
                  <XAxis dataKey="label" stroke="#A3ACA4" angle={-25} textAnchor="end" />
                  <YAxis allowDecimals={false} stroke="#A3ACA4" />
                  <Tooltip contentStyle={{ backgroundColor: '#171B18', borderColor: '#303A32', color: '#F5F7F2' }} />
                  <Bar dataKey="value" fill="#F2B84B" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Aggregated Data Preview Table */}
      <div className="card" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
        <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.75rem' }}>
          Aggregated Data Points ({chartData.length} entries)
        </h3>

        <div className="table-responsive" style={{ maxHeight: '280px', overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th>{xAxisCol || 'Category'}</th>
                <th>Aggregated Value ({yAxisCol || 'Count'})</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((d, idx) => (
                <tr key={idx}>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>{idx + 1}</td>
                  <td style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>{d.label}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>{d.value.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VisualizationStudioPage;
