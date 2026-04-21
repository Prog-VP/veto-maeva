import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";

export function PageHeader({
  eyebrow,
  title,
  intro,
  breadcrumbs,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  breadcrumbs?: { label: string; href: string }[];
}) {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
      <div
        aria-hidden
        className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-terracotta/30 via-caramel/20 to-transparent blur-3xl"
      />
      <Container>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Fil d'Ariane" className="mb-8">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-bark/60">
              <li>
                <Link href="/" className="hover:text-coffee">Accueil</Link>
              </li>
              {breadcrumbs.map((crumb, i) => (
                <li key={crumb.href} className="flex items-center gap-1">
                  <ChevronRight className="h-3.5 w-3.5" />
                  {i === breadcrumbs.length - 1 ? (
                    <span className="text-coffee font-medium">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="hover:text-coffee">
                      {crumb.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.22em] text-terracotta font-bold">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-4 max-w-full overflow-wrap-anywhere font-display text-5xl font-extrabold leading-[0.95] tracking-normal text-balance sm:text-6xl md:text-8xl md:leading-[0.9] md:tracking-[-0.03em]">
          {title}
        </h1>
        {intro && (
          <p className="mt-8 max-w-2xl font-serif text-2xl italic text-bark/75 text-pretty leading-snug">
            {intro}
          </p>
        )}
      </Container>
    </section>
  );
}
