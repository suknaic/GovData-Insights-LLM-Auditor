import streamlit as st
import requests
import os

API_URL = os.getenv("API_URL", "http://localhost:8000")

st.set_page_config(
    page_title="GovData Insights",
    page_icon="🏛️",
    layout="wide"
)

st.title("🏛️ GovData Insights & LLM Auditor 🏛️ ")

st.markdown("""
O **GovData Insights** cruza dados de portais públicos e utiliza Inteligência Artificial (LLMs) para facilitar a auditoria cidadã.
Esta interface permite interagir em tempo real com o motor LLM integrado à API para processar **dados reais**.
""")

def renderizar_analise_risco(dados):
    if not isinstance(dados, dict):
        st.warning("O modelo não retornou dados estruturados. Veja a resposta bruta:")
        st.write(dados)
        return
        
    # Busca a chave de risco em diferentes variações dependendo da aba/prompt
    risco = str(dados.get("nivel_risco", dados.get("risco", dados.get("Nível de Risco de Corrupção", "DESCONHECIDO")))).upper()
    
    cor = "gray"
    icone = "❓"
    
    #cores da IA

    if "ALTO" in risco:
        cor = "#FF4B4B"
        icone = "🚨"
    elif "MÉDIO" in risco or "MEDIO" in risco:
        cor = "#FF8C00"
        icone = "⚠️"
    elif "BAIXO" in risco:
        cor = "#FACA2B"
        icone = "🟡"
    elif "NENHUM" in risco or "INEXISTENTE" in risco:
        cor = "#00C851"
        icone = "✅"
    
    st.markdown(f"<h3 style='margin-bottom: 5px;'>{icone} Classificação de Risco: <span style='color:{cor}; font-weight:bold;'>{risco}</span></h3>", unsafe_allow_html=True)
    
    # Exibir Justificativa
    justificativa = dados.get("justificativa", dados.get("analise", dados.get("Justificativa", "")))
    if justificativa:
        st.info(f"**Parecer do Auditor IA:**\n\n{justificativa}")
        
    # Exibir Valor Total se existir
    valor = dados.get("valor_total", dados.get("valor total estimado", dados.get("Valor", "")))
    if valor:
        st.markdown(f"**💰 Valor Estimado Identificado:** {valor}")
        
    # Exibir Sobrepreço se existir
    sobrepreco = dados.get("sobrepreco", dados.get("indicios_sobrepreco", dados.get("indícios de sobrepreço", dados.get("Existem indícios de sobrepreço?", ""))))
    if str(sobrepreco).strip() and str(sobrepreco).strip().lower() not in ["none", "null", "false", "não", "nao", ""]:
        st.warning(f"**📈 Atenção a Indícios de Sobrepreço:** {sobrepreco}")



tab1, tab2, tab3, tab4 = st.tabs(["📄 Resumo de Editais", "⚠️ Análise de Risco", "🔍 Extração de Entidades (NER)", "📎 Auditoria de PDFs/Imagens"])

with tab1:
    st.header("Resumo Estruturado de Editais")
    st.markdown("Cole o texto de um edital ou licitação para que a IA extraia o Objeto, Valor Máximo, Prazo e Requisitos de forma limpa.")
    
    edital_text = st.text_area("Texto do Edital:", height=200, key="edital")
    if st.button("Gerar Resumo"):
        if edital_text:
            with st.spinner("Analisando com Gemini..."):
                try:
                    res = requests.post(f"{API_URL}/api/analyze/edital", json={"text": edital_text})
                    if res.status_code == 200:
                        st.success("Resumo gerado com sucesso!")
                        st.markdown(res.json().get("summary"))
                    else:
                        st.error(f"Erro na API: {res.text}")
                except Exception as e:
                    st.error(f"Falha de conexão com a API: {e}")
        else:
            st.warning("Por favor, insira o texto do edital.")

with tab2:
    st.header("Análise de Risco e Sentimento")
    st.markdown("Cole a justificativa de uma compra com dispensa de licitação. O modelo avaliará se os argumentos legais são robustos ou genéricos (comum em possíveis fraudes).")
    
    just_text = st.text_area("Texto da Justificativa:", height=200, key="justificativa")
    if st.button("Analisar Risco"):
        if just_text:
            with st.spinner("Avaliando argumentos..."):
                try:
                    res = requests.post(f"{API_URL}/api/analyze/risk", json={"text": just_text})
                    if res.status_code == 200:
                        data = res.json()
                        renderizar_analise_risco(data)
                    else:
                        st.error(f"Erro na API: {res.text}")
                except Exception as e:
                    st.error(f"Falha de conexão com a API: {e}")
        else:
            st.warning("Por favor, insira o texto da justificativa.")

with tab3:
    st.header("Extração de Entidades em Diários Oficiais")
    st.markdown("Cole trechos complexos e não estruturados de Diários Oficiais para extrair os dados diretamente para tabelas (Nome da Empresa, CNPJ, Órgão, Valor).")
    
    do_text = st.text_area("Trecho do Diário Oficial:", height=200, key="do")
    if st.button("Extrair Dados (NER)"):
        if do_text:
            with st.spinner("Extraindo entidades com Structured Output..."):
                try:
                    res = requests.post(f"{API_URL}/api/analyze/entities", json={"text": do_text})
                    if res.status_code == 200:
                        entidades = res.json().get("entidades", [])
                        if entidades:
                            st.success(f"Foram encontradas {len(entidades)} entidades no texto.")
                            st.table(entidades)
                        else:
                            st.warning("Nenhuma entidade governamental encontrada no texto fornecido.")
                    else:
                        st.error(f"Erro na API: {res.text}")
                except Exception as e:
                    st.error(f"Falha de conexão com a API: {e}")
        else:
            st.warning("Por favor, insira o texto do diário oficial.")

with tab4:
    st.header("Auditoria Direta de Documentos")
    st.markdown("Anexe um Edital, Nota Fiscal ou Contrato (PDF ou Imagens). A Inteligência Artificial irá ler o arquivo e classificar possíveis riscos de sobrepreço.")
    
    arquivos_upload = st.file_uploader("Anexe até 3 Editais/Anexos (PDF, PNG ou JPG)", type=["pdf", "png", "jpg"], accept_multiple_files=True)
    if st.button("Auditar Anexo(s)"):
        if arquivos_upload and len(arquivos_upload) > 0:
            if len(arquivos_upload) > 3:
                st.warning("Por favor, envie no máximo 3 arquivos por vez.")
            else:
                with st.spinner("Lendo documento(s) e analisando risco (Gemini Multimodal)..."):
                    try:
                        # Monta a lista de arquivos para enviar no requests.post
                        # O nome do campo deve ser 'files', que é o nome do parâmetro na API FastAPI
                        arquivos_para_enviar = [
                            ("files", (arq.name, arq.getvalue(), arq.type)) for arq in arquivos_upload
                        ]
                        res = requests.post(f"{API_URL}/api/analyze/document", files=arquivos_para_enviar)
                        
                        if res.status_code == 200:
                            st.success("Análise concluída!")
                            # Renderiza o visual amigável invés de JSON bruto
                            renderizar_analise_risco(res.json().get("analysis"))
                        else:
                            st.error(f"Erro na API: {res.text}")
                    except Exception as e:
                        st.error(f"Falha de conexão com a API: {e}")
        else:
            st.warning("Por favor, anexe ao menos um arquivo antes de auditar.")
