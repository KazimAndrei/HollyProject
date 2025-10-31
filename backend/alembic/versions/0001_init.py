from alembic import op
import sqlalchemy as sa
revision = '0001_init'
down_revision = None
branch_labels = None
depends_on = None
def upgrade():
    op.execute("CREATE EXTENSION IF NOT EXISTS vector;")
    op.create_table('users',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('apple_user_id', sa.String(), nullable=True),
        sa.Column('locale', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'))
    )
    op.create_table('subscriptions',
        sa.Column('user_id', sa.String(), sa.ForeignKey('users.id'), primary_key=True),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('product_id', sa.String(), nullable=True),
        sa.Column('original_tx_id', sa.String(), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'))
    )
    op.create_table('conversations',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('user_id', sa.String(), sa.ForeignKey('users.id')),
        sa.Column('title', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'))
    )
    op.create_table('messages',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('conversation_id', sa.String(), sa.ForeignKey('conversations.id')),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('tokens', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'))
    )
    op.create_table('verses',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('translation', sa.String(), nullable=False),
        sa.Column('book', sa.Integer(), nullable=False),
        sa.Column('chapter', sa.Integer(), nullable=False),
        sa.Column('verse', sa.Integer(), nullable=False),
        sa.Column('text', sa.Text(), nullable=False),
    )
    op.create_index('idx_verses_ref', 'verses', ['translation','book','chapter','verse'])
    op.execute("""        ALTER TABLE verses ADD COLUMN text_tsv tsvector;
        UPDATE verses SET text_tsv = to_tsvector('english', text);
        CREATE INDEX verses_tsv_idx ON verses USING GIN (text_tsv);
    """)
    op.create_table('verse_embeddings',
        sa.Column('verse_id', sa.Integer(), sa.ForeignKey('verses.id'), primary_key=True),
        sa.Column('embedding', sa.dialects.postgresql.ARRAY(sa.Float()), nullable=True)
    )
    op.execute("""        ALTER TABLE verse_embeddings ALTER COLUMN embedding TYPE vector(1536);
        CREATE INDEX verse_embed_hnsw ON verse_embeddings USING hnsw (embedding vector_l2_ops);
    """)
def downgrade():
    op.execute("DROP INDEX IF EXISTS verse_embed_hnsw;")
    op.drop_table('verse_embeddings')
    op.execute("DROP INDEX IF EXISTS verses_tsv_idx;")
    op.drop_table('verses')
    op.drop_table('messages')
    op.drop_table('conversations')
    op.drop_table('subscriptions')
    op.drop_table('users')
