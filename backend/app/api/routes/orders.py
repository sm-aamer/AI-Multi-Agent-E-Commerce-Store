from datetime import timezone
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, status
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, require_admin
from app.core.config import get_settings
from app.db.database import get_db
from app.models.catalog import Product
from app.models.order import Order
from app.models.user import User
from app.schemas.order import OrderCreate, OrderResponse, OrderUpdate

router = APIRouter(tags=["orders"])


def optional_customer_id(
    authorization: Annotated[str | None, Header()] = None,
    db: Session = Depends(get_db),
) -> str | None:
    if authorization is None:
        return None
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token")
    try:
        user_id = jwt.decode(
            token,
            get_settings().secret_key,
            algorithms=[get_settings().jwt_algorithm],
        ).get("sub")
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token") from exc
    if not user_id or db.get(User, user_id) is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token")
    return user_id


def to_response(order: Order) -> OrderResponse:
    created_at = order.created_at
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    return OrderResponse(
        id=order.id,
        customer_id=order.customer_id,
        customer_name=order.customer_name,
        email=order.email,
        phone=order.phone,
        address=order.address,
        items=order.items,
        subtotal=float(order.subtotal),
        shipping=float(order.shipping),
        total=float(order.total),
        status=order.status,
        payment_method=order.payment_method,
        payment_status=order.payment_status,
        bank_reference=order.bank_reference,
        fraud_score=float(order.fraud_score),
        created_at=created_at.date().isoformat(),
    )


@router.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    customer_id: str | None = Depends(optional_customer_id),
):
    product_ids = {item.product_id for item in payload.items}
    products = {
        product.id: product
        for product in db.scalars(
            select(Product).where(Product.id.in_(product_ids)).with_for_update()
        ).all()
    }
    if len(products) != len(product_ids):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="One or more products are unavailable")

    item_rows = []
    subtotal = Decimal("0")
    requested: dict[str, int] = {}
    for item in payload.items:
        product = products[item.product_id]
        if item.size and product.sizes and item.size not in product.sizes:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"Invalid size for {product.name}")
        requested[product.id] = requested.get(product.id, 0) + item.quantity
        item_total = Decimal(str(product.price)) * item.quantity
        subtotal += item_total
        item_rows.append(
            {
                "productId": product.id,
                "name": product.name,
                "price": float(product.price),
                "quantity": item.quantity,
                **({"size": item.size} if item.size else {}),
            }
        )
    for product_id, quantity in requested.items():
        product = products[product_id]
        if product.stock < quantity:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Insufficient stock for {product.name}",
            )

    shipping = Decimal("0") if subtotal == 0 or subtotal >= Decimal("250") else Decimal("10")
    for product_id, quantity in requested.items():
        products[product_id].stock -= quantity
    order = Order(
        customer_id=customer_id or "guest",
        customer_name=payload.customer_name.strip(),
        email=str(payload.email).lower(),
        phone=payload.phone.strip(),
        address=payload.address.model_dump(by_alias=True),
        items=item_rows,
        subtotal=subtotal,
        shipping=shipping,
        total=subtotal + shipping,
        payment_method=payload.payment_method,
        payment_status="awaiting_verification" if payload.payment_method == "bank_transfer" else "unpaid",
        bank_reference=payload.bank_reference,
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return to_response(order)


@router.get("/orders/me", response_model=list[OrderResponse])
def list_my_orders(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    orders = db.scalars(
        select(Order).where(Order.customer_id == user.id).order_by(Order.created_at.desc())
    ).all()
    return [to_response(order) for order in orders]


@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_order(order_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.customer_id != user.id and user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This order does not belong to you")
    return to_response(order)


@router.get("/admin/orders", response_model=list[OrderResponse], dependencies=[Depends(require_admin)])
def list_all_orders(db: Session = Depends(get_db)):
    orders = db.scalars(select(Order).order_by(Order.created_at.desc())).all()
    return [to_response(order) for order in orders]


@router.patch("/admin/orders/{order_id}", response_model=OrderResponse, dependencies=[Depends(require_admin)])
def update_order(order_id: str, payload: OrderUpdate, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(order, key, value)
    db.commit()
    db.refresh(order)
    return to_response(order)
