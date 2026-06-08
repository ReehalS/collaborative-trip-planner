'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { RxHamburgerMenu, RxCross2 } from 'react-icons/rx';
import { authClient } from '@app/auth-client';
import { useDbUser } from '@hooks/useDbUser';
import profileColors from '@data/profileColors';
import { authenticatedLinks, unauthenticatedLinks } from '@data/navConfig';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const session = authClient.useSession();
  const user = session.data?.user ?? null;
  const { dbUser } = useDbUser();
  const pathname = usePathname();
  const router = useRouter();
  // Only show auth-dependent UI after client hydration to avoid mismatch
  const authenticated = hydrated && !!user;

  // Mark as hydrated once mounted on client
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setProfileMenuOpen(false);
  }, [pathname]);

  // Close profile menu when clicking outside
  useEffect(() => {
    if (!profileMenuOpen) return;
    const handleClick = () => setProfileMenuOpen(false);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [profileMenuOpen]);

  // Don't render any nav links until hydrated to avoid server/client mismatch
  const links = !hydrated
    ? []
    : authenticated
    ? authenticatedLinks
    : unauthenticatedLinks;

  const profilePic = dbUser?.profilePic ?? 1;
  const ProfileIcon = profileColors[profilePic - 1]?.icon;
  const profileBg = profileColors[profilePic - 1]?.background || '#e5e5e5';

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-50 h-16 bg-white/80 backdrop-blur-md border-b border-stone-200 shadow-navbar">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="font-display text-xl font-bold text-surface-900 tracking-tight hover:text-primary-600 transition-colors duration-200"
        >
          Wanderly
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
            <div className="relative ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileMenuOpen(!profileMenuOpen);
                }}
                className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary-300 transition-all duration-150"
                style={{ backgroundColor: profileBg }}
              >
                {ProfileIcon && <ProfileIcon size={18} color="#fff" />}
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-card shadow-elevated border border-surface-200 py-1 z-50">
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-surface-700 hover:bg-surface-100 transition-colors duration-150"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
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
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-3 rounded-btn text-sm font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-100 transition-colors duration-200"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
