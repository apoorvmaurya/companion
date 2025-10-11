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
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated"
        )

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        return user_id
    except JWTError as e:
        print(f"JWT verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")
