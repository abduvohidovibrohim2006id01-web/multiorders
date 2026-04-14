import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

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
      <body className="flex">
        <Sidebar />
        <main style={{ flex: 1, padding: '2rem', height: '100vh', overflowY: 'auto' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
