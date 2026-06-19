from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://pfa_user:pfa_password@db:5432/asset_db"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # App (optionnels)
    APP_NAME: str = "Asset Management System"
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        # Autorise les champs supplémentaires du .env
        extra = "ignore"


settings = Settings()