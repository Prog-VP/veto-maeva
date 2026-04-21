import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export function PhotoPlaceholder({
  label,
  className,
  aspectRatio = "4/5",
  tone = "warm",
}: {
  label?: string;
  className?: string;
  aspectRatio?: string;
  tone?: "warm" | "dark" | "light";
}) {
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
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full backdrop-blur-sm",
              tone === "dark" ? "bg-cream/10 text-cream" : "bg-bark/10 text-bark",
            )}
          >
            <ImageIcon className="h-7 w-7" strokeWidth={1.5} />
          </div>
          {label && (
            <p
              className={cn(
                "font-serif italic text-sm",
                tone === "dark" ? "text-cream/70" : "text-bark/60",
              )}
            >
              {label}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
