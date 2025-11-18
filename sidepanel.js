// Configuration
// We use gemini-2.0-flash because it currently has the most stable JSON mode + Search combination.
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
    const key = await getStorage('geminiApiKey');
    if (key) {
        showMainScreen();
    } else {
        setupScreen.classList.remove('hidden');
    }
});

// Key Management
saveKeyBtn.addEventListener('click', async () => {
    const key = apiKeyInput.value.trim();
    if (!key) return;
    await setStorage({ geminiApiKey: key });
    showMainScreen();
});

changeKeyBtn.addEventListener('click', async () => {
    await setStorage({ geminiApiKey: null });
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
    if (!productText || productText.includes("Loading")) return;

    loadingState.classList.remove('hidden');
    resultsArea.classList.add('hidden');
    analyzeBtn.disabled = true;

    try {
        const apiKey = await getStorage('geminiApiKey');
        const analysis = await callGeminiAPI(apiKey, productText);
        renderResults(analysis);
    } catch (error) {
        console.error("Analysis failed:", error);
        // FALLBACK: Show the error as the verdict so you know what happened
        renderResults({
            real_score: 0,
            verdict: "Error: " + error.message,
            dealbreakers: ["Check API Key", "Try a different product page"],
            pros: [],
            source_count: 0
        });
    } finally {
        loadingState.classList.add('hidden');
        analyzeBtn.disabled = false;
    }
});

// 1. Scrape the page safely
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
            document.getElementById('product-title').innerText = results[0].result.substring(0, 80) + "...";
        }
    });
}

// 2. Call Gemini (Unbreakable Version)
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
        tools: [{ googleSearch: {} }], // Search Grounding
        generationConfig: {
            responseMimeType: "application/json",
            // FORCE VALID JSON SCHEMA
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
        // Because we used responseSchema, we can parse directly without regex hacks
        return JSON.parse(rawText);
    } catch (e) {
        console.warn("JSON Parse failed despite schema:", rawText);
        // EMERGENCY FALLBACK: If it's still not JSON, return the raw text as the verdict
        return {
            real_score: 0,
            verdict: rawText, // Just show the user whatever the AI wrote
            dealbreakers: ["Could not format data"],
            pros: [],
            source_count: 0
        };
    }
}

// 3. Render Results
function renderResults(data) {
    document.getElementById('real-score').innerText = data.real_score;
    document.getElementById('verdict-text').innerText = data.verdict;
    document.getElementById('source-count').innerText = data.source_count || 0;

    // Color Code Score
    const score = parseFloat(data.real_score);
    const scoreEl = document.getElementById('real-score');
    scoreEl.style.color = (score < 3.0) ? "#dc2626" : (score < 4.0) ? "#d97706" : "#059669";

    // Lists
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

// Helpers
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