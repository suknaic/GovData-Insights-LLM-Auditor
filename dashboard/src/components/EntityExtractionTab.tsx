'use client';

import { useState } from 'react';
import { Search, Loader2, Building2, Table as TableIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { extractEntities } from '@/lib/api';

interface Entity {
  empresa: string;
  cnpj: string;
  valor: string;
  orgao_contratante: string;
}

export default function EntityExtractionTab() {
  const [text, setText] = useState('');
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    setEntities([]);
    try {
      const data = await extractEntities(text);
      const list = (data.entidades as Entity[]) || [];
      setEntities(list);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Cole trechos de Diários Oficiais para extrair dados estruturados (Empresa, CNPJ, Órgão,
        Valor).
      </p>
      <Textarea
        placeholder="Cole o trecho do Diário Oficial aqui..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-48 resize-y transition-shadow focus-visible:shadow-lg"
      />
      <Button
        onClick={handleSubmit}
        disabled={loading || !text.trim()}
        className="w-fit gap-2 bg-gradient-to-r from-primary to-[oklch(0.55_0.18_265)] shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Search className="size-4" />
        )}
        {loading ? 'Extraindo entidades...' : 'Extrair Dados (NER)'}
      </Button>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {entities.length > 0 && (
        <div>
          <p className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="size-4 text-primary" />
            Foram encontradas <strong className="text-foreground">{entities.length}</strong> entidade(s)
            no texto.
          </p>
          <div className="overflow-hidden rounded-xl border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-medium">Empresa</TableHead>
                  <TableHead className="font-medium">CNPJ</TableHead>
                  <TableHead className="font-medium">Valor</TableHead>
                  <TableHead className="font-medium">Órgão Contratante</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entities.map((e, i) => (
                  <TableRow key={i} className="transition-colors hover:bg-muted/30">
                    <TableCell className="font-medium">{e.empresa}</TableCell>
                    <TableCell className="font-mono text-xs">{e.cnpj}</TableCell>
                    <TableCell>{e.valor}</TableCell>
                    <TableCell className="text-muted-foreground">{e.orgao_contratante}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
      {entities.length === 0 && !loading && !error && text && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <TableIcon className="size-4" />
          Nenhuma entidade encontrada no texto fornecido.
        </p>
      )}
    </div>
  );
}
