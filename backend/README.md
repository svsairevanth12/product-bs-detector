# BS Detector Backend API 🚀

Scalable FastAPI backend that provides product sentiment analysis using **Pollinations AI** with search grounding capabilities.

## Features

✨ **No API Keys Required for Users** - Backend handles all authentication
🔍 **Search-Augmented Analysis** - Uses Pollinations' searchgpt/gemini models
⚡ **Redis Caching** - Fast responses with intelligent caching
🐳 **Docker Ready** - Easy deployment with Docker Compose
🛡️ **Rate Limiting** - Built-in protection against abuse
📊 **Health Monitoring** - Health check endpoints for monitoring

## Quick Start

### 1. Prerequisites

- Python 3.11+ or Docker
- Pollinations API Token (get from [auth.pollinations.ai](https://auth.pollinations.ai/))

### 2. Setup with Docker (Recommended)

```bash
# Clone the repository
cd backend

# Create .env file
cp .env.example .env

# Edit .env and add your Pollinations token
nano .env

# Start the services
docker-compose up -d

# Check logs
docker-compose logs -f
```

The API will be available at `http://localhost:8000`

### 3. Setup without Docker

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and add your token
nano .env

# Run the server
python main.py
```

## API Endpoints

### POST `/api/v1/analyze`

Analyze a product for genuine sentiment and reviews.

**Request:**
```json
{
  "product_title": "Sony WH-1000XM5 Headphones",
  "product_url": "https://amazon.com/..." // optional
}
```

**Response:**
```json
{
  "real_score": 4.2,
  "verdict": "Generally well-received with excellent noise cancellation...",
  "dealbreakers": [
    "Hinge cracks after 6-12 months of normal use",
    "Poor customer service for warranty claims"
  ],
  "pros": [
    "Industry-leading noise cancellation",
    "Exceptional sound quality",
    "30-hour battery life"
  ],
  "source_count": 15
}
```

### GET `/api/v1/health`

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "pollinations_connected": true,
  "redis_connected": true,
  "model": "searchgpt"
}
```

## Configuration

Edit `.env` file:

```bash
# Your Pollinations API token (from auth.pollinations.ai)
POLLINATIONS_API_TOKEN=your_token_here

# Model selection (searchgpt, gemini, openai, mistral)
POLLINATIONS_MODEL=searchgpt

# Redis caching (recommended for production)
REDIS_ENABLED=true
REDIS_HOST=redis
REDIS_PORT=6379
CACHE_TTL=3600

# CORS (allow all or specific origins)
CORS_ORIGINS=["*"]

# Rate limiting (requests per minute per IP)
RATE_LIMIT_PER_MINUTE=20
```

## Available Models

- **searchgpt** - Search-augmented model (recommended for BS Detector)
- **gemini** - Google Gemini 2.5 Flash
- **openai** - OpenAI models
- **mistral** - Mistral models

## Architecture

```
backend/
├── main.py              # FastAPI application
├── config.py            # Configuration management
├── requirements.txt     # Python dependencies
├── Dockerfile           # Container definition
├── docker-compose.yml   # Multi-container setup
├── routers/
│   └── analyze.py      # API routes
├── services/
│   └── pollinations.py # Pollinations AI integration
├── models/
│   └── schemas.py      # Pydantic models
└── utils/
    └── cache.py        # Redis caching
```

## Deployment

### Deploy to Cloud

**Option 1: Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

**Option 2: Render**
1. Connect your GitHub repository
2. Set environment variables in dashboard
3. Deploy

**Option 3: DigitalOcean App Platform**
1. Create new app from GitHub
2. Set environment variables
3. Deploy

### Environment Variables for Production

```bash
POLLINATIONS_API_TOKEN=your_token_here
POLLINATIONS_MODEL=searchgpt
REDIS_ENABLED=true
REDIS_HOST=your-redis-host
CACHE_TTL=3600
CORS_ORIGINS=["chrome-extension://*","https://yourdomain.com"]
```

## Monitoring

### Check API Status
```bash
curl http://localhost:8000/health
```

### View Logs
```bash
# Docker
docker-compose logs -f api

# Local
python main.py
```

### Performance

- **With Cache**: ~50ms response time
- **Without Cache**: ~2-5s response time (depends on AI analysis)
- **Rate Limit**: 20 requests/minute per IP (configurable)

## Scaling

### Horizontal Scaling

```bash
# Scale to 3 instances
docker-compose up -d --scale api=3

# Use nginx for load balancing
```

### Redis Cluster

For high-traffic deployments, use Redis Cluster or managed Redis (AWS ElastiCache, Redis Cloud).

## Security

- ✅ API token stored securely on backend
- ✅ CORS protection
- ✅ Rate limiting by IP
- ✅ Non-root Docker container
- ✅ Input validation with Pydantic
- ✅ No sensitive data logging

## Troubleshooting

**Issue: "Pollinations API error"**
- Check your API token is valid
- Verify network connectivity
- Check Pollinations API status

**Issue: "Redis connection failed"**
- Ensure Redis is running: `docker-compose ps`
- Check Redis host/port in .env
- API will work without Redis (no caching)

**Issue: "Rate limited"**
- Wait 60 seconds or increase `RATE_LIMIT_PER_MINUTE`
- Implement distributed rate limiting with Redis

## API Documentation

Interactive API docs available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Support

- [Pollinations Docs](https://github.com/pollinations/pollinations)
- [FastAPI Docs](https://fastapi.tiangolo.com/)

## License

MIT License - See main repository for details
