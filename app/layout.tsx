import type { Metadata } from "next";

import localFont from "next/font/local";

import { PORTAL_ROOT_ID } from "@/lib/constants/dom";

import { ThemeScript } from "./_components/ThemeScript";
import "./globals.css";

const DEFAULT_SITE_URL = "https://201-escape.vercel.app";
const SITE_DESCRIPTION =
  "채용 공고, 지원 현황, 면접 일정을 한곳에서 정리하는 모바일 중심 지원 관리 서비스";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL),
  openGraph: {
    description: SITE_DESCRIPTION,
    locale: "ko_KR",
    siteName: "201 escape",
    title: "201 escape",
    type: "website",
    url: "/",
  },
  title: {
    default: "201 escape",
    template: "%s | 201 escape",
  },
  twitter: {
    card: "summary",
    description: SITE_DESCRIPTION,
    title: "201 escape",
  },
};

const pretendard = localFont({
  display: "swap",
  src: "./_fonts/PretendardVariable.subset.woff2",
  weight: "400 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${pretendard.className} antialiased`}>
        {children}
        <div id={PORTAL_ROOT_ID} />
      </body>
    </html>
  );
}
