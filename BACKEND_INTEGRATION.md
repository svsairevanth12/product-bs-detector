# Backend Integration Guide

This guide explains how to use the BS Detector extension with the scalable backend API powered by Pollinations AI.

## 🎯 Why Use the Backend?

### Benefits of Backend Mode
✅ **Scalable** - Handle unlimited users with proper infrastructure
✅ **Free Tier Available** - No API key required for basic usage
✅ **Better Performance** - Built-in caching reduces response times
✅ **Rate Limiting** - Protects against abuse
✅ **Centralized Updates** - Update AI prompts without changing extension
✅ **Privacy Friendly** - User doesn't need to manage API keys
✅ **Search-Augmented** - Uses Pollinations' searchgpt model with live web search

### Original Direct Mode
- Requires users to have their own Google Gemini API key
- Each user hits API directly (no caching benefit across users)
- Good for privacy-conscious users who want direct control

## 🚀 Quick Start

### Option 1: Use Backend Mode (Recommended)

1. **Deploy the backend:**
   ```bash
   cd backend
   npm install
   npm start
   ```
   Backend runs on `http://localhost:3000` by default

2. **Update extension to use backend:**
   - Open `sidepanel-backend.js`
   - Set `API_MODE = 'backend'`
   - Set `BACKEND_URL` to your deployed backend URL
   - Replace `sidepanel.js` with `sidepanel-backend.js`:
     ```bash
     cp sidepanel-backend.js sidepanel.js
     ```

3. **Update manifest.json** (if using localhost):
   ```json
   {
     "host_permissions": [
       "<all_urls>",
       "http://localhost:3000/*"
     ]
   }
   ```

4. **Reload the extension** in Chrome

### Option 2: Keep Direct Mode

- No changes needed!
- Extension continues to work with Gemini API directly
- Users need their own Gemini API key

## 🔧 Configuration

### Backend Mode Configuration

Edit `sidepanel-backend.js`:

```javascript
const API_MODE = 'backend';  // Use backend API
const BACKEND_URL = 'http://localhost:3000';  // Your backend URL
```

### Direct Mode Configuration

Edit `sidepanel-backend.js`:

```javascript
const API_MODE = 'direct';  // Use Gemini API directly
const MODEL_NAME = 'gemini-2.0-flash';
```

## 🌐 Deployment Options

### Local Development
```bash
cd backend
npm install
npm run dev
```
Access at: `http://localhost:3000`

### Docker Deployment
```bash
cd backend
docker-compose up -d
```

### Cloud Deployment

**Heroku:**
```bash
cd backend
heroku create bs-detector-backend
git push heroku main
```
Update `BACKEND_URL` in extension to: `https://your-app.herokuapp.com`

**Vercel:**
```bash
cd backend
npm install -g vercel
vercel deploy
```

**Railway:**
- Connect GitHub repo
- Select `backend` folder
- Deploy automatically

**Google Cloud Run:**
```bash
gcloud run deploy bs-detector-backend \
  --source . \
  --platform managed \
  --region us-central1
```

## 📝 Extension Updates Required

### 1. Update manifest.json

Add your backend URL to host permissions:

```json
{
  "manifest_version": 3,
  "name": "The BS Detector",
  "version": "1.0",
  "permissions": ["sidePanel", "activeTab", "scripting", "storage"],
  "host_permissions": [
    "<all_urls>",
    "https://your-backend-url.com/*"
  ],
  ...
}
```

### 2. Update sidepanel.js

Replace with backend version:
```bash
cp sidepanel-backend.js sidepanel.js
```

Or manually update the configuration in `sidepanel.js`:
```javascript
const API_MODE = 'backend';
const BACKEND_URL = 'https://your-backend-url.com';
```

### 3. Update sidepanel.html (Optional)

Update the setup screen text to reflect backend mode:

```html
<div id="setup-screen">
    <h2>Configuration</h2>
    <p>
        <strong>Powered by Pollinations AI</strong><br>
        No API key required! Or add your Pollinations token for higher rate limits.
    </p>
    <input type="text" id="api-key-input" placeholder="Optional: Pollinations Token" />
    <button id="save-key-btn">Save Key</button>
    <p>
        Get a free token at <a href="https://auth.pollinations.ai/" target="_blank">auth.pollinations.ai</a><br>
        Key is stored locally in your browser.
    </p>
</div>
```

## 🔐 Authentication Modes

### Anonymous Mode (No Token)
```javascript
// Extension: Leave API key empty
// Backend: Works with 15s rate limit per request
```

### Seed Tier (Free Token)
```javascript
// Extension: Enter Pollinations token
// Backend: 5s rate limit, better performance
// Get token: https://auth.pollinations.ai/
```

### Premium Tiers
Contact Pollinations for Flower/Nectar tiers for higher rate limits.

## 🧪 Testing

### Test Backend Connection
```bash
# Health check
curl http://localhost:3000/api/health

# Test analysis
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"productTitle": "iPhone 15 Pro"}'
```

### Test Extension with Backend
1. Open Chrome extension
2. Navigate to any product page (Amazon, etc.)
3. Click extension icon
4. Click "Analyze This Page"
5. Check browser console for any errors
6. Verify results appear correctly

## 🐛 Troubleshooting

### Extension Can't Connect to Backend

**Error:** "Failed to fetch" or "Network error"

**Solutions:**
1. Verify backend is running:
   ```bash
   curl http://localhost:3000/api/health
   ```

2. Check `BACKEND_URL` matches your backend:
   ```javascript
   const BACKEND_URL = 'http://localhost:3000';
   ```

3. Ensure manifest.json has correct permissions:
   ```json
   "host_permissions": ["<all_urls>", "http://localhost:3000/*"]
   ```

4. Check browser console for CORS errors

### CORS Errors

**Error:** "Access-Control-Allow-Origin"

**Solution:** Update backend `.env`:
```env
ALLOWED_ORIGINS=chrome-extension://your-extension-id
```

Get extension ID from `chrome://extensions/`

### Backend Returns Errors

**Error:** "Rate limit exceeded"

**Solutions:**
- Add Pollinations API token to backend `.env`
- Reduce usage frequency
- Upgrade to higher tier

**Error:** "Invalid API token"

**Solutions:**
- Verify token at [auth.pollinations.ai](https://auth.pollinations.ai/)
- Check backend `.env` file has correct token
- Token should be set as `POLLINATIONS_API_TOKEN=xxx`

### Slow Response Times

**Solutions:**
- First request is slower (3-8 seconds) due to AI processing
- Subsequent requests for same product use cache (<100ms)
- Check backend logs: `docker-compose logs -f`
- Monitor with: `curl http://localhost:3000/api/stats`

## 📊 Comparison: Backend vs Direct Mode

| Feature | Backend Mode | Direct Mode |
|---------|-------------|-------------|
| **User Setup** | Optional token | Required API key |
| **Performance** | Cached (fast repeats) | No cache |
| **Scalability** | Unlimited users | Per-user limits |
| **Cost** | Free tier available | User pays for API |
| **Privacy** | Backend sees queries | Direct to Google |
| **Maintenance** | Update backend | Update extension |
| **Offline** | Backend must be up | Works if Google is up |

## 🎨 Customization

### Change AI Model

Backend (`backend/src/config/config.js`):
```javascript
pollinations: {
  model: process.env.POLLINATIONS_MODEL || 'searchgpt',  // or 'gemini', 'openai', etc.
}
```

### Adjust Cache Duration

Backend (`.env`):
```env
CACHE_TTL=3600  # 1 hour in seconds
```

### Modify Rate Limits

Backend (`.env`):
```env
RATE_LIMIT_MAX_REQUESTS=100  # Max requests per window
RATE_LIMIT_WINDOW_MS=900000  # Window size (15 minutes)
```

## 🚀 Production Deployment Checklist

- [ ] Deploy backend to cloud platform (Heroku, Railway, etc.)
- [ ] Set `NODE_ENV=production` in backend
- [ ] Configure `POLLINATIONS_API_TOKEN` for better rate limits
- [ ] Set `ALLOWED_ORIGINS` to your extension ID
- [ ] Enable HTTPS (most cloud platforms do this automatically)
- [ ] Update `BACKEND_URL` in extension to production URL
- [ ] Update `manifest.json` host_permissions
- [ ] Test extension with production backend
- [ ] Monitor backend logs and stats endpoint
- [ ] Set up error tracking (optional: Sentry, LogRocket)

## 📚 Additional Resources

- **Backend README**: [backend/README.md](backend/README.md)
- **Pollinations API Docs**: [APIDOCS.md](https://github.com/pollinations/pollinations/blob/master/APIDOCS.md)
- **Get API Token**: [auth.pollinations.ai](https://auth.pollinations.ai/)
- **Pollinations Website**: [pollinations.ai](https://pollinations.ai/)

## 💡 Tips

1. **Development**: Use `API_MODE = 'backend'` with localhost
2. **Production**: Deploy backend, update `BACKEND_URL`
3. **Privacy Mode**: Use `API_MODE = 'direct'` for users who want direct control
4. **Hybrid Approach**: Offer both modes as user preference (future enhancement)

---

**Questions?** Check the [backend README](backend/README.md) or open an issue on GitHub.
