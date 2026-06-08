'use client';

import { useRouter } from 'next/navigation';
import { User } from '@utils/typeDefs';
import Link from 'next/link';
import profileColors from '../_data/profileColors';
import LoadingSkeleton from '@components/LoadingSkeleton/LoadingSkeleton';
import { useDbUser } from '@hooks/useDbUser';
import { LuGlobe, LuMapPin, LuUsers, LuCalendar, LuUser } from 'react-icons/lu';

// ---------- Time-of-day greeting ----------
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

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
      borderColor: 'border-primary-400',
      iconColor: 'text-primary-500',
      icon: <LuGlobe className="w-7 h-7" />,
    },
    {
      title: 'Activities',
      description: 'Browse all your planned activities',
      href: '/activities',
      borderColor: 'border-accent-500',
      iconColor: 'text-accent-500',
      icon: <LuCalendar className="w-7 h-7" />,
    },
    {
      title: 'Edit Profile',
      description: 'Update your name, email, or avatar',
      href: '/edit-profile',
      borderColor: 'border-amber-400',
      iconColor: 'text-amber-500',
      icon: <LuUser className="w-7 h-7" />,
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
            {getGreeting()}, {user.firstName}!
          </h1>
          <p className="text-sm text-surface-500 mt-0.5">Where to next?</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {actions.map((action) => (
          <button
            key={action.href}
            onClick={() => router.push(action.href)}
            className={`bg-white rounded-card shadow-card p-6 text-left hover:shadow-card-hover transition-all duration-200 cursor-pointer group border border-surface-200/50 border-l-4 ${action.borderColor}`}
          >
            <div
              className={`${action.iconColor} mb-3 group-hover:scale-110 transition-transform duration-200 inline-block`}
            >
              {action.icon}
            </div>
            <h3 className="font-semibold text-surface-900 group-hover:text-primary-600 transition-colors duration-200">
              {action.title}
            </h3>
            <p className="text-sm text-surface-500 mt-1">
              {action.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Public landing page ----------
function LandingPage() {
  const features = [
    {
      title: 'Create a trip, invite your crew',
      description:
        'Set up a trip in seconds and share a join code with friends.',
      borderColor: 'border-primary-400',
      iconColor: 'text-primary-500',
      icon: <LuGlobe className="w-6 h-6" />,
    },
    {
      title: 'Pin activities on a shared map',
      description:
        'Search for places and pin them so everyone can see the plan.',
      borderColor: 'border-accent-500',
      iconColor: 'text-accent-500',
      icon: <LuMapPin className="w-6 h-6" />,
    },
    {
      title: 'Vote and finalize together',
      description:
        'Your whole group can weigh in, so the best ideas rise to the top.',
      borderColor: 'border-amber-400',
      iconColor: 'text-amber-500',
      icon: <LuUsers className="w-6 h-6" />,
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-8 right-12 w-64 h-64 bg-primary-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-32 right-48 w-48 h-48 bg-accent-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-16 right-32 w-36 h-36 bg-amber-300/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-2xl">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-surface-900 leading-tight">
            Plan your next adventure{' '}
            <span className="text-primary-500">together.</span>
          </h1>
          <p className="mt-5 text-lg text-surface-500 leading-relaxed">
            Wanderly helps friend groups build trip itineraries without the
            endless group chat chaos. Create a trip, invite your crew, and plan
            it all in one place.
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-8">
            <Link
              href="/signup"
              className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-btn transition-colors duration-200"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="text-surface-600 hover:text-surface-900 font-medium transition-colors duration-200"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Feature blurbs */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`pl-5 border-l-4 ${feature.borderColor}`}
            >
              <div className={`${feature.iconColor} mb-2`}>{feature.icon}</div>
              <h3 className="font-semibold text-surface-900 mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-surface-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-primary-50 border-t border-primary-100">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-surface-900 mb-3">
            Your friends are waiting.
          </h2>
          <p className="text-surface-500 mb-6">
            Start planning your next trip together — it only takes a minute.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-btn transition-colors duration-200"
          >
            Sign Up Free
          </Link>
        </div>
      </section>
    </div>
  );
}

// ---------- Main page ----------
const IndexPage = () => {
  const { dbUser, loading } = useDbUser();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto w-full px-6 py-8">
        <LoadingSkeleton variant="page" />
      </div>
    );
  }

  if (dbUser) {
    return <Dashboard user={dbUser} />;
  }

  return <LandingPage />;
};

export default IndexPage;
