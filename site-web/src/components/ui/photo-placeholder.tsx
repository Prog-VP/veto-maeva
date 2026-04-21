import { cn } from "@/lib/cn";
import {
  CabinetSilhouette,
  HorseHead,
  Horseshoe,
  PawSimple,
  Portrait,
} from "@/components/ui/silhouettes";

type Kind = "paw" | "horseshoe" | "horse" | "portrait" | "cabinet";

export function PhotoPlaceholder({
  className,
  aspectRatio = "4/5",
  tone = "warm",
  kind = "paw",
}: {
  className?: string;
  aspectRatio?: string;
  tone?: "warm" | "dark" | "light";
  kind?: Kind;
}) {
  const Icon = {
    paw: PawSimple,
    horseshoe: Horseshoe,
    horse: HorseHead,
    portrait: Portrait,
    cabinet: CabinetSilhouette,
  }[kind];

  const iconColor =
    tone === "dark"
      ? "text-cream/20"
      : tone === "light"
        ? "text-coffee/20"
        : "text-cream/35";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[2rem] border border-[color:var(--color-border)]",
        tone === "warm" && "bg-gradient-to-br from-sand via-caramel to-terracotta",
        tone === "dark" && "gradient-brand",
        tone === "light" && "bg-gradient-to-br from-cream-dark to-sand",
        className,
      )}
      style={{ aspectRatio }}
    >
      <div className="grain absolute inset-0" aria-hidden />

      <div className="relative flex h-full w-full items-center justify-center p-8">
        <Icon
          className={cn(
            "w-[55%] h-auto transition-transform duration-700 ease-out group-hover:scale-105 group-hover:rotate-[-2deg]",
            iconColor,
          )}
          aria-hidden
        />
      </div>

      <div
        aria-hidden
        className={cn(
          "absolute top-5 right-5 h-2 w-2 rounded-full",
          tone === "dark" ? "bg-cream/30" : "bg-bark/20",
        )}
      />
      <div
        aria-hidden
        className={cn(
          "absolute bottom-6 left-6 h-1.5 w-1.5 rounded-full",
          tone === "dark" ? "bg-cream/20" : "bg-bark/15",
        )}
      />
    </div>
  );
}
