/**
 * Cookie configuration utilities for SmartData Insight
 */

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Standard cookie configuration for setting the JWT auth token
 */
const getAuthCookieOptions = () => {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours (1 day)
    path: '/'
  };
};

/**
 * Cookie configuration for clearing the JWT auth token
 */
const getClearCookieOptions = () => {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/'
  };
};

module.exports = {
  getAuthCookieOptions,
  getClearCookieOptions
};
