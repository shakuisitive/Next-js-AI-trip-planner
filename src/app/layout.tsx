import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
// import ClientLayout from "@/app/ClientLayout";
import Script from "next/script";
import { AuthContextProvider } from "@/context/AuthContext";
import { SessionProvider } from "next-auth/react";
import { CredentialsContextProvider } from "@/context/CredentialsContext";
import { Toaster } from "sonner";
import ClientLayout from "../components/client-layout-updated";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Shakir Trip Planner",
  description: "Discover amazing places at exclusive deals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-R9MLH5GVZE"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-R9MLH5GVZE');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <CredentialsContextProvider>
            <AuthContextProvider>
              <ClientLayout>{children}</ClientLayout>
              <div id="portal-root" />
            </AuthContextProvider>
          </CredentialsContextProvider>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
