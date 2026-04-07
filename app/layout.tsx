import type { Metadata } from "next";

import localFont from "next/font/local";
import { Toaster } from "sonner";

import { PORTAL_ROOT_ID } from "@/lib/constants/dom";

import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  description: "모바일 제스처와 데이터 시각화를 활용한 통합 채용 관리 대시보드",
  title: "201 escape",
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
    <html lang="ko">
      <body className={`${pretendard.className} antialiased`}>
        <Providers>
          {children}
          <div id={PORTAL_ROOT_ID} />
          <Toaster position="bottom-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
