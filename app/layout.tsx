import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'H3lium | Autonomous AI Agent Role & Intent Security Console',
  description: 'Deterministic security console that detects when autonomous AI agents deviate from declared roles and responds with minimal containment.',
  openGraph: {
    title: 'H3lium | Autonomous AI Agent Security Console',
    description: 'Allowed is not the same as appropriate. Continuous role, taint, and intent enforcement for autonomous AI agent chains.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'H3lium | AI Agent Security Console',
    description: 'Autonomous AI agent security console detecting behavioral role drift and indirect prompt injection.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen selection:bg-teal-500 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
