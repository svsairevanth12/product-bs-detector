# 🚀 Unlimited Access Mode

This guide explains how to configure the BS Detector backend for **unlimited Pollinations API access**.

## 🎯 What is Unlimited Mode?

Unlimited Mode removes all rate limiting restrictions and optimizes the backend for high-volume usage. Perfect for:

- Users with unlimited Pollinations API access (Nectar tier)
- Production deployments with high traffic
- Development/testing without rate limit interruptions
- Enterprise use cases

## ⚡ Quick Setup

### 1. Use the Unlimited Configuration Template

```bash
cd backend
cp .env.unlimited .env
```

### 2. Add Your API Token

Edit `.env`:
```env
POLLINATIONS_API_TOKEN=your_unlimited_token_here
```

### 3. Start the Backend

```bash
npm start
```

You should see:
```
🚀 BS Detector Backend running on port 3000
⚡ UNLIMITED ACCESS MODE - No rate limits applied!
```

## 🔧 Configuration Details

### Unlimited Mode Settings

```env
# Core Settings
POLLINATIONS_API_TOKEN=your_token_here
POLLINATIONS_MODEL=searchgpt
NODE_ENV=production

# Disable Rate Limiting
RATE_LIMIT_ENABLED=false

# Optimized Timeouts
API_TIMEOUT=60000  # 60 seconds (longer for complex searches)

# Extended Cache
CACHE_TTL=7200     # 2 hours (reduces API calls)
CACHE_CHECK_PERIOD=600

# CORS (allow all for maximum flexibility)
ALLOWED_ORIGINS=*
```

## 📊 Performance Optimizations

### 1. Extended Cache Duration
- **Standard Mode**: 1 hour cache
- **Unlimited Mode**: 2 hour cache (configurable up to 24 hours)

```env
CACHE_TTL=86400  # 24 hours for maximum performance
```

### 2. Longer API Timeouts
Allows more comprehensive searches:
```env
API_TIMEOUT=90000  # 90 seconds for deep searches
```

### 3. No Rate Limiting Overhead
- Zero middleware processing delay
- No IP tracking or request counting
- Instant request processing

## 🎛️ Advanced Configuration

### Disable Cache (For Always-Fresh Results)

If you want real-time results without caching:

```env
CACHE_TTL=0  # Disable cache entirely
```

### Increase Concurrent Connections

For Node.js/Express (in your deployment):

```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096"

# Increase max connections
UV_THREADPOOL_SIZE=128
```

### Docker Unlimited Mode

Update `docker-compose.yml`:

```yaml
services:
  backend:
    build: .
    environment:
      - RATE_LIMIT_ENABLED=false
      - API_TIMEOUT=60000
      - CACHE_TTL=7200
      - POLLINATIONS_API_TOKEN=${POLLINATIONS_API_TOKEN}
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## 🌐 Cloud Deployment for Unlimited Mode

### Heroku

```bash
heroku config:set RATE_LIMIT_ENABLED=false
heroku config:set POLLINATIONS_API_TOKEN=your_token
heroku config:set API_TIMEOUT=60000
heroku config:set CACHE_TTL=7200
```

### Railway

Add to environment variables in Railway dashboard:
```
RATE_LIMIT_ENABLED=false
POLLINATIONS_API_TOKEN=your_token
API_TIMEOUT=60000
```

### Vercel

Create `vercel.json`:
```json
{
  "env": {
    "RATE_LIMIT_ENABLED": "false",
    "POLLINATIONS_API_TOKEN": "@pollinations-token",
    "API_TIMEOUT": "60000",
    "CACHE_TTL": "7200"
  }
}
```

### Google Cloud Run

```bash
gcloud run deploy bs-detector-backend \
  --set-env-vars RATE_LIMIT_ENABLED=false \
  --set-env-vars POLLINATIONS_API_TOKEN=your_token \
  --set-env-vars API_TIMEOUT=60000 \
  --set-env-vars CACHE_TTL=7200 \
  --memory 2Gi \
  --cpu 2 \
  --concurrency 1000
```

## 📈 Scaling for High Traffic

### Horizontal Scaling

Deploy multiple instances behind a load balancer:

```bash
# Docker Swarm
docker service create \
  --name bs-detector \
  --replicas 5 \
  --env RATE_LIMIT_ENABLED=false \
  --env POLLINATIONS_API_TOKEN=your_token \
  -p 3000:3000 \
  bs-detector-backend

# Kubernetes
kubectl scale deployment bs-detector-backend --replicas=10
```

### Redis Caching (Optional)

For shared cache across multiple instances:

1. **Install Redis:**
```bash
npm install redis
```

2. **Update `pollinationsService.js`:**
```javascript
const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URL
});

// Use Redis instead of node-cache for shared caching
```

3. **Configure:**
```env
REDIS_URL=redis://localhost:6379
CACHE_TTL=7200
```

## 🔍 Monitoring Unlimited Mode

### Check Status

```bash
curl http://localhost:3000/api/health
```

Response includes unlimited mode status:
```json
{
  "success": true,
  "status": "healthy",
  "config": {
    "rateLimitEnabled": false,
    "unlimitedMode": true,
    "cacheEnabled": true
  }
}
```

### View Statistics

```bash
curl http://localhost:3000/api/stats
```

```json
{
  "success": true,
  "cache": {
    "keys": 1523,
    "hits": 45230,
    "misses": 1523,
    "hitRate": "96.7%"
  },
  "uptime": 86400.5,
  "requestsProcessed": 46753,
  "averageResponseTime": "3.2s"
}
```

## ⚠️ Important Considerations

### 1. API Costs

Even with unlimited API access, monitor your usage:
```bash
# Check backend logs for request counts
docker-compose logs | grep "analysis request"
```

### 2. Memory Usage

Unlimited mode with caching uses more memory:
- **Typical**: 100-300 MB
- **High Traffic**: 500 MB - 2 GB
- **Adjust**: Reduce `CACHE_TTL` if memory constrained

### 3. Network Bandwidth

Unlimited requests = more bandwidth:
- Monitor network usage
- Consider CDN for static content
- Use compression (already enabled in backend)

## 🧪 Testing Unlimited Mode

### Load Testing

```bash
# Install hey (load testing tool)
go install github.com/rakyll/hey@latest

# Test unlimited mode
hey -n 1000 -c 50 -m POST \
  -H "Content-Type: application/json" \
  -d '{"productTitle":"iPhone 15 Pro"}' \
  http://localhost:3000/api/analyze
```

Expected results:
- **Standard Mode**: Some 429 errors after ~100 requests
- **Unlimited Mode**: All 1000 requests succeed

### Stress Testing

```bash
# Apache Bench
ab -n 10000 -c 100 \
  -p payload.json \
  -T application/json \
  http://localhost:3000/api/analyze
```

## 🎯 Best Practices

1. **Always Use HTTPS in Production**
   ```bash
   # Use reverse proxy (Nginx, Caddy, Traefik)
   # Or cloud platform's built-in HTTPS
   ```

2. **Enable Logging**
   ```env
   LOG_LEVEL=info  # or 'debug' for detailed logs
   ```

3. **Monitor Cache Hit Rate**
   ```bash
   # Aim for >80% cache hit rate
   curl http://localhost:3000/api/stats | jq '.cache'
   ```

4. **Set Reasonable Cache Duration**
   ```env
   CACHE_TTL=7200  # 2 hours is optimal
   # Too short: More API calls
   # Too long: Stale data
   ```

5. **Use Environment-Specific Configs**
   - Development: Short cache, debug logging
   - Production: Long cache, info logging

## 🔗 Resources

- **Pollinations API**: [pollinations.ai](https://pollinations.ai/)
- **Get Unlimited Token**: [auth.pollinations.ai](https://auth.pollinations.ai/)
- **Backend README**: [README.md](README.md)
- **Integration Guide**: [../BACKEND_INTEGRATION.md](../BACKEND_INTEGRATION.md)

## 💬 Support

Unlimited mode not working?

1. Check logs: `docker-compose logs -f`
2. Verify `.env`: `cat .env | grep RATE_LIMIT_ENABLED`
3. Test health: `curl http://localhost:3000/api/health`
4. Check token: Valid at [auth.pollinations.ai](https://auth.pollinations.ai/)

---

**🚀 Enjoy unlimited, blazing-fast product analysis!**
