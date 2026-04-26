import { Skeleton } from "@/components/ui/skeleton/Skeleton";

const TAB_SKELETON_KEYS = [0, 1, 2] as const;
const ROW_SKELETON_KEYS = [0, 1, 2, 3, 4] as const;

export function ApplicationsPanelFallback() {
  return (
    <div className="flex h-[32rem] min-h-0 flex-col sm:h-[36rem] lg:h-[40rem]">
      <div className="border-b border-border/70 bg-background px-5 sm:px-6">
        <div className="flex h-auto items-end gap-5 rounded-none bg-transparent p-0">
          {TAB_SKELETON_KEYS.map((key) => (
            <div className="flex items-center gap-1.5 px-1 pb-3" key={key}>
              <Skeleton className={key === 1 ? "h-5 w-10" : "h-5 w-8"} />
              <Skeleton className="h-4 w-5 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 px-4 sm:px-5">
        <div className="h-full overflow-hidden pt-2 pb-10 lg:pr-4">
          {ROW_SKELETON_KEYS.map((index) => (
            <ApplicationRowFallback key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ApplicationRowFallback() {
  return (
    <div className="border-b border-border/70">
      <div className="flex min-h-[110px] w-full items-start justify-between gap-4 px-1 py-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <div className="flex flex-col">
            <Skeleton className="mt-0.5 h-4.5 w-24" />
            <Skeleton className="mt-1 h-6 w-40" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-12" />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-1">
          <Skeleton className="hidden h-5 w-12 sm:block" />
          <Skeleton className="size-4" />
        </div>
      </div>
    </div>
  );
}
