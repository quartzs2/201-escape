import type { Metadata } from "next";

import "./globals.css";
import localFont from "next/font/local";

export const metadata: Metadata = {
  description: "모바일 제스처와 데이터 시각화를 활용한 통합 채용 관리 대시보드",
  title: "201 escape",
};

const pretendard = localFont({
  display: "swap",
  src: "./_fonts/PretendardVariable.woff2",
  weight: "45 920",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${pretendard.className} antialiased`}>{children}</body>
    </html>
  );
}
