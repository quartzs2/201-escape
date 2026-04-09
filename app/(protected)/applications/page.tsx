import { ApplicationsView } from "./_components/ApplicationsView";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await searchParams;
  return <ApplicationsView searchParams={resolvedParams} />;
}
