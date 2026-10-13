import { PageShell } from "@/components/layout/page-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <PageShell>
      <section className="page-x pt-6 lg:pt-12" aria-hidden>
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="mt-5 h-11 w-28 rounded-full" />
      </section>
    </PageShell>
  );
}
