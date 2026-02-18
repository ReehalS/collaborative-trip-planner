import '@globals/globals.css';
import fonts from '@globals/fonts';

import Providers from './_components/Providers';
import Navbar from '@components/Navbar/Navbar';
import Footer from '@components/Footer/Footer';
import ThemeRegistry from '@components/ThemeRegistry';

export const metadata = {
  title: 'Collaborative Planner',
  description: 'Plan trips collaboratively with friends',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fonts} min-h-screen flex flex-col bg-surface-50 font-sans text-surface-700 antialiased`}
      >
        <Providers>
          <ThemeRegistry>
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </ThemeRegistry>
        </Providers>
      </body>
    </html>
  );
}
