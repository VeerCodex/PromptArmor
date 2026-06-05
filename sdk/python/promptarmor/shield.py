import urllib.request
import urllib.error
import json
from typing import Dict, Any

class Shield:
    def __init__(self, api_key: str, api_url: str = "http://localhost:8000"):
        if not api_key:
            raise ValueError("api_key must not be empty")
        self.api_key = api_key
        self.api_url = api_url.rstrip("/")

    def _post(self, endpoint: str, text: str) -> Dict[str, Any]:
        url = f"{self.api_url}{endpoint}"
        payload = json.dumps({"text": text}).encode("utf-8")
        headers = {
            "Content-Type": "application/json",
            "X-API-Key": self.api_key
        }
        
        req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
        try:
            # Perform POST request with 10 seconds timeout
            with urllib.request.urlopen(req, timeout=10) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            try:
                error_body = e.read().decode("utf-8")
                error_json = json.loads(error_body)
                error_detail = error_json.get("detail", error_body)
            except Exception:
                error_detail = str(e)
            raise RuntimeError(f"PromptArmor API Error ({e.code}): {error_detail}")
        except Exception as e:
            raise RuntimeError(f"Failed to connect to PromptArmor API at {self.api_url}: {e}")

    def scan_input(self, user_message: str) -> Dict[str, Any]:
        """
        Scans user input for prompt injection, jailbreaks, and PII.
        
        Returns:
            Dict: {
                "threat_score": int,
                "threat_type": str,
                "details": Dict
            }
        """
        return self._post("/scan/input", user_message)

    def scan_output(self, llm_response: str) -> Dict[str, Any]:
        """
        Scans LLM response for data leakage and PII.
        
        Returns:
            Dict: {
                "threat_score": int,
                "threat_type": str,
                "details": Dict
            }
        """
        return self._post("/scan/output", llm_response)
