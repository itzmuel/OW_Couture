import type { Metadata } from "next";
import {
  Inter,
  Cormorant_Garamond,
} from "next/font/google";

import "./globals.css";

import { AuthProvider } from "@/components/auth-context";
import { CartProvider } from "@/components/cart-context";
import { CustomizationDrawerProvider } from "@/components/customization-drawer-context";
import { SiteShell } from "@/components/site-shell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://owcouture.com"),

  title: {
    default: "OW Couture",
    template: "%s | OW Couture",
  },

  description:
    "Luxury made-to-order bridal gowns, evening dresses, bespoke tailoring and ready-to-wear pieces.",

  keywords: [
    "Bridal",
    "Wedding Dresses",
    "Luxury Fashion",
    "Custom Dresses",
    "Evening Dresses",
    "OW Couture",
  ],

  openGraph: {
    title: "OW Couture",
    description:
      "Made-to-order luxury bridal and evening wear.",
    type: "website",
    locale: "en_CA",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${cormorant.variable} antialiased bg-[#F8F6F2] text-[#171717]`}
      >
        <AuthProvider>
          <CartProvider>
            <CustomizationDrawerProvider>
              <SiteShell>{children}</SiteShell>
            </CustomizationDrawerProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
