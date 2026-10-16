from typing import Literal

from pydantic import EmailStr, Field

from app.schemas.common import ApiSchema


class AddressSchema(ApiSchema):
    line1: str
    city: str
    postal_code: str
    country: str


class OrderItemCreate(ApiSchema):
    product_id: str
    quantity: int = Field(gt=0, le=99)
    size: str | None = None


class OrderCreate(ApiSchema):
    customer_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(min_length=7, max_length=30)
    address: AddressSchema
    items: list[OrderItemCreate] = Field(min_length=1, max_length=50)
    payment_method: Literal["bank_transfer", "cod"]
    bank_reference: str | None = Field(default=None, max_length=80)


class OrderItemResponse(ApiSchema):
    product_id: str
    name: str
    price: float
    quantity: int
    size: str | None = None


class OrderResponse(ApiSchema):
    id: str
    customer_id: str
    customer_name: str
    email: EmailStr
    phone: str
    address: AddressSchema
    items: list[OrderItemResponse]
    subtotal: float
    shipping: float
    total: float
    status: str
    payment_method: str
    payment_status: str
    bank_reference: str | None = None
    fraud_score: float | None = None
    fraud_reasons: list[str] | None = None
    created_at: str


class OrderUpdate(ApiSchema):
    status: Literal["pending", "confirmed", "shipped", "delivered", "cancelled"] | None = None
    payment_status: Literal["unpaid", "awaiting_verification", "verified", "rejected"] | None = None
    fraud_score: float | None = Field(default=None, ge=0, le=1)
