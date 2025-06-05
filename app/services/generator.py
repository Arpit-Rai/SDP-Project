import requests
import re
from typing import Dict, Optional
import time
import json

OLLAMA_URL = "http://ollama:11434"
OLLAMA_MODEL = "phi:latest"
MAX_RETRIES = 3


def check_ollama_connection():
    """Check if Ollama is accessible and has the required model"""
    try:
        # Test basic connectivity
        response = requests.get(f"{OLLAMA_URL}/api/tags", timeout=10)
        response.raise_for_status()
        
        models = response.json().get("models", [])
        model_names = [model.get("name", "") for model in models]
        
        print(f"🔍 Available models: {model_names}")
        
        if not any(OLLAMA_MODEL in name for name in model_names):
            print(f"❌ Model '{OLLAMA_MODEL}' not found in available models")
            return False
            
        print(f"✅ Ollama connection successful, {OLLAMA_MODEL} model available")
        return True
        
    except Exception as e:
        print(f"❌ Ollama connection failed: {e}")
        return False


def test_ollama_generate():
    """Test a simple generation to verify Ollama is working"""
    try:
        test_prompt = "Say hello in one word."
        response = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": test_prompt,
                "stream": False
            },
            timeout=120
        )
        print("Payload sent:", {
            "model": OLLAMA_MODEL,
            "prompt": test_prompt,
            "stream": False
        })
        print("Response text:", response.text)
        response.raise_for_status()
        
        result = response.json()
        print(f"🧪 Test generation response: {result}")
        
        if "response" in result and result["response"].strip():
            print("✅ Ollama generation test successful")
            return True
        else:
            print("❌ Ollama generation test failed - empty response")
            return False
            
    except Exception as e:
        print(f"❌ Ollama generation test failed: {e}")
        return False


def generate_social_posts(summary: str) -> Dict[str, str]:
    """
    Generate social media posts using Ollama and Mistral based on a summary.
    Returns a dictionary with 'twitter', 'instagram', and 'shorts_title' keys.
    """
    
    # First, check if Ollama is accessible
    if not check_ollama_connection():
        print("❌ Ollama not accessible, returning fallback")
        return get_fallback_posts()
    
    # Test basic generation
    if not test_ollama_generate():
        print("❌ Ollama generation test failed, returning fallback")
        return get_fallback_posts()
    
    prompt = f"""You are a creative social media assistant. Based on this summary, create engaging social media content:

Summary: {summary}

Please respond EXACTLY in this format:

Twitter: [Write a catchy tweet under 280 characters]

Instagram: [Write an engaging caption with 4-5 emojis and end with 3-5 hashtags]

Shorts Title: [Write a compelling title in 8 words or less]

Remember to follow the exact format above."""

    for attempt in range(1, MAX_RETRIES + 1):
        print(f"🔄 Attempt {attempt}/{MAX_RETRIES} to generate posts...")

        try:
            # Use the generate API
            payload = {
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "max_tokens": 500
                }
            }
            
            print(f"📤 Sending request to: {OLLAMA_URL}/api/generate")
            print(f"📤 Payload: {json.dumps(payload, indent=2)}")
            
            response = requests.post(
                f"{OLLAMA_URL}/api/generate",
                json=payload,
                timeout=120,  # Increased timeout
            )
            
            print(f"📥 Response status: {response.status_code}")
            print(f"📥 Response headers: {dict(response.headers)}")
            
            response.raise_for_status()
            response_data = response.json()
            
            print(f"📥 Full response: {json.dumps(response_data, indent=2)}")
            
            raw_output = response_data.get("response", "")
            
            if not raw_output or raw_output.strip() == "":
                print(f"⚠️ Empty response on attempt {attempt}")
                continue

            print("📝 Ollama raw output:\n", raw_output)
            parsed = parse_ollama_response(raw_output)
            
            print(f"📋 Parsed response: {json.dumps(parsed, indent=2)}")

            # Validate parsed content
            valid_content = True
            for key in ["twitter", "instagram", "shorts_title"]:
                if not parsed.get(key) or parsed[key].strip() == "":
                    print(f"⚠️ Missing or empty content for: {key}")
                    parsed[key] = get_fallback_content(key)
                    valid_content = False

            if valid_content:
                print("✅ Successfully generated all social media posts")
                return parsed
            else:
                print("⚠️ Some content was missing, using fallbacks for those fields")
                return parsed

        except requests.Timeout as e:
            print(f"⏰ Timeout on attempt {attempt}: {e}")
            time.sleep(5)
        except requests.RequestException as e:
            print(f"❌ Request error on attempt {attempt}: {e}")
            if hasattr(e.response, 'text'):
                print(f"Error response: {e.response.text}")
            time.sleep(2)
        except json.JSONDecodeError as e:
            print(f"❌ JSON decode error on attempt {attempt}: {e}")
            time.sleep(2)
        except Exception as e:
            print(f"❌ Unexpected error on attempt {attempt}: {e}")
            time.sleep(2)

    print("❌ Failed to generate posts after all attempts")
    return get_fallback_posts()


def parse_ollama_response(text: str) -> Dict[str, str]:
    """
    Parse the structured response from Ollama and extract platform-specific content.
    """
    posts = {"twitter": "", "instagram": "", "shorts_title": ""}
    key_map = {
        "twitter": "twitter",
        "instagram": "instagram", 
        "shorts title": "shorts_title",
        "shorts_title": "shorts_title",  # Handle both formats
    }

    # Split into lines and process
    lines = text.strip().split('\n')
    current_key = None
    current_content = []

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Check if this line starts a new section
        found_key = None
        for label, internal_key in key_map.items():
            if line.lower().startswith(label.lower() + ":"):
                found_key = internal_key
                # Save previous content if any
                if current_key and current_content:
                    posts[current_key] = ' '.join(current_content).strip()
                
                # Start new section
                current_key = found_key
                # Extract content after the colon
                content_after_colon = line.split(":", 1)[1].strip() if ":" in line else ""
                current_content = [content_after_colon] if content_after_colon else []
                break
        
        if not found_key and current_key:
            # This line belongs to the current section
            current_content.append(line)

    # Don't forget the last section
    if current_key and current_content:
        posts[current_key] = ' '.join(current_content).strip()

    return posts


def get_fallback_posts() -> Dict[str, str]:
    """Fallback values if nothing is generated"""
    return {
        "twitter": "Could not generate Twitter post. Please try again.",
        "instagram": "Could not generate Instagram caption. Try again later.",
        "shorts_title": "Could not generate a Shorts title.",
    }


def get_fallback_content(key: str) -> str:
    defaults = {
        "twitter": "Check out this amazing content! 🎬✨",
        "instagram": "Experience something amazing today! 🌟🎥 #inspo #trending #shorts",
        "shorts_title": "Watch This Before It Goes Viral!",
    }
    return defaults.get(key, f"Could not generate content for {key}.")