import type { Metadata } from "next";
import { Geist, Geist_Mono, Oxanium } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import ConditionalLayout from "@/components/ConditionalLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const oxanium = Oxanium({
  variable: "--font-oxanium",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Next Level Audio - Car Audio Installation & Window Tinting | Stroudsburg, PA",
  description: "Professional car audio installation, window tinting, and auto accessories in Stroudsburg, PA. Quality craftsmanship at competitive prices.",
  openGraph: {
    title: "Next Level Audio - Car Audio & Window Tinting | Stroudsburg, PA",
    description: "Professional car audio installation, window tinting, and auto accessories in Stroudsburg, PA.",
    url: "https://nextlevelaudiopa.com",
    siteName: "Next Level Audio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Next Level Audio - Car Audio & Window Tinting | Stroudsburg, PA",
    description: "Professional car audio installation, window tinting, and auto accessories in Stroudsburg, PA.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
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
              email: "nextlevelaudio@ymail.com",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Stroudsburg",
                addressRegion: "PA",
                postalCode: "18360",
                addressCountry: "US",
              },
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
                  closes: "18:00",
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
        <ClientLayout>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </ClientLayout>
      </body>
    </html>
  );
}
