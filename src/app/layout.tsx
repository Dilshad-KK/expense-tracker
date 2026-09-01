import { Amiri_Quran, Poppins } from "next/font/google";
import "@/styles/globals.css";

const amiriQuran = Amiri_Quran({
  weight: "400",
  variable: "--font-arabic",
  subsets: ["arabic"],
});

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${amiriQuran.variable}`}>
      <body className="antialiased h-[100dvh] overflow-hidden overscroll-none flex flex-col bg-[var(--q-bg)]">
        {children}
      </body>
    </html>
  );
}
