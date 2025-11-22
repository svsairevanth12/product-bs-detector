// Configuration
const BACKEND_URL = "http://localhost:8000/analyze";

// DOM Elements
const analyzeBtn = document.getElementById('analyze-btn');
const loadingState = document.getElementById('loading-state');
const resultsArea = document.getElementById('results-area');
const productTitleEl = document.getElementById('product-title');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    getCurrentTabProduct();
});

// Main Logic
analyzeBtn.addEventListener('click', async () => {
    const productText = productTitleEl.innerText;
    if (!productText || productText.includes("Loading") || productText.includes("System Page")) return;

    loadingState.classList.remove('hidden');
    resultsArea.classList.add('hidden');
    analyzeBtn.disabled = true;
    analyzeBtn.innerText = "Analyzing...";

    try {
        // 1. Call our Backend Proxy
        const analysis = await callBackendAPI(productText);
        renderResults(analysis);
    } catch (error) {
        console.error("Analysis failed:", error);
        // FALLBACK: Show the error
        renderResults({
            real_score: 0,
            verdict: "Error: " + error.message + ". Ensure the backend is running at localhost:8000.",
            dealbreakers: ["Connection Failed"],
            pros: [],
            source_count: 0
        });
    } finally {
        loadingState.classList.add('hidden');
        analyzeBtn.disabled = false;
        analyzeBtn.innerText = "Analyze This Page";
    }
});

// 1. Scrape the page safely
async function getCurrentTabProduct() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("edge://") || tab.url.startsWith("about:")) {
        productTitleEl.innerText = "System Page (Cannot Analyze)";
        analyzeBtn.disabled = true;
        return;
    }

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            let title = "";
            // Try multiple selectors for better coverage
            const selectors = [
                '#productTitle', // Amazon
                'h1.product-title', // Generic
                'h1.product_title', // WooCommerce
                'h1.pdp-title', // BestBuy etc
                'h1' // Fallback
            ];

            for (const selector of selectors) {
                const el = document.querySelector(selector);
                if (el && el.innerText.trim().length > 0) {
                    title = el.innerText;
                    break;
                }
            }

            if (!title) title = document.title;
            return title.trim();
        }
    }, (results) => {
        if (chrome.runtime.lastError || !results || !results[0]) {
            productTitleEl.innerText = tab.title || "Unknown Product";
        } else {
            // We display a truncated version, but we should ideally store the full version for the API
            // For now, we just use the innerText which might be long, CSS handles wrapping/truncation if needed
            const fullTitle = results[0].result;
            productTitleEl.innerText = fullTitle;
            // Store full title in dataset if we want to be precise later
            productTitleEl.dataset.fullTitle = fullTitle;
        }
    });
}

// 2. Call Backend Proxy
async function callBackendAPI(productTitle) {
    // Use the full title if available
    const titleToSend = productTitleEl.dataset.fullTitle || productTitle;

    const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_title: titleToSend })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    // The backend returns a JSON string or object.
    // If the backend returns a stringified JSON (due to LLM output), parse it.
    if (typeof data === 'string') {
        try {
            return JSON.parse(data);
        } catch (e) {
             // If it's just text, return a fallback object
             return {
                real_score: 0,
                verdict: data,
                dealbreakers: [],
                pros: [],
                source_count: 0
            };
        }
    }

    return data;
}

// 3. Render Results
function renderResults(data) {
    document.getElementById('real-score').innerText = data.real_score;
    document.getElementById('verdict-text').innerText = data.verdict;
    document.getElementById('source-count').innerText = data.source_count || 0;

    // Color Code Score
    const score = parseFloat(data.real_score);
    const scoreEl = document.getElementById('real-score');
    scoreEl.style.color = (score < 3.0) ? "#ef4444" : (score < 4.0) ? "#f59e0b" : "#10b981"; // Tailwind colors

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
        consList.innerHTML = "<li style='color:#64748b'>None found</li>";
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
        prosList.innerHTML = "<li style='color:#64748b'>None found</li>";
    }

    resultsArea.classList.remove('hidden');
}