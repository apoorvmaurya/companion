from typing import List, Dict, Optional
from datetime import datetime

class MemoryService:
    def __init__(self):
        self.langmem_available = False
        try:
            import langmem
            self.langmem = langmem
            self.langmem_available = True
            print("LangMem initialized successfully")
        except ImportError:
            print("LangMem not available, using fallback memory system")
            self.memory_store: Dict[str, List[Dict]] = {}

    async def store_interaction(
        self,
        user_id: str,
        companion_id: str,
        room_id: str,
        user_message: str,
        ai_response: str
    ) -> bool:
        try:
            if self.langmem_available:
                memory_id = f"{user_id}_{companion_id}"
                self.langmem.add_memory(
                    memory_id,
                    {
                        "user_message": user_message,
                        "ai_response": ai_response,
                        "timestamp": datetime.utcnow().isoformat(),
                        "room_id": room_id
                    }
                )
            else:
                memory_key = f"{user_id}_{companion_id}"
                if memory_key not in self.memory_store:
                    self.memory_store[memory_key] = []

                self.memory_store[memory_key].append({
                    "user_message": user_message,
                    "ai_response": ai_response,
                    "timestamp": datetime.utcnow().isoformat(),
                    "room_id": room_id
                })

                if len(self.memory_store[memory_key]) > 50:
                    self.memory_store[memory_key] = self.memory_store[memory_key][-50:]

            return True
        except Exception as e:
            print(f"Error storing memory: {e}")
            return False

    async def get_context(
        self,
        user_id: str,
        companion_id: str,
        limit: int = 10
    ) -> List[Dict]:
        try:
            if self.langmem_available:
                memory_id = f"{user_id}_{companion_id}"
                memories = self.langmem.get_memories(memory_id, limit=limit)
                return memories if memories else []
            else:
                memory_key = f"{user_id}_{companion_id}"
                memories = self.memory_store.get(memory_key, [])
                return memories[-limit:] if memories else []
        except Exception as e:
            print(f"Error retrieving memory: {e}")
            return []

    async def clear_context(self, user_id: str, companion_id: str) -> bool:
        try:
            if self.langmem_available:
                memory_id = f"{user_id}_{companion_id}"
                self.langmem.clear_memory(memory_id)
            else:
                memory_key = f"{user_id}_{companion_id}"
                if memory_key in self.memory_store:
                    del self.memory_store[memory_key]

            return True
        except Exception as e:
            print(f"Error clearing memory: {e}")
            return False

    async def get_summary(
        self,
        user_id: str,
        companion_id: str
    ) -> Optional[str]:
        try:
            context = await self.get_context(user_id, companion_id, limit=20)
            if not context:
                return None

            summary_parts = []
            for memory in context[-5:]:
                summary_parts.append(f"User: {memory.get('user_message', '')}")
                summary_parts.append(f"Assistant: {memory.get('ai_response', '')}")

            return "\n".join(summary_parts)
        except Exception as e:
            print(f"Error generating summary: {e}")
            return None
