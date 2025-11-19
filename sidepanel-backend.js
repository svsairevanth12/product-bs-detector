// Configuration
// Two modes: 'backend' (recommended) or 'direct' (original Gemini API)
const API_MODE = 'backend'; // Change to 'direct' to use original Gemini API
const BACKEND_URL = 'http://localhost:3000'; // Update this to your deployed backend URL
const MODEL_NAME = "gemini-2.0-flash";

// DOM Elements
const setupScreen = document.getElementById('setup-screen');
const mainScreen = document.getElementById('main-screen');
const apiKeyInput = document.getElementById('api-key-input');
const saveKeyBtn = document.getElementById('save-key-btn');
const analyzeBtn = document.getElementById('analyze-btn');
const changeKeyBtn = document.getElementById('change-key-btn');
const loadingState = document.getElementById('loading-state');
const resultsArea = document.getElementById('results-area');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Update setup screen text based on mode
    const setupText = document.querySelector('#setup-screen p');
    if (API_MODE === 'backend') {
        setupText.innerHTML = `
            <strong>Backend Mode Active</strong><br>
            Leave empty to use anonymous tier, or enter your Pollinations token for higher rate limits.<br>
            <a href="https://auth.pollinations.ai/" target="_blank" style="color: #2563eb;">Get Token</a>
        `;
        apiKeyInput.placeholder = "Optional: Pollinations Token";
        apiKeyInput.type = "text";

        // In backend mode, API key is optional
        showMainScreen();
    } else {
        setupText.textContent = "Enter your Google Gemini API Key:";
        apiKeyInput.placeholder = "AIzaSy...";
        apiKeyInput.type = "password";

        // In direct mode, require API key
        const key = await getStorage('apiKey');
        if (key) {
            showMainScreen();
        } else {
            setupScreen.classList.remove('hidden');
        }
    }
});

// Key Management
saveKeyBtn.addEventListener('click', async () => {
    const key = apiKeyInput.value.trim();
    await setStorage({ apiKey: key });
    showMainScreen();
});

changeKeyBtn.addEventListener('click', async () => {
    await setStorage({ apiKey: null });
    mainScreen.classList.add('hidden');
    setupScreen.classList.remove('hidden');
    resultsArea.classList.add('hidden');
});

// Main Logic
function showMainScreen() {
    setupScreen.classList.add('hidden');
    mainScreen.classList.remove('hidden');
    getCurrentTabProduct();
}

analyzeBtn.addEventListener('click', async () => {
    const productText = document.getElementById('product-title').innerText;
    if (!productText || productText.includes("Loading") || productText.includes("Cannot Analyze")) return;

    loadingState.classList.remove('hidden');
    resultsArea.classList.add('hidden');
    analyzeBtn.disabled = true;

    try {
        let analysis;

        if (API_MODE === 'backend') {
            analysis = await callBackendAPI(productText);
        } else {
            const apiKey = await getStorage('apiKey');
            if (!apiKey) {
                throw new Error('API key is required in direct mode');
            }
            analysis = await callGeminiAPI(apiKey, productText);
        }

        renderResults(analysis);
    } catch (error) {
        console.error("Analysis failed:", error);
        renderResults({
            real_score: 0,
            verdict: "Error: " + error.message,
            dealbreakers: [
                API_MODE === 'backend'
                    ? "Check if backend is running at " + BACKEND_URL
                    : "Check API Key",
                "Try a different product page"
            ],
            pros: [],
            source_count: 0
        });
    } finally {
        loadingState.classList.add('hidden');
        analyzeBtn.disabled = false;
    }
});

// Get product title from current tab
async function getCurrentTabProduct() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("edge://")) {
        document.getElementById('product-title').innerText = "System Page (Cannot Analyze)";
        analyzeBtn.disabled = true;
        return;
    }

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            let title = "";
            const amzn = document.getElementById('productTitle');
            const h1 = document.querySelector('h1');
            if (amzn) title = amzn.innerText;
            else if (h1) title = h1.innerText;
            else title = document.title;
            return title.trim();
        }
    }, (results) => {
        if (chrome.runtime.lastError || !results || !results[0]) {
            document.getElementById('product-title').innerText = tab.title || "Unknown Product";
        } else {
            const title = results[0].result;
            document.getElementById('product-title').innerText =
                title.length > 80 ? title.substring(0, 80) + "..." : title;
        }
        analyzeBtn.disabled = false;
    });
}

// Backend API Call (Recommended)
async function callBackendAPI(productTitle) {
    const apiKey = await getStorage('apiKey'); // Optional token for higher rate limits

    const response = await fetch(`${BACKEND_URL}/api/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
        },
        body: JSON.stringify({
            productTitle: productTitle,
            model: 'searchgpt', // Use search-augmented model
            skipCache: false
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Backend error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
        throw new Error(result.error || 'Backend returned unsuccessful response');
    }

    return result.data;
}

// Direct Gemini API Call (Original method)
async function callGeminiAPI(apiKey, productTitle) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

    const prompt = `
    You are a cynical consumer investigator. Analyze this product: "${productTitle}".

    1. Use Google Search to find discussions on Reddit, YouTube, and independent forums.
    2. Ignore marketing fluff. Look for "dealbreakers".
    3. Determine if this is a high-quality item or generic "dropshipped" junk.
    `;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ googleSearch: {} }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    real_score: { type: "NUMBER" },
                    verdict: { type: "STRING" },
                    dealbreakers: {
                        type: "ARRAY",
                        items: { type: "STRING" }
                    },
                    pros: {
                        type: "ARRAY",
                        items: { type: "STRING" }
                    },
                    source_count: { type: "NUMBER" }
                },
                required: ["real_score", "verdict", "dealbreakers", "pros"]
            }
        }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.error) throw new Error(data.error.message || "API Error");
    if (!data.candidates || !data.candidates[0].content) throw new Error("No content returned");

    const rawText = data.candidates[0].content.parts[0].text;

    try {
        return JSON.parse(rawText);
    } catch (e) {
        console.warn("JSON Parse failed despite schema:", rawText);
        return {
            real_score: 0,
            verdict: rawText,
            dealbreakers: ["Could not format data"],
            pros: [],
            source_count: 0
        };
    }
}

// Render Results
function renderResults(data) {
    document.getElementById('real-score').innerText = data.real_score;
    document.getElementById('verdict-text').innerText = data.verdict;
    document.getElementById('source-count').innerText = data.source_count || 0;

    // Show cache indicator if present
    if (data.cached) {
        const sourceCountEl = document.getElementById('source-count');
        sourceCountEl.innerHTML = `${data.source_count} <span style="color: #059669;">(cached)</span>`;
    }

    // Color Code Score
    const score = parseFloat(data.real_score);
    const scoreEl = document.getElementById('real-score');
    scoreEl.style.color = (score < 3.0) ? "#dc2626" : (score < 4.0) ? "#d97706" : "#059669";

    // Dealbreakers List
    const consList = document.getElementById('cons-list');
    consList.innerHTML = "";
    if (data.dealbreakers && data.dealbreakers.length > 0) {
        data.dealbreakers.forEach(item => {
            const li = document.createElement('li');
            li.className = "dealbreaker-item";
            li.innerText = item;
            consList.appendChild(li);
        });
    } else {
        consList.innerHTML = "<li style='color:#999'>None found</li>";
    }

    // Pros List
    const prosList = document.getElementById('pros-list');
    prosList.innerHTML = "";
    if (data.pros && data.pros.length > 0) {
        data.pros.forEach(item => {
            const li = document.createElement('li');
            li.className = "pro-item";
            li.innerText = item;
            prosList.appendChild(li);
        });
    } else {
        prosList.innerHTML = "<li style='color:#999'>None found</li>";
    }

    resultsArea.classList.remove('hidden');
}

// Storage Helpers
function getStorage(key) {
    return new Promise((resolve) => {
        chrome.storage.local.get([key], (result) => resolve(result[key]));
    });
}

function setStorage(obj) {
    return new Promise((resolve) => {
        chrome.storage.local.set(obj, resolve);
    });
}
