import 'dotenv/config';
import axios from 'axios';
import { db } from '../db/connection.js';
import { licitacoes } from '../db/schema.js';
import { env } from '../config/env.js';
import { eq } from 'drizzle-orm';

interface LicitacaoItem {
  identificador: string;
  uasg: number;
  modalidade: number;
  numero_aviso: number;
  objeto: string;
  data_abertura_proposta?: string;
}

async function inserirNoBanco(lista: LicitacaoItem[]): Promise<void> {
  let novosRegistros = 0;

  for (const item of lista) {
    const existe = await db
      .select()
      .from(licitacoes)
      .where(eq(licitacoes.identificador, item.identificador))
      .limit(1);

    if (existe.length === 0) {
      const dataAbertura = item.data_abertura_proposta
        ? new Date(item.data_abertura_proposta.replace('Z', '+00:00'))
        : null;

      await db.insert(licitacoes).values({
        identificador: item.identificador,
        uasg: item.uasg,
        modalidade: item.modalidade,
        numeroAviso: item.numero_aviso,
        objeto: item.objeto,
        dataAbertura: dataAbertura,
      });
      novosRegistros++;
    }
  }

  console.log(`Sucesso! ${novosRegistros} novas licitações cadastradas no banco de dados.`);
}

async function extractAndLoadComprasnet(): Promise<void> {
  console.log('Iniciando extração de dados REAIS de Licitações...');

  const apiKey = env.portalTransparenciaApiKey;

  if (!apiKey) {
    console.log('AVISO: Chave da API do Portal da Transparência não encontrada no .env!');
    console.log('---');
    console.log('Tentando API Pública alternativa (PNCP - Portal Nacional de Contratações Públicas)...');

    const cnpjOrgao = '00394460000141';
    const anoAtual = new Date().getFullYear();
    const urlPncp = `https://pncp.gov.br/api/pncp/v1/orgaos/${cnpjOrgao}/compras/${anoAtual}`;

    try {
      const response = await axios.get(urlPncp, { timeout: 10000 });
      const dadosApi = response.data as any[];

      const licitacoesExtraidas: LicitacaoItem[] = dadosApi.slice(0, 50).map((item: any) => ({
        identificador: item.numeroControlePNCP ?? `pncp-${Date.now()}-${Math.random()}`,
        uasg: parseInt(item.unidadeOrgao?.codigoUnidade ?? '0', 10),
        modalidade: item.modalidadeId ?? 0,
        numero_aviso: parseInt(item.numeroCompra ?? '0', 10),
        objeto: item.objetoCompra ?? 'Sem objeto detalhado',
        data_abertura_proposta: item.dataAberturaProposta,
      }));

      console.log(`Sucesso! ${licitacoesExtraidas.length} registros obtidos do PNCP.`);
      await inserirNoBanco(licitacoesExtraidas);
      return;
    } catch (err) {
      console.error(`Erro ao acessar PNCP: ${err}`);
      console.log('Não foi possível obter dados reais. Configure a API do Portal da Transparência.');
      return;
    }
  }

  const url = 'https://api.portaldatransparencia.gov.br/api-de-dados/licitacoes';
  const params = {
    dataInicial: '01/01/2024',
    dataFinal: '31/01/2024',
    pagina: 1,
  };
  const headers = {
    'chave-api-dados': apiKey,
    Accept: 'application/json',
  };

  try {
    console.log('Consultando Portal da Transparência...');
    const response = await axios.get(url, { params, headers, timeout: 10000 });
    const dadosApi = response.data as any[];

    const licitacoesExtraidas: LicitacaoItem[] = dadosApi.map((item: any) => ({
      identificador: item.licitacao?.numero ?? 'N/A',
      uasg: parseInt(item.unidadeGestora?.codigo ?? '0', 10),
      modalidade: item.modalidadeLicitacao?.codigo ?? 0,
      numero_aviso: item.licitacao?.numeroAviso ?? 0,
      objeto: item.licitacao?.objeto ?? 'Sem objeto',
      data_abertura_proposta: item.dataAbertura,
    }));

    console.log(`Foram encontradas ${licitacoesExtraidas.length} licitações. Inserindo no banco de dados...`);
    await inserirNoBanco(licitacoesExtraidas);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error(`Erro na requisição da API: ${err.message}`);
      if (err.response) {
        console.error(`Detalhes: ${err.response.data}`);
      }
    } else {
      console.error(`Erro: ${err}`);
    }
  }
}

extractAndLoadComprasnet().catch(console.error);
