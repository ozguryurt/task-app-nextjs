import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Taskflow | Görev ve Ekip Yönetimi",
    template: "%s | Taskflow",
  },
  description:
    "Ekipler için bulut tabanlı görev yönetimi: ekip ve rol yönetimi, görev atama, öncelik ve teslim tarihi takibi tek çalışma alanında.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try { const savedTheme = localStorage.getItem('taskflow-theme'); const theme = savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); document.documentElement.classList.toggle('dark', theme === 'dark'); document.documentElement.style.colorScheme = theme; } catch {}`,
          }}
        />
      </head>
      <body
        className={`${poppins.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          {children}
          <ThemeToggle className="fixed bottom-5 right-5 z-40 shadow-lg" />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
