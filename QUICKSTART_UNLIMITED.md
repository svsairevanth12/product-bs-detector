# 🚀 Quick Start: Unlimited Mode

**Get your BS Detector backend running with unlimited access in 2 minutes!**

## Prerequisites

- Node.js 18+ installed
- Pollinations API token (get at [auth.pollinations.ai](https://auth.pollinations.ai/))

## 🔥 3-Step Setup

### 1. Configure for Unlimited Access

```bash
cd backend
cp .env.unlimited .env
```

### 2. Add Your API Token

Edit `backend/.env`:
```env
POLLINATIONS_API_TOKEN=your_token_here
```

### 3. Start the Backend

```bash
npm install
npm start
```

**You should see:**
```
🚀 BS Detector Backend running on port 3000
⚡ UNLIMITED ACCESS MODE - No rate limits applied!
💚 Health Check: http://localhost:3000/api/health
```

## ✅ Verify It's Working

```bash
# Test the health endpoint
curl http://localhost:3000/api/health

# Test product analysis
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"productTitle": "iPhone 15 Pro"}'
```

## 🎯 What You Get

| Feature | Unlimited Mode |
|---------|----------------|
| **Rate Limits** | ❌ None - analyze as much as you want! |
| **API Timeout** | 60 seconds (longer searches) |
| **Cache Duration** | 2 hours (configurable up to 24h) |
| **Max Requests** | ♾️ Unlimited |
| **Performance** | ⚡ <100ms for cached results |

## 🔧 Optional: Advanced Configuration

Want to customize? Edit `backend/.env`:

```env
# Disable cache for always-fresh results
CACHE_TTL=0

# Extend cache for maximum performance
CACHE_TTL=86400  # 24 hours

# Increase API timeout for deeper searches
API_TIMEOUT=90000  # 90 seconds

# Allow all CORS origins
ALLOWED_ORIGINS=*
```

## 🌐 Deploy to Production

### Docker (Easiest)
```bash
cd backend
docker-compose up -d
```

### Heroku
```bash
heroku create your-app-name
heroku config:set POLLINATIONS_API_TOKEN=your_token
heroku config:set RATE_LIMIT_ENABLED=false
git push heroku main
```

### Railway / Vercel
1. Connect your GitHub repo
2. Add environment variables:
   - `POLLINATIONS_API_TOKEN=your_token`
   - `RATE_LIMIT_ENABLED=false`
3. Deploy!

## 🔗 Connect Extension to Backend

1. **Update extension:**
```bash
cp sidepanel-backend.js sidepanel.js
```

2. **Edit `sidepanel.js` (lines 2-3):**
```javascript
const API_MODE = 'backend';
const BACKEND_URL = 'http://localhost:3000';  // or your production URL
```

3. **Reload extension in Chrome**

## 📊 Monitor Performance

```bash
# Check cache statistics
curl http://localhost:3000/api/stats

# View logs
docker-compose logs -f  # (if using Docker)
# or
tail -f backend/logs/combined.log
```

## 🆘 Troubleshooting

### "Rate limit exceeded" error?
✅ Check `.env` has `RATE_LIMIT_ENABLED=false`

### Backend not starting?
✅ Run `npm install` first
✅ Check Node.js version: `node -v` (should be 18+)

### Extension can't connect?
✅ Verify backend is running: `curl http://localhost:3000/api/health`
✅ Check `BACKEND_URL` in `sidepanel.js` matches your backend

### Token not working?
✅ Verify token at [auth.pollinations.ai](https://auth.pollinations.ai/)
✅ Check `.env` has correct format: `POLLINATIONS_API_TOKEN=xxx`

## 📚 Full Documentation

- **Unlimited Mode Guide**: [backend/UNLIMITED_MODE.md](backend/UNLIMITED_MODE.md)
- **Backend README**: [backend/README.md](backend/README.md)
- **Integration Guide**: [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md)

---

**🚀 You're ready! Enjoy unlimited product analysis!**
