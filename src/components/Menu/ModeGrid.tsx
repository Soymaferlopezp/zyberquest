import ModeCard from "./ModeCard";
import type { ModeCardProps } from "./ModeCard";
import { MODES } from "@/lib/modes";

type ModeGridProps = {
  onActivate?: (href: string) => void;
  cardProps?: Partial<Pick<ModeCardProps, "className" | "ctaLabel" | "hint">>;
};

export default function ModeGrid({ onActivate, cardProps }: ModeGridProps) {
  const baseHint = cardProps?.hint ?? "Tab/Shift+Tab • Enter • 1/2/3";

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {MODES.map((m, i) => (
        <ModeCard
          key={m.id}
          title={m.title}
          desc={m.desc}
          href={m.href}
          accent={m.accent}
          className={cardProps?.className ?? "min-h-[162px]"}
          ctaLabel={cardProps?.ctaLabel ?? "Entrar"}
          hint={`${baseHint} • ${i + 1} → ${m.title}`}
          onActivate={onActivate ? () => onActivate(m.href) : undefined}
        />
      ))}
    </div>
  );
}
