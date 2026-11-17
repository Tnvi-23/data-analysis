const { createCanvas } = require('@napi-rs/canvas');

const PALETTE = [
  '#16A34A', // Emerald
  '#0EA5E9', // Sky Blue
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#10B981', // Teal
  '#F97316', // Orange
  '#6366F1'  // Indigo
];

/**
 * Generate a high-resolution, print-ready Pie/Donut Chart PNG buffer
 */
const generatePieChartBuffer = async ({
  title = 'Categorical Distribution',
  data = [],
  width = 800,
  height = 420
}) => {
  if (!data || data.length === 0) return null;

  const validItems = data
    .filter((d) => d && typeof d.value === 'number' && d.value > 0)
    .slice(0, 8); // Top 8 categories max for clarity

  if (validItems.length === 0) return null;

  const total = validItems.reduce((acc, cur) => acc + cur.value, 0);
  if (total <= 0) return null;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Crisp white background for printability
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Border & subtle container
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);

  // Title Banner
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 22px Helvetica, Arial, sans-serif';
  ctx.fillText(title, 35, 45);

  ctx.fillStyle = '#64748B';
  ctx.font = '14px Helvetica, Arial, sans-serif';
  ctx.fillText(`Sample Size: ${total.toLocaleString()} total occurrences`, 35, 72);

  // Divider
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(35, 88);
  ctx.lineTo(width - 35, 88);
  ctx.stroke();

  // Chart Layout: Left side donut/pie, Right side legend
  const centerX = 230;
  const centerY = 250;
  const outerRadius = 130;
  const innerRadius = 55; // Donut hole for modern executive look

  let currentAngle = -Math.PI / 2; // Start at 12 o'clock

  validItems.forEach((item, index) => {
    const sliceAngle = (item.value / total) * (Math.PI * 2);
    const endAngle = currentAngle + sliceAngle;
    const color = PALETTE[index % PALETTE.length];

    // Draw donut slice
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, currentAngle, endAngle);
    ctx.arc(centerX, centerY, innerRadius, endAngle, currentAngle, true);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();

    // White separator line
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw percentage text inside larger slices
    const pct = (item.value / total) * 100;
    if (pct >= 8) {
      const midAngle = currentAngle + sliceAngle / 2;
      const textRadius = (outerRadius + innerRadius) / 2;
      const textX = centerX + Math.cos(midAngle) * textRadius;
      const textY = centerY + Math.sin(midAngle) * textRadius + 5;

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 13px Helvetica, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${pct.toFixed(0)}%`, textX, textY);
      ctx.textAlign = 'left'; // reset
    }

    currentAngle = endAngle;
  });

  // Center hole text
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 16px Helvetica, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${validItems.length} Cats`, centerX, centerY - 4);
  ctx.font = '12px Helvetica, Arial, sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText('Breakdown', centerX, centerY + 14);
  ctx.textAlign = 'left';

  // Legend on Right
  const legendX = 430;
  let legendY = 125;
  const rowHeight = 32;

  validItems.forEach((item, index) => {
    const color = PALETTE[index % PALETTE.length];
    const pct = ((item.value / total) * 100).toFixed(1);

    // Color swatch
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(legendX, legendY, 18, 18, 4) : ctx.rect(legendX, legendY, 18, 18);
    ctx.fill();

    // Category Label (truncated if too long)
    const label = String(item.label || `Category ${index + 1}`);
    const displayLabel = label.length > 22 ? label.substring(0, 20) + '..' : label;

    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 14px Helvetica, Arial, sans-serif';
    ctx.fillText(displayLabel, legendX + 28, legendY + 14);

    // Count and Percentage
    ctx.fillStyle = '#64748B';
    ctx.font = '14px Helvetica, Arial, sans-serif';
    ctx.fillText(`${item.value.toLocaleString()} (${pct}%)`, legendX + 230, legendY + 14);

    legendY += rowHeight;
  });

  return canvas.toBuffer('image/png');
};

/**
 * Generate a high-resolution, print-ready Histogram PNG buffer
 */
const generateHistogramBuffer = async ({
  title = 'Frequency Distribution Histogram',
  bins = [],
  xLabel = 'Value Range',
  yLabel = 'Frequency Count',
  width = 800,
  height = 400
}) => {
  if (!bins || bins.length === 0) return null;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);

  // Title
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 20px Helvetica, Arial, sans-serif';
  ctx.fillText(title, 35, 42);

  // Subtitle
  ctx.fillStyle = '#64748B';
  ctx.font = '13px Helvetica, Arial, sans-serif';
  ctx.fillText(`${xLabel} vs ${yLabel}`, 35, 65);

  const chartX = 75;
  const chartY = 95;
  const chartW = width - 110;
  const chartH = height - 160;

  const maxVal = Math.max(...bins.map((b) => b.count || 0), 1);

  // Draw Grid Lines (Y-Axis)
  ctx.strokeStyle = '#F1F5F9';
  ctx.lineWidth = 1;
  const gridTicks = 4;
  for (let i = 0; i <= gridTicks; i++) {
    const y = chartY + chartH - (i / gridTicks) * chartH;
    ctx.beginPath();
    ctx.moveTo(chartX, y);
    ctx.lineTo(chartX + chartW, y);
    ctx.stroke();

    // Tick Label
    ctx.fillStyle = '#94A3B8';
    ctx.font = '12px Helvetica, Arial, sans-serif';
    ctx.textAlign = 'right';
    const tickVal = Math.round((i / gridTicks) * maxVal);
    ctx.fillText(String(tickVal), chartX - 10, y + 4);
  }
  ctx.textAlign = 'left';

  // Draw Bars
  const barW = chartW / bins.length;
  const barGap = 6;

  bins.forEach((bin, idx) => {
    const count = bin.count || 0;
    const bH = (count / maxVal) * chartH;
    const bX = chartX + idx * barW + barGap / 2;
    const bY = chartY + chartH - bH;
    const actualW = barW - barGap;

    // Bar rectangle
    ctx.fillStyle = '#16A34A'; // Brand primary green
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(bX, bY, actualW, bH, [4, 4, 0, 0])
      : ctx.rect(bX, bY, actualW, bH);
    ctx.fill();

    // Value above bar
    if (count > 0) {
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 12px Helvetica, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(count), bX + actualW / 2, bY - 6);
    }

    // X-Axis Label
    ctx.fillStyle = '#64748B';
    ctx.font = '11px Helvetica, Arial, sans-serif';
    ctx.textAlign = 'center';
    const lbl = bin.label || bin.name || `Bin ${idx + 1}`;
    const displayLbl = lbl.length > 14 ? lbl.substring(0, 12) + '..' : lbl;
    ctx.fillText(displayLbl, bX + actualW / 2, chartY + chartH + 22);
  });

  ctx.textAlign = 'left';
  return canvas.toBuffer('image/png');
};

/**
 * Generate a Correlation Heatmap / Bar Visualizer PNG buffer
 */
const generateCorrelationChartBuffer = async ({
  title = 'Linear Pearson Correlation Dependencies',
  correlations = [],
  width = 800,
  height = 400
}) => {
  if (!correlations || correlations.length === 0) return null;

  const validCorrs = correlations.slice(0, 8); // Top 8 correlation pairs
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);

  // Title
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 20px Helvetica, Arial, sans-serif';
  ctx.fillText(title, 35, 42);

  ctx.fillStyle = '#64748B';
  ctx.font = '13px Helvetica, Arial, sans-serif';
  ctx.fillText('Pairwise Pearson coefficient (r) between -1.00 and +1.00', 35, 65);

  const startX = 220;
  const startY = 100;
  const barAreaW = width - startX - 80;
  const rowH = 34;

  // Zero-line
  const zeroX = startX + barAreaW / 2;
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(zeroX, startY - 10);
  ctx.lineTo(zeroX, startY + validCorrs.length * rowH);
  ctx.stroke();

  // Draw ticks at -1, -0.5, 0, +0.5, +1
  [-1, -0.5, 0, 0.5, 1].forEach((tick) => {
    const tx = zeroX + (tick * barAreaW) / 2;
    ctx.strokeStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.moveTo(tx, startY - 10);
    ctx.lineTo(tx, startY + validCorrs.length * rowH);
    ctx.stroke();

    ctx.fillStyle = '#94A3B8';
    ctx.font = '11px Helvetica, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${tick > 0 ? '+' : ''}${tick.toFixed(1)}`, tx, startY - 15);
  });
  ctx.textAlign = 'left';

  validCorrs.forEach((corr, idx) => {
    const y = startY + idx * rowH;
    const r = Number(corr.coefficient ?? corr.correlation ?? 0);
    const pairName = `${corr.col1} vs ${corr.col2}`;
    const displayPair = pairName.length > 24 ? pairName.substring(0, 22) + '..' : pairName;

    // Label
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 13px Helvetica, Arial, sans-serif';
    ctx.fillText(displayPair, 35, y + 16);

    // Bar calculation
    const barWidth = (Math.abs(r) * barAreaW) / 2;
    const barStartX = r >= 0 ? zeroX : zeroX - barWidth;
    const color = r >= 0 ? '#16A34A' : '#EF4444';

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(barStartX, y + 4, barWidth, 18, 3)
      : ctx.rect(barStartX, y + 4, barWidth, 18);
    ctx.fill();

    // Value text
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 12px Helvetica, Arial, sans-serif';
    const textX = r >= 0 ? zeroX + barWidth + 8 : zeroX - barWidth - 38;
    ctx.fillText(`${r > 0 ? '+' : ''}${r.toFixed(3)}`, textX, y + 17);
  });

  return canvas.toBuffer('image/png');
};

module.exports = {
  generatePieChartBuffer,
  generateHistogramBuffer,
  generateCorrelationChartBuffer
};
