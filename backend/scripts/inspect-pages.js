const fs = require('fs');
const zlib = require('zlib');

function decodePdfHex(str) {
  return str.replace(/<([0-9a-fA-F]+)>/g, (_, hex) => {
    try {
      return Buffer.from(hex, 'hex').toString('utf-8');
    } catch (e) {
      return '';
    }
  });
}

function analyzePdfPages(filePath) {
  const buf = fs.readFileSync(filePath);
  const str = buf.toString('latin1');
  
  // Find all content streams
  const streamRegex = /(\d+)\s+0\s+obj[\s\S]*?stream\r?\n([\s\S]*?)\r?\nendstream[\s\S]*?endobj/g;
  let sm;
  const streams = {};
  while ((sm = streamRegex.exec(str)) !== null) {
    const objNum = sm[1];
    try {
      const decompressed = zlib.inflateSync(Buffer.from(sm[2], 'latin1')).toString('utf-8');
      const decoded = decodePdfHex(decompressed);
      
      const words = [];
      // Match TJ arrays
      const tjRegex = /\[([\s\S]*?)\]\s*TJ/g;
      let tm;
      while ((tm = tjRegex.exec(decoded)) !== null) {
        // extract letters and words
        const cleaned = tm[1].replace(/[-0-9.]/g, '').replace(/\s+/g, ' ').trim();
        if (cleaned) words.push(cleaned);
      }
      // Match Tj strings
      const tjSimpleRegex = /\(([\s\S]*?)\)\s*Tj/g;
      while ((tm = tjSimpleRegex.exec(decoded)) !== null) {
        words.push(tm[1]);
      }
      streams[objNum] = {
        decompressedLength: decompressed.length,
        text: words.join(' '),
        hasImages: decompressed.includes('/Do') // PDFKit uses `/Do` operator to paint an XObject (image)
      };
    } catch (e) {}
  }
  
  // Find page objects
  const pageObjRegex = /(\d+)\s+0\s+obj[\s\S]*?\/Type\s*\/Page\b[\s\S]*?endobj/g;
  let pageMatch;
  let pageIndex = 0;
  
  console.log('====================================================');
  console.log('PDF Page Content Inspection: ' + filePath);
  console.log('====================================================');
  
  while ((pageMatch = pageObjRegex.exec(str)) !== null) {
    pageIndex++;
    const pageObjStr = pageMatch[0];
    const contentsMatch = pageObjStr.match(/\/Contents\s+(\d+)\s+0\s+R/);
    const contentId = contentsMatch ? contentsMatch[1] : null;
    const streamInfo = streams[contentId] || { text: '', decompressedLength: 0, hasImages: false };
    const textPreview = streamInfo.text.substring(0, 180).trim();
    const isBlank = streamInfo.decompressedLength < 500 && streamInfo.text.length < 50 && !streamInfo.hasImages;
    
    console.log(`\nPage ${pageIndex}:`);
    console.log(`  Stream ID: ${contentId}`);
    console.log(`  Decompressed Bytes: ${streamInfo.decompressedLength}`);
    console.log(`  Paints Embedded Images (/Do): ${streamInfo.hasImages}`);
    console.log(`  Text Content Extracted (${streamInfo.text.length} chars):`);
    console.log(`  "${textPreview}..."`);
    console.log(`  Status: ${isBlank ? '⚠️ POTENTIALLY BLANK!' : '✅ ACTIVE PAGE WITH RICH CONTENT'}`);
  }
}

const targetFile = process.argv[2] || 'uploads/reports/report-1793552001186-137755422.pdf';
analyzePdfPages(targetFile);
