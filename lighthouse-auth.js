// Supabase signInWithPassword를 직접 호출해 세션 쿠키를 주입합니다.
// @supabase/ssr은 세션을 localStorage가 아닌 쿠키에 저장하기 때문에
// setCookie로 주입해야 서버 컴포넌트에서 인증 상태를 읽을 수 있습니다.

/**
 * @param {import('puppeteer').Browser} browser
 * @param {{ url: string }} context
 */
module.exports = async (browser, context) => {
  const targetUrl = new URL(context.url);
  const publicPaths = new Set(["/", "/login"]);

  // 공개 페이지는 비인증 상태로 측정합니다.
  if (publicPaths.has(targetUrl.pathname)) {
    return;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const testEmail = process.env.LHCI_TEST_EMAIL;
  const testPassword = process.env.LHCI_TEST_PASSWORD;

  if (!supabaseUrl || !publishableKey || !testEmail || !testPassword) {
    throw new Error("Lighthouse 인증에 필요한 환경변수가 누락되었습니다.");
  }

  const projectRef = new URL(supabaseUrl).hostname.split(".")[0];

  const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
    }),
    headers: {
      apikey: publishableKey,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!res.ok) {
    throw new Error(`Supabase 인증 요청 실패: ${res.status}`);
  }

  const session = await res.json();

  if (!session.access_token) {
    throw new Error(`Supabase 로그인 실패: ${JSON.stringify(session)}`);
  }

  const page = await browser.newPage();

  await page.setCookie({
    httpOnly: true,
    name: `sb-${projectRef}-auth-token`,
    path: "/",
    secure: targetUrl.protocol === "https:",
    url: targetUrl.origin,
    value: JSON.stringify({
      access_token: session.access_token,
      expires_at: session.expires_at,
      expires_in: session.expires_in,
      refresh_token: session.refresh_token,
      token_type: session.token_type,
      user: session.user,
    }),
  });

  await page.close();
};
