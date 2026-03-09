from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import settings

url = settings.database_url
if url.startswith("postgres://"):
    url = url.replace("postgres://", "postgresql://", 1)

engine = create_engine(url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
