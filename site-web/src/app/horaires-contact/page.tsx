import type { Metadata } from "next";
import { Phone, MessageCircle, MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { CLINIC } from "@/lib/clinic";

export const metadata: Metadata = {
  title: "Horaires, contact et infos pratiques",
  description:
    "Prendre rendez-vous au cabinet Vully Vétérinaire à Montmagny (VD) : téléphone, WhatsApp, horaires d'appel et infos pratiques.",
  alternates: { canonical: "/horaires-contact" },
  openGraph: {
    title: "Horaires, contact et infos pratiques",
    url: "/horaires-contact",
  },
};

export default function HorairesContactPage() {
  const mapQuery = encodeURIComponent(
    `${CLINIC.address.street}, ${CLINIC.address.postalCode} ${CLINIC.address.city}, Suisse`,
  );

  return (
    <>
      <BreadcrumbJsonLd
        items={[{ name: "Horaires, contact et infos pratiques", url: "/horaires-contact" }]}
      />

      <PageHeader
        title={
          <>
            Horaires, contact<br />
            <span className="gradient-text">et infos pratiques</span>.
          </>
        }
        breadcrumbs={[{ label: "Horaires & contact", href: "/horaires-contact" }]}
      />

      <section className="pb-20">
        <Container>
          <div className="rounded-3xl border border-[color:var(--color-border)] bg-cream p-8 md:p-10">
            <p className="text-xs uppercase tracking-[0.22em] text-terracotta font-bold">
              Numéro de téléphone
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={CLINIC.phone.href}
                className="inline-flex w-full min-w-0 items-center justify-center gap-3 rounded-full gradient-brand px-5 py-4 font-display text-xl font-extrabold text-cream sm:w-auto sm:px-7 sm:text-2xl md:text-3xl"
              >
                <Phone className="h-6 w-6 shrink-0" strokeWidth={2.5} />
                <span className="whitespace-nowrap">{CLINIC.phone.display}</span>
              </a>
              <a
                href={CLINIC.phone.whatsapp}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-coffee/15 px-6 py-4 text-sm font-semibold text-coffee transition-colors hover:bg-coffee hover:text-cream sm:w-auto"
              >
                <MessageCircle className="h-4 w-4 shrink-0" />
                WhatsApp
              </a>
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-24">
        <Container>
          <div className="space-y-6">
            <Qa
              question="Comment prendre rendez-vous pour une consultation, une prise de rendez-vous, une commande de nourriture ou de matériel ?"
              answer={<p>Par téléphone ou par message Whatsapp.</p>}
            />

            <Qa
              question="Quand nous appeler ?"
              hint="Prises de rendez-vous, médicaments, nourriture ou matériel, tout ce qui est NON URGENT."
              answer={<p>Du lundi au vendredi, de 8h à 11h30 et de 14h à 17h.</p>}
            />

            <Qa
              question="Que faire en cas d'urgences ?"
              answer={
                <p>
                  Pas de message WhatsApp pour une urgence, téléphonez au{" "}
                  <a href={CLINIC.phone.href} className="font-semibold text-coffee underline decoration-terracotta/50 underline-offset-4">
                    {CLINIC.phone.display}
                  </a>
                  . J'essayerais autant que possible de répondre à vos appels 7j/7, 24h/24. Si
                  toutefois je ne devais pas être disponible, restez en ligne et écoutez le répondeur
                  qui vous indiquera quoi faire et quel service d'urgence contacter.
                </p>
              }
            />

            <Qa
              question="Quand puis-je venir en rendez-vous ?"
              answer={
                <>
                  <p>
                    Les rendez-vous seront fixés selon les disponibilités durant la semaine et un
                    samedi par mois.
                  </p>
                  <p className="mt-3">
                    Un soir par semaine, des rendez-vous jusqu'à 21h seront possibles.
                  </p>
                </>
              }
            />

            <Qa
              question="Où se déroulent les rendez-vous ?"
              answer={
                <>
                  <p>
                    <strong className="font-semibold text-coffee">Petits animaux</strong> : dans mon
                    cabinet, à la rue de la Laiterie 4, 1587 Montmagny. Pour les personnes à mobilité
                    réduite, les animaux très stressés ou les euthanasies, je me déplace à domicile.
                  </p>
                  <p className="mt-3">
                    <strong className="font-semibold text-coffee">Chevaux</strong> : à domicile, chez
                    vous.
                  </p>
                </>
              }
            />
          </div>
        </Container>
      </section>

      <section className="pb-24">
        <Container>
          <div className="mb-10">
            <h2 className="font-display text-5xl md:text-6xl font-extrabold tracking-tight leading-[0.95] text-balance">
              Où nous trouver ?
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-2 items-start">
            <div className="rounded-3xl border border-[color:var(--color-border)] bg-cream p-8 md:p-10">
              <p className="text-xs uppercase tracking-[0.22em] text-terracotta font-bold">
                Cabinet petits animaux
              </p>
              <address className="mt-5 not-italic font-display text-3xl md:text-4xl font-extrabold tracking-tight text-coffee leading-[1.05]">
                {CLINIC.name}<br />
                {CLINIC.address.street}<br />
                {CLINIC.address.postalCode} {CLINIC.address.city}
              </address>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-coffee/15 px-6 py-3.5 text-sm font-semibold text-coffee hover:bg-coffee hover:text-cream transition-colors"
              >
                <MapPin className="h-4 w-4" />
                Ouvrir dans Google Maps
              </a>
            </div>
            <div className="overflow-hidden rounded-3xl border border-[color:var(--color-border)]">
              <div className="aspect-[4/3] w-full bg-cream-dark">
                <iframe
                  title={`Carte — ${CLINIC.address.city}`}
                  src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                  className="h-full w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

function Qa({
  question,
  hint,
  answer,
}: {
  question: string;
  hint?: string;
  answer: React.ReactNode;
}) {
  return (
    <article className="rounded-3xl border border-[color:var(--color-border)] bg-cream p-8 md:p-10">
      <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-coffee leading-[1.1]">
        {question}
      </h2>
      {hint && <p className="mt-2 text-sm text-bark/60 italic">({hint})</p>}
      <div className="mt-5 text-lg text-bark/85 leading-relaxed">{answer}</div>
    </article>
  );
}
