# The BS Detector 🕵️‍♂️📉

**Real Reviews. No Fluff.**

> "Amazon says 4.8 stars, but Reddit calls this 'e-waste that breaks in a month.' Real Score: 2.1."

The **BS Detector** is a Chrome Extension that uses **Google Gemini AI** with **Search Grounding** to investigate products in real-time. Instead of relying on potentially fake Amazon/Shopify reviews, it actively searches Reddit, YouTube, and specialized forums to tell you if a product is actually good or just dropshipped garbage.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Gemini](https://img.shields.io/badge/AI-Gemini%202.0%20Flash-orange)

## ✨ Features

*   **🔎 Deep Search Grounding:** Doesn't just summarize the page you are on. It browses the web to find external discussions.
*   **📊 The "Real" Score:** Generates a sentiment score (1.0 - 5.0) based on enthusiast discussions, not paid bot reviews.
*   **🚩 Dealbreaker Detection:** Highlights specific, recurring failure points (e.g., "Hinge snaps after 3 months," "Requires Chinese server login").
*   **📦 Dropship Detection:** Identifies if a "Brand Name" product is actually a generic white-label item found on Alibaba.
*   **⚡ Client-Side Only:** No backend server required. Runs entirely in your browser using your own API key.

## 🛠️ Prerequisites

To use this extension, you need a **Google Gemini API Key**.
1.  Go to [Google AI Studio](https://aistudio.google.com/).
2.  Click **Get API key**.
3.  Create a key (The free tier works perfectly for this).

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
3.  **First Run:** Paste your Gemini API Key into the settings box and click "Save".
4.  Click **"Analyze This Page"**.
5.  Wait a few seconds for the AI to scour the web and return the verdict.

## 🏗️ Technical Details

This extension demonstrates the power of the **Gemini API** without a backend server.

*   **Model:** Uses `gemini-1.5-flash` (optimized for speed and low latency).
*   **Tools:** Enables `googleSearch` tool for live internet access.
*   **Output:** Uses `responseSchema` to force the LLM to return strict JSON, preventing parsing errors.
*   **Security:** Your API key is stored in `chrome.storage.local`. It is **never** sent to any server other than Google's official API endpoints.

### Project Structure

```text
bs-detector/
├── manifest.json      # Extension configuration and permissions
├── sidepanel.html     # The UI layout
├── sidepanel.js       # Main logic (Scraping + Gemini API calls)
├── styles.css         # Styling
└── README.md          # This file
```

## 🐛 Troubleshooting

*   **"System Page (Cannot Analyze)"**: You are trying to run the extension on a Chrome settings page or a blank tab. Go to a real website (e.g., Amazon.com).
*   **"API Error"**: Double-check your API Key. Ensure you have enabled billing (even for the free tier) if required by your region.
*   **The Verdict is "Check the verdict for details"**: Sometimes the AI finds conflicting info. Read the text summary for the nuance.

## 🤝 Contributing

Got an idea to make it better?
1.  Fork the repo.
2.  Add a feature (e.g., Price History integration, specific Reddit thread links).
3.  Submit a Pull Request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

***

*Disclaimer: This tool uses AI to analyze public sentiment. It may occasionally hallucinate or miss context. Always do your own research before making large purchases.*