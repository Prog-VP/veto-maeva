import { AlertCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { PhoneCTA } from "@/components/ui/phone-cta";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Urgence",
  description:
    "Que faire en cas d'urgence vétérinaire. Contacter le numéro de téléphone normal. Si pas de réponse, le répondeur redirige vers le service d'urgence de garde.",
  path: "/urgence",
});

export default function UrgencePage() {
  return (
    <>
      <PageHeader
        variant="dark"
        breadcrumbs={[{ label: "Urgence", href: "/urgence" }]}
        jsonLdName="Urgence"
        title={
          <>
            Que faire en cas<br />d'urgence ?
          </>
        }
        beforeTitle={
          <div className="inline-flex items-center gap-2 rounded-full bg-cream/10 backdrop-blur px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]">
            <AlertCircle className="h-3.5 w-3.5" />
            Urgence
          </div>
        }
      >
        <div className="mt-12 max-w-2xl">
          <PhoneCTA size="xl" variant="inverse" className="w-full" />
        </div>
      </PageHeader>

      <section className="py-20 md:py-28">
        <Container size="narrow">
          <div className="space-y-8 text-xl md:text-2xl leading-relaxed text-bark/90 text-pretty">
            <p>Contacter le numéro de téléphone normal.</p>
            <p>
              Si pas de réponses, attendez le signal du répondeur, il vous redirigera sur le service
              d'urgence de garde en cas d'indisponibilités.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
