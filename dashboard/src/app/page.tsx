import { Landmark, BarChart3 } from 'lucide-react';
import DashboardTabs from './_components/DashboardTabs';
import ThemeToggle from './_components/ThemeToggle';

export default function Home() {
  return (
    <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-4 py-6 sm:px-6 sm:py-10">
      <header className="animate-fade-in sticky top-4 z-50 flex items-center justify-between rounded-2xl border bg-background/60 px-5 py-4 backdrop-blur-xl sm:px-8">
        <div className="flex flex-col gap-1">
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
      </header>

      <div className="animate-fade-in-up">
        <DashboardTabs />
      </div>
    </div>
  );
}
