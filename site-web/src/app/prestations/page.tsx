import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { SERVICES_HORSES, SERVICES_PETS } from "@/lib/clinic";

export const metadata: Metadata = {
  title: "Prestations",
  description:
    "Prestations vétérinaires pour chevaux (à domicile) et petits animaux (au cabinet) au Vully : vaccinations, médecine interne, chirurgie, dentisterie, acupuncture.",
  alternates: { canonical: "/prestations" },
  openGraph: {
    title: "Prestations",
    url: "/prestations",
  },
};

export default function PrestationsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Prestations", url: "/prestations" }]} />

      <PageHeader
        title="Prestations"
        breadcrumbs={[{ label: "Prestations", href: "/prestations" }]}
      />

      <section className="pb-20 md:pb-24">
        <Container>
          <div className="rounded-[2.5rem] bg-cream-dark/60 p-8 md:p-12">
            <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight leading-[0.95]">
              Chevaux
            </h2>
            <p className="mt-6 max-w-2xl text-lg text-bark/85 leading-relaxed">
              Les prestations se déroulent chez vous à domicile. Je suis équipée d'une radiologie
              portable ainsi que d'une échographie afin de pouvoir réaliser les premiers examens
              sur place.
            </p>

            <ul className="mt-10 grid gap-3 md:grid-cols-2">
              {SERVICES_HORSES.map((service, i) => (
                <Reveal
                  as="li"
                  key={service.title}
                  delay={i * 50}
                  className="relative overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-cream p-6 transition-transform hover:-translate-y-0.5"
                >
                  <span className="absolute top-4 right-5 font-display text-4xl font-extrabold text-caramel/20 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-xl font-extrabold tracking-tight text-coffee pr-10">
                    {service.title}
                  </h3>
                  {service.description && (
                    <p className="mt-2 text-bark/75 leading-relaxed">{service.description}</p>
                  )}
                </Reveal>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="pb-24 md:pb-32">
        <Container>
          <div className="rounded-[2.5rem] gradient-brand p-8 md:p-12 text-cream relative overflow-hidden">
            <div className="grain absolute inset-0" aria-hidden />
            <div className="relative">
              <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight leading-[0.95]">
                Petits animaux
              </h2>
              <p className="mt-6 max-w-2xl text-lg text-cream/90 leading-relaxed">
                Les prestations se déroulent de préférence au cabinet. Pour les personnes à mobilité
                réduite, les animaux très stressés ou les euthanasies, je me déplace à votre
                domicile.
              </p>

              <ul className="mt-10 grid gap-3 md:grid-cols-2">
                {SERVICES_PETS.map((service, i) => (
                  <Reveal
                    as="li"
                    key={service.title}
                    delay={i * 50}
                    className="relative overflow-hidden rounded-2xl bg-cream/10 border border-cream/15 backdrop-blur p-6 transition-transform hover:-translate-y-0.5"
                  >
                    <span className="absolute top-4 right-5 font-display text-4xl font-extrabold text-cream/25 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-display text-xl font-extrabold tracking-tight text-cream pr-10">
                      {service.title}
                    </h3>
                    {service.description && (
                      <p className="mt-2 text-cream/85 leading-relaxed">{service.description}</p>
                    )}
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
