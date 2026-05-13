import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-96" />
          <Skeleton className="h-5 w-[600px]" />
        </div>
        <Skeleton className="size-10 rounded-md" />
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-44 rounded-md" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>
    </main>
  );
}
