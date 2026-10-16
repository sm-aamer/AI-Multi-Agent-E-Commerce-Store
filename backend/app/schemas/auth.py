from pydantic import BaseModel, EmailStr, Field
from pydantic import field_validator

from app.schemas.common import ApiSchema


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)

    @field_validator("password")
    @classmethod
    def bcrypt_password_limit(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be no more than 72 UTF-8 bytes")
        return value


class RegisterRequest(LoginRequest):
    name: str = Field(min_length=2, max_length=120)


class CustomerResponse(ApiSchema):
    id: str
    name: str
    email: EmailStr
    phone: str | None = None
    created_at: str
    orders: int = 0
    spent: float = 0
    role: str


class TokenResponse(BaseModel):
    token: str
    user: CustomerResponse
