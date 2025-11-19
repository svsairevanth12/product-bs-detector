# The BS Detector 🕵️‍♂️📉

**Real Reviews. No Fluff.**

> "Amazon says 4.8 stars, but Reddit calls this 'e-waste that breaks in a month.' Real Score: 2.1."

The **BS Detector** is a Chrome Extension that uses AI with **Search Grounding** to investigate products in real-time. Instead of relying on potentially fake Amazon/Shopify reviews, it actively searches Reddit, YouTube, and specialized forums to tell you if a product is actually good or just dropshipped garbage.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Pollinations](https://img.shields.io/badge/AI-Pollinations-blueviolet)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green)

## ✨ Features

*   **🔎 Deep Search Grounding:** Doesn't just summarize the page you are on. It browses the web to find external discussions.
*   **📊 The "Real" Score:** Generates a sentiment score (1.0 - 5.0) based on enthusiast discussions, not paid bot reviews.
*   **🚩 Dealbreaker Detection:** Highlights specific, recurring failure points (e.g., "Hinge snaps after 3 months," "Requires Chinese server login").
*   **📦 Dropship Detection:** Identifies if a "Brand Name" product is actually a generic white-label item found on Alibaba.
*   **🚀 Two Modes:** Choose between scalable backend (Pollinations AI) or direct Gemini API calls.
*   **⚡ Smart Caching:** Backend mode caches results for faster subsequent lookups.
*   **🌐 Free Tier:** Optional - backend mode works without API key for basic usage.

## 🛠️ Prerequisites

### Option 1: Backend Mode (Recommended - Scalable & Free)
1.  Deploy the included backend (see [Backend Setup](#-backend-setup-optional))
2.  Optionally get a free [Pollinations API token](https://auth.pollinations.ai/) for higher rate limits

### Option 2: Direct Mode
1.  Get a **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)
2.  The free tier works perfectly for personal use

## 🚀 Installation

Since this is a custom developer extension, you will load it manually:

1.  **Download/Clone** this repository to a folder on your computer (e.g., `bs-detector/`).
2.  Open Google Chrome and navigate to `chrome://extensions/`.
3.  Toggle **Developer mode** in the top right corner.
4.  Click the **Load unpacked** button in the top left.
5.  Select the `bs-detector` folder you created.
6.  The **BS Detector** icon (🧩) should now appear in your toolbar.

## 📖 How to Use

1.  Navigate to any product page on **Amazon**, **Shopify**, or similar sites.
2.  Click the extension icon (or open the Side Panel).
3.  **First Run:**
    *   **Backend Mode:** Leave empty or optionally add Pollinations token
    *   **Direct Mode:** Paste your Gemini API Key
4.  Click **"Analyze This Page"**.
5.  Wait a few seconds for the AI to scour the web and return the verdict.

## 🚀 Backend Setup (Optional)

For scalable, production-ready deployment with caching and rate limiting:

### Quick Start
```bash
cd backend
chmod +x start.sh
./start.sh
```

### Manual Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your POLLINATIONS_API_TOKEN (optional)
npm start
```

### Docker Deployment
```bash
cd backend
docker-compose up -d
```

The backend will run on `http://localhost:3000`. See [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md) for detailed setup instructions.

**Deploy to Cloud:**
- **Heroku:** `git push heroku main`
- **Railway:** Connect GitHub repo
- **Vercel:** `vercel deploy`
- **Google Cloud Run:** `gcloud run deploy`

Once deployed, update `BACKEND_URL` in `sidepanel-backend.js` and replace `sidepanel.js`:
```bash
cp sidepanel-backend.js sidepanel.js
```

## 🏗️ Technical Details

### Architecture Options

**Backend Mode (Recommended):**
*   **AI:** Pollinations `searchgpt` model (Gemini with Google Search)
*   **Backend:** Node.js + Express with caching, rate limiting
*   **Caching:** Redis-ready with node-cache fallback
*   **Security:** API token stored locally, HTTPS required for production
*   **Scalability:** Horizontal scaling ready, Docker support

**Direct Mode:**
*   **AI:** Google Gemini `gemini-2.0-flash`
*   **Tools:** `googleSearch` tool for live web search
*   **Output:** `responseSchema` for strict JSON parsing
*   **Security:** API key stored in `chrome.storage.local`, sent only to Google

### Project Structure

```text
product-bs-detector/
├── manifest.json              # Extension configuration
├── sidepanel.html             # UI layout
├── sidepanel.js               # Direct mode (Gemini API)
├── sidepanel-backend.js       # Backend mode (Pollinations API)
├── styles.css                 # Styling
├── background.js              # Service worker
├── BACKEND_INTEGRATION.md     # Backend setup guide
├── README.md                  # This file
└── backend/                   # Scalable backend service
    ├── src/
    │   ├── server.js          # Express server
    │   ├── services/          # Pollinations service
    │   ├── routes/            # API endpoints
    │   ├── middleware/        # Error handling, etc.
    │   ├── config/            # Configuration
    │   └── utils/             # Logger, helpers
    ├── Dockerfile             # Docker container
    ├── docker-compose.yml     # Docker Compose
    ├── package.json           # Dependencies
    ├── .env.example           # Environment template
    └── README.md              # Backend documentation
```

## 🐛 Troubleshooting

### Extension Issues
*   **"System Page (Cannot Analyze)"**: You're on a Chrome settings page. Navigate to a product page (e.g., Amazon.com).
*   **"Check if backend is running"**: Backend mode is enabled but backend isn't accessible.
    - Verify backend is running: `curl http://localhost:3000/api/health`
    - Check `BACKEND_URL` in `sidepanel.js` matches your backend
*   **"API Error"**:
    - **Direct Mode**: Double-check your Gemini API Key
    - **Backend Mode**: Check backend logs for errors

### Backend Issues
*   **"Rate limit exceeded"**: Add your Pollinations API token to `.env` or reduce usage
*   **"CORS error"**: Update `ALLOWED_ORIGINS` in backend `.env` to include your extension ID
*   **Slow responses**: First request takes 3-8s (AI processing), cached requests <100ms

See [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md) for detailed troubleshooting.

## 📊 API Comparison

| Feature | Backend Mode | Direct Mode |
|---------|-------------|-------------|
| **Setup Complexity** | Medium (deploy backend) | Easy (just API key) |
| **User Setup** | Optional token | Required API key |
| **Performance** | Cached, <100ms repeats | 3-8s every time |
| **Scalability** | Unlimited users | Per-user API limits |
| **Cost** | Free tier available | User pays for API |
| **Privacy** | Backend sees queries | Direct to Google |

## 🤝 Contributing

Got an idea to make it better?
1.  Fork the repo.
2.  Add a feature (e.g., Price History integration, specific Reddit thread links, hybrid mode).
3.  Submit a Pull Request.

**Ideas:**
- [ ] Add price history tracking
- [ ] Link to specific Reddit/YouTube sources
- [ ] Support more e-commerce sites
- [ ] Add user preferences (privacy mode, cache duration)
- [ ] Implement Redis caching for backend
- [ ] Add analytics dashboard

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

## 🔗 Resources

- **Backend Documentation**: [backend/README.md](backend/README.md)
- **Integration Guide**: [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md)
- **Pollinations AI**: [pollinations.ai](https://pollinations.ai/)
- **Get Pollinations Token**: [auth.pollinations.ai](https://auth.pollinations.ai/)
- **Google Gemini API**: [aistudio.google.com](https://aistudio.google.com/)

***

*Disclaimer: This tool uses AI to analyze public sentiment. It may occasionally hallucinate or miss context. Always do your own research before making large purchases.*