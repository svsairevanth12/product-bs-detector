require('dotenv').config();

const config = {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
  },

  pollinations: {
    apiToken: process.env.POLLINATIONS_API_TOKEN,
    baseUrl: process.env.POLLINATIONS_API_BASE_URL || 'https://text.pollinations.ai',
    model: process.env.POLLINATIONS_MODEL || 'searchgpt',
    timeout: 30000, // 30 seconds
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },

  cache: {
    ttl: parseInt(process.env.CACHE_TTL) || 3600, // 1 hour
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD) || 600, // 10 minutes
  },

  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['*'], // Allow all in development
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

// Validate required configuration
if (!config.pollinations.apiToken && config.server.env === 'production') {
  console.warn('WARNING: POLLINATIONS_API_TOKEN not set. Using anonymous tier with rate limits.');
}

module.exports = config;
