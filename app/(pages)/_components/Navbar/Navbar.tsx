'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RxHamburgerMenu, RxCross2 } from 'react-icons/rx';
import { useRouter } from 'next/navigation';

import styles from './Navbar.module.scss';
import useToggle from '@hooks/useToggle';

interface NavLink {
  name: string;
  slug: string;
}

export default function Navbar({ navLinks }: { navLinks: NavLink[] }) {
  const {
    state: active,
    toggleState: toggleActive,
    setOff: setInactive,
  } = useToggle(false);

  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if the user and token exist in localStorage
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      setAuthenticated(true);
    } else {
      setAuthenticated(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login'); // Redirect to login
  };

  return (
    <div className={styles.relative_wrapper}>
      <div className={styles.container}>
        <h2>LOGO IMG</h2>
        <div className={styles.nav_container}>
          <div className={`${styles.links} ${active ? styles.active : null}`}>
            {navLinks.map((link) => {
              return (
                <Link key={link.slug} href={link.slug} onClick={setInactive}>
                  {link.name}
                </Link>
              );
            })}
            {/* Add Logout button conditionally */}
            {authenticated && (
              <button className={styles.logout_button} onClick={handleLogout}>
                Logout
              </button>
            )}
          </div>
          <button className={styles.menu} onClick={toggleActive}>
            {active ? <RxCross2 /> : <RxHamburgerMenu />}
          </button>
        </div>
      </div>
    </div>
  );
}
