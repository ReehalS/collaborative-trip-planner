import '@globals/globals.css';
import fonts from '@globals/fonts';

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
    <html lang="en">
      <body
        className={`${fonts} min-h-screen flex flex-col bg-surface-50 font-sans text-surface-700 antialiased`}
      >
        <ThemeRegistry>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </ThemeRegistry>
      </body>
    </html>
  );
}
