import { PublicHeader } from "../_components/PublicHeader";
import { LoginActions } from "./_components/LoginActions";

const PRIVACY_PAGE_HREF = "/privacy";
const WEBVIEW_QUERY_VALUE = "1";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const shouldShowWebViewNotice =
    getFirstSearchParam(resolvedSearchParams?.webview) === WEBVIEW_QUERY_VALUE;

  return (
    <div className="flex h-dvh flex-col bg-muted/30">
      <PublicHeader />
      <div className="flex flex-1 flex-col items-center justify-center px-5 pb-20">
        <div className="w-full max-w-sm rounded-[32px] border border-border/50 bg-background p-10 shadow-xl shadow-black/[0.03]">
          <header className="mb-10 text-center">
            <span className="text-[11px] font-bold tracking-[0.2em] text-primary uppercase">
              Welcome
            </span>
            <h1 className="mt-3 text-[32px] font-bold tracking-tight text-foreground">
              로그인
            </h1>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              201 escape에 오신 것을 환영합니다.
            </p>
          </header>

          <div className="space-y-4">
            <LoginActions shouldShowWebViewNotice={shouldShowWebViewNotice} />

            <div className="flex justify-center px-1">
              <p className="inline-flex flex-wrap items-center justify-center gap-x-1 text-center text-sm leading-5 font-medium text-muted-foreground">
                <span>계속 진행하면</span>
                <a
                  className="font-semibold text-primary underline underline-offset-4"
                  href={PRIVACY_PAGE_HREF}
                >
                  개인정보처리방침
                </a>
                <span>에 동의한 것으로 간주됩니다.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getFirstSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}
