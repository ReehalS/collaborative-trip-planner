import Link from 'next/link';

const LINKS = [
  { label: 'About', href: '/about', external: false },
  {
    label: 'Company',
    href: 'https://portfolio.sandeepreehal.com',
    external: true,
  },
  { label: 'Privacy', href: '/privacy', external: false },
];

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-stone-800">
          <div>
            <span className="font-display text-white font-bold text-lg tracking-tight">
              Wanderly
            </span>
            <p className="text-sm text-stone-500 mt-1">
              Plan trips with your crew.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-7 gap-y-2">
            {LINKS.map(({ label, href, external }) =>
              external ? (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-stone-400 hover:text-white transition-colors duration-150"
                >
                  {label}
                </a>
              ) : (
                <Link
                  key={label}
                  href={href}
                  className="text-sm text-stone-400 hover:text-white transition-colors duration-150"
                >
                  {label}
                </Link>
              )
            )}
          </nav>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-6 text-xs text-stone-500">
          <span>© 2025 Wanderly. All rights reserved.</span>
          <span>
            Made by{' '}
            <a
              href="https://portfolio.sandeepreehal.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-300 hover:text-white transition-colors duration-150"
            >
              Sandeep Reehal
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
