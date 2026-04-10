import { getStatCounts } from "@/lib/actions";

export async function StatCardsContent() {
  const result = await getStatCounts();

  if (!result.ok) {
    throw new Error(result.reason);
  }

  const { docs, interviewing, offered, total } = result.data;

  const cards = [
    { label: "전체", value: total },
    { label: "서류", value: docs },
    { label: "면접", value: interviewing },
    { label: "합격", value: offered },
  ];

  return (
    <section className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((card) => (
        <div
          className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-border/50 bg-background p-5 shadow-sm"
          key={card.label}
        >
          <span className="text-2xl font-black tracking-tight text-foreground">
            {card.value}
          </span>
          <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
            {card.label}
          </span>
        </div>
      ))}
    </section>
  );
}
