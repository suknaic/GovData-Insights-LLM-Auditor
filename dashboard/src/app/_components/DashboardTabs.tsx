'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, AlertTriangle, Search, Paperclip } from 'lucide-react';
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
                {tab.id === 'edital' ? 'Editais' :
                 tab.id === 'risk' ? 'Risco' :
                 tab.id === 'ner' ? 'NER' : 'Docs'}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
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
    <Suspense
      fallback={
        <div className="flex flex-col gap-6">
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      }
    >
      <TabsContentInner />
    </Suspense>
  );
}
