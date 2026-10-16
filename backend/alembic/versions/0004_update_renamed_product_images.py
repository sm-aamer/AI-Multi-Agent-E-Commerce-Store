"""update paths for renamed product images

Revision ID: 0004_renamed_product_images
Revises: 0003_curated_catalog
Create Date: 2026-10-13
"""

from alembic import op
import sqlalchemy as sa

revision = "0004_renamed_product_images"
down_revision = "0003_curated_catalog"
branch_labels = None
depends_on = None

products = sa.table(
    "products",
    sa.column("slug", sa.String(length=200)),
    sa.column("image", sa.Text()),
)


def upgrade() -> None:
    connection = op.get_bind()
    image_paths = {
        "camel-overshirt-olive-chino-look": "/products/camel-overshirt-olive-chino.jpg",
        "terracotta-shirt-sand-chino-look": "/products/terracotta-shirt-sand-chino.jpg",
        "navy-jacket-stone-trouser-look": "/products/navy-jacket-stone-trouser.jpg",
    }
    for slug, image in image_paths.items():
        connection.execute(
            sa.update(products).where(products.c.slug == slug).values(image=image)
        )


def downgrade() -> None:
    connection = op.get_bind()
    image_paths = {
        "camel-overshirt-olive-chino-look": "/products/camel-overshirt-olive-chino-look.jpg",
        "terracotta-shirt-sand-chino-look": "/products/terracotta-shirt-sand-chino-look.jpg",
        "navy-jacket-stone-trouser-look": "/products/navy-jacket-stone-trouser-look.jpg",
    }
    for slug, image in image_paths.items():
        connection.execute(
            sa.update(products).where(products.c.slug == slug).values(image=image)
        )
