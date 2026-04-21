import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { CLINIC } from "@/lib/clinic";

export const metadata: Metadata = {
  title: "À propos de moi",
  description: `${CLINIC.vet.fullName}, ${CLINIC.vet.title}. Diplômée en médecine vétérinaire en 2016 à Berne, 10 ans d'expérience principalement en médecine équine.`,
  alternates: { canonical: "/a-propos" },
  openGraph: {
    title: "À propos de moi",
    url: "/a-propos",
  },
};

export default function AProposPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "À propos de moi", url: "/a-propos" }]} />

      <PageHeader
        title="À propos de moi"
        breadcrumbs={[{ label: "À propos de moi", href: "/a-propos" }]}
      />

      <section className="pb-24 md:pb-32">
        <Container>
          <div className="grid gap-16 lg:grid-cols-12 items-start">
            <div className="lg:col-span-5 lg:sticky lg:top-28">
              <PhotoPlaceholder aspectRatio="3/4" tone="light" className="-rotate-[1.5deg]" />
            </div>

            <div className="lg:col-span-7 space-y-6 text-lg leading-relaxed text-bark/85 text-pretty">
              <p>
                Originaire du Vully, j'ai très tôt développé une véritable passion pour les animaux,
                ce qui m'a naturellement conduite vers la médecine vétérinaire.
              </p>
              <p>
                Diplômée en médecine vétérinaire en 2016 à Berne, j'ai travaillé pendant 10 ans dans
                diverses pratiques, principalement en médecine équine. J'ai depuis continuellement
                enrichi mes compétences grâce à de nombreuses formations continues, notamment en
                dentisterie équine, ainsi qu'en acupuncture pour petits et grands animaux.
              </p>
              <p>
                J'ai finalement choisi de m'installer à mon compte afin de mettre mon expérience
                au service de ma région.
              </p>
              <p>
                Ce qui me tient particulièrement à cœur, c'est de prendre le temps d'écouter chaque
                propriétaire, de considérer pleinement son point de vue et de construire ensemble
                la meilleure prise en charge possible. J'accorde une grande importance au respect
                de l'animal, en privilégiant des soins réalisés avec douceur et attention à son
                bien-être.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
