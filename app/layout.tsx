import type { Metadata } from "next";
import { Geist, Geist_Mono, Oxanium } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import ConditionalLayout from "@/components/ConditionalLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const oxanium = Oxanium({
  variable: "--font-oxanium",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Next Level Audio - Car Audio Installation & Window Tinting | Stroudsburg, PA",
  description: "Professional car audio installation, window tinting, and auto accessories in Stroudsburg, PA. Quality craftsmanship at competitive prices.",
  alternates: {
    canonical: "https://nextlevelaudiopa.com",
    languages: {
      en: "https://nextlevelaudiopa.com",
      es: "https://nextlevelaudiopa.com/es",
    },
  },
  openGraph: {
    title: "Next Level Audio - Car Audio & Window Tinting | Stroudsburg, PA",
    description: "Professional car audio installation, window tinting, and auto accessories in Stroudsburg, PA.",
    url: "https://nextlevelaudiopa.com",
    siteName: "Next Level Audio",
    images: [{ url: "/images/logo.webp", width: 800, height: 222, alt: "Next Level Audio" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Next Level Audio - Car Audio & Window Tinting | Stroudsburg, PA",
    description: "Professional car audio installation, window tinting, and auto accessories in Stroudsburg, PA.",
    images: ["/images/logo.webp"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <head>
        <link rel="preconnect" href="https://checkout.clover.com" />
        <link rel="dns-prefetch" href="https://api.openai.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AutoRepair",
              name: "Next Level Audio",
              description:
                "Professional car audio installation, window tinting, and auto accessories in Stroudsburg, PA.",
              url: "https://nextlevelaudiopa.com",
              telephone: "+1-570-730-4433",
              email: "nextlevelauto@ymail.com",
              address: {
                "@type": "PostalAddress",
                streetAddress: "944 North 9th Street",
                addressLocality: "Stroudsburg",
                addressRegion: "PA",
                postalCode: "18360",
                addressCountry: "US",
              },
              image: "https://nextlevelaudiopa.com/images/logo.webp",
              priceRange: "$$",
              geo: {
                "@type": "GeoCoordinates",
                latitude: "40.9862",
                longitude: "-75.1946",
              },
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                  ],
                  opens: "09:00",
                  closes: "19:00",
                },
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: "Saturday",
                  opens: "09:00",
                  closes: "15:00",
                },
              ],
              areaServed: [
                { "@type": "City", name: "Stroudsburg" },
                { "@type": "City", name: "East Stroudsburg" },
                { "@type": "City", name: "Tannersville" },
                { "@type": "City", name: "Bartonsville" },
                { "@type": "City", name: "Mount Pocono" },
                { "@type": "City", name: "Tobyhanna" },
                { "@type": "City", name: "Delaware Water Gap" },
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${oxanium.variable} antialiased bg-black`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientLayout>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </ClientLayout>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
