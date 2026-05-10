import sys
import os
import requests
from datetime import datetime
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.database.config import SessionLocal, engine
from src.database.models import Base, Licitacao

load_dotenv()

def setup_database():
    print("Sincronizando tabelas com o banco de dados...")
    Base.metadata.create_all(bind=engine)

def extract_and_load_comprasnet():
    print("Iniciando extração de dados REAIS de Licitações...")
    
    # URL da API do Portal da Transparência do Governo Federal
    # Documentação: https://api.portaldatransparencia.gov.br/swagger-ui.html
    url = "https://api.portaldatransparencia.gov.br/api-de-dados/licitacoes"
    
    # Parâmetros de busca (Exemplo: licitações do último mês)
    params = {
        "dataInicial": "01/01/2024",
        "dataFinal": "31/01/2024",
        "pagina": 1
    }
    
    api_key = os.getenv("PORTAL_TRANSPARENCIA_API_KEY")
    
    if not api_key:
        print("AVISO: Chave da API do Portal da Transparência não encontrada no .env!")
        print("Obtenha sua chave em: https://api.portaldatransparencia.gov.br/")
        print("Por favor, adicione 'PORTAL_TRANSPARENCIA_API_KEY=sua_chave' no arquivo .env.")
        print("---")
        print("Tentando API Pública alternativa (PNCP - Portal Nacional de Contratações Públicas)...")
        # Usando a API pública do PNCP como alternativa de dados
        # Exemplo: Consultar compras do STF (CNPJ: 00394460000141) no ano atual
        cnpj_orgao = "00394460000141"
        ano_atual = datetime.now().year
        url_pncp = f"https://pncp.gov.br/api/pncp/v1/orgaos/{cnpj_orgao}/compras/{ano_atual}"
        try:
            response = requests.get(url_pncp, timeout=10)
            response.raise_for_status()
            dados_api = response.json()
            # Adaptação do JSON do PNCP para a lista de licitações
            licitacoes_extraidas = []
            # Limite de 50 registros para exemplo
            for item in dados_api[:50]:
                licitacoes_extraidas.append({
                    "identificador": item.get("numeroControlePNCP"),
                    "uasg": int(item.get("unidadeOrgao", {}).get("codigoUnidade", 0)),
                    "modalidade": item.get("modalidadeId", 0),
                    "numero_aviso": int(item.get("numeroCompra", 0)),
                    "objeto": item.get("objetoCompra", "Sem objeto detalhado"),
                    "data_abertura_proposta": item.get("dataAberturaProposta")
                })
            
            print(f"Sucesso! {len(licitacoes_extraidas)} registros obtidos do PNCP.")
            inserir_no_banco(licitacoes_extraidas)
            return
            
        except Exception as e:
            print(f"Erro ao acessar PNCP: {e}")
            print("Não foi possível obter dados reais. Configure a API do Portal da Transparência.")
            return

    headers = {
        "chave-api-dados": api_key,
        "Accept": "application/json"
    }
    
    try:
        print("Consultando Portal da Transparência...")
        response = requests.get(url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        dados_api = response.json()
        
        licitacoes_extraidas = []
        for item in dados_api:
            licitacoes_extraidas.append({
                "identificador": item.get("licitacao", {}).get("numero", "N/A"),
                "uasg": item.get("unidadeGestora", {}).get("codigo", 0),
                "modalidade": item.get("modalidadeLicitacao", {}).get("codigo", 0),
                "numero_aviso": item.get("licitacao", {}).get("numeroAviso", 0),
                "objeto": item.get("licitacao", {}).get("objeto", "Sem objeto"),
                "data_abertura_proposta": item.get("dataAbertura")
            })
            
        print(f"Foram encontradas {len(licitacoes_extraidas)} licitações. Inserindo no banco de dados...")
        inserir_no_banco(licitacoes_extraidas)
        
    except requests.exceptions.RequestException as e:
        print(f"Erro na requisição da API: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Detalhes: {e.response.text}")

def inserir_no_banco(lista_licitacoes):
    db = SessionLocal()
    novos_registros = 0
    
    try:
        for item in lista_licitacoes:
            identificador = str(item.get('identificador'))
            existe = db.query(Licitacao).filter(Licitacao.identificador == identificador).first()
            
            if not existe:
                data_abertura_str = item.get('data_abertura_proposta')
                if data_abertura_str:
                    # Tentar parsear diferentes formatos ISO
                    try:
                        data_abertura = datetime.fromisoformat(data_abertura_str.replace('Z', '+00:00'))
                    except ValueError:
                        data_abertura = None
                else:
                    data_abertura = None
                
                # Tratamento de segurança para conversão de inteiros
                try:
                    uasg_val = int(item.get('uasg', 0) or 0)
                except ValueError:
                    uasg_val = 0
                
                try:
                    modalidade_val = int(item.get('modalidade', 0) or 0)
                except ValueError:
                    modalidade_val = 0

                try:
                    aviso_val = int(item.get('numero_aviso', 0) or 0)
                except ValueError:
                    aviso_val = 0

                nova_licitacao = Licitacao(
                    identificador=identificador,
                    uasg=uasg_val,
                    modalidade=modalidade_val,
                    numero_aviso=aviso_val,
                    objeto=item.get('objeto'),
                    data_abertura=data_abertura
                )
                
                db.add(nova_licitacao)
                novos_registros += 1
        
        db.commit()
        print(f"Sucesso! {novos_registros} novas licitações cadastradas no banco de dados.")
        
    except Exception as e:
        db.rollback()
        print(f"Erro de transação no banco de dados: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    setup_database()
    extract_and_load_comprasnet()
