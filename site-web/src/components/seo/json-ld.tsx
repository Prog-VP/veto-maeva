import { CLINIC } from "@/lib/clinic";

export function LocalBusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "VeterinaryCare",
    "@id": `${CLINIC.url}/#organization`,
    name: CLINIC.name,
    description: CLINIC.description,
    url: CLINIC.url,
    telephone: CLINIC.phone.display,
    email: CLINIC.email,
    image: `${CLINIC.url}/opengraph-image`,
    address: {
      "@type": "PostalAddress",
      streetAddress: CLINIC.address.street,
      postalCode: CLINIC.address.postalCode,
      addressLocality: CLINIC.address.city,
      addressRegion: CLINIC.address.region,
      addressCountry: CLINIC.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: CLINIC.geo.latitude,
      longitude: CLINIC.geo.longitude,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "11:30",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "14:00",
        closes: "17:00",
      },
    ],
    areaServed: [
      { "@type": "Place", name: "Vully" },
      { "@type": "Place", name: "Broye" },
      { "@type": "Place", name: "Fribourg" },
      { "@type": "Place", name: "Vaud" },
    ],
    founder: {
      "@type": "Person",
      name: CLINIC.vet.fullName,
      jobTitle: CLINIC.vet.title,
      alumniOf: "Université de Berne",
    },
    knowsAbout: [
      "Médecine vétérinaire équine",
      "Médecine vétérinaire des petits animaux",
      "Dentisterie équine",
      "Acupuncture vétérinaire",
      "Chirurgie vétérinaire",
      "Gynécologie équine",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${CLINIC.url}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
