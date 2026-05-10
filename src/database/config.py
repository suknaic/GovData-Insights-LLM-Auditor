import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Obtém a URL de conexão do Docker ou define um fallback local para testes com SQLite
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite:///./govdata.db"
)

# engine de conexão (com parâmetro extra se for SQLite)
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)

# fábrica de sessões (usada para transações com o banco)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Dependência para fornecer a sessão do DB para a API do FastAPI"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
