import { ApplicationsProviders } from "./ApplicationsProviders";

export default function ApplicationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ApplicationsProviders>{children}</ApplicationsProviders>;
}
