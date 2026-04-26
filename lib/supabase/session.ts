import "server-only";
import { cookies } from "next/headers";

const AUTH_COOKIE_SUFFIX = "-auth-token";
const BASE64_PREFIX = "base64-";

type SupabaseSessionCookie = {
  access_token?: unknown;
};

export async function getSupabaseAccessTokenFromCookie() {
  const cookieStore = await cookies();
  const authCookieName = getSupabaseAuthCookieName();
  const cookieValue = combineCookieChunks(
    authCookieName,
    cookieStore.getAll().map(({ name, value }) => ({ name, value })),
  );

  if (!cookieValue) {
    return null;
  }

  const decodedCookieValue = decodeSupabaseCookieValue(cookieValue);

  if (!decodedCookieValue) {
    return null;
  }

  try {
    const session = JSON.parse(decodedCookieValue) as SupabaseSessionCookie;

    if (typeof session.access_token !== "string") {
      return null;
    }

    return session.access_token;
  } catch {
    return null;
  }
}

function combineCookieChunks(
  cookieName: string,
  cookiesToRead: { name: string; value: string }[],
) {
  const unchunkedCookie = cookiesToRead.find(({ name }) => name === cookieName);

  if (unchunkedCookie?.value) {
    return unchunkedCookie.value;
  }

  const chunks: string[] = [];

  for (let index = 0; ; index++) {
    const chunkName = `${cookieName}.${index}`;
    const chunk = cookiesToRead.find(({ name }) => name === chunkName);

    if (!chunk?.value) {
      break;
    }

    chunks.push(chunk.value);
  }

  if (chunks.length === 0) {
    return null;
  }

  return chunks.join("");
}

function decodeBase64Url(value: string) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const paddedBase64 = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );

  return Buffer.from(paddedBase64, "base64").toString("utf8");
}

function decodeSupabaseCookieValue(value: string) {
  if (!value.startsWith(BASE64_PREFIX)) {
    return value;
  }

  try {
    return decodeBase64Url(value.slice(BASE64_PREFIX.length));
  } catch {
    return null;
  }
}

function getSupabaseAuthCookieName() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required.");
  }

  const projectRef = new URL(supabaseUrl).hostname.split(".")[0];

  return `sb-${projectRef}${AUTH_COOKIE_SUFFIX}`;
}
