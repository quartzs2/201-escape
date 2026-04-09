export const dynamic = "force-dynamic";

import { BottomTabBar } from "./_components/BottomTabBar";
import { Header } from "./_components/Header";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="pb-16 md:pb-0">{children}</main>
      <BottomTabBar />
    </>
  );
}
