'use client';

import { useState, useRef } from 'react';
import { Upload, Loader2, AlertTriangle, DollarSign, TrendingUp, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { analyzeDocument } from '@/lib/api';

function RiskBadgeInline({ nivel_risco }: { nivel_risco?: string }) {
  if (!nivel_risco) return null;
  const upper = nivel_risco.toUpperCase();
  const variant =
    upper.includes('ALTO') ? 'destructive' :
    upper.includes('MÉDIO') || upper.includes('MEDIO') ? 'secondary' :
    upper.includes('BAIXO') ? 'outline' :
    upper.includes('NENHUM') || upper.includes('INEXISTENTE') ? 'ghost' :
    'outline';
  const label =
    upper.includes('ALTO') ? 'ALTO' :
    upper.includes('MÉDIO') || upper.includes('MEDIO') ? 'MÉDIO' :
    upper.includes('BAIXO') ? 'BAIXO' :
    upper.includes('NENHUM') || upper.includes('INEXISTENTE') ? 'NENHUM' :
    'DESCONHECIDO';
  return (
    <Badge variant={variant} className="px-3 py-1 text-xs font-semibold">
      {label}
    </Badge>
  );
}

export default function DocumentAuditTab() {
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function getString(value: unknown): string {
    if (value === null || value === undefined) return '';
    return String(value);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    setFiles(selected.slice(0, 3));
    setResult(null);
    setError('');
  }

  async function handleSubmit() {
    if (files.length === 0) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await analyzeDocument(files);
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Anexe um Edital, Nota Fiscal ou Contrato (PDF ou Imagens). A IA irá ler o arquivo e
        classificar riscos.
      </p>

      <div className="flex flex-col gap-3 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-6 transition-colors hover:border-primary/30">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileChange}
          className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:text-primary-foreground file:shadow-sm file:transition-all hover:file:opacity-90"
        />
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg bg-background px-3 py-1.5 text-xs shadow-sm"
              >
                <File className="size-3.5 text-primary" />
                {f.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSubmit}
          disabled={loading || files.length === 0 || files.length > 3}
          className="w-fit gap-2 bg-gradient-to-r from-primary to-[oklch(0.55_0.18_265)] shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          {loading ? 'Lendo documento(s) e analisando risco...' : 'Auditar Anexo(s)'}
        </Button>
        {files.length > 3 && (
          <p className="text-sm text-destructive">Envie no máximo 3 arquivos por vez.</p>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="border-primary/10 shadow-lg shadow-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-primary" />
              Resultado da Auditoria
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Classificação de Risco:</span>
              <RiskBadgeInline nivel_risco={getString(result.nivel_risco ?? result.risco)} />
            </div>
            {(() => {
              const justificativa = getString(result.justificativa ?? result.analise);
              const valorTotal = getString(result.valor_total);
              const sobrepreco = getString(result.indicios_sobrepreco ?? result.sobrepreco);
              return (
                <>
                  {justificativa && (
                    <>
                      <Separator />
                      <div>
                        <p className="mb-1.5 text-sm font-medium">Parecer do Auditor IA:</p>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                          {justificativa}
                        </p>
                      </div>
                    </>
                  )}
                  {valorTotal && (
                    <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-sm">
                      <DollarSign className="size-4 text-primary" />
                      <strong>Valor Estimado Identificado:</strong>{' '}
                      <span className="text-primary">{valorTotal}</span>
                    </div>
                  )}
                  {sobrepreco && (
                    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      <TrendingUp className="size-4" />
                      <strong>Indícios de Sobrepreço:</strong> {sobrepreco}
                    </div>
                  )}
                </>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
