import google.generativeai as genai
from config.settings import get_settings
from services.supabase_client import get_supabase_client
from services.memory_service import MemoryService

settings = get_settings()
genai.configure(api_key=settings.gemini_api_key)

class AIService:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-pro')
        self.memory_service = MemoryService()

    async def generate_response(self, user_message: str, companion: dict, room_id: str, user_id: str = None) -> str:
        try:
            supabase = get_supabase_client()

            conversation_history = ""

            if user_id:
                context_memories = await self.memory_service.get_context(user_id, companion["id"], limit=5)
                if context_memories:
                    conversation_history += "Previous conversations:\n"
                    for memory in context_memories:
                        conversation_history += f"User: {memory.get('user_message', '')}\n"
                        conversation_history += f"{companion['name']}: {memory.get('ai_response', '')}\n"
                    conversation_history += "\n"

            messages_response = supabase.table("messages").select("*").eq("room_id", room_id).order("created_at").limit(10).execute()

            if messages_response.data:
                conversation_history += "Current session:\n"
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
            ai_response = response.text.strip()

            if user_id:
                await self.memory_service.store_interaction(
                    user_id=user_id,
                    companion_id=companion["id"],
                    room_id=room_id,
                    user_message=user_message,
                    ai_response=ai_response
                )

            return ai_response

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
