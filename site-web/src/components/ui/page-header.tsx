import { Container } from "@/components/ui/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Eyebrow } from "@/components/ui/eyebrow";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { cn } from "@/lib/cn";

type BreadcrumbItem = { label: string; href: string };

export function PageHeader({
  eyebrow,
  title,
  intro,
  breadcrumbs,
  jsonLdName,
  beforeTitle,
  children,
  variant = "light",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  jsonLdName?: string;
  beforeTitle?: React.ReactNode;
  children?: React.ReactNode;
  variant?: "light" | "dark";
}) {
  const dark = variant === "dark";

  return (
    <>
      {jsonLdName && breadcrumbs && breadcrumbs.length > 0 && (
        <BreadcrumbJsonLd
          items={[{ name: jsonLdName, url: breadcrumbs[breadcrumbs.length - 1].href }]}
        />
      )}

      <section
        className={cn(
          "relative overflow-hidden",
          dark
            ? "pt-16 pb-24 md:pt-24 md:pb-32 text-cream"
            : "pt-12 pb-16 md:pt-20 md:pb-24",
        )}
      >
        {dark ? (
          <>
            <div className="absolute inset-0 gradient-brand" aria-hidden />
            <div className="grain absolute inset-0" aria-hidden />
          </>
        ) : (
          <div
            aria-hidden
            className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-terracotta/30 via-caramel/20 to-transparent blur-3xl"
          />
        )}

        <Container className="relative">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumb items={breadcrumbs} variant={variant} className="mb-8" />
          )}

          {eyebrow && <Eyebrow className={dark ? "text-cream" : undefined}>{eyebrow}</Eyebrow>}

          {beforeTitle}

          <h1
            className={cn(
              "max-w-full overflow-wrap-anywhere font-display font-extrabold text-balance",
              Boolean(eyebrow || beforeTitle) && "mt-4",
              dark
                ? "text-6xl md:text-[8rem] leading-[0.88] tracking-[-0.035em]"
                : "text-5xl sm:text-6xl md:text-8xl leading-[0.95] tracking-normal md:leading-[0.9] md:tracking-[-0.03em]",
            )}
          >
            {title}
          </h1>

          {intro && (
            <p
              className={cn(
                "mt-8 max-w-2xl font-serif text-2xl italic text-pretty leading-snug",
                dark ? "text-cream/85" : "text-bark/75",
              )}
            >
              {intro}
            </p>
          )}

          {children && <div className="relative">{children}</div>}
        </Container>
      </section>
    </>
  );
}
