import { PublicHeader } from "../_components/PublicHeader";
import { LoginActions } from "./_components/LoginActions";

const WEBVIEW_QUERY_VALUE = "1";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const shouldShowWebViewNotice =
    getFirstSearchParam(resolvedSearchParams?.webview) === WEBVIEW_QUERY_VALUE;

  return (
    <div className="flex h-dvh flex-col bg-background">
      <PublicHeader />
      <div className="flex flex-1 flex-col items-center justify-center px-5 pb-20">
        <div className="w-full max-w-sm">
          <header className="mb-10 text-center">
            <h1 className="text-[32px] font-bold tracking-tight text-foreground">
              로그인
            </h1>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              201 escape에 오신 것을 환영합니다.
            </p>
          </header>

          <div className="space-y-4">
            <LoginActions shouldShowWebViewNotice={shouldShowWebViewNotice} />
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
