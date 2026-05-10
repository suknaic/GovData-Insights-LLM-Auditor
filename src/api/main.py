from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from src.llm_engine.agent import summarize_edital, analyze_risk, extract_entities

app = FastAPI(
    title="GovData Insights API",
    description="API para análise de dados governamentais com suporte de LLM",
    version="0.1.0",
)

class TextRequest(BaseModel):
    text: str

@app.get("/")
def read_root():
    return {"status": "ok", "message": "GovData Insights API is running."}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/api/analyze/edital")
def api_summarize_edital(request: TextRequest):
    try:
        summary = summarize_edital(request.text)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze/risk")
def api_analyze_risk(request: TextRequest):
    try:
        analysis = analyze_risk(request.text)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze/entities")
def api_extract_entities(request: TextRequest):
    try:
        entities = extract_entities(request.text)
        return entities
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import UploadFile, File
import shutil
import os

from typing import List

@app.post("/api/analyze/document")
async def api_analyze_document(files: List[UploadFile] = File(...)):
    from src.llm_engine.agent import analisar_documento_licitacao
    try:
        temp_dir = "temp_uploads"
        os.makedirs(temp_dir, exist_ok=True)
        
        arquivos_info = []
        # Limite de 3 arquivos
        for file in files[:3]:
            file_path = os.path.join(temp_dir, file.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            arquivos_info.append({"path": file_path, "mime_type": file.content_type})
            
        analysis = analisar_documento_licitacao(arquivos_info)
        return {"analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
