from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database - lu depuis .env ou valeurs par défaut
    DATABASE_URL: str = "postgresql://asset_user:asset_password@db:5432/asset_management"
    POSTGRES_USER: str = "asset_user"
    POSTGRES_PASSWORD: str = "asset_password"
    POSTGRES_DB: str = "asset_management"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # App
    APP_NAME: str = "Asset Management System"
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()