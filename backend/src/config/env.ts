import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '..', '..', '.env');
dotenv.config({ path: envPath });

export const env = {
  databaseUrl: process.env.DATABASE_URL || 'postgresql://govuser:govpassword@localhost:5432/govdata',
  geminiApiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '',
  portalTransparenciaApiKey: process.env.PORTAL_TRANSPARENCIA_API_KEY || '',
  apiPort: parseInt(process.env.API_PORT || '8000', 10),
  apiUrl: process.env.API_URL || 'http://localhost:8000',
};

if (!env.geminiApiKey) {
  console.warn('AVISO: GEMINI_API_KEY ou GOOGLE_API_KEY não encontrada no .env');
}
