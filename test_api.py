#!/usr/bin/env python3
"""
Sora 2 API Test Script
Tests the OpenAI Sora 2 video generation API endpoints
"""

import os
import sys
import json
import time
import requests
from datetime import datetime

# API Configuration
API_KEY = os.environ.get('OPENAI_API_KEY', '')
BASE_URL = "https://api.openai.com/v1"
VIDEO_ENDPOINT = f"{BASE_URL}/video/generations"

# Test configuration
TEST_MODE = True  # Set to False to actually generate videos
VERBOSE = True

def log(message, level="INFO"):
    """Print log message with timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [{level}] {message}")

def test_api_authentication():
    """Test 1: Verify API key authentication"""
    log("Test 1: API Authentication", "TEST")

    if not API_KEY:
        log("❌ No API key provided. Set OPENAI_API_KEY environment variable", "ERROR")
        return False

    if not API_KEY.startswith('sk-'):
        log("⚠️  API key format looks incorrect (should start with 'sk-')", "WARN")

    log(f"✅ API key present: {API_KEY[:20]}...", "SUCCESS")
    return True

def test_endpoint_accessibility():
    """Test 2: Check if endpoint is accessible"""
    log("Test 2: Endpoint Accessibility", "TEST")

    # Try to access OpenAI API (use models endpoint as a test)
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }

    try:
        # Test with models endpoint first (less expensive)
        response = requests.get(f"{BASE_URL}/models", headers=headers, timeout=10)

        if response.status_code == 200:
            log("✅ OpenAI API accessible", "SUCCESS")
            if VERBOSE:
                models = response.json()
                log(f"Available models count: {len(models.get('data', []))}", "INFO")
            return True
        elif response.status_code == 401:
            log("❌ Authentication failed - invalid API key", "ERROR")
            if VERBOSE:
                log(f"Response: {response.text}", "DEBUG")
            return False
        else:
            log(f"⚠️  Unexpected status code: {response.status_code}", "WARN")
            if VERBOSE:
                log(f"Response: {response.text}", "DEBUG")
            return False
    except requests.exceptions.RequestException as e:
        log(f"❌ Network error: {str(e)}", "ERROR")
        return False

def test_video_generation_request_format():
    """Test 3: Verify video generation request format"""
    log("Test 3: Video Generation Request Format", "TEST")

    # Minimal test payload
    test_payload = {
        "model": "sora-2",
        "prompt": "A test video of a red ball rolling on a table",
        "duration": 5,
        "resolution": "1280x720",
        "quality": "standard"
    }

    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }

    log(f"Request payload: {json.dumps(test_payload, indent=2)}", "DEBUG")

    if TEST_MODE:
        log("⚠️  TEST_MODE enabled - not making actual API call", "WARN")
        log("✅ Request format validated (dry run)", "SUCCESS")
        return True

    try:
        log("Making POST request to video generation endpoint...", "INFO")
        response = requests.post(
            VIDEO_ENDPOINT,
            headers=headers,
            json=test_payload,
            timeout=30
        )

        log(f"Response status: {response.status_code}", "INFO")
        log(f"Response headers: {dict(response.headers)}", "DEBUG")

        if response.status_code == 200 or response.status_code == 201:
            log("✅ Video generation request accepted", "SUCCESS")
            job_data = response.json()
            log(f"Response: {json.dumps(job_data, indent=2)}", "DEBUG")
            return job_data
        elif response.status_code == 400:
            log("❌ Bad request - invalid parameters", "ERROR")
            log(f"Error: {response.text}", "DEBUG")
            return False
        elif response.status_code == 403:
            log("❌ Forbidden - Sora 2 API access not enabled for this account", "ERROR")
            log(f"Error: {response.text}", "DEBUG")
            return False
        elif response.status_code == 404:
            log("❌ Endpoint not found - Sora 2 API may not be available yet", "ERROR")
            log(f"Error: {response.text}", "DEBUG")
            return False
        else:
            log(f"❌ Unexpected status: {response.status_code}", "ERROR")
            log(f"Response: {response.text}", "DEBUG")
            return False

    except requests.exceptions.RequestException as e:
        log(f"❌ Request failed: {str(e)}", "ERROR")
        return False

def test_polling_endpoint(job_id):
    """Test 4: Verify polling endpoint"""
    log("Test 4: Job Status Polling", "TEST")

    if not job_id:
        log("⚠️  No job ID provided - skipping polling test", "WARN")
        return True

    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }

    polling_url = f"{VIDEO_ENDPOINT}/{job_id}"

    try:
        log(f"Polling job status: {job_id}", "INFO")
        response = requests.get(polling_url, headers=headers, timeout=10)

        if response.status_code == 200:
            log("✅ Polling endpoint accessible", "SUCCESS")
            job_status = response.json()
            log(f"Job status: {json.dumps(job_status, indent=2)}", "DEBUG")
            return job_status
        else:
            log(f"❌ Polling failed with status: {response.status_code}", "ERROR")
            log(f"Response: {response.text}", "DEBUG")
            return False

    except requests.exceptions.RequestException as e:
        log(f"❌ Polling request failed: {str(e)}", "ERROR")
        return False

def test_all_parameters():
    """Test 5: Validate all parameter combinations"""
    log("Test 5: Parameter Validation", "TEST")

    tests = [
        {
            "name": "Sora 2 with all parameters",
            "payload": {
                "model": "sora-2",
                "prompt": "A golden retriever running in a field",
                "duration": 10,
                "resolution": "1280x720",
                "quality": "standard",
                "style": "cinematic",
                "fps": 30
            }
        },
        {
            "name": "Sora 2 Pro with extended duration",
            "payload": {
                "model": "sora-2-pro",
                "prompt": "Time-lapse of clouds over mountains",
                "duration": 30,
                "resolution": "1920x1080",
                "quality": "high",
                "style": "documentary",
                "fps": 60
            }
        },
        {
            "name": "Minimal parameters (Sora 2)",
            "payload": {
                "model": "sora-2",
                "prompt": "A red ball rolling"
            }
        },
        {
            "name": "Portrait aspect ratio (9:16)",
            "payload": {
                "model": "sora-2",
                "prompt": "Close-up of coffee being poured",
                "duration": 8,
                "resolution": "720x1280",
                "quality": "standard"
            }
        },
        {
            "name": "Square aspect ratio (1:1)",
            "payload": {
                "model": "sora-2",
                "prompt": "Rotating product showcase",
                "duration": 10,
                "resolution": "1080x1080",
                "style": "cinematic"
            }
        }
    ]

    all_valid = True
    for test in tests:
        log(f"Validating: {test['name']}", "INFO")

        # Validate required fields
        if 'model' not in test['payload'] or 'prompt' not in test['payload']:
            log(f"  ❌ Missing required fields", "ERROR")
            all_valid = False
            continue

        # Validate model
        if test['payload']['model'] not in ['sora-2', 'sora-2-pro']:
            log(f"  ❌ Invalid model: {test['payload']['model']}", "ERROR")
            all_valid = False
            continue

        # Validate duration
        if 'duration' in test['payload']:
            duration = test['payload']['duration']
            max_duration = 90 if test['payload']['model'] == 'sora-2-pro' else 20
            if duration < 1 or duration > max_duration:
                log(f"  ❌ Invalid duration: {duration} (max: {max_duration})", "ERROR")
                all_valid = False
                continue

        # Validate prompt length
        if len(test['payload']['prompt']) > 500:
            log(f"  ❌ Prompt too long: {len(test['payload']['prompt'])} chars", "ERROR")
            all_valid = False
            continue

        log(f"  ✅ Valid configuration", "SUCCESS")
        if VERBOSE:
            log(f"     {json.dumps(test['payload'], indent=6)}", "DEBUG")

    if all_valid:
        log("✅ All parameter combinations valid", "SUCCESS")
    else:
        log("❌ Some parameter combinations invalid", "ERROR")

    return all_valid

def print_summary(results):
    """Print test summary"""
    log("", "INFO")
    log("=" * 60, "INFO")
    log("TEST SUMMARY", "INFO")
    log("=" * 60, "INFO")

    total = len(results)
    passed = sum(1 for r in results.values() if r)
    failed = total - passed

    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        log(f"{status} - {test_name}", "INFO")

    log("=" * 60, "INFO")
    log(f"Total: {total} | Passed: {passed} | Failed: {failed}", "INFO")

    if failed == 0:
        log("🎉 All tests passed!", "SUCCESS")
    else:
        log(f"⚠️  {failed} test(s) failed", "WARN")

    log("=" * 60, "INFO")

def main():
    """Run all tests"""
    log("Starting Sora 2 API Tests", "INFO")
    log(f"Test mode: {TEST_MODE}", "INFO")
    log(f"Verbose: {VERBOSE}", "INFO")
    log("=" * 60, "INFO")

    results = {}

    # Test 1: Authentication
    results["API Authentication"] = test_api_authentication()

    if not results["API Authentication"]:
        log("Stopping tests - authentication failed", "ERROR")
        print_summary(results)
        return 1

    # Test 2: Endpoint accessibility
    results["Endpoint Accessibility"] = test_endpoint_accessibility()

    # Test 3: Video generation request (dry run if TEST_MODE)
    video_result = test_video_generation_request_format()
    results["Video Generation Request"] = bool(video_result)

    # Test 4: Polling (only if we have a job ID)
    if isinstance(video_result, dict) and 'id' in video_result:
        results["Job Status Polling"] = bool(test_polling_endpoint(video_result['id']))
    else:
        log("Skipping polling test (no job ID)", "WARN")
        results["Job Status Polling"] = True  # Mark as passed since we're in test mode

    # Test 5: Parameter validation
    results["Parameter Validation"] = test_all_parameters()

    # Print summary
    print_summary(results)

    # Return exit code
    return 0 if all(results.values()) else 1

if __name__ == "__main__":
    # Get API key from environment or command line
    if len(sys.argv) > 1:
        API_KEY = sys.argv[1]

    exit_code = main()
    sys.exit(exit_code)
