from pydantic import Field

from app.schemas.common import ApiSchema


class CategoryCreate(ApiSchema):
    name: str = Field(min_length=1, max_length=120)
    slug: str = Field(min_length=1, max_length=140)
    image: str
    blurb: str | None = None


class CategoryResponse(CategoryCreate):
    id: str


class ProductCreate(ApiSchema):
    name: str = Field(min_length=1, max_length=180)
    slug: str = Field(min_length=1, max_length=200)
    description: str
    price: float = Field(gt=0)
    compare_at_price: float | None = Field(default=None, gt=0)
    category_id: str
    stock: int = Field(ge=0)
    image: str
    rating: float = Field(default=0, ge=0, le=5)
    review_count: int = Field(default=0, ge=0)
    featured: bool = False
    is_new: bool = False
    sizes: list[str] | None = None
    material: str | None = None


class ProductResponse(ProductCreate):
    id: str
