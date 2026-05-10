from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.orm import declarative_base

# Classe base para criar os modelos
Base = declarative_base()

class Licitacao(Base):
    """
    Modelo de Tabela que representa uma Licitação extraída do Portal de Compras.
    """
    __tablename__ = "licitacoes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    identificador = Column(String, unique=True, index=True, nullable=False)
    uasg = Column(Integer, nullable=True)
    modalidade = Column(Integer, nullable=True)
    numero_aviso = Column(Integer, nullable=True)
    objeto = Column(Text, nullable=True)
    data_abertura = Column(DateTime, nullable=True)
    
    # --- Novos campos para Dashboard (Looker) gerados pelo LLM ---
    # Pode ser convertido para Float depois, mas String captura a saída bruta
    valor_total = Column(String, nullable=True) 
     # "ALTO", "MEDIO", "BAIXO"
    nivel_risco_corrupcao = Column(String, nullable=True)
    justificativa_risco = Column(Text, nullable=True)
    # UF (ex: "SP", "RJ") para integração dashboard como Looker
    estado_origem = Column(String, nullable=True) 
    
    def __repr__(self):
        return f"<Licitacao(identificador='{self.identificador}', uasg={self.uasg})>"
