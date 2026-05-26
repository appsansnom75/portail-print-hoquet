import { CartProvider } from '@/context/CartContext';
import { Analytics } from '@vercel/analytics/react';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
        <Analytics />
        <GoogleAnalytics gaId="G-PWBTPXLWYS" /> {/* ← ton vrai ID ici */}
      </body>
    </html>
  );
}