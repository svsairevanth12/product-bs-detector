import os
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS to allow requests from the extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the extension ID
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Placeholder for the user's unlimited tier token
# You should set this in your environment variables or replace it directly here
POLLINATIONS_TOKEN = os.environ.get("POLLINATIONS_TOKEN", "YOUR_UNLIMITED_POLLINATIONS_TOKEN")

class AnalyzeRequest(BaseModel):
    product_title: str

@app.post("/analyze")
async def analyze_product(request: AnalyzeRequest):
    # 1. Construct the prompt
    prompt = f"""
    You are a cynical consumer investigator. Analyze this product: "{request.product_title}".

    1. Use Google Search to find discussions on Reddit, YouTube, and independent forums.
    2. Ignore marketing fluff. Look for "dealbreakers".
    3. Determine if this is a high-quality item or generic "dropshipped" junk.

    Return the result in STRICT JSON format with the following schema:
    {{
        "real_score": <number 1.0-5.0>,
        "verdict": "<short summary string>",
        "dealbreakers": ["<string>", "<string>", ...],
        "pros": ["<string>", "<string>", ...],
        "source_count": <number of sources found>
    }}
    """

    # 2. Call Pollinations API
    # Using 'gemini-search' which maps to "Gemini 2.5 Flash Lite with Google Search" as per research
    url = "https://text.pollinations.ai/openai"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {POLLINATIONS_TOKEN}"  # Unlimited tier token
    }

    payload = {
        "model": "gemini-search",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "json": True # Pollinations supports a json flag to enforce JSON output often
    }

    try:
        print(f"Sending request to Pollinations for: {request.product_title}")
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        response.raise_for_status()

        data = response.json()

        # Extract content
        if "choices" in data and len(data["choices"]) > 0:
            content = data["choices"][0]["message"]["content"]

            # Clean up markdown code blocks if present (```json ... ```)
            if content.startswith("```json"):
                content = content.replace("```json", "").replace("```", "")
            elif content.startswith("```"):
                content = content.replace("```", "")

            return content # Returning the raw string to be parsed by the frontend or parsing it here

        else:
             raise HTTPException(status_code=500, detail="Invalid response format from AI provider")

    except requests.exceptions.RequestException as e:
        print(f"Error calling upstream API: {e}")
        raise HTTPException(status_code=502, detail=f"Upstream API Error: {str(e)}")
    except Exception as e:
        print(f"Internal error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
