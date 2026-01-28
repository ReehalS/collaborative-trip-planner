'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { RxHamburgerMenu, RxCross2 } from 'react-icons/rx';
import {
  authenticatedLinks,
  unauthenticatedLinks,
} from '@data/navConfig';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setAuthenticated(!!token);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthenticated(false);
    setMenuOpen(false);
    router.push('/login');
  };

  const links = authenticated ? authenticatedLinks : unauthenticatedLinks;

  return (
    <nav className="sticky top-0 z-50 h-16 bg-white/80 backdrop-blur-md border-b border-surface-200 shadow-navbar">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="font-display text-xl font-bold text-surface-900 tracking-tight hover:text-primary-600 transition-colors duration-200"
        >
          Collaborative Planner
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const isActive =
              pathname === link.slug ||
              (link.slug !== '/' && pathname.startsWith(link.slug));
            return (
              <Link
                key={link.slug}
                href={link.slug}
                className={`px-3 py-2 rounded-btn text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          {authenticated && (
            <button
              onClick={handleLogout}
              className="ml-2 px-3 py-2 rounded-btn text-sm font-medium text-error hover:bg-error-light transition-all duration-200"
            >
              Logout
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-btn text-surface-600 hover:text-surface-900 hover:bg-surface-100 transition-colors duration-200"
          aria-label="Toggle menu"
        >
          {menuOpen ? <RxCross2 size={22} /> : <RxHamburgerMenu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-surface-200 shadow-elevated overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-3 space-y-1">
          {links.map((link) => {
            const isActive =
              pathname === link.slug ||
              (link.slug !== '/' && pathname.startsWith(link.slug));
            return (
              <Link
                key={link.slug}
                href={link.slug}
                className={`block px-4 py-3 rounded-btn text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          {authenticated && (
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 rounded-btn text-sm font-medium text-error hover:bg-error-light transition-colors duration-200"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
