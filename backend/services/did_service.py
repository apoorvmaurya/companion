import aiohttp
from typing import Dict, Optional
from config.settings import get_settings

settings = get_settings()

class DIDService:
    def __init__(self):
        self.api_key = settings.did_api_key
        self.base_url = "https://api.d-id.com"
        self.headers = {
            "Authorization": f"Basic {self.api_key}",
            "Content-Type": "application/json"
        }

    async def create_stream(self, presenter_id: str, session_id: str) -> Optional[Dict]:
        try:
            url = f"{self.base_url}/talks/streams"
            payload = {
                "source_url": f"https://create-images-results.d-id.com/api-docs/assets/{presenter_id}.jpg",
                "session_id": session_id
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload, headers=self.headers) as response:
                    if response.status == 201:
                        data = await response.json()
                        return data
                    else:
                        error_text = await response.text()
                        print(f"D-ID create stream error: {response.status} - {error_text}")
                        return None

        except Exception as e:
            print(f"Error creating D-ID stream: {e}")
            return None

    async def send_answer(self, stream_id: str, answer: Dict) -> bool:
        try:
            url = f"{self.base_url}/talks/streams/{stream_id}/sdp"
            payload = {
                "answer": answer,
                "session_id": stream_id
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload, headers=self.headers) as response:
                    if response.status == 200:
                        return True
                    else:
                        error_text = await response.text()
                        print(f"D-ID send answer error: {response.status} - {error_text}")
                        return False

        except Exception as e:
            print(f"Error sending answer to D-ID: {e}")
            return False

    async def send_ice_candidate(self, stream_id: str, candidate: Dict, sdp_mid: str, sdp_m_line_index: int) -> bool:
        try:
            url = f"{self.base_url}/talks/streams/{stream_id}/ice"
            payload = {
                "candidate": candidate,
                "sdpMid": sdp_mid,
                "sdpMLineIndex": sdp_m_line_index,
                "session_id": stream_id
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload, headers=self.headers) as response:
                    if response.status == 200:
                        return True
                    else:
                        error_text = await response.text()
                        print(f"D-ID send ICE error: {response.status} - {error_text}")
                        return False

        except Exception as e:
            print(f"Error sending ICE candidate to D-ID: {e}")
            return False

    async def stream_text(self, stream_id: str, text: str, voice_id: str = None) -> bool:
        try:
            url = f"{self.base_url}/talks/streams/{stream_id}"
            payload = {
                "script": {
                    "type": "text",
                    "input": text
                },
                "session_id": stream_id
            }

            if voice_id:
                payload["config"] = {
                    "fluent": True,
                    "pad_audio": 0,
                    "driver_expressions": {
                        "expressions": [{"expression": "neutral", "start_frame": 0, "intensity": 1.0}]
                    }
                }

            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload, headers=self.headers) as response:
                    if response.status == 200:
                        return True
                    else:
                        error_text = await response.text()
                        print(f"D-ID stream text error: {response.status} - {error_text}")
                        return False

        except Exception as e:
            print(f"Error streaming text to D-ID: {e}")
            return False

    async def delete_stream(self, stream_id: str) -> bool:
        try:
            url = f"{self.base_url}/talks/streams/{stream_id}"

            async with aiohttp.ClientSession() as session:
                async with session.delete(url, headers=self.headers) as response:
                    if response.status in [200, 204]:
                        return True
                    else:
                        error_text = await response.text()
                        print(f"D-ID delete stream error: {response.status} - {error_text}")
                        return False

        except Exception as e:
            print(f"Error deleting D-ID stream: {e}")
            return False
