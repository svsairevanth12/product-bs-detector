# The BS Detector 🕵️‍♂️📉

**Real Reviews. No Fluff.**

> "Amazon says 4.8 stars, but Reddit calls this 'e-waste that breaks in a month.' Real Score: 2.1."

The **BS Detector** is a Chrome Extension with a **FastAPI backend** powered by **Pollinations AI** to investigate products in real-time. Instead of relying on potentially fake Amazon/Shopify reviews, it actively searches Reddit, YouTube, and specialized forums to tell you if a product is actually good or just dropshipped garbage.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![AI](https://img.shields.io/badge/AI-Pollinations-orange)
![Backend](https://img.shields.io/badge/Backend-FastAPI-green)

## ✨ Features

*   **🔎 Deep Search Grounding:** Doesn't just summarize the page you are on. It browses the web to find external discussions.
*   **📊 The "Real" Score:** Generates a sentiment score (1.0 - 5.0) based on enthusiast discussions, not paid bot reviews.
*   **🚩 Dealbreaker Detection:** Highlights specific, recurring failure points (e.g., "Hinge snaps after 3 months," "Requires Chinese server login").
*   **📦 Dropship Detection:** Identifies if a "Brand Name" product is actually a generic white-label item found on Alibaba.
*   **⚡ Free for Users:** No API keys needed! Backend handles all authentication.
*   **🚀 Scalable Backend:** FastAPI + Redis caching + Docker ready.

## 🛠️ Prerequisites

**NEW:** This extension now uses a **scalable backend** powered by Pollinations AI!

### For Users (Extension Only)
- Just install the extension and configure the backend URL
- No API key required!

### For Backend Hosting
1. Get a Pollinations API Token from [auth.pollinations.ai](https://auth.pollinations.ai/)
2. Docker & Docker Compose (or Python 3.11+)
3. See [Backend Setup](#-backend-setup) below

## 🚀 Installation

Since this is a custom developer extension, you will load it manually:

1.  **Download/Clone** this repository to a folder on your computer (e.g., `bs-detector/`).
2.  Open Google Chrome and navigate to `chrome://extensions/`.
3.  Toggle **Developer mode** in the top right corner.
4.  Click the **Load unpacked** button in the top left.
5.  Select the `bs-detector` folder you created.
6.  The **BS Detector** icon (🧩) should now appear in your toolbar.

## 📖 How to Use

1.  **First Time:** Configure the backend URL in the extension (default: `http://localhost:8000`)
2.  Navigate to any product page on **Amazon**, **Shopify**, or similar sites
3.  Click the extension icon (or open the Side Panel)
4.  Click **"Analyze This Page"**
5.  Wait a few seconds for the AI to scour the web and return the verdict

**No API key needed!** The backend handles all authentication.

## 🏗️ Technical Details

This extension uses a **FastAPI backend** powered by **Pollinations AI**.

### Frontend (Chrome Extension)
*   **Manifest V3** compliant
*   **Side Panel UI** for better UX
*   **No API keys** stored in browser
*   **Configurable backend** URL

### Backend (Python FastAPI)
*   **Model:** Pollinations AI `searchgpt` or `gemini` (with search grounding)
*   **Caching:** Redis for fast repeated queries (~50ms cached, ~3s uncached)
*   **Rate Limiting:** 20 requests/minute per IP (configurable)
*   **Scalable:** Docker-ready, horizontally scalable
*   **Security:** API token stored securely on server only

### Project Structure

```text
product-bs-detector/
├── manifest.json           # Extension configuration
├── sidepanel.html          # UI layout
├── sidepanel.js            # Frontend logic (calls backend API)
├── styles.css              # Styling
├── background.js           # Service worker
├── README.md               # This file
└── backend/                # FastAPI Backend ⭐
    ├── main.py             # FastAPI application
    ├── config.py           # Configuration management
    ├── requirements.txt    # Python dependencies
    ├── Dockerfile          # Container definition
    ├── docker-compose.yml  # Multi-container setup
    ├── routers/            # API routes
    ├── services/           # Pollinations AI integration
    ├── models/             # Data schemas
    └── utils/              # Caching utilities
```

## 🚀 Backend Setup

### Quick Start with Docker (Recommended)

```bash
cd backend

# Create .env file
cp .env.example .env

# Edit .env and add your Pollinations token
# Get token from: https://auth.pollinations.ai/
nano .env

# Start the backend
docker-compose up -d

# Check status
curl http://localhost:8000/health
```

The backend will be running at `http://localhost:8000`

### Without Docker

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
nano .env

# Run the server
python main.py
```

For detailed backend documentation, see **[backend/README.md](backend/README.md)**

## 🐛 Troubleshooting

*   **"System Page (Cannot Analyze)"**: You are on a Chrome settings page. Go to a product page (e.g., Amazon.com).
*   **"Cannot connect to backend"**: Ensure the backend is running (`docker-compose up -d` in backend folder).
*   **"Backend error"**: Check backend logs (`docker-compose logs -f`) and verify your Pollinations API token.
*   **Extension can't reach localhost**: If backend is on a remote server, use the server's IP or deploy publicly (Railway, Render, etc.).

## 🤝 Contributing

Got an idea to make it better?
1.  Fork the repo.
2.  Add a feature (e.g., Price History integration, specific Reddit thread links).
3.  Submit a Pull Request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

***

*Disclaimer: This tool uses AI to analyze public sentiment. It may occasionally hallucinate or miss context. Always do your own research before making large purchases.*