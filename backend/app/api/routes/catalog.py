from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import require_admin
from app.db.database import get_db
from app.models.catalog import Category, Product
from app.schemas.product import CategoryCreate, CategoryResponse, ProductCreate, ProductResponse

router = APIRouter(tags=["catalog"])


@router.get("/categories", response_model=list[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    return db.scalars(select(Category).order_by(Category.name)).all()


@router.post(
    "/categories",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def create_category(payload: CategoryCreate, db: Session = Depends(get_db)):
    category = Category(**payload.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put(
    "/categories/{category_id}",
    response_model=CategoryResponse,
    dependencies=[Depends(require_admin)],
)
def update_category(category_id: str, payload: CategoryCreate, db: Session = Depends(get_db)):
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    for key, value in payload.model_dump().items():
        setattr(category, key, value)
    db.commit()
    db.refresh(category)
    return category


@router.get("/products", response_model=list[ProductResponse])
def list_products(
    q: str | None = None,
    category: str | None = None,
    minPrice: float | None = None,
    maxPrice: float | None = None,
    sort: str = "featured",
    db: Session = Depends(get_db),
):
    statement = select(Product)
    if q:
        statement = statement.where(Product.name.ilike(f"%{q.strip()}%"))
    if category:
        statement = statement.join(Category).where(Category.slug == category)
    if minPrice is not None:
        statement = statement.where(Product.price >= minPrice)
    if maxPrice is not None:
        statement = statement.where(Product.price <= maxPrice)
    if sort == "price-asc":
        statement = statement.order_by(Product.price.asc())
    elif sort == "price-desc":
        statement = statement.order_by(Product.price.desc())
    elif sort == "rating":
        statement = statement.order_by(Product.rating.desc())
    elif sort == "newest":
        statement = statement.order_by(Product.is_new.desc(), Product.name)
    else:
        statement = statement.order_by(Product.featured.desc(), Product.name)
    return db.scalars(statement).all()


@router.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@router.post(
    "/products",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    if db.get(Category, payload.category_id) is None:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Category not found")
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put(
    "/products/{product_id}",
    response_model=ProductResponse,
    dependencies=[Depends(require_admin)],
)
def update_product(product_id: str, payload: ProductCreate, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    if db.get(Category, payload.category_id) is None:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Category not found")
    for key, value in payload.model_dump().items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete(
    "/products/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def delete_product(product_id: str, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    db.delete(product)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
