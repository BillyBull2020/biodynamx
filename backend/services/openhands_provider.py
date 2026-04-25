"""
OpenHands Cloud Provider - FREE with OpenHands Cloud account
=====================================================
Uses OpenHands Cloud LLM infrastructure (free)
"""

import os
import requests
from typing import Dict, Any, List


class OpenHandsCloudProvider:
    """OpenHands Cloud provider - FREE with account"""
    
    def __init__(self, api_key: str = None, base_url: str = None, model: str = "openhands/claude-sonnet-4-5-20250929"):
        self.api_key = api_key or os.getenv("OPENHANDS_API_KEY")
        self.base_url = base_url or os.getenv("OPENHANDS_HOST", "https://app.all-hands.dev")
        self.model = model
    
    def chat(self, messages: List[Dict], **kwargs) -> Dict[str, Any]:
        """Send chat via OpenHands Cloud API"""
        if not self.api_key:
            return {"success": False, "error": "OPENHANDS_API_KEY not configured", "provider": "openhands"}
        
        url = f"{self.base_url}/api/chat"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        model = kwargs.get("model", self.model)
        
        payload = {
            "model": model,
            "messages": messages
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=120)
            response.raise_for_status()
            data = response.json()
            
            content = data.get("content", "") or data.get("message", {}).get("content", "")
            
            return {
                "success": True,
                "content": content,
                "model": data.get("model", model),
                "provider": "openhands"
            }
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"OpenHands Cloud error: {str(e)}",
                "provider": "openhands"
            }
    
    def test_connection(self) -> Dict[str, Any]:
        """Test OpenHands Cloud connection"""
        if not self.api_key:
            return {"success": False, "error": "API key not configured"}
        
        try:
            url = f"{self.base_url}/api/chat"
            headers = {"Authorization": f"Bearer {self.api_key}"}
            # Send a simple test message
            payload = {
                "model": self.model,
                "messages": [{"role": "user", "content": "Hi"}]
            }
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            
            if response.status_code == 200:
                return {"success": True, "message": "OpenHands Cloud connected (FREE!)"}
            return {"success": False, "error": f"Status: {response.status_code}"}
        except Exception as e:
            return {"success": False, "error": str(e)}


# Make it available for import
def get_openhands_provider(api_key: str = None) -> OpenHandsCloudProvider:
    return OpenHandsCloudProvider(api_key=api_key)