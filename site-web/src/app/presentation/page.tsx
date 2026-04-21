import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Présentation",
  description:
    "Cabinet vétérinaire de proximité pour les habitants du Vully et des environs. Un petit cabinet familial à taille humaine, à Montmagny (VD).",
  alternates: { canonical: "/presentation" },
  openGraph: {
    title: "Présentation",
    url: "/presentation",
  },
};

export default function PresentationPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Présentation", url: "/presentation" }]} />

      <PageHeader
        title="Présentation"
        breadcrumbs={[{ label: "Présentation", href: "/presentation" }]}
      />

      <section className="pb-24 md:pb-32">
        <Container>
          <div className="grid gap-16 lg:grid-cols-12 items-start">
            <div className="lg:col-span-5 space-y-6">
              <PhotoPlaceholder aspectRatio="4/5" tone="warm" />
              <PhotoPlaceholder aspectRatio="4/3" tone="light" className="lg:ml-12" />
            </div>

            <div className="lg:col-span-7 space-y-6 text-lg leading-relaxed text-bark/85 text-pretty">
              <p>
                L'idée de ce cabinet vétérinaire a germé, après de longues réflexions, avec la volonté
                d'offrir une médecine vétérinaire de proximité aux habitants du Vully et des environs.
                Ici, pas de structures hors normes avec une immense équipe, mais un petit cabinet familial
                à taille humaine.
              </p>
              <p>
                Ce projet est né du désir de créer un lien durable avec les propriétaires d'animaux
                de la région, en les accompagnant au fil du temps avec écoute, confiance et simplicité.
              </p>
              <p>
                Je souhaite proposer une prise en charge rapide, efficace et accessible, en mettant
                à disposition des soins essentiels, à la fois basiques et de qualité.
              </p>
              <p>
                Le cabinet propose des soins pour vos équidés mais également vos animaux de compagnie.
              </p>
              <p>
                Je dispose d'un petit cabinet à domicile pour toutes les consultations des petits
                animaux, ainsi qu'un véhicule équipé pour soigner vos équidés à domicile.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
