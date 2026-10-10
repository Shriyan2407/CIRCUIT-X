import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', weight: ['400', '500', '700'] });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '500'] });

export const metadata: Metadata = {
  title: 'CIRCUIT-X — Networks That Survive',
  description: 'A graph-based network reliability simulation built with Java. BFS, DFS, Dijkstra, a custom min-heap and failure recovery, shown as a living 3D network.',
};

export const viewport: Viewport = {
  themeColor: '#030303',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>
        {children}
        <noscript>
          <p className="noscript">CIRCUIT-X needs JavaScript to run its simulation.</p>
        </noscript>
      </body>
    </html>
  );
}
