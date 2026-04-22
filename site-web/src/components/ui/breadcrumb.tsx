import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "light" | "dark";

export function Breadcrumb({
  items,
  variant = "light",
  className,
}: {
  items: { label: string; href: string }[];
  variant?: Variant;
  className?: string;
}) {
  if (!items.length) return null;

  const dark = variant === "dark";
  const linkCls = dark ? "hover:text-cream" : "hover:text-coffee";
  const currentCls = dark ? "text-cream font-medium" : "text-coffee font-medium";

  return (
    <nav
      aria-label="Fil d'Ariane"
      className={cn("text-sm", dark ? "text-cream/70" : "text-bark/60", className)}
    >
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link href="/" className={linkCls}>Accueil</Link>
        </li>
        {items.map((crumb, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={crumb.href} className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5" />
              {isLast ? (
                <span className={currentCls}>{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className={linkCls}>{crumb.label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
