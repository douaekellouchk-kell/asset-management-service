from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserResponse
from app.core.security import get_password_hash
from typing import List

class UserService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def create_user(self, user_data: UserCreate) -> UserResponse:
        if self.repo.get_by_email(user_data.email):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        
        hashed_pw = get_password_hash(user_data.password)
        db_user = self.repo.create(
            email=user_data.email,
            password_hash=hashed_pw,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            role=user_data.role.value
        )
        return UserResponse.model_validate(db_user)

    def get_users(self, skip: int = 0, limit: int = 50) -> List[UserResponse]:
        users = self.repo.get_all(skip=skip, limit=limit)
        return [UserResponse.model_validate(u) for u in users]
        