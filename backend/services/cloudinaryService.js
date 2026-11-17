const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const fs = require('fs');

function describeCloudinaryError(error) {
  const nested = error?.error || error?.response?.body?.error;
  return {
    name: error?.name || nested?.name || 'CloudinaryError',
    message: error?.message || nested?.message || 'Unknown Cloudinary upload error',
    httpCode: error?.http_code || error?.statusCode || error?.response?.statusCode || nested?.http_code || null,
    code: error?.code || nested?.code || null
  };
}

/**
 * Upload a PDF file to Cloudinary with verified URL return
 *
 * @param {string} filePath - Local absolute path to the generated PDF
 * @param {string} originalName - Original filename for identification
 * @returns {Promise<{ url: string, publicId: string, format: string }|null>}
 */
const uploadPDFToCloudinary = async (filePath, originalName = 'report.pdf') => {
  if (!isCloudinaryConfigured()) {
    console.info('[Cloudinary] Configuration missing or incomplete. Skipping cloud upload.');
    return null;
  }

  const stat = await fs.promises.stat(filePath);
  if (!stat.isFile() || stat.size < 5) throw new Error('Generated PDF is empty or missing.');
  const header = Buffer.alloc(5);
  const handle = await fs.promises.open(filePath, 'r');
  try { await handle.read(header, 0, 5, 0); } finally { await handle.close(); }
  if (header.toString() !== '%PDF-') throw new Error('Generated file is not a valid PDF.');

  try {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const publicId = `report-${uniqueSuffix}`;

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'raw',
      folder: 'smartdata_insight_reports',
      public_id: publicId,
      use_filename: false,
      unique_filename: true,
      overwrite: false
    });

    const secureUrl = result.secure_url || result.url;
    if (!secureUrl || typeof secureUrl !== 'string' || !secureUrl.startsWith('http')) {
      throw new Error('Cloudinary response did not return a valid secure URL.');
    }

    return {
      url: secureUrl,
      publicId: result.public_id || publicId,
      format: result.format || 'pdf'
    };
  } catch (err) {
    const details = describeCloudinaryError(err);
    console.error('[Cloudinary] Upload failed:', JSON.stringify({ ...details, resourceType: 'raw', attempted: true }));
    throw err;
  }
};

/**
 * Delete a report asset from Cloudinary
 *
 * @param {string} publicId - Cloudinary asset public ID
 */
const deleteFromCloudinary = async (publicId) => {
  if (!isCloudinaryConfigured() || !publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    console.info(`[Cloudinary] Successfully deleted asset: ${publicId}`);
  } catch (err) {
    console.warn(`[Cloudinary] Delete failed for ${publicId}:`, err.message);
  }
};

module.exports = {
  uploadPDFToCloudinary,
  deleteFromCloudinary,
  isCloudinaryConfigured
};
