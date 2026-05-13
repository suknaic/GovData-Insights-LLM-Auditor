'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2, Scale, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { analyzeRisk } from '@/lib/api';

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

export default function RiskAnalysisTab() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function getString(value: unknown): string {
    if (value === null || value === undefined) return '';
    return String(value);
  }

  async function handleSubmit() {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await analyzeRisk(text);
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
        Cole a justificativa de uma compra com dispensa de licitação. O modelo avaliará se os
        argumentos legais são robustos ou genéricos (comum em possíveis fraudes).
      </p>
      <Textarea
        placeholder="Cole a justificativa aqui..."
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
          <Scale className="size-4" />
        )}
        {loading ? 'Avaliando argumentos...' : 'Analisar Risco'}
      </Button>
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
              Resultado da Análise
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
                </>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
