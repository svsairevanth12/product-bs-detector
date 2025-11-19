const axios = require('axios');
const NodeCache = require('node-cache');
const config = require('../config/config');
const logger = require('../utils/logger');

// Initialize cache
const cache = new NodeCache({
  stdTTL: config.cache.ttl,
  checkperiod: config.cache.checkPeriod
});

class PollinationsService {
  constructor() {
    this.baseUrl = config.pollinations.baseUrl;
    this.apiToken = config.pollinations.apiToken;
    this.model = config.pollinations.model;
  }

  /**
   * Generate cache key from product title and model
   */
  generateCacheKey(productTitle, model) {
    return `analysis:${model}:${productTitle.toLowerCase().trim()}`;
  }

  /**
   * Build the analysis prompt for BS detection
   */
  buildPrompt(productTitle) {
    return `You are a cynical consumer investigator analyzing product quality and authenticity.

Product to analyze: "${productTitle}"

Instructions:
1. Search the web (Reddit, YouTube, independent forums, tech reviews) for REAL user experiences
2. Ignore marketing content and sponsored reviews
3. Focus on identifying:
   - Common failure points and dealbreakers
   - Signs of dropshipped/white-label products
   - Quality issues reported by actual users
   - Positive aspects backed by evidence
4. Determine a realistic sentiment score from 1.0 (terrible) to 5.0 (excellent)

IMPORTANT: Return ONLY a valid JSON object with this exact structure:
{
  "real_score": 3.5,
  "verdict": "Brief honest assessment in 2-3 sentences",
  "dealbreakers": ["Issue 1", "Issue 2", "Issue 3"],
  "pros": ["Positive aspect 1", "Positive aspect 2"],
  "source_count": 12
}

Do not include any text before or after the JSON. Return ONLY the JSON object.`;
  }

  /**
   * Call Pollinations API with search-augmented model
   */
  async analyzeProduct(productTitle, options = {}) {
    const model = options.model || this.model;
    const cacheKey = this.generateCacheKey(productTitle, model);

    // Check cache first
    const cachedResult = cache.get(cacheKey);
    if (cachedResult && !options.skipCache) {
      logger.info('Cache hit for product analysis', { productTitle, model });
      return { ...cachedResult, cached: true };
    }

    try {
      const prompt = this.buildPrompt(productTitle);

      logger.info('Calling Pollinations API', {
        productTitle,
        model,
        hasToken: !!this.apiToken
      });

      // Prepare request configuration
      const requestConfig = {
        method: 'POST',
        url: `${this.baseUrl}/openai`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          messages: [
            {
              role: 'system',
              content: 'You are a consumer product investigator who provides brutally honest assessments based on real user feedback from the web.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          model: model,
          jsonMode: true, // Enable JSON mode for structured output
          seed: 42, // Consistent results for same input
        },
        timeout: config.pollinations.timeout,
      };

      // Add authentication if token is available
      if (this.apiToken) {
        requestConfig.headers['Authorization'] = `Bearer ${this.apiToken}`;
        logger.debug('Using authenticated request');
      }

      // Make API request
      const response = await axios(requestConfig);

      // Extract the response text
      let responseText = '';
      if (response.data && response.data.choices && response.data.choices[0]) {
        responseText = response.data.choices[0].message.content;
      } else if (typeof response.data === 'string') {
        responseText = response.data;
      } else {
        throw new Error('Unexpected API response format');
      }

      logger.debug('Raw API response', { responseText: responseText.substring(0, 200) });

      // Parse JSON response
      let analysisResult;
      try {
        // Try to find JSON in the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
        } else {
          analysisResult = JSON.parse(responseText);
        }
      } catch (parseError) {
        logger.warn('Failed to parse JSON response, using fallback', {
          error: parseError.message,
          responseText: responseText.substring(0, 500)
        });

        // Fallback: Return raw text as verdict
        analysisResult = {
          real_score: 0,
          verdict: responseText || 'Unable to analyze product at this time.',
          dealbreakers: ['API returned unexpected format'],
          pros: [],
          source_count: 0
        };
      }

      // Validate response structure
      const validatedResult = this.validateAndNormalizeResponse(analysisResult);

      // Cache the result
      cache.set(cacheKey, validatedResult);
      logger.info('Successfully analyzed product and cached result', {
        productTitle,
        score: validatedResult.real_score
      });

      return { ...validatedResult, cached: false };

    } catch (error) {
      logger.error('Error calling Pollinations API', {
        error: error.message,
        productTitle,
        model,
        statusCode: error.response?.status,
        responseData: error.response?.data
      });

      // Return user-friendly error response
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a few moments.');
      } else if (error.response?.status === 401) {
        throw new Error('Invalid API token. Please check your configuration.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. The analysis is taking too long.');
      } else {
        throw new Error(`Analysis failed: ${error.message}`);
      }
    }
  }

  /**
   * Validate and normalize API response
   */
  validateAndNormalizeResponse(data) {
    return {
      real_score: this.normalizeScore(data.real_score),
      verdict: typeof data.verdict === 'string' ? data.verdict : 'No verdict provided',
      dealbreakers: Array.isArray(data.dealbreakers) ? data.dealbreakers : [],
      pros: Array.isArray(data.pros) ? data.pros : [],
      source_count: typeof data.source_count === 'number' ? data.source_count : 0
    };
  }

  /**
   * Normalize score to be between 1.0 and 5.0
   */
  normalizeScore(score) {
    const numScore = parseFloat(score);
    if (isNaN(numScore)) return 0;
    return Math.max(1.0, Math.min(5.0, numScore));
  }

  /**
   * Get available models from Pollinations
   */
  async getAvailableModels() {
    try {
      const response = await axios.get(`${this.baseUrl}/models`, {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      logger.error('Error fetching available models', { error: error.message });
      return [this.model]; // Return default model as fallback
    }
  }

  /**
   * Clear cache for a specific product or all cache
   */
  clearCache(productTitle = null) {
    if (productTitle) {
      const cacheKey = this.generateCacheKey(productTitle, this.model);
      cache.del(cacheKey);
      logger.info('Cleared cache for product', { productTitle });
    } else {
      cache.flushAll();
      logger.info('Cleared all cache');
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return cache.getStats();
  }
}

module.exports = new PollinationsService();
