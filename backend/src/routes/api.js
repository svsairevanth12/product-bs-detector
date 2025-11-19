const express = require('express');
const router = express.Router();
const pollinationsService = require('../services/pollinationsService');
const logger = require('../utils/logger');

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

/**
 * Get cache statistics
 */
router.get('/stats', (req, res) => {
  const cacheStats = pollinationsService.getCacheStats();
  res.json({
    success: true,
    cache: cacheStats,
    uptime: process.uptime()
  });
});

/**
 * Get available AI models
 */
router.get('/models', async (req, res, next) => {
  try {
    const models = await pollinationsService.getAvailableModels();
    res.json({
      success: true,
      models: models
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Analyze product endpoint
 * POST /api/analyze
 * Body: { productTitle: string, model?: string, skipCache?: boolean }
 */
router.post('/analyze', async (req, res, next) => {
  try {
    const { productTitle, model, skipCache } = req.body;

    // Validation
    if (!productTitle || typeof productTitle !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'productTitle is required and must be a string'
      });
    }

    if (productTitle.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'productTitle must be at least 3 characters long'
      });
    }

    if (productTitle.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'productTitle must be less than 500 characters'
      });
    }

    logger.info('Received analysis request', {
      productTitle: productTitle.substring(0, 50),
      model,
      skipCache,
      ip: req.ip
    });

    // Call Pollinations service
    const result = await pollinationsService.analyzeProduct(productTitle, {
      model,
      skipCache
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    next(error);
  }
});

/**
 * Clear cache endpoint (useful for testing)
 * DELETE /api/cache?productTitle=xxx
 */
router.delete('/cache', (req, res) => {
  const { productTitle } = req.query;

  pollinationsService.clearCache(productTitle);

  res.json({
    success: true,
    message: productTitle
      ? `Cache cleared for product: ${productTitle}`
      : 'All cache cleared'
  });
});

module.exports = router;
