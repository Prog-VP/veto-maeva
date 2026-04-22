import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { ServicesBlock } from "@/components/ui/services-block";
import { pageMetadata } from "@/lib/metadata";
import { SERVICES_HORSES, SERVICES_PETS } from "@/lib/clinic";

export const metadata = pageMetadata({
  title: "Prestations",
  description:
    "Prestations vétérinaires pour chevaux (à domicile) et petits animaux (au cabinet) au Vully : vaccinations, médecine interne, chirurgie, dentisterie, acupuncture.",
  path: "/prestations",
});

export default function PrestationsPage() {
  return (
    <>
      <PageHeader
        title="Prestations"
        breadcrumbs={[{ label: "Prestations", href: "/prestations" }]}
        jsonLdName="Prestations"
      />

      <section className="pb-20 md:pb-24">
        <Container>
          <ServicesBlock
            title="Chevaux"
            intro="Les prestations se déroulent chez vous à domicile. Je suis équipée d'une radiologie portable ainsi que d'une échographie afin de pouvoir réaliser les premiers examens sur place."
            services={SERVICES_HORSES}
          />
        </Container>
      </section>

      <section className="pb-24 md:pb-32">
        <Container>
          <ServicesBlock
            title="Petits animaux"
            intro="Les prestations se déroulent de préférence au cabinet. Pour les personnes à mobilité réduite, les animaux très stressés ou les euthanasies, je me déplace à votre domicile."
            services={SERVICES_PETS}
            variant="dark"
          />
        </Container>
      </section>
    </>
  );
}
