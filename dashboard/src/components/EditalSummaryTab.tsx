'use client';

import { useState } from 'react';
import { FileText, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { summarizeEdital } from '@/lib/api';

export default function EditalSummaryTab() {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    setSummary('');
    try {
      const result = await summarizeEdital(text);
      setSummary(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Cole o texto de um edital ou licitação para que a IA extraia o Objeto, Valor Máximo, Prazo e
        Requisitos.
      </p>
      <Textarea
        placeholder="Cole o texto do edital aqui..."
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
          <Sparkles className="size-4" />
        )}
        {loading ? 'Analisando com Gemini...' : 'Gerar Resumo'}
      </Button>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {summary && (
        <Card className="border-primary/10 shadow-lg shadow-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="size-4 text-primary" />
              Resumo
            </CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-sm leading-relaxed">
            {summary}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
