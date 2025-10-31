from sqlalchemy.orm import declarative_base, Mapped, mapped_column
from sqlalchemy import Integer, String, Text, ForeignKey, DateTime, Date, func
from pgvector.sqlalchemy import Vector

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    apple_user_id: Mapped[str | None] = mapped_column(String, nullable=True)
    locale: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())

class Subscription(Base):
    __tablename__ = "subscriptions"
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), primary_key=True)
    status: Mapped[str] = mapped_column(String)
    product_id: Mapped[str | None] = mapped_column(String, nullable=True)
    original_tx_id: Mapped[str | None] = mapped_column(String, nullable=True)
    expires_at: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Quota(Base):
    __tablename__ = "quotas"
    user_id: Mapped[str] = mapped_column(String, primary_key=True)
    date: Mapped[str] = mapped_column(Date, primary_key=True)
    messages_used: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Conversation(Base):
    __tablename__ = "conversations"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    title: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())

class Message(Base):
    __tablename__ = "messages"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    conversation_id: Mapped[str] = mapped_column(String, ForeignKey("conversations.id"))
    role: Mapped[str] = mapped_column(String)
    content: Mapped[str] = mapped_column(Text)
    tokens: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())

class Verse(Base):
    __tablename__ = "verses"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    translation: Mapped[str] = mapped_column(String, index=True)
    book: Mapped[int] = mapped_column(Integer, index=True)
    chapter: Mapped[int] = mapped_column(Integer, index=True)
    verse: Mapped[int] = mapped_column(Integer, index=True)
    text: Mapped[str] = mapped_column(Text)

class VerseEmbedding(Base):
    __tablename__ = "verse_embeddings"
    verse_id: Mapped[int] = mapped_column(Integer, ForeignKey("verses.id"), primary_key=True)
    embedding = mapped_column(Vector(1536), nullable=False)
