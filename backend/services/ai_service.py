import google.generativeai as genai
from config.settings import get_settings
from services.supabase_client import get_supabase_client

settings = get_settings()
genai.configure(api_key=settings.gemini_api_key)

class AIService:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-pro')

    async def generate_response(self, user_message: str, companion: dict, room_id: str) -> str:
        try:
            supabase = get_supabase_client()
            messages_response = supabase.table("messages").select("*").eq("room_id", room_id).order("created_at").limit(10).execute()

            conversation_history = ""
            if messages_response.data:
                for msg in messages_response.data:
                    sender = "User" if msg["sender_type"] == "user" else companion["name"]
                    conversation_history += f"{sender}: {msg['content']}\n"

            system_prompt = f"""You are {companion['name']}, an AI companion with the following traits:
Personality: {companion['personality']}
Description: {companion['description']}
Specialties: {', '.join(companion['specialties'])}

Previous conversation:
{conversation_history}

Respond to the user in a natural, engaging way that matches your personality.
Keep responses concise and conversational (2-3 sentences).
Be helpful, friendly, and stay in character."""

            prompt = f"{system_prompt}\n\nUser: {user_message}\n{companion['name']}:"

            response = self.model.generate_content(prompt)

            return response.text.strip()

        except Exception as e:
            print(f"Error generating AI response: {e}")
            return "I apologize, but I'm having trouble processing that right now. Could you try rephrasing?"

    async def generate_voice(self, text: str, voice_id: str) -> bytes:
        try:
            from elevenlabs import generate
            audio = generate(
                text=text,
                voice=voice_id,
                api_key=settings.elevenlabs_api_key
            )
            return audio
        except Exception as e:
            print(f"Error generating voice: {e}")
            return b""
