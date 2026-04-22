import { Phone } from "lucide-react";
import { cn } from "@/lib/cn";
import { CLINIC } from "@/lib/clinic";

type Size = "md" | "lg" | "xl";
type Variant = "primary" | "inverse";

export function PhoneCTA({
  size = "md",
  variant = "primary",
  className,
  pulse = true,
}: {
  size?: Size;
  variant?: Variant;
  className?: string;
  pulse?: boolean;
}) {
  return (
    <a
      href={CLINIC.phone.href}
      className={cn(
        "shine group inline-flex items-center justify-center gap-3 rounded-full font-semibold transition-transform hover:scale-[1.03]",
        pulse && "pulse",
        variant === "primary" && "gradient-brand text-cream shadow-xl shadow-coffee/25",
        variant === "inverse" && "bg-cream text-coffee shadow-2xl shadow-coffee/30",
        size === "md" && "px-7 py-4 text-base",
        size === "lg" && "px-5 py-4 font-display text-xl font-extrabold sm:px-7 sm:text-2xl md:text-3xl",
        size === "xl" && "px-8 py-6 text-xl md:text-2xl font-display font-extrabold",
        className,
      )}
    >
      <Phone className={cn("shrink-0", size === "md" ? "h-4 w-4" : "h-6 w-6")} strokeWidth={2.5} />
      <span className="whitespace-nowrap">{CLINIC.phone.display}</span>
    </a>
  );
}
