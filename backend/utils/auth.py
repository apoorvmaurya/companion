from fastapi import Header, HTTPException
from jose import jwt, JWTError
from config.settings import get_settings

settings = get_settings()

async def get_current_user(authorization: str = Header(None)) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    try:
        token = authorization.replace("Bearer ", "")

        payload = jwt.decode(
            token,
            settings.supabase_service_key,
            algorithms=["HS256"],
            options={"verify_signature": False}
        )

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
