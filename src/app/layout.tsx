import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./navbar";
import Script from 'next/script';

export const metadata: Metadata = {
    title: "Roteiro",
    description: "Know your movies.",
    icons: {
        icon: '/roteiro.svg'
    }
};

export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
    return (
        <html lang="en">
            <body>
                <Navbar />
                {children}
                <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" />
            </body>
        </html>
    );
}