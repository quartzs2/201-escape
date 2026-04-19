import { Skeleton } from "@/components/ui/skeleton/Skeleton";

const TAB_SKELETON_KEYS = [0, 1, 2] as const;
const ROW_SKELETON_KEYS = [0, 1, 2, 3, 4] as const;

export function ApplicationsPanelFallback() {
  return (
    <div className="flex flex-col">
      <div className="border-b border-border/70 bg-background px-5 sm:px-6">
        <div className="flex items-end gap-5 py-3">
          {TAB_SKELETON_KEYS.map((key) => (
            <Skeleton
              className={
                key === 1 ? "h-6 w-20 rounded-full" : "h-6 w-16 rounded-full"
              }
              key={key}
            />
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-5">
        <div className="h-[32rem] min-h-0 space-y-3 overflow-hidden pt-4 sm:h-[36rem] lg:h-[40rem]">
          {ROW_SKELETON_KEYS.map((index) => (
            <div
              className="rounded-2xl border border-border/60 px-4 py-4"
              key={index}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <div className="space-y-2">
                    <Skeleton className="h-4.5 w-24" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <Skeleton className="mt-1 h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
