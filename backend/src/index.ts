import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { routes } from './api/routes.js';
import { env } from './config/env.js';

const app = Fastify({ logger: true });

async function start() {
  await app.register(cors, { origin: '*' });
  await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });
  await app.register(routes);

  try {
    await app.listen({ port: env.apiPort, host: '0.0.0.0' });
    console.log(`🚀 GovData Insights API rodando em http://localhost:${env.apiPort}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
