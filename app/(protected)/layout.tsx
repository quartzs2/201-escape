import { BottomTabBar } from "./_components/BottomTabBar";
import { Header } from "./_components/Header";
import { WindowScrollTopFAB } from "./_components/WindowScrollTopFAB";
import { ProtectedProviders } from "./ProtectedProviders";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="pt-16 pb-16 md:pb-0">{children}</div>
      <BottomTabBar />
      <WindowScrollTopFAB />
      <ProtectedProviders />
    </>
  );
}
