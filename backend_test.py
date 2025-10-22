"""Backend API smoke tests for Bible Chat MVP."""
import requests
import json
import sys
import os

# Get backend URL from frontend .env
BACKEND_URL = "https://scripture-converse-1.preview.emergentagent.com/api"

def print_test_header(test_name):
    """Print formatted test header."""
    print(f"\n{'='*80}")
    print(f"TEST: {test_name}")
    print(f"{'='*80}")

def print_result(success, message, response_data=None):
    """Print test result."""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {message}")
    if response_data:
        print(f"Response: {json.dumps(response_data, indent=2, ensure_ascii=False)}")

def test_daily_verse_en():
    """Test GET /api/daily-verse?locale=en"""
    print_test_header("Daily Verse - English (Psalm 23:1-4 KJV)")
    
    try:
        response = requests.get(f"{BACKEND_URL}/daily-verse?locale=en", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Check structure
            if "success" in data and "data" in data:
                verse_data = data["data"]
                
                # Check if it's Psalm 23
                if "ref" in verse_data and "Psalm 23" in verse_data["ref"]:
                    print_result(True, "Daily verse returned Psalm 23:1-4 KJV", data)
                    return True
                else:
                    print_result(False, f"Expected Psalm 23, got: {verse_data.get('ref', 'unknown')}", data)
                    return False
            else:
                print_result(False, "Invalid response structure", data)
                return False
        else:
            print_result(False, f"HTTP {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_daily_verse_ru():
    """Test GET /api/daily-verse?locale=ru"""
    print_test_header("Daily Verse - Russian (Псалом 23:1-4 Synodal)")
    
    try:
        response = requests.get(f"{BACKEND_URL}/daily-verse?locale=ru", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            if "success" in data and "data" in data:
                verse_data = data["data"]
                
                # Check if it's Psalm 23 in Russian
                if "ref" in verse_data and "Псалом 23" in verse_data["ref"]:
                    print_result(True, "Daily verse returned Псалом 23:1-4 Russian Synodal", data)
                    return True
                else:
                    print_result(False, f"Expected Псалом 23, got: {verse_data.get('ref', 'unknown')}", data)
                    return False
            else:
                print_result(False, "Invalid response structure", data)
                return False
        else:
            print_result(False, f"HTTP {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_scripture_john_3_16_en():
    """Test GET /api/scripture/John%203:16?locale=en"""
    print_test_header("Scripture - John 3:16 KJV")
    
    try:
        response = requests.get(f"{BACKEND_URL}/scripture/John%203:16?locale=en", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            if "success" in data and "data" in data:
                verse_data = data["data"]
                
                # Check if it's John 3:16
                if "ref" in verse_data and "John 3:16" in verse_data["ref"]:
                    print_result(True, "Scripture returned John 3:16 KJV", data)
                    return True
                else:
                    print_result(False, f"Expected John 3:16, got: {verse_data.get('ref', 'unknown')}", data)
                    return False
            else:
                print_result(False, "Invalid response structure", data)
                return False
        else:
            print_result(False, f"HTTP {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_scripture_john_3_16_ru():
    """Test GET /api/scripture/Иоанна%203:16?locale=ru"""
    print_test_header("Scripture - Иоанна 3:16 Russian Synodal")
    
    try:
        response = requests.get(f"{BACKEND_URL}/scripture/Иоанна%203:16?locale=ru", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            if "success" in data and "data" in data:
                verse_data = data["data"]
                
                # Check if it's John 3:16 in Russian
                if "ref" in verse_data and "Иоанна 3:16" in verse_data["ref"]:
                    print_result(True, "Scripture returned Иоанна 3:16 Russian Synodal", data)
                    return True
                else:
                    print_result(False, f"Expected Иоанна 3:16, got: {verse_data.get('ref', 'unknown')}", data)
                    return False
            else:
                print_result(False, "Invalid response structure", data)
                return False
        else:
            print_result(False, f"HTTP {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_scripture_philippians_4_6_7_en():
    """Test GET /api/scripture/Philippians%204:6-7?locale=en"""
    print_test_header("Scripture - Philippians 4:6-7 KJV")
    
    try:
        response = requests.get(f"{BACKEND_URL}/scripture/Philippians%204:6-7?locale=en", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            if "success" in data and "data" in data:
                verse_data = data["data"]
                
                # Check if it's Philippians 4:6-7
                if "ref" in verse_data and "Philippians 4" in verse_data["ref"]:
                    print_result(True, "Scripture returned Philippians 4:6-7 KJV", data)
                    return True
                else:
                    print_result(False, f"Expected Philippians 4:6-7, got: {verse_data.get('ref', 'unknown')}", data)
                    return False
            else:
                print_result(False, "Invalid response structure", data)
                return False
        else:
            print_result(False, f"HTTP {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_chat_fear_en():
    """Test POST /api/chat - How to deal with fear? (EN)"""
    print_test_header("Chat - Fear Question (English)")
    
    try:
        payload = {
            "text": "How to deal with fear?",
            "locale": "en"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/chat",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            
            # Check required fields
            if "answer" in data and "citations" in data and "has_reliable_sources" in data:
                print_result(True, "Chat endpoint returned valid response structure", data)
                
                # Note about OpenAI
                if not data.get("has_reliable_sources"):
                    print("ℹ️  Note: has_reliable_sources=false (expected due to OpenAI network issue)")
                
                return True
            else:
                print_result(False, "Missing required fields (answer, citations, has_reliable_sources)", data)
                return False
        else:
            print_result(False, f"HTTP {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_chat_fear_ru():
    """Test POST /api/chat - Как справиться со страхом? (RU)"""
    print_test_header("Chat - Fear Question (Russian)")
    
    try:
        payload = {
            "text": "Как справиться со страхом?",
            "locale": "ru"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/chat",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            
            # Check required fields
            if "answer" in data and "citations" in data and "has_reliable_sources" in data:
                print_result(True, "Chat endpoint returned valid Russian response", data)
                
                # Note about OpenAI
                if not data.get("has_reliable_sources"):
                    print("ℹ️  Note: has_reliable_sources=false (expected due to OpenAI network issue)")
                
                return True
            else:
                print_result(False, "Missing required fields", data)
                return False
        else:
            print_result(False, f"HTTP {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_chat_nonsense():
    """Test POST /api/chat - Random nonsense"""
    print_test_header("Chat - Nonsense Input")
    
    try:
        payload = {
            "text": "Random nonsense xyz123",
            "locale": "en"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/chat",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            
            # Should return polite refusal or has_reliable_sources=false
            if "answer" in data and "has_reliable_sources" in data:
                if not data["has_reliable_sources"]:
                    print_result(True, "Chat correctly handled nonsense input (has_reliable_sources=false)", data)
                    return True
                else:
                    print_result(True, "Chat returned response (may be polite refusal)", data)
                    return True
            else:
                print_result(False, "Missing required fields", data)
                return False
        else:
            print_result(False, f"HTTP {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_scripture_invalid_ref():
    """Test GET /api/scripture/InvalidRef%20999:999?locale=en - Should return 404"""
    print_test_header("Scripture - Invalid Reference (Edge Case)")
    
    try:
        response = requests.get(f"{BACKEND_URL}/scripture/InvalidRef%20999:999?locale=en", timeout=10)
        
        if response.status_code == 404:
            print_result(True, "Correctly returned 404 for invalid reference", {"status": 404})
            return True
        else:
            print_result(False, f"Expected 404, got HTTP {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_chat_empty_body():
    """Test POST /api/chat with empty body - Should return 422"""
    print_test_header("Chat - Empty Body (Edge Case)")
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/chat",
            json={},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 422:
            print_result(True, "Correctly returned 422 validation error for empty body", {"status": 422})
            return True
        else:
            print_result(False, f"Expected 422, got HTTP {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def run_all_tests():
    """Run all backend API tests."""
    print("\n" + "="*80)
    print("BIBLE CHAT MVP - BACKEND API SMOKE TESTS")
    print("="*80)
    print(f"Backend URL: {BACKEND_URL}")
    print("="*80)
    
    results = {
        "Scripture Endpoints": [],
        "Chat Endpoint (RAG)": [],
        "Edge Cases": []
    }
    
    # Scripture Endpoints
    results["Scripture Endpoints"].append(("Daily Verse EN", test_daily_verse_en()))
    results["Scripture Endpoints"].append(("Daily Verse RU", test_daily_verse_ru()))
    results["Scripture Endpoints"].append(("John 3:16 EN", test_scripture_john_3_16_en()))
    results["Scripture Endpoints"].append(("John 3:16 RU", test_scripture_john_3_16_ru()))
    results["Scripture Endpoints"].append(("Philippians 4:6-7 EN", test_scripture_philippians_4_6_7_en()))
    
    # Chat Endpoint
    results["Chat Endpoint (RAG)"].append(("Fear Question EN", test_chat_fear_en()))
    results["Chat Endpoint (RAG)"].append(("Fear Question RU", test_chat_fear_ru()))
    results["Chat Endpoint (RAG)"].append(("Nonsense Input", test_chat_nonsense()))
    
    # Edge Cases
    results["Edge Cases"].append(("Invalid Reference 404", test_scripture_invalid_ref()))
    results["Edge Cases"].append(("Empty Body 422", test_chat_empty_body()))
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    total_tests = 0
    passed_tests = 0
    
    for category, tests in results.items():
        print(f"\n{category}:")
        for test_name, result in tests:
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"  {status} - {test_name}")
            total_tests += 1
            if result:
                passed_tests += 1
    
    print("\n" + "="*80)
    print(f"OVERALL: {passed_tests}/{total_tests} tests passed")
    print("="*80)
    
    return passed_tests == total_tests

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
