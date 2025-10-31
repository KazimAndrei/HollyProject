"""add quotas table"""

from alembic import op
import sqlalchemy as sa


revision = "0002_add_quotas_table"
down_revision = "0001_init"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "quotas",
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("messages_used", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            server_onupdate=sa.text("now()"),
        ),
        sa.PrimaryKeyConstraint("user_id", "date", name="quotas_pkey"),
    )


def downgrade():
    op.drop_table("quotas")
