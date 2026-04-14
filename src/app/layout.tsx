import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Multiorder Panel',
  description: 'Premium order management dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main style={{ padding: '2rem', height: '100vh', overflowY: 'auto', maxWidth: '1400px', margin: '0 auto' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
