import os
import google.generativeai as genai
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from typing import List
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser

# variáveis de ambiente do .env
load_dotenv()


def configurar_genai():
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError(
            "A chave GEMINI_API_KEY ou GOOGLE_API_KEY não foi encontrada no arquivo .env!")
    genai.configure(api_key=api_key)


def analisar_documento_licitacao(arquivos_info):
    """
    arquivos_info deve ser uma lista de dicts: [{"path": caminho, "mime_type": tipo}, ...]
    """
    configurar_genai()

    documentos_enviados = []

    # Limite de até 3 arquivos
    for info in arquivos_info[:3]: 
        doc = genai.upload_file(info["path"], mime_type=info["mime_type"])
        documentos_enviados.append(doc)

    prompt = """
    Você é um auditor do TCU. Leia os arquivos em anexo referentes a um edital de licitação e me responda.
    É OBRIGATÓRIO que a resposta seja ESTRITAMENTE e UNICAMENTE um arquivo JSON válido usando as chaves exatas abaixo:
    {
      "indicios_sobrepreco": "Descreva se há indícios (Sim/Não) e um breve porquê.",
      "nivel_risco": "Responda apenas com uma destas 4 opções exatas: NENHUM, BAIXO, MEDIO ou ALTO",
      "justificativa": "A sua justificativa detalhada para o nível de risco escolhido.",
      "valor_total": "O valor total estimado em Reais. Se não encontrar, escreva 'Não encontrado'."
    }
    """

    conteudo_prompt = documentos_enviados + [prompt]

    # versão do gemini
    modelo = genai.GenerativeModel('gemini-2.5-flash')
    resposta = modelo.generate_content(conteudo_prompt)
    
    texto = resposta.text.strip()
    if texto.startswith("```json"):
        texto = texto[7:]
    if texto.startswith("```"):
        texto = texto[3:]
    if texto.endswith("```"):
        texto = texto[:-3]
        
    import json
    try:
        resultado_json = json.loads(texto.strip())
        return resultado_json
    except json.JSONDecodeError:
        # Fallback caso o modelo não retorne JSON puro
        return {"erro_parse": "Não foi possível estruturar o JSON", "texto_bruto": resposta.text}


# Inicializa o modelo Gemini
# Usa a chave GEMINI_API_KEY ou GOOGLE_API_KEY do .env
def get_llm(temperature=0.2):
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError(
            "A chave GEMINI_API_KEY não foi encontrada no arquivo .env!")
    return ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=temperature, google_api_key=api_key)

# --- 1. Resumo de Editais ---


def summarize_edital(text: str) -> str:
    llm = get_llm()
    prompt = PromptTemplate.from_template(
        "Você é um assistente especializado em auditoria pública. "
        "Leia o texto do edital de licitação abaixo e forneça um resumo estruturado em tópicos: \n"
        "- Objeto da Licitação\n"
        "- Valor Máximo\n"
        "- Prazo\n"
        "- Principais Requisitos\n\n"
        "Texto do Edital:\n{text}"
    )
    chain = prompt | llm | StrOutputParser()
    return chain.invoke({"text": text})

# --- 2. Análise de Risco / Sentimento ---


def analyze_risk(justification: str) -> dict:
    llm = get_llm(temperature=0.1)
    prompt = PromptTemplate.from_template(
        "Você é um auditor de contas públicas especializado na legislação brasileira. Analise a seguinte justificativa "
        "para uma dispensa de licitação. Avalie se os argumentos são robustos e legais, "
        "ou se são vagos e genéricos, indicando um possível risco de fraude ou irregularidade. "
        "É FUNDAMENTAL que na sua análise você cite a base legal (como a Lei 14.133/2021 - Nova Lei de Licitações, "
        "ou jurisprudências do TCU) que apoie ou refute os argumentos apresentados. "
        "Retorne EXATAMENTE em formato JSON com duas chaves:\n"
        "\"nivel_risco\": \"BAIXO\", \"MEDIO\" ou \"ALTO\"\n"
        "\"analise\": \"Sua justificativa detalhada, citando expressamente os artigos e leis aplicáveis.\"\n\n"
        "Justificativa:\n{justification}"
    )
    chain = prompt | llm | JsonOutputParser()
    return chain.invoke({"justification": justification})

# --- 3. Extração de Entidades (NER) ---


class EntityExtractor(BaseModel):
    empresa: str = Field(description="Nome da empresa contratada")
    cnpj: str = Field(description="CNPJ da empresa contratada")
    valor: str = Field(description="Valor do contrato ou licitação (em Reais)")
    orgao_contratante: str = Field(
        description="Nome do órgão público contratante")


class Entities(BaseModel):
    entidades: List[EntityExtractor]


def extract_entities(text: str) -> dict:
    llm = get_llm()
    structured_llm = llm.with_structured_output(Entities)
    prompt = PromptTemplate.from_template(
        "Você é um extrator de dados focado em compras governamentais. "
        "Extraia as informações de entidades do trecho do diário oficial abaixo.\n"
        "Texto:\n{text}"
    )
    chain = prompt | structured_llm
    result = chain.invoke({"text": text})
    return result.model_dump()
