import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aistra Outreach Executive Dashboard | Smartlead",
  description: "Live, read-only cold email performance metrics across Creative and Accounting segments.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-slate-950 text-slate-100 min-h-screen selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
