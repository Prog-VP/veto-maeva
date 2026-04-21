import type { Metadata } from "next";
import Link from "next/link";
import { Phone, AlertCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { CLINIC } from "@/lib/clinic";

export const metadata: Metadata = {
  title: "Urgence",
  description:
    "Que faire en cas d'urgence vétérinaire. Contacter le numéro de téléphone normal. Si pas de réponse, le répondeur redirige vers le service d'urgence de garde.",
  alternates: { canonical: "/urgence" },
  openGraph: {
    title: "Urgence",
    url: "/urgence",
  },
};

export default function UrgencePage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Urgence", url: "/urgence" }]} />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-brand" aria-hidden />
        <div className="grain absolute inset-0" aria-hidden />
        <div className="relative pt-16 pb-24 md:pt-24 md:pb-32 text-cream">
          <Container>
            <nav aria-label="Fil d'Ariane" className="mb-8 text-sm text-cream/70">
              <ol className="flex flex-wrap items-center gap-1">
                <li>
                  <Link href="/" className="hover:text-cream">
                    Accueil
                  </Link>
                </li>
                <li>/</li>
                <li className="text-cream font-medium">Urgence</li>
              </ol>
            </nav>

            <div className="inline-flex items-center gap-2 rounded-full bg-cream/10 backdrop-blur px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]">
              <AlertCircle className="h-3.5 w-3.5" />
              Urgence
            </div>

            <h1 className="mt-8 font-display text-6xl md:text-[8rem] font-extrabold leading-[0.88] tracking-[-0.035em] text-balance">
              Que faire en cas<br />d'urgence ?
            </h1>

            <div className="mt-12 max-w-2xl">
              <a
                href={CLINIC.phone.href}
                className="pulse shine group inline-flex w-full items-center justify-center gap-3 rounded-full bg-cream px-8 py-6 text-xl md:text-2xl font-display font-extrabold text-coffee shadow-2xl shadow-coffee/30 transition-transform hover:scale-[1.02]"
              >
                <Phone className="h-6 w-6" strokeWidth={2.5} />
                {CLINIC.phone.display}
              </a>
            </div>
          </Container>
        </div>
      </section>

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
