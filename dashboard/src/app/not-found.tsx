import { Home, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-8">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="mb-4 flex justify-center">
            <SearchX className="size-12 text-muted-foreground" />
          </div>
          <CardTitle>Página não encontrada</CardTitle>
          <CardDescription>
            A página que você procura não existe ou foi movida.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button render={<Link href="/" />} nativeButton={false} className="gap-2">
            <Home className="size-4" />
            Voltar ao início
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
