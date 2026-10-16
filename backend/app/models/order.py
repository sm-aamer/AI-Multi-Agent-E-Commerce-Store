import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, JSON, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=lambda: f"ORD-{uuid.uuid4().hex[:10].upper()}")
    customer_id: Mapped[str] = mapped_column(String(36), index=True, nullable=False)
    customer_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    address: Mapped[dict] = mapped_column(JSON, nullable=False)
    items: Mapped[list[dict]] = mapped_column(JSON, nullable=False)
    subtotal: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    shipping: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    total: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)
    payment_method: Mapped[str] = mapped_column(String(20), nullable=False)
    payment_status: Mapped[str] = mapped_column(String(30), nullable=False)
    bank_reference: Mapped[str | None] = mapped_column(String(80))
    fraud_score: Mapped[float] = mapped_column(Numeric(4, 3), default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
