import type { Metadata } from "next";
import { Exo, Exo_2 } from "next/font/google";
import "./globals.css";

const exo = Exo({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-exo",
  display: "swap",
});

const exo2 = Exo_2({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-exo2",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Calendrier marketing Daïmo",
  description: "Articles, images et carrousels programmés sur LinkedIn.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${exo.variable} ${exo2.variable} font-body text-slate-900`}>
        {children}
      </body>
    </html>
  );
}
