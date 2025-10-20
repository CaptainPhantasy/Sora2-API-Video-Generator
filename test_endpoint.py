#!/usr/bin/env python3
"""
Test the actual Sora 2 endpoint to verify it exists and check response format
This will make a real API call (costs money if successful)
"""

import os
import sys
import json
import requests
from datetime import datetime

API_KEY = os.environ.get('OPENAI_API_KEY', '')
BASE_URL = "https://api.openai.com/v1"

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

def test_sora_endpoint():
    """Test if Sora 2 endpoint exists and what the response is"""

    log("Testing Sora 2 endpoint...")

    # Minimal payload to test
    payload = {
        "model": "sora-2",
        "prompt": "A red ball rolling on a white table",
        "duration": 5,
        "resolution": "1280x720"
    }

    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }

    log(f"Endpoint: {BASE_URL}/video/generations")
    log(f"Payload: {json.dumps(payload, indent=2)}")

    try:
        response = requests.post(
            f"{BASE_URL}/video/generations",
            headers=headers,
            json=payload,
            timeout=30
        )

        log(f"\nStatus Code: {response.status_code}")
        log(f"Headers: {dict(response.headers)}")

        try:
            response_json = response.json()
            log(f"\nResponse Body:\n{json.dumps(response_json, indent=2)}")
        except:
            log(f"\nResponse Text:\n{response.text}")

        # Interpret results
        if response.status_code == 200 or response.status_code == 201:
            log("\n✅ SUCCESS! Sora 2 endpoint is accessible and working!")
            log("⚠️  This created a real job - you may be charged!")
            if 'id' in response_json:
                log(f"Job ID: {response_json['id']}")
                return response_json
        elif response.status_code == 400:
            log("\n❌ Bad Request - Parameters may be incorrect")
        elif response.status_code == 403:
            log("\n❌ Forbidden - Account doesn't have Sora 2 access")
        elif response.status_code == 404:
            log("\n❌ Not Found - Endpoint doesn't exist yet")
        elif response.status_code == 429:
            log("\n❌ Rate Limited - Too many requests")
        else:
            log(f"\n⚠️  Unexpected status code: {response.status_code}")

    except Exception as e:
        log(f"\n❌ Error: {str(e)}")

    return None

def check_available_models():
    """Check what models are available"""
    log("\nChecking available models...")

    headers = {
        'Authorization': f'Bearer {API_KEY}'
    }

    try:
        response = requests.get(f"{BASE_URL}/models", headers=headers)
        if response.status_code == 200:
            models = response.json()
            sora_models = [m for m in models.get('data', []) if 'sora' in m.get('id', '').lower()]

            log(f"Total models: {len(models.get('data', []))}")

            if sora_models:
                log(f"\n✅ Found Sora models:")
                for model in sora_models:
                    log(f"  - {model.get('id')}")
            else:
                log("\n❌ No Sora models found in available models")
                log("\nSearching for video-related models...")
                video_models = [m for m in models.get('data', []) if 'video' in m.get('id', '').lower()]
                if video_models:
                    log("Found video models:")
                    for model in video_models:
                        log(f"  - {model.get('id')}")
                else:
                    log("No video-related models found")

    except Exception as e:
        log(f"Error checking models: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        API_KEY = sys.argv[1]

    if not API_KEY:
        log("❌ No API key provided")
        sys.exit(1)

    log("=" * 60)
    log("Sora 2 Endpoint Test")
    log("=" * 60)

    # First check available models
    check_available_models()

    log("\n" + "=" * 60)

    # Ask for confirmation before making the real call
    print("\n⚠️  WARNING: The next test will attempt to create a real video generation job.")
    print("This may cost money if successful (approximately $1.50 for 5 seconds).")
    print("\nDo you want to proceed? (yes/no): ", end='')

    try:
        response = input().strip().lower()
        if response == 'yes':
            log("\nProceeding with endpoint test...")
            result = test_sora_endpoint()

            if result and 'id' in result:
                log(f"\n⚠️  Job created with ID: {result['id']}")
                log("You can check status at:")
                log(f"  {BASE_URL}/video/generations/{result['id']}")
        else:
            log("\nTest cancelled by user")
    except KeyboardInterrupt:
        log("\n\nTest cancelled")
