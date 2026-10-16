"""seed curated fashion catalog

Revision ID: 0003_curated_catalog
Revises: 0002_orders
Create Date: 2026-10-13
"""

from alembic import op
import sqlalchemy as sa

revision = "0003_curated_catalog"
down_revision = "0002_orders"
branch_labels = None
depends_on = None

categories = sa.table(
    "categories",
    sa.column("id", sa.String(length=36)),
    sa.column("name", sa.String(length=120)),
    sa.column("slug", sa.String(length=140)),
    sa.column("image", sa.Text()),
    sa.column("blurb", sa.Text()),
)
products = sa.table(
    "products",
    sa.column("id", sa.String(length=36)),
    sa.column("name", sa.String(length=180)),
    sa.column("slug", sa.String(length=200)),
    sa.column("description", sa.Text()),
    sa.column("price", sa.Numeric(10, 2)),
    sa.column("compare_at_price", sa.Numeric(10, 2)),
    sa.column("category_id", sa.String(length=36)),
    sa.column("stock", sa.Integer()),
    sa.column("image", sa.Text()),
    sa.column("rating", sa.Float()),
    sa.column("review_count", sa.Integer()),
    sa.column("featured", sa.Boolean()),
    sa.column("is_new", sa.Boolean()),
    sa.column("sizes", sa.JSON()),
    sa.column("material", sa.String(length=180)),
)

category_seeds = [
    {
        "id": "a7b62b0c-6d7c-4bb3-a678-1e4ad4d4c001",
        "name": "Women's Fashion",
        "slug": "women",
        "image": "/products/burgundy-lace-sleeve-dress.jpg",
        "blurb": "Dresses and considered everyday layers.",
    },
    {
        "id": "a7b62b0c-6d7c-4bb3-a678-1e4ad4d4c002",
        "name": "Men's Fashion",
        "slug": "men",
        "image": "/products/black-three-piece-suit.jpg",
        "blurb": "Tailored looks and relaxed everyday outfits.",
    },
]

product_seeds = [
    {
        "id": "b81cb9a7-5cc5-4d21-8ae3-0134512f0013",
        "name": "Classic Black Three-Piece Suit",
        "slug": "classic-black-three-piece-suit",
        "description": "A black three-piece suit styled with a crisp white shirt and coordinating tie.",
        "price": 249,
        "category_slug": "men",
        "stock": 10,
        "image": "/products/black-three-piece-suit.jpg",
        "featured": True,
        "is_new": False,
        "sizes": ["S", "M", "L", "XL"],
    },
    {
        "id": "b81cb9a7-5cc5-4d21-8ae3-0134512f0014",
        "name": "Cream Tailored Set",
        "slug": "cream-tailored-set",
        "description": "A cream blazer and matching trousers styled over a white shirt.",
        "price": 189,
        "category_slug": "men",
        "stock": 10,
        "image": "/products/cream-tailored-set.jpg",
        "featured": True,
        "is_new": False,
        "sizes": ["S", "M", "L", "XL"],
    },
    {
        "id": "b81cb9a7-5cc5-4d21-8ae3-0134512f0015",
        "name": "Burgundy Lace-Sleeve Dress",
        "slug": "burgundy-lace-sleeve-dress",
        "description": "A deep burgundy dress with sheer lace sleeves and a softly draped neckline.",
        "price": 89,
        "category_slug": "women",
        "stock": 10,
        "image": "/products/burgundy-lace-sleeve-dress.jpg",
        "featured": True,
        "is_new": False,
        "sizes": ["XS", "S", "M", "L", "XL"],
    },
    {
        "id": "b81cb9a7-5cc5-4d21-8ae3-0134512f0016",
        "name": "Black Floral-Hem Dress",
        "slug": "black-floral-hem-dress",
        "description": "A black sleeveless dress finished with a colorful floral skirt.",
        "price": 79,
        "category_slug": "women",
        "stock": 10,
        "image": "/products/black-floral-hem-dress.jpg",
        "featured": True,
        "is_new": False,
        "sizes": ["XS", "S", "M", "L", "XL"],
    },
    {
        "id": "b81cb9a7-5cc5-4d21-8ae3-0134512f0017",
        "name": "Camel Overshirt & Olive Chino Look",
        "slug": "camel-overshirt-olive-chino-look",
        "description": "A camel overshirt paired with olive trousers and neutral sneakers.",
        "price": 159,
        "category_slug": "men",
        "stock": 10,
        "image": "/products/camel-overshirt-olive-chino.jpg",
        "featured": False,
        "is_new": True,
        "sizes": ["S", "M", "L", "XL"],
    },
    {
        "id": "b81cb9a7-5cc5-4d21-8ae3-0134512f0018",
        "name": "Terracotta Shirt & Sand Chino Look",
        "slug": "terracotta-shirt-sand-chino-look",
        "description": "A terracotta short-sleeve shirt styled with sand trousers and ivory sneakers.",
        "price": 149,
        "category_slug": "men",
        "stock": 10,
        "image": "/products/terracotta-shirt-sand-chino.jpg",
        "featured": False,
        "is_new": True,
        "sizes": ["S", "M", "L", "XL"],
    },
    {
        "id": "b81cb9a7-5cc5-4d21-8ae3-0134512f0019",
        "name": "Navy Jacket & Stone Trouser Look",
        "slug": "navy-jacket-stone-trouser-look",
        "description": "A navy jacket layered over a striped knit with stone-colored trousers.",
        "price": 179,
        "category_slug": "men",
        "stock": 10,
        "image": "/products/navy-jacket-stone-trouser.jpg",
        "featured": False,
        "is_new": True,
        "sizes": ["S", "M", "L", "XL"],
    },
    {
        "id": "b81cb9a7-5cc5-4d21-8ae3-0134512f0020",
        "name": "Contrast Stripe Knit Sweater",
        "slug": "contrast-stripe-knit-sweater",
        "description": "A relaxed knit sweater with broad black and taupe contrast stripes.",
        "price": 69,
        "category_slug": "women",
        "stock": 10,
        "image": "/products/contrast-stripe-knit-sweater.jpg",
        "featured": False,
        "is_new": True,
        "sizes": ["XS", "S", "M", "L", "XL"],
    },
]


def upgrade() -> None:
    connection = op.get_bind()
    category_ids: dict[str, str] = {}

    for category in category_seeds:
        category_id = connection.execute(
            sa.select(categories.c.id).where(categories.c.slug == category["slug"])
        ).scalar_one_or_none()
        if category_id is None:
            connection.execute(sa.insert(categories).values(**category))
            category_id = category["id"]
        category_ids[category["slug"]] = category_id

    for product in product_seeds:
        exists = connection.execute(
            sa.select(products.c.id).where(products.c.slug == product["slug"])
        ).first()
        if exists:
            continue

        values = {
            key: value
            for key, value in product.items()
            if key not in {"category_slug"}
        }
        values.update(
            category_id=category_ids[product["category_slug"]],
            compare_at_price=None,
            rating=0,
            review_count=0,
            material=None,
        )
        connection.execute(sa.insert(products).values(**values))


def downgrade() -> None:
    connection = op.get_bind()
    seeded_product_ids = [product["id"] for product in product_seeds]
    connection.execute(sa.delete(products).where(products.c.id.in_(seeded_product_ids)))

    for category in category_seeds:
        referenced = connection.execute(
            sa.select(products.c.id).where(products.c.category_id == category["id"]).limit(1)
        ).first()
        if not referenced:
            connection.execute(sa.delete(categories).where(categories.c.id == category["id"]))
