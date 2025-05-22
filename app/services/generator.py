import requests
import re
import time

def generate_social_posts(summary: str) -> dict[str, str]:
    posts = {
        "twitter": "Could not generate post.",
        "instagram": "Could not generate caption.",
        "shorts_title": "Could not generate title."
    }

    prompt = f"""
You are a creative social media content specialist.

Based on this summary:
\"\"\"{summary}\"\"\"

Generate the following social media content:

Twitter: A short tweet (max 280 characters)
Instagram: A caption with at least 4 emojis
Shorts Title: A catchy 5-8 word YouTube Shorts title

⚠️ Format your response exactly as:
Twitter: ...
Instagram: ...
Shorts Title: ...
"""

    # First, check if Ollama is available
    try:
        health_response = requests.get("http://ollama:11434/api/tags", timeout=5)
        if health_response.status_code != 200:
            print("❌ Ollama service not available")
            return posts
    except Exception as e:
        print(f"❌ Cannot connect to Ollama: {e}")
        return posts

    # Try to generate content with retries
    max_retries = 3
    for attempt in range(max_retries):
        try:
            print(f"🔄 Attempt {attempt + 1}/{max_retries} to generate posts...")
            
            # Use the correct payload format for Ollama chat API
            response = requests.post(
                "http://ollama:11434/api/chat",
                json={
                    "model": "mistral",
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "stream": False
                },
                timeout=60  # Increase timeout for model generation
            )

            if response.status_code == 404:
                print("📝 Chat API not available, trying generate API...")
                # Fallback to generate API
                response = requests.post(
                    "http://ollama:11434/api/generate",
                    json={
                        "model": "mistral",
                        "prompt": prompt,
                        "stream": False
                    },
                    timeout=60
                )

            response.raise_for_status()
            
            # Extract the generated content
            if response.status_code == 200:
                result = response.json()
                
                # Handle different response formats
                if "message" in result:
                    # Chat API response format
                    output = result["message"].get("content", "")
                elif "response" in result:
                    # Generate API response format
                    output = result.get("response", "")
                else:
                    print("❌ Unexpected response format from Ollama")
                    continue

                print(f"\n📝 Ollama raw output:\n{output}")

                # Parse the response to extract individual posts
                parsed_posts = parse_ollama_response(output)
                
                # Update posts dict with parsed content
                for key, value in parsed_posts.items():
                    if value and value.strip():  # Only update if we got actual content
                        posts[key] = value.strip()
                
                print(f"✅ Successfully generated posts on attempt {attempt + 1}")
                return posts
            
        except requests.exceptions.Timeout:
            print(f"⏱️ Timeout on attempt {attempt + 1}")
            if attempt < max_retries - 1:
                time.sleep(2)  # Wait before retry
                continue
        except requests.exceptions.RequestException as e:
            print(f"❌ Request error on attempt {attempt + 1}: {e}")
            if attempt < max_retries - 1:
                time.sleep(2)
                continue
        except Exception as e:
            print(f"❌ Unexpected error on attempt {attempt + 1}: {e}")
            if attempt < max_retries - 1:
                time.sleep(2)
                continue

    print("❌ Failed to generate posts after all attempts")
    return posts


def parse_ollama_response(output: str) -> dict[str, str]:
    """
    Parse the Ollama response to extract Twitter, Instagram, and Shorts Title content
    """
    parsed = {}
    
    # Clean up the output
    output = output.strip()
    
    # Try to extract Twitter post
    twitter_match = re.search(r'Twitter:\s*(.+?)(?=\n(?:Instagram|Shorts Title)|\Z)', output, re.DOTALL | re.IGNORECASE)
    if twitter_match:
        parsed["twitter"] = twitter_match.group(1).strip()
    
    # Try to extract Instagram caption
    instagram_match = re.search(r'Instagram:\s*(.+?)(?=\n(?:Twitter|Shorts Title)|\Z)', output, re.DOTALL | re.IGNORECASE)
    if instagram_match:
        parsed["instagram"] = instagram_match.group(1).strip()
    
    # Try to extract Shorts Title
    shorts_match = re.search(r'Shorts Title:\s*(.+?)(?=\n(?:Twitter|Instagram)|\Z)', output, re.DOTALL | re.IGNORECASE)
    if shorts_match:
        parsed["shorts_title"] = shorts_match.group(1).strip()
    
    return parsed


def ensure_mistral_model_available():
    """
    Ensure the Mistral model is available in Ollama
    """
    try:
        # Check if model is available
        response = requests.get("http://ollama:11434/api/tags", timeout=10)
        if response.status_code == 200:
            models = response.json().get("models", [])
            model_names = [model.get("name", "") for model in models]
            
            if "mistral:latest" in model_names or "mistral" in model_names:
                print("✅ Mistral model is available")
                return True
            else:
                print("📥 Mistral model not found, attempting to pull...")
                # Try to pull the model
                pull_response = requests.post(
                    "http://ollama:11434/api/pull",
                    json={"name": "mistral"},
                    timeout=300  # 5 minutes timeout for model pulling
                )
                if pull_response.status_code == 200:
                    print("✅ Successfully pulled Mistral model")
                    return True
                else:
                    print(f"❌ Failed to pull Mistral model: {pull_response.status_code}")
                    return False
        else:
            print(f"❌ Failed to check available models: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error checking/pulling Mistral model: {e}")
        return False


# Optional: Function to test the generator
def test_generator():
    """
    Test function to verify the generator works
    """
    test_summary = "This is a test video about artificial intelligence and machine learning concepts."
    
    print("🧪 Testing social media post generation...")
    
    # First ensure model is available
    if not ensure_mistral_model_available():
        print("❌ Cannot proceed - Mistral model not available")
        return
    
    # Generate posts
    posts = generate_social_posts(test_summary)
    
    print("\n📱 Generated Posts:")
    print(f"Twitter: {posts['twitter']}")
    print(f"Instagram: {posts['instagram']}")
    print(f"Shorts Title: {posts['shorts_title']}")


if __name__ == "__main__":
    test_generator()