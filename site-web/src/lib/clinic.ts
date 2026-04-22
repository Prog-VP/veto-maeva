// TODO: remplacer les placeholders (téléphone, GPS, domaine, email)
export const CLINIC = {
  name: "Vully Vétérinaire",
  tagline: "Un cabinet pour vos amis à 4 pattes mais aussi à 4 sabots",
  description:
    "Cabinet vétérinaire Vully Vétérinaire à Montmagny (VD). Soins pour équidés et petits animaux par Maëva Verdon, Dr. med. vet.",
  url: "https://vully-vétérinaire.ch",

  address: {
    street: "Rue de la Laiterie 4",
    postalCode: "1587",
    city: "Montmagny",
    region: "VD",
    country: "CH",
    countryName: "Suisse",
  },

  phone: {
    display: "+41 00 000 00 00",
    href: "tel:+410000000000",
    whatsapp: "https://wa.me/410000000000",
  },

  email: "contact@vully-veterinaire.ch",

  geo: {
    latitude: 46.9485,
    longitude: 7.0751,
  },

  vet: {
    firstName: "Maëva",
    lastName: "Verdon",
    fullName: "Maëva Verdon",
    title: "Dr. med. vet.",
  },
} as const;

export const SERVICES_HORSES = [
  { title: "Vaccinations et vermifugations", description: "" },
  {
    title: "Médecine interne",
    description:
      "Problèmes pulmonaires, dermatologie, gériatrie, coliques, problèmes gastro-intestinaux, ophtalmologie basique.",
  },
  {
    title: "Gynécologie",
    description: "Suivi d'ovulation, si nécessaire insémination, suivi de gestation.",
  },
  { title: "Visite d'achat", description: "Avec ou sans radiologies." },
  {
    title: "Locomoteur",
    description:
      "Affections de l'appareil locomoteur, conseils ferrages ou parage, abcès de pieds.",
  },
  { title: "Chirurgie", description: "Petite chirurgie d'urgence, plaies, castrations." },
  { title: "Dentisterie", description: "Suivi de dentisterie (uniquement sous sédatif)." },
  {
    title: "Acupuncture",
    description: "Pour tout problème de santé, veuillez me contacter.",
  },
  { title: "Gestion de fin de vie et euthanasie", description: "" },
] as const;

export const SERVICES_PETS = [
  { title: "Vaccinations, vermifugations, poses de microchip", description: "" },
  {
    title: "Médecine interne",
    description:
      "Dermatologie, pneumologie, problèmes gastro-intestinaux, ophtalmologie, etc.",
  },
  {
    title: "Chirurgie",
    description:
      "Castration et stérilisation chat, castration chien, plaies, petites chirurgies. Je ne pratique pas de stérilisation chienne.",
  },
  {
    title: "Dentisterie",
    description: "Détartrage, arrachage de dent simple.",
  },
  {
    title: "Acupuncture",
    description: "Pour tout problème de santé, veuillez me contacter.",
  },
  { title: "Gestion de fin de vie et euthanasie", description: "" },
] as const;

export const NAV = [
  { href: "/", label: "Accueil", short: "Accueil" },
  { href: "/presentation", label: "Présentation", short: "Présentation" },
  { href: "/a-propos", label: "À propos de moi", short: "À propos" },
  { href: "/prestations", label: "Prestations", short: "Prestations" },
  {
    href: "/horaires-contact",
    label: "Horaires, contact et infos pratiques",
    short: "Horaires & contact",
  },
  { href: "/urgence", label: "Urgence", short: "Urgence" },
] as const;
