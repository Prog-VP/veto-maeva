import Link from "next/link";
import { ArrowUpRight, Phone } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { Reveal } from "@/components/ui/reveal";
import { CLINIC, NAV } from "@/lib/clinic";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Sections />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-10 pb-24 md:pt-20 md:pb-32">
      <div
        aria-hidden
        className="absolute -top-40 -right-40 h-[560px] w-[560px] rounded-full bg-gradient-to-br from-terracotta/40 via-caramel/30 to-transparent blur-3xl"
      />
      <div
        aria-hidden
        className="absolute top-60 -left-40 h-[420px] w-[420px] rounded-full bg-gradient-to-tr from-coffee/30 via-walnut/20 to-transparent blur-3xl"
      />

      <Container size="wide">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8 items-end">
          <div className="lg:col-span-7">
            <h1 className="font-display text-[clamp(3rem,9vw,7.5rem)] font-extrabold leading-[0.88] tracking-[-0.035em] text-balance">
              Bienvenue au cabinet{" "}
              <span className="gradient-text">Vully Vétérinaire</span>.
            </h1>

            <p className="mt-8 max-w-xl font-serif text-2xl italic text-bark/80 text-pretty leading-snug">
              {CLINIC.tagline}.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href={CLINIC.phone.href}
                className="pulse shine group inline-flex items-center gap-2.5 rounded-full gradient-brand px-7 py-4 text-base font-semibold text-cream shadow-xl shadow-coffee/25 transition-transform hover:scale-[1.03]"
              >
                <Phone className="h-4 w-4" strokeWidth={2.5} />
                {CLINIC.phone.display}
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative">
              <PhotoPlaceholder
                aspectRatio="4/5"
                tone="warm"
                kind="horse"
                className="rotate-[2deg]"
              />
              <div className="absolute -bottom-8 -left-8 hidden md:block">
                <PhotoPlaceholder
                  aspectRatio="1/1"
                  tone="dark"
                  kind="paw"
                  className="w-40 -rotate-[4deg]"
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Sections() {
  const items = NAV.filter((item) => item.href !== "/");
  return (
    <section className="py-16 md:py-24">
      <Container>
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <Reveal as="li" key={item.href} delay={i * 80}>
              <Link
                href={item.href}
                className="group flex h-full items-start justify-between gap-4 rounded-3xl border border-[color:var(--color-border)] bg-cream p-8 transition-transform hover:-translate-y-1 hover:shadow-xl hover:shadow-coffee/5"
              >
                <span className="font-display text-3xl font-extrabold tracking-tight text-coffee leading-[1.05]">
                  {item.label}
                </span>
                <ArrowUpRight className="h-6 w-6 shrink-0 text-terracotta transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
