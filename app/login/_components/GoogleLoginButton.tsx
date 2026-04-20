import GoogleIcon from "@/assets/google.svg";
import { Button } from "@/components/ui/button/Button";

export function GoogleLoginButton() {
  return (
    <Button
      asChild
      className="h-auto w-full gap-3 rounded-2xl border-border/60 bg-background px-4 py-4 text-[15px] font-bold text-foreground hover:border-primary/20 hover:bg-muted/30 active:scale-[0.98] disabled:opacity-60"
      variant="outline"
    >
      <a href="/auth/login/google">
        <GoogleIcon aria-hidden="true" className="h-5 w-5" />
        <span>Google로 계속하기</span>
      </a>
    </Button>
  );
}
