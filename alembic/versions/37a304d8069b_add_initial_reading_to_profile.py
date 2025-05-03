"""Add initial_reading to profile

Revision ID: 37a304d8069b
Revises: 
Create Date: 2025-05-01 02:29:32.732247
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '37a304d8069b'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    """Upgrade schema."""
    # Add initial_reading column to profile table
    op.add_column('profile', sa.Column('initial_reading', sa.Integer(), nullable=True))

def downgrade() -> None:
    """Downgrade schema."""
    # Remove initial_reading column
    op.drop_column('profile', 'initial_reading')