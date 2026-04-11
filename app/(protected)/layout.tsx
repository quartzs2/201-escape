import { BottomTabBar } from "./_components/BottomTabBar";
import { Header } from "./_components/Header";
import { ProtectedProviders } from "./ProtectedProviders";

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
      <ProtectedProviders />
    </>
  );
}
