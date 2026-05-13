'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, AlertTriangle, Search, Paperclip } from 'lucide-react';
import { BarChart3 } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import EditalSummaryTab from '@/components/EditalSummaryTab';
import RiskAnalysisTab from '@/components/RiskAnalysisTab';
import EntityExtractionTab from '@/components/EntityExtractionTab';
import DocumentAuditTab from '@/components/DocumentAuditTab';
import { Skeleton } from '@/components/ui/skeleton';

const TAB_ITEMS = [
  { id: 'edital', label: 'Resumo de Editais', icon: FileText, component: EditalSummaryTab },
  { id: 'risk', label: 'Análise de Risco', icon: AlertTriangle, component: RiskAnalysisTab },
  { id: 'ner', label: 'Extração de Entidades (NER)', icon: Search, component: EntityExtractionTab },
  { id: 'document', label: 'Auditoria de PDFs/Imagens', icon: Paperclip, component: DocumentAuditTab },
] as const;

function TabsContentInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get('tab') || 'edital';

  function handleTabChange(value: string) {
    router.replace(`?tab=${value}`, { scroll: false });
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-col">
      <div className="animate-fade-in sticky top-4 z-50 rounded-2xl border bg-background/60 backdrop-blur-xl">
        <div className="flex flex-wrap items-start justify-between gap-6 px-5 py-4 sm:px-8">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[oklch(0.55_0.18_265)] shadow-lg shadow-primary/25">
                <BarChart3 className="size-5 text-primary-foreground" />
              </div>
              <h1 className="text-gradient text-xl font-bold tracking-tight sm:text-2xl">
                GovData Insights
              </h1>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              O <strong>GovData Insights</strong> cruza dados de portais públicos e utiliza IA para
              facilitar a auditoria cidadã. Interaja em tempo real com o motor LLM para processar{' '}
              <strong>dados reais</strong>.
            </p>
          </div>
          <ThemeToggle />
        </div>
        <div className="border-t px-5 py-3 sm:px-8">
          <TabsList className="w-full gap-1.5 overflow-x-auto p-1.5">
            {TAB_ITEMS.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="gap-2 px-4 py-1.5"
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">
                    {tab.id === 'edital'
                      ? 'Editais'
                      : tab.id === 'risk'
                      ? 'Risco'
                      : tab.id === 'ner'
                      ? 'NER'
                      : 'Docs'}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
      </div>
      {TAB_ITEMS.map((tab) => {
        const Component = tab.component;
        return (
          <TabsContent key={tab.id} value={tab.id} className="mt-6 w-full">
            <div className="animate-fade-in">
              <Component />
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

export default function DashboardTabs() {
  return (
    <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-4 py-6 sm:px-6 sm:py-10">
      <Suspense
        fallback={
          <div className="flex flex-col gap-6">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        }
      >
        <TabsContentInner />
      </Suspense>
    </div>
  );
}
