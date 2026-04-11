import { TooltipProvider } from "@/components/ui/tooltip/Tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>;
}
