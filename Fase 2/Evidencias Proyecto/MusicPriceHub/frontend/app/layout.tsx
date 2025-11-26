import "./globals.css";
import { ThemeProvider } from "./providers/ThemeProvider";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "MusicPriceHub",
  description: "Comparador de precios de instrumentos musicales",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-page text-page-foreground transition-colors">
        <ThemeProvider>
          {/* NAVBAR GLOBAL (siempre visible en todas las páginas) */}
          <Navbar />

          {/* CONTENIDO PRINCIPAL */}
          <main className="relative z-10">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
