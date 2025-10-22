"""App Store Server API service for subscription verification."""
import os
import time
import base64
import jwt
import httpx
from typing import Dict, Optional
from datetime import datetime, timezone


class AppStoreService:
    """Service for App Store Server API integration."""

    # Base URLs
    SANDBOX_URL = "https://api.storekit-sandbox.itunes.apple.com/inApps/v1"
    PRODUCTION_URL = "https://api.storekit.itunes.apple.com/inApps/v1"

    def __init__(self):
        self.env = os.getenv("APPSTORE_ENV", "sandbox")
        self.issuer_id = os.getenv("APPSTORE_ISSUER_ID")
        self.key_id = os.getenv("APPSTORE_KEY_ID")
        self.private_key_b64 = os.getenv("APPSTORE_PRIVATE_KEY")
        self.bundle_id = os.getenv("BUNDLE_ID")
        self.product_id = os.getenv("PRODUCT_ID")

        self.base_url = self.SANDBOX_URL if self.env == "sandbox" else self.PRODUCTION_URL
        self.is_mock_mode = not all([self.issuer_id, self.key_id, self.private_key_b64])

        if self.is_mock_mode:
            print("⚠️ [AppStore] Running in MOCK mode (keys not configured)")

    def _generate_jwt(self) -> str:
        """Generate JWT for App Store Server API authentication."""
        if self.is_mock_mode:
            return "mock_token"

        try:
            # Decode private key from base64
            private_key_pem = base64.b64decode(self.private_key_b64).decode('utf-8')

            now = int(time.time())
            payload = {
                "iss": self.issuer_id,
                "iat": now,
                "exp": now + 300,  # 5 minutes
                "aud": "appstoreconnect-v1",
                "bid": self.bundle_id,
            }

            token = jwt.encode(
                payload,
                private_key_pem,
                algorithm="ES256",
                headers={"kid": self.key_id, "alg": "ES256"}
            )

            return token
        except Exception as e:
            print(f"❌ [AppStore] JWT generation failed: {e}")
            raise

    async def _call_api(
        self,
        method: str,
        endpoint: str,
        max_retries: int = 3
    ) -> Dict:
        """Call App Store Server API with retry logic."""
        if self.is_mock_mode:
            # Mock response
            return {
                "data": [{
                    "signedTransactionInfo": "mock_signed_transaction",
                    "status": 1,  # ACTIVE
                }]
            }

        token = self._generate_jwt()
        headers = {"Authorization": f"Bearer {token}"}
        url = f"{self.base_url}{endpoint}"

        backoff_times = [0.5, 1.0, 2.0]

        async with httpx.AsyncClient(timeout=5.0) as client:
            for attempt in range(max_retries):
                try:
                    print(f"[AppStore] API call: {method} {endpoint} (attempt {attempt + 1}/{max_retries})")

                    response = await client.request(method, url, headers=headers)

                    if response.status_code == 200:
                        return response.json()
                    elif response.status_code in [429, 500, 502, 503]:
                        # Retry on rate limit or server errors
                        if attempt < max_retries - 1:
                            wait_time = backoff_times[attempt]
                            print(f"⚠️ [AppStore] Status {response.status_code}, retrying in {wait_time}s...")
                            await httpx.AsyncClient().get(f"https://httpbin.org/delay/{wait_time}")
                            continue
                    else:
                        print(f"❌ [AppStore] API error: {response.status_code}")
                        return None
                except httpx.TimeoutException:
                    print(f"⚠️ [AppStore] Timeout on attempt {attempt + 1}")
                    if attempt < max_retries - 1:
                        continue
                except Exception as e:
                    print(f"❌ [AppStore] Request failed: {e}")
                    return None

        return None

    def _decode_signed_transaction(self, signed_info: str) -> Dict:
        """Decode signed transaction info (base64url decode without crypto verification for Phase 5A)."""
        if self.is_mock_mode or signed_info == "mock_signed_transaction":
            # Mock transaction data
            return {
                "originalTransactionId": "mock_1000000123456789",
                "expiresDate": int((datetime.now(timezone.utc).timestamp() + 86400 * 7) * 1000),  # 7 days from now
                "isInTrialPeriod": True,
            }

        try:
            # Base64url decode (without signature verification in Phase 5A)
            # Phase 5B will add full JWS verification
            parts = signed_info.split('.')
            if len(parts) >= 2:
                # Decode payload (second part)
                payload_b64 = parts[1]
                # Add padding if needed
                padding = 4 - (len(payload_b64) % 4)
                if padding != 4:
                    payload_b64 += '=' * padding
                
                payload_json = base64.urlsafe_b64decode(payload_b64).decode('utf-8')
                import json
                return json.loads(payload_json)
            else:
                print("❌ [AppStore] Invalid signed transaction format")
                return {}
        except Exception as e:
            print(f"❌ [AppStore] Decode error: {e}")
            return {}

    async def verify_transaction(
        self,
        original_transaction_id: Optional[str] = None,
        transaction_id: Optional[str] = None
    ) -> Dict:
        """Verify subscription transaction.
        
        Args:
            original_transaction_id: Original transaction ID (preferred)
            transaction_id: Transaction ID (fallback - will resolve to originalTransactionId)
            
        Returns:
            {
                "status": "active" | "trial" | "expired",
                "originalTransactionId": str,
                "trialEndsAt": str (ISO),
                "needsServerValidation": false
            }
        """
        print("[Analytics] verify_start", {"originalTransactionId": bool(original_transaction_id), "transactionId": bool(transaction_id)})

        # Case 1: originalTransactionId provided (preferred)
        if original_transaction_id:
            result = await self._verify_with_original_transaction_id(original_transaction_id)
            if result:
                print("[Analytics] verify_success", {"status": result["status"], "method": "originalTransactionId"})
                return result

        # Case 2: Only transactionId provided - resolve to originalTransactionId first
        if transaction_id:
            print("[AppStore] Resolving transactionId to originalTransactionId...")
            
            # Call /transactions/{transactionId}
            response = await self._call_api("GET", f"/transactions/{transaction_id}")
            
            if response and "signedTransactionInfo" in response:
                transaction_data = self._decode_signed_transaction(response["signedTransactionInfo"])
                resolved_original_id = transaction_data.get("originalTransactionId")
                
                if resolved_original_id:
                    print(f"✅ [AppStore] Resolved to originalTransactionId: {resolved_original_id[:10]}...")
                    result = await self._verify_with_original_transaction_id(resolved_original_id)
                    if result:
                        print("[Analytics] verify_success", {"status": result["status"], "method": "resolved_transactionId"})
                        return result
            
            # Could not resolve
            print("❌ [AppStore] Could not resolve transactionId")
            print("[Analytics] verify_fail", {"reason": "cannot_resolve_transactionId"})
            return {
                "status": "expired",
                "originalTransactionId": transaction_id,
                "needsServerValidation": False,
                "error": "Could not resolve transactionId. Please send originalTransactionId."
            }

        # No IDs provided
        print("[Analytics] verify_fail", {"reason": "no_transaction_id"})
        return {
            "status": "expired",
            "needsServerValidation": False,
            "error": "No transaction ID provided"
        }

    async def _verify_with_original_transaction_id(self, original_transaction_id: str) -> Optional[Dict]:
        """Verify using originalTransactionId."""
        print("[Analytics] appstore_call", {"endpoint": f"/subscriptions/{original_transaction_id[:10]}..."})
        
        response = await self._call_api("GET", f"/subscriptions/{original_transaction_id}")
        
        if not response or "data" not in response:
            print("❌ [AppStore] No data in response")
            return None

        # Get latest transaction from data array
        transactions = response.get("data", [])
        if not transactions:
            print("❌ [AppStore] No transactions found")
            return None

        # Find latest by expiresDate
        latest_transaction = None
        latest_expires = 0

        for txn in transactions:
            signed_info = txn.get("signedTransactionInfo")
            if not signed_info:
                continue

            txn_data = self._decode_signed_transaction(signed_info)
            expires_date_ms = txn_data.get("expiresDate", 0)

            if expires_date_ms > latest_expires:
                latest_expires = expires_date_ms
                latest_transaction = txn_data

        if not latest_transaction:
            print("❌ [AppStore] Could not find valid transaction")
            return None

        # Parse transaction data
        expires_date_ms = latest_transaction.get("expiresDate", 0)
        expires_date = datetime.fromtimestamp(expires_date_ms / 1000, tz=timezone.utc)
        now = datetime.now(timezone.utc)
        is_in_trial = latest_transaction.get("isInTrialPeriod", False)

        # Determine status
        if now < expires_date:
            status = "trial" if is_in_trial else "active"
        else:
            status = "expired"

        return {
            "status": status,
            "originalTransactionId": original_transaction_id,
            "trialEndsAt": expires_date.isoformat() if is_in_trial else None,
            "needsServerValidation": False,
        }
