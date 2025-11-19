# BS Detector Backend API

A scalable Node.js backend service that integrates **Pollinations AI** to provide intelligent product analysis for the BS Detector Chrome Extension.

## 🚀 Features

- ✅ **Pollinations AI Integration** - Uses searchgpt model with Google Search capabilities
- ✅ **Intelligent Caching** - Reduces API calls and improves response times
- ✅ **Rate Limiting** - Protects against abuse and manages costs
- ✅ **Error Handling** - Comprehensive error handling with detailed logging
- ✅ **CORS Support** - Configured for Chrome extension compatibility
- ✅ **Docker Ready** - Easy deployment with Docker and Docker Compose
- ✅ **Health Monitoring** - Built-in health checks and statistics endpoints
- ✅ **Scalable Architecture** - Ready for horizontal scaling

## 📋 Prerequisites

- Node.js 18+ and npm 9+
- Pollinations API Token (optional, but recommended for higher rate limits)
- Docker & Docker Compose (optional, for containerized deployment)

## 🔧 Installation

### Local Development

1. **Clone and navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
```bash
cp .env.example .env
```

Edit `.env` file and add your Pollinations API token:
```env
POLLINATIONS_API_TOKEN=your_token_here
PORT=3000
NODE_ENV=development
```

4. **Start the development server:**
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Docker Deployment

1. **Build and run with Docker Compose:**
```bash
docker-compose up -d
```

2. **View logs:**
```bash
docker-compose logs -f
```

3. **Stop the service:**
```bash
docker-compose down
```

## 🌐 API Endpoints

### Health Check
```http
GET /api/health
```

Response:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-11-19T10:30:00.000Z",
  "uptime": 3600.5,
  "memory": {...}
}
```

### Analyze Product
```http
POST /api/analyze
Content-Type: application/json

{
  "productTitle": "Amazing Bluetooth Speaker with 20hr Battery",
  "model": "searchgpt",
  "skipCache": false
}
```

Response:
```json
{
  "success": true,
  "data": {
    "real_score": 3.5,
    "verdict": "Decent quality but durability concerns after 6 months...",
    "dealbreakers": [
      "Battery degrades rapidly after 6 months",
      "Generic white-label from Alibaba"
    ],
    "pros": [
      "Good sound quality for the price",
      "Initial battery life is excellent"
    ],
    "source_count": 15,
    "cached": false
  }
}
```

### Get Available Models
```http
GET /api/models
```

Response:
```json
{
  "success": true,
  "models": ["openai", "searchgpt", "gemini", "mistral", ...]
}
```

### Get Statistics
```http
GET /api/stats
```

Response:
```json
{
  "success": true,
  "cache": {
    "keys": 45,
    "hits": 230,
    "misses": 45,
    "ksize": 45,
    "vsize": 450000
  },
  "uptime": 86400.5
}
```

### Clear Cache
```http
DELETE /api/cache?productTitle=Optional+Product+Name
```

## 🔐 Authentication

The backend supports Pollinations API authentication using Bearer tokens:

1. **Get your token from:** [auth.pollinations.ai](https://auth.pollinations.ai/)

2. **Add to `.env` file:**
```env
POLLINATIONS_API_TOKEN=your_token_here
```

3. **Access Tiers:**
   - **Anonymous**: 15s rate limit (no token)
   - **Seed**: 5s rate limit (free registration)
   - **Flower**: 3s rate limit (premium)
   - **Nectar**: No rate limit (enterprise)

## ⚙️ Configuration

All configuration is managed through environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment (development/production) |
| `POLLINATIONS_API_TOKEN` | - | Your Pollinations API token |
| `POLLINATIONS_MODEL` | `searchgpt` | AI model to use |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per window |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 min) |
| `CACHE_TTL` | `3600` | Cache time-to-live (1 hour) |
| `ALLOWED_ORIGINS` | `*` | CORS allowed origins |
| `LOG_LEVEL` | `info` | Logging level |

## 📊 Monitoring & Logging

### Logs Location
- Console output: Real-time colored logs
- `logs/combined.log`: All logs
- `logs/error.log`: Error logs only

### Log Levels
- `error`: Critical errors
- `warn`: Warnings
- `info`: General information (default)
- `debug`: Detailed debugging

### Health Monitoring
```bash
curl http://localhost:3000/api/health
```

## 🎯 Performance Optimization

### Caching Strategy
- **Default TTL**: 1 hour
- **Cache Key**: `analysis:{model}:{productTitle}`
- **Storage**: In-memory (Node-Cache)
- **Eviction**: LRU (Least Recently Used)

### Rate Limiting
- **Window**: 15 minutes
- **Max Requests**: 100 per IP
- **Headers**: Returns rate limit info

### Response Times
- **Cached**: <10ms
- **API Call**: 3-8 seconds (depends on search complexity)

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure `POLLINATIONS_API_TOKEN`
- [ ] Set `ALLOWED_ORIGINS` to your extension ID
- [ ] Enable HTTPS (use reverse proxy like Nginx)
- [ ] Set up monitoring (PM2, Docker health checks)
- [ ] Configure log rotation
- [ ] Set resource limits (memory, CPU)

### Deployment Options

**1. Docker (Recommended)**
```bash
docker-compose up -d --build
```

**2. PM2 (Process Manager)**
```bash
npm install -g pm2
pm2 start src/server.js --name bs-detector-backend
pm2 save
pm2 startup
```

**3. Cloud Platforms**
- **Heroku**: `git push heroku main`
- **Vercel**: Configure as Node.js project
- **AWS ECS**: Use provided Dockerfile
- **Google Cloud Run**: Deploy with Docker
- **Railway**: Connect GitHub repo

### Environment Variables in Production
Never commit `.env` files! Use platform-specific secrets:
- Heroku: `heroku config:set KEY=value`
- Vercel: Project Settings → Environment Variables
- Docker: Use `docker-compose.override.yml` or `.env` file

## 🧪 Testing

### Manual Testing
```bash
# Health check
curl http://localhost:3000/api/health

# Analyze product
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"productTitle": "iPhone 15 Pro"}'

# Get models
curl http://localhost:3000/api/models

# Get stats
curl http://localhost:3000/api/stats
```

## 🔧 Troubleshooting

### Common Issues

**1. "Rate limit exceeded"**
- Solution: Add your Pollinations API token to upgrade tier
- Or: Reduce `RATE_LIMIT_MAX_REQUESTS` value

**2. "Invalid API token"**
- Solution: Verify token at [auth.pollinations.ai](https://auth.pollinations.ai/)
- Check `.env` file has correct token

**3. "CORS error from extension"**
- Solution: Add your extension ID to `ALLOWED_ORIGINS`:
  ```env
  ALLOWED_ORIGINS=chrome-extension://your-extension-id
  ```

**4. "Cache not working"**
- Check logs for cache hits/misses
- Verify `CACHE_TTL` is set correctly
- Use `DELETE /api/cache` to clear if needed

**5. "Slow response times"**
- First request will be slower (API call + search)
- Subsequent requests use cache (<10ms)
- Check `source_count` - more sources = longer processing

## 📈 Scaling

### Horizontal Scaling
- Deploy multiple instances behind a load balancer
- Use Redis for shared caching (replace node-cache)
- Implement session affinity if needed

### Vertical Scaling
- Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096`
- Optimize cache size: Reduce `CACHE_TTL` if memory constrained
- Monitor with `GET /api/stats`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🔗 Links

- **Pollinations AI**: [pollinations.ai](https://pollinations.ai/)
- **API Docs**: [APIDOCS.md](https://github.com/pollinations/pollinations/blob/master/APIDOCS.md)
- **Get Token**: [auth.pollinations.ai](https://auth.pollinations.ai/)
- **Chrome Extension**: [../README.md](../README.md)

## 💬 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review logs in `logs/` directory
3. Check Pollinations API status
4. Open a GitHub issue

---

**Built with ❤️ for the BS Detector Chrome Extension**
