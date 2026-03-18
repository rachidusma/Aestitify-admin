import type { Metadata } from "next";
import "./globals.css";
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Aestitify Admin | Theme Studio",
  description: "Next-gen theme and icon management for Aestitify",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ display: 'flex' }}>
        <aside className="sidebar">
          <div className="sidebar-logo">
            <h1 className="title-gradient">Aestitify Admin</h1>
          </div>
          <nav className="sidebar-nav">
            <Link href="/" className="nav-item">Dashboard</Link>
            <Link href="/themes" className="nav-item">Themes</Link>
            <Link href="/icons" className="nav-item">Icons</Link>
            <Link href="/widgets" className="nav-item">Widgets</Link>
          </nav>
        </aside>
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
