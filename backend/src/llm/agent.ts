import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';
import fs from 'fs';

function getApiKey(): string {
  if (!env.geminiApiKey) {
    throw new Error('GEMINI_API_KEY ou GOOGLE_API_KEY não encontrada no .env');
  }
  return env.geminiApiKey;
}

function getModel() {
  const apiKey = getApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

async function generate(prompt: string): Promise<string> {
  const model = getModel();
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// --- 1. Resumo de Editais ---

export async function summarizeEdital(text: string): Promise<string> {
  const prompt = `Você é um assistente especializado em auditoria pública.
Leia o texto do edital de licitação abaixo e forneça um resumo estruturado em tópicos:
- Objeto da Licitação
- Valor Máximo
- Prazo
- Principais Requisitos

Texto do Edital:
${text}`;

  return generate(prompt);
}

// --- 2. Análise de Risco ---

export async function analyzeRisk(justification: string): Promise<Record<string, unknown>> {
  const prompt = `Você é um auditor de contas públicas especializado na legislação brasileira. Analise a seguinte justificativa
para uma dispensa de licitação. Avalie se os argumentos são robustos e legais,
ou se são vagos e genéricos, indicando um possível risco de fraude ou irregularidade.
É FUNDAMENTAL que na sua análise você cite a base legal (como a Lei 14.133/2021 - Nova Lei de Licitações,
ou jurisprudências do TCU) que apoie ou refute os argumentos apresentados.
Retorne EXATAMENTE em formato JSON com duas chaves:
"nivel_risco": "BAIXO", "MEDIO" ou "ALTO"
"analise": "Sua justificativa detalhada, citando expressamente os artigos e leis aplicáveis."

Justificativa:
${justification}`;

  const text = await generate(prompt);
  return parseJSON(text);
}

// --- 3. Extração de Entidades (NER) ---

export async function extractEntities(text: string): Promise<Record<string, unknown>> {
  const prompt = `Você é um extrator de dados focado em compras governamentais.
Extraia as informações de entidades do trecho do diário oficial abaixo.
Retorne EXATAMENTE em formato JSON com a chave "entidades" contendo um array de objetos com as chaves:
"empresa" (nome da empresa contratada),
"cnpj" (CNPJ da empresa contratada),
"valor" (valor do contrato em Reais),
"orgao_contratante" (nome do órgão público contratante).

Texto:
${text}`;

  const raw = await generate(prompt);
  return parseJSON(raw);
}

// --- 4. Auditoria Multimodal de Documentos (PDF/Imagens) ---

interface ArquivoInfo {
  path: string;
  mime_type: string;
}

export async function analisarDocumentoLicitacao(arquivosInfo: ArquivoInfo[]): Promise<Record<string, unknown>> {
  const apiKey = getApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const inlineFiles = [];
  for (const info of arquivosInfo.slice(0, 3)) {
    const data = fs.readFileSync(info.path);
    inlineFiles.push({
      inlineData: {
        data: Buffer.from(data).toString('base64'),
        mimeType: info.mime_type,
      },
    });
  }

  const prompt = `Você é um auditor do TCU. Leia os arquivos em anexo referentes a um edital de licitação e me responda.
É OBRIGATÓRIO que a resposta seja ESTRITAMENTE e UNICAMENTE um arquivo JSON válido usando as chaves exatas abaixo:
{
  "indicios_sobrepreco": "Descreva se há indícios (Sim/Não) e um breve porquê.",
  "nivel_risco": "Responda apenas com uma destas 4 opções exatas: NENHUM, BAIXO, MEDIO ou ALTO",
  "justificativa": "A sua justificativa detalhada para o nível de risco escolhido.",
  "valor_total": "O valor total estimado em Reais. Se não encontrar, escreva 'Não encontrado'."
}`;

  const result = await model.generateContent([prompt, ...inlineFiles]);
  const response = await result.response;
  const text = cleanJSON(response.text());

  try {
    return JSON.parse(text);
  } catch {
    return { erro_parse: 'Não foi possível estruturar o JSON', texto_bruto: text };
  }
}

// --- Helpers ---

function cleanJSON(text: string): string {
  let t = text.trim();
  if (t.startsWith('```json')) t = t.slice(7);
  else if (t.startsWith('```')) t = t.slice(3);
  if (t.endsWith('```')) t = t.slice(0, -3);
  return t.trim();
}

function parseJSON(text: string): Record<string, unknown> {
  const cleaned = cleanJSON(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    return { erro_parse: 'Não foi possível estruturar o JSON', texto_bruto: text };
  }
}
