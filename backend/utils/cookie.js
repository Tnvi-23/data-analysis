/**
 * Cookie configuration utilities for SmartData Insight
 */

const isProduction = process.env.NODE_ENV === 'production';

function isCrossSiteProductionRequest(req) {
  const origin = req?.get?.('origin') || '';
  return isProduction || /^https:\/\//i.test(origin);
}

/**
 * Standard cookie configuration for setting the JWT auth token
 */
const getAuthCookieOptions = (req) => {
  const crossSite = isCrossSiteProductionRequest(req);
  return {
    httpOnly: true,
    secure: crossSite,
    sameSite: crossSite ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours (1 day)
    path: '/'
  };
};

/**
 * Cookie configuration for clearing the JWT auth token
 */
const getClearCookieOptions = (req) => {
  const crossSite = isCrossSiteProductionRequest(req);
  return {
    httpOnly: true,
    secure: crossSite,
    sameSite: crossSite ? 'none' : 'lax',
    path: '/'
  };
};

module.exports = {
  getAuthCookieOptions,
  getClearCookieOptions
};
