"""create order storage

Revision ID: 0002_orders
Revises: 0001_core_tables
Create Date: 2026-10-13
"""

from alembic import op
import sqlalchemy as sa

revision = "0002_orders"
down_revision = "0001_core_tables"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "orders",
        sa.Column("id", sa.String(length=40), nullable=False),
        sa.Column("customer_id", sa.String(length=36), nullable=False),
        sa.Column("customer_name", sa.String(length=120), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("phone", sa.String(length=30), nullable=False),
        sa.Column("address", sa.JSON(), nullable=False),
        sa.Column("items", sa.JSON(), nullable=False),
        sa.Column("subtotal", sa.Numeric(10, 2), nullable=False),
        sa.Column("shipping", sa.Numeric(10, 2), nullable=False),
        sa.Column("total", sa.Numeric(10, 2), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="pending"),
        sa.Column("payment_method", sa.String(length=20), nullable=False),
        sa.Column("payment_status", sa.String(length=30), nullable=False),
        sa.Column("bank_reference", sa.String(length=80), nullable=True),
        sa.Column("fraud_score", sa.Numeric(4, 3), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_orders_customer_id", "orders", ["customer_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_orders_customer_id", table_name="orders")
    op.drop_table("orders")
