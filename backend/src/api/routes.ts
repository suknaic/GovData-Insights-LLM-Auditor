import { FastifyInstance } from 'fastify';
import { summarizeEdital, analyzeRisk, extractEntities, analisarDocumentoLicitacao } from '../llm/agent.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from 'stream/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_DIR = path.resolve(__dirname, '..', '..', '..', '..', 'temp_uploads');

interface TextBody {
  text: string;
}

export async function routes(app: FastifyInstance): Promise<void> {
  app.get('/', async () => ({
    status: 'ok',
    message: 'GovData Insights API is running.',
  }));

  app.get('/health', async () => ({ status: 'healthy' }));

  app.post<{ Body: TextBody }>('/api/analyze/edital', async (request, reply) => {
    try {
      const summary = await summarizeEdital(request.body.text);
      return { summary };
    } catch (err) {
      reply.status(500).send({ detail: (err as Error).message });
    }
  });

  app.post<{ Body: TextBody }>('/api/analyze/risk', async (request, reply) => {
    try {
      const analysis = await analyzeRisk(request.body.text);
      return analysis;
    } catch (err) {
      reply.status(500).send({ detail: (err as Error).message });
    }
  });

  app.post<{ Body: TextBody }>('/api/analyze/entities', async (request, reply) => {
    try {
      const entities = await extractEntities(request.body.text);
      return entities;
    } catch (err) {
      reply.status(500).send({ detail: (err as Error).message });
    }
  });

  app.post('/api/analyze/document', async (request, reply) => {
    try {
      fs.mkdirSync(TEMP_DIR, { recursive: true });

      const arquivosInfo: { path: string; mime_type: string }[] = [];

      if (request.files) {
        for await (const file of request.files()) {
          const filePath = path.join(TEMP_DIR, file.filename);
          const writeStream = fs.createWriteStream(filePath);
          await pipeline(file.file, writeStream);
          arquivosInfo.push({ path: filePath, mime_type: file.mimetype });

          if (arquivosInfo.length >= 3) break;
        }
      }

      if (arquivosInfo.length === 0) {
        return reply.status(400).send({ detail: 'Nenhum arquivo enviado.' });
      }

      const analysis = await analisarDocumentoLicitacao(arquivosInfo);
      return { analysis };
    } catch (err) {
      reply.status(500).send({ detail: (err as Error).message });
    }
  });
}
