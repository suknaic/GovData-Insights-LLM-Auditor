'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-8">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="size-5" />
        <AlertTitle>Algo deu errado</AlertTitle>
        <AlertDescription className="flex flex-col gap-4">
          <p>{error.message || 'Ocorreu um erro inesperado ao carregar esta página.'}</p>
          <Button variant="outline" size="sm" onClick={reset} className="w-fit gap-2">
            <RefreshCw className="size-4" />
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
