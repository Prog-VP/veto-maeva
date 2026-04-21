import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Fraunces, Inter } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageMain } from "@/components/layout/page-main";
import { LocalBusinessJsonLd } from "@/components/seo/json-ld";
import { CLINIC } from "@/lib/clinic";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700", "800"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(CLINIC.url),
  title: {
    default: `${CLINIC.name} — Cabinet vétérinaire au Vully`,
    template: `%s · ${CLINIC.name}`,
  },
  description: CLINIC.description,
  keywords: [
    "vétérinaire Vully",
    "vétérinaire Montmagny",
    "vétérinaire équin",
    "vétérinaire chevaux Vully",
    "vétérinaire petits animaux Fribourg",
    "acupuncture vétérinaire",
    "dentisterie équine",
    "cabinet vétérinaire Broye",
    "Dr. med. vet. Maëva Verdon",
  ],
  authors: [{ name: CLINIC.vet.fullName }],
  creator: CLINIC.vet.fullName,
  publisher: CLINIC.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_CH",
    url: CLINIC.url,
    siteName: CLINIC.name,
    title: `${CLINIC.name} — ${CLINIC.tagline}`,
    description: CLINIC.description,
  },
  twitter: {
    card: "summary_large_image",
    title: CLINIC.name,
    description: CLINIC.tagline,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#f5efe6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${bricolage.variable} ${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-bark">
        <LocalBusinessJsonLd />
        <Header />
        <PageMain>{children}</PageMain>
        <Footer />
      </body>
    </html>
  );
}
