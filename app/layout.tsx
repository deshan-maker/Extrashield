import type { Metadata } from "next";
import { Inter, Manrope, IBM_Plex_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import AuthSessionProvider from "@/components/AuthSessionProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://extrashield.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Extra Shield | Powered Cloud Warranty & Insurance Platform",
    template: "%s | Extra Shield",
  },
  description:
    "Extra Shield protects every device it touches — driven warranty, insurance and repair tracking for Sri Lanka's mobile industry.",
  keywords: [
    "mobile phone warranty Sri Lanka",
    "device protection plan",
    "phone insurance Sri Lanka",
    "IMEI warranty check",
    "screen protection plan",
    "Extra Shield",
  ],
  openGraph: {
    title: "Extra Shield | Powered Cloud Warranty & Insurance Platform",
    description:
      "Every claim, warranty and repair — one intelligent cloud. Sri Lanka's first end-to-end mobile device protection ecosystem.",
    url: SITE_URL,
    siteName: "Extra Shield",
    locale: "en_LK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Extra Shield | Powered Cloud Warranty & Insurance Platform",
    description:
      "Every claim, warranty and repair — one intelligent cloud. Sri Lanka's first end-to-end mobile device protection ecosystem.",
  },
  robots: {
    index: true,
    follow: true,
  },
  // Paste the verification code Google Search Console gives you (Settings >
  // Ownership verification > HTML tag method) into NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION.
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
  }),
};

const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('dwp-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${inter.variable} ${manrope.variable} ${plexMono.variable} font-body antialiased`}
      >
        {/* Google Analytics (GA4) — inert until NEXT_PUBLIC_GA_MEASUREMENT_ID
            is set. Get a Measurement ID from analytics.google.com
            (Admin > Data Streams > your web stream), format G-XXXXXXXXXX. */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}