'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { User } from '@utils/typeDefs';
import Link from 'next/link';
import profileColors from '../_data/profileColors';
import LoadingSkeleton from '@components/LoadingSkeleton/LoadingSkeleton';

// ---------- Authenticated dashboard ----------
function Dashboard({ user }: { user: User }) {
  const router = useRouter();

  const profileColor =
    profileColors[(user.profilePic ?? 1) - 1]?.background || '#e5e5e5';
  const ProfileIcon = profileColors[(user.profilePic ?? 1) - 1]?.icon;

  const actions = [
    {
      title: 'My Trips',
      description: 'View and manage your collaborative trips',
      href: '/trips',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Activities',
      description: 'Browse all your planned activities',
      href: '/activities',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Edit Profile',
      description: 'Update your name, email, or avatar',
      href: '/edit-profile',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-8 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center shadow-card flex-shrink-0"
          style={{ backgroundColor: profileColor }}
        >
          {ProfileIcon && <ProfileIcon size={36} color="#fff" />}
        </div>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-surface-900">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-sm text-surface-500 mt-0.5">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {actions.map((action) => (
          <button
            key={action.href}
            onClick={() => router.push(action.href)}
            className="bg-white rounded-card shadow-card p-6 text-left hover:shadow-card-hover transition-all duration-200 cursor-pointer group border border-surface-200/50"
          >
            <div className="text-primary-500 mb-3 group-hover:scale-110 transition-transform duration-200 inline-block">
              {action.icon}
            </div>
            <h3 className="font-semibold text-surface-900 group-hover:text-primary-600 transition-colors duration-200">
              {action.title}
            </h3>
            <p className="text-sm text-surface-500 mt-1">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Feature card for the landing page ----------
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-card shadow-card p-6 border border-surface-200/50">
      <div className="text-primary-500 mb-3">{icon}</div>
      <h3 className="font-semibold text-surface-900 mb-1">{title}</h3>
      <p className="text-sm text-surface-500 leading-relaxed">{description}</p>
    </div>
  );
}

// ---------- Public landing page ----------
function LandingPage() {
  const features = [
    {
      title: 'Collaborative Trip Planning',
      description:
        'Create trips and invite friends with a simple join code. Everyone can contribute ideas and plan together in real time.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Activity Scheduling',
      description:
        'Add activities with dates, times, and locations. Keep your whole itinerary organized in one place.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Interactive Maps',
      description:
        'See all your destinations and activities on a map. Search for locations and pin them directly to your trip.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      title: 'Share with a Code',
      description:
        'Each trip gets a unique join code. Share it with friends so they can hop in and start contributing instantly.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
    },
    {
      title: 'Group Coordination',
      description:
        'See who\'s part of each trip, manage members, and keep everyone on the same page from departure to return.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: 'Personal Dashboard',
      description:
        'View all your trips and activities at a glance. Customize your profile and keep your travel plans organized.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-surface-900 leading-tight">
          Plan trips together,
          <br />
          <span className="text-primary-500">effortlessly.</span>
        </h1>
        <p className="mt-4 text-lg text-surface-500 max-w-2xl mx-auto leading-relaxed">
          Collaborative Planner makes it easy to organize group trips. Create an itinerary, add activities, invite friends, and keep everyone in sync — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-btn transition-colors duration-200 text-center"
          >
            Get Started — It&apos;s Free
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3 border border-surface-300 hover:border-surface-400 text-surface-700 font-semibold rounded-btn transition-colors duration-200 text-center"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Screenshot placeholder */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-surface-100 border-2 border-dashed border-surface-300 rounded-card h-64 sm:h-80 flex items-center justify-center">
          <p className="text-surface-400 text-sm">App screenshot placeholder</p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-surface-900 text-center mb-3">
          Everything you need to plan the perfect trip
        </h2>
        <p className="text-surface-500 text-center mb-10 max-w-xl mx-auto">
          From brainstorming destinations to finalizing your daily schedule, Collaborative Planner has you covered.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-t border-surface-200/60">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-surface-900 text-center mb-12">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              {
                step: '1',
                title: 'Create a Trip',
                description:
                  'Pick a destination, set the details, and get a unique join code to share.',
              },
              {
                step: '2',
                title: 'Invite Your Group',
                description:
                  'Share the join code with friends. They can hop in with one click.',
              },
              {
                step: '3',
                title: 'Plan Together',
                description:
                  'Add activities, pin locations on the map, and build your itinerary as a team.',
              },
            ].map((item) => (
              <div key={item.step}>
                <div className="w-10 h-10 rounded-full bg-primary-500 text-white font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-surface-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-surface-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-surface-900 mb-3">
          Ready to start planning?
        </h2>
        <p className="text-surface-500 mb-6">
          Create your free account and start your first trip in minutes.
        </p>
        <Link
          href="/signup"
          className="inline-block px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-btn transition-colors duration-200"
        >
          Sign Up for Free
        </Link>
      </section>
    </div>
  );
}

// ---------- Main page ----------
const IndexPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decodedToken = jwtDecode<{ exp: number } & User>(token);

        if (decodedToken.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setChecked(true);
          return;
        }

        const { id, email, firstName, lastName, profilePic } = decodedToken;
        setUser({ id, email, firstName, lastName, profilePic });
      } catch {
        localStorage.removeItem('token');
      }
    }
    setChecked(true);
  }, []);

  if (!checked) {
    return (
      <div className="max-w-4xl mx-auto w-full px-6 py-8">
        <LoadingSkeleton variant="page" />
      </div>
    );
  }

  if (user) {
    return <Dashboard user={user} />;
  }

  return <LandingPage />;
};

export default IndexPage;
