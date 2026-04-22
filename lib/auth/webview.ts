const KNOWN_IN_APP_BROWSER_PATTERNS = [
  /FBAN|FBAV|FB_IAB/i,
  /Instagram/i,
  /KAKAOTALK/i,
  /Line\//i,
  /NAVER/i,
  /Twitter/i,
];

export function isAndroidUserAgent(userAgent: string): boolean {
  return /Android/i.test(userAgent);
}

export function isLikelyWebViewUserAgent(userAgent: string): boolean {
  if (!userAgent) {
    return false;
  }

  return (
    isAndroidWebViewUserAgent(userAgent) ||
    isIosWebViewUserAgent(userAgent) ||
    isKnownInAppBrowserUserAgent(userAgent)
  );
}

function isAndroidWebViewUserAgent(userAgent: string): boolean {
  return isAndroidUserAgent(userAgent) && /\bwv\b/i.test(userAgent);
}

function isIosWebViewUserAgent(userAgent: string): boolean {
  const isIos = /iPhone|iPad|iPod/i.test(userAgent);
  const hasAppleWebKit = /AppleWebKit/i.test(userAgent);
  const hasMobile = /Mobile/i.test(userAgent);
  const hasSafari = /Safari/i.test(userAgent);
  const isStandaloneBrowser = /CriOS|EdgiOS|FxiOS/i.test(userAgent);

  return (
    isIos && hasAppleWebKit && hasMobile && !hasSafari && !isStandaloneBrowser
  );
}

function isKnownInAppBrowserUserAgent(userAgent: string): boolean {
  return KNOWN_IN_APP_BROWSER_PATTERNS.some((pattern) => {
    return pattern.test(userAgent);
  });
}
