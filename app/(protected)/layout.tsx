import { Header } from "./_components/Header";
import { ProtectedEnhancements } from "./ProtectedProviders";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="pt-16 pb-16 md:pb-0">{children}</div>
      <ProtectedEnhancements />
    </>
  );
}
