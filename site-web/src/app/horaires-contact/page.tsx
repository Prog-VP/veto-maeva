import { MessageCircle, MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PhoneCTA } from "@/components/ui/phone-cta";
import { ButtonOutline } from "@/components/ui/button-outline";
import { pageMetadata } from "@/lib/metadata";
import { CLINIC } from "@/lib/clinic";

export const metadata = pageMetadata({
  title: "Horaires, contact et infos pratiques",
  description:
    "Prendre rendez-vous au cabinet Vully Vétérinaire à Montmagny (VD) : téléphone, WhatsApp, horaires d'appel et infos pratiques.",
  path: "/horaires-contact",
});

export default function HorairesContactPage() {
  const mapQuery = encodeURIComponent(
    `${CLINIC.address.street}, ${CLINIC.address.postalCode} ${CLINIC.address.city}, Suisse`,
  );

  return (
    <>
      <PageHeader
        title={
          <>
            Horaires, contact<br />
            <span className="gradient-text">et infos pratiques</span>.
          </>
        }
        breadcrumbs={[{ label: "Horaires & contact", href: "/horaires-contact" }]}
        jsonLdName="Horaires, contact et infos pratiques"
      />

      <section className="pb-20">
        <Container>
          <Card>
            <Eyebrow>Numéro de téléphone</Eyebrow>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <PhoneCTA size="lg" className="w-full min-w-0 sm:w-auto" pulse={false} />
              <ButtonOutline href={CLINIC.phone.whatsapp} external className="w-full sm:w-auto py-4">
                <MessageCircle className="h-4 w-4 shrink-0" />
                WhatsApp
              </ButtonOutline>
            </div>
          </Card>
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
                  <a
                    href={CLINIC.phone.href}
                    className="font-semibold text-coffee underline decoration-terracotta/50 underline-offset-4"
                  >
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
            <Card>
              <Eyebrow>Cabinet petits animaux</Eyebrow>
              <address className="mt-5 not-italic font-display text-3xl md:text-4xl font-extrabold tracking-tight text-coffee leading-[1.05]">
                {CLINIC.name}<br />
                {CLINIC.address.street}<br />
                {CLINIC.address.postalCode} {CLINIC.address.city}
              </address>
              <ButtonOutline
                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                external
                className="mt-8"
              >
                <MapPin className="h-4 w-4" />
                Ouvrir dans Google Maps
              </ButtonOutline>
            </Card>
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
    <Card as="article">
      <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-coffee leading-[1.1]">
        {question}
      </h2>
      {hint && <p className="mt-2 text-sm text-bark/60 italic">({hint})</p>}
      <div className="mt-5 text-lg text-bark/85 leading-relaxed">{answer}</div>
    </Card>
  );
}
