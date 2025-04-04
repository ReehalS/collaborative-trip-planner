import '@globals/globals.scss';
import fonts from '@globals/fonts';
import metadata from '@globals/metadata.json';

import navLinks from '@data/navLinks.json';
import Navbar from '@components/Navbar/Navbar';
import Footer from '@components/Footer/Footer';

export { metadata };

export default function RootLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${fonts} rootLayout`}>
        <Navbar navLinks={navLinks} />
        <main className="mainContent">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
