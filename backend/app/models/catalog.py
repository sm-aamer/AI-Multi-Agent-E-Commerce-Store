import uuid

from sqlalchemy import Boolean, Float, ForeignKey, Integer, JSON, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    slug: Mapped[str] = mapped_column(String(140), unique=True, index=True, nullable=False)
    image: Mapped[str] = mapped_column(Text, nullable=False)
    blurb: Mapped[str | None] = mapped_column(Text)
    products: Mapped[list["Product"]] = relationship(back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(180), nullable=False)
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    compare_at_price: Mapped[float | None] = mapped_column(Numeric(10, 2))
    category_id: Mapped[str] = mapped_column(ForeignKey("categories.id"), index=True, nullable=False)
    stock: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    image: Mapped[str] = mapped_column(Text, nullable=False)
    rating: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    review_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_new: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sizes: Mapped[list[str] | None] = mapped_column(JSON)
    material: Mapped[str | None] = mapped_column(String(180))
    category: Mapped[Category] = relationship(back_populates="products")
