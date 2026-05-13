import { pgTable, serial, varchar, integer, text, timestamp } from 'drizzle-orm/pg-core';

export const licitacoes = pgTable('licitacoes', {
  id: serial('id').primaryKey(),
  identificador: varchar('identificador').notNull().unique(),
  uasg: integer('uasg'),
  modalidade: integer('modalidade'),
  numeroAviso: integer('numero_aviso'),
  objeto: text('objeto'),
  dataAbertura: timestamp('data_abertura'),
  valorTotal: varchar('valor_total'),
  nivelRiscoCorrupcao: varchar('nivel_risco_corrupcao'),
  justificativaRisco: text('justificativa_risco'),
  estadoOrigem: varchar('estado_origem'),
});

export type Licitacao = typeof licitacoes.$inferSelect;
export type NewLicitacao = typeof licitacoes.$inferInsert;
