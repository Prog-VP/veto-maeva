import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";

type Service = { title: string; description: string };

export function ServicesBlock({
  title,
  intro,
  services,
  variant = "light",
}: {
  title: string;
  intro: React.ReactNode;
  services: readonly Service[];
  variant?: "light" | "dark";
}) {
  const dark = variant === "dark";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[2.5rem] p-8 md:p-12",
        dark ? "gradient-brand text-cream" : "bg-cream-dark/60",
      )}
    >
      {dark && <div className="grain absolute inset-0" aria-hidden />}

      <div className="relative">
        <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight leading-[0.95]">
          {title}
        </h2>

        <p
          className={cn(
            "mt-6 max-w-2xl text-lg leading-relaxed",
            dark ? "text-cream/90" : "text-bark/85",
          )}
        >
          {intro}
        </p>

        <ul className="mt-10 grid gap-3 md:grid-cols-2">
          {services.map((service, i) => (
            <Reveal
              as="li"
              key={service.title}
              delay={i * 50}
              className={cn(
                "relative overflow-hidden rounded-2xl p-6 transition-transform hover:-translate-y-0.5",
                dark
                  ? "bg-cream/10 border border-cream/15 backdrop-blur"
                  : "border border-[color:var(--color-border)] bg-cream",
              )}
            >
              <span
                className={cn(
                  "absolute top-4 right-5 font-display text-4xl font-extrabold tabular-nums",
                  dark ? "text-cream/25" : "text-caramel/20",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3
                className={cn(
                  "font-display text-xl font-extrabold tracking-tight pr-10",
                  dark ? "text-cream" : "text-coffee",
                )}
              >
                {service.title}
              </h3>
              {service.description && (
                <p
                  className={cn(
                    "mt-2 leading-relaxed",
                    dark ? "text-cream/85" : "text-bark/75",
                  )}
                >
                  {service.description}
                </p>
              )}
            </Reveal>
          ))}
        </ul>
      </div>
    </div>
  );
}
