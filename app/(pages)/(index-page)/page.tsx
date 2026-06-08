'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@utils/typeDefs';
import Link from 'next/link';
import profileColors from '../_data/profileColors';
import LoadingSkeleton from '@components/LoadingSkeleton/LoadingSkeleton';
import { useDbUser } from '@hooks/useDbUser';
import {
  LuGlobe,
  LuCalendar,
  LuUser,
  LuSearch,
  LuMapPin,
  LuThumbsUp,
  LuArrowRight,
} from 'react-icons/lu';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// ---------- Authenticated dashboard ----------
function Dashboard({ user }: { user: User }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const profileColor =
    profileColors[(user.profilePic ?? 1) - 1]?.background || '#e5e5e5';
  const ProfileIcon = profileColors[(user.profilePic ?? 1) - 1]?.icon;

  const handleSearch = () => {
    const dest = searchQuery.trim();
    router.push(
      dest
        ? `/trips/create?destination=${encodeURIComponent(dest)}`
        : '/trips/create'
    );
  };

  const actions = [
    {
      title: 'My Trips',
      description: 'View and manage your collaborative trips',
      href: '/trips',
      borderColor: 'border-primary-400',
      iconColor: 'text-primary-500',
      bgColor: 'bg-primary-50',
      icon: <LuGlobe className="w-6 h-6" />,
    },
    {
      title: 'Activities',
      description: 'Browse all your planned activities',
      href: '/activities',
      borderColor: 'border-accent-500',
      iconColor: 'text-accent-500',
      bgColor: 'bg-accent-50',
      icon: <LuCalendar className="w-6 h-6" />,
    },
    {
      title: 'Edit Profile',
      description: 'Update your name, email, or avatar',
      href: '/edit-profile',
      borderColor: 'border-amber-400',
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50',
      icon: <LuUser className="w-6 h-6" />,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-8 animate-fade-in">
      <div className="flex items-center gap-4 mb-7">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-card flex-shrink-0"
          style={{ backgroundColor: profileColor }}
        >
          {ProfileIcon && <ProfileIcon size={32} color="#fff" />}
        </div>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-surface-900">
            {getGreeting()}, {user.firstName}!
          </h1>
          <p className="text-sm text-surface-500 mt-0.5">Where to next?</p>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl shadow-card p-2 flex gap-2 mb-7">
        <div className="flex-1 flex items-center gap-3 px-4 py-2.5">
          <LuSearch className="w-5 h-5 text-surface-400 flex-shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Plan a new trip. Where are you going?"
            className="flex-1 text-surface-800 placeholder-surface-400 outline-none text-sm bg-transparent"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
        >
          Plan Trip
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {actions.map((action) => (
          <button
            key={action.href}
            onClick={() => router.push(action.href)}
            className={`bg-white rounded-card shadow-card p-5 text-left hover:shadow-card-hover transition-all duration-200 cursor-pointer group border border-surface-200/50 border-l-4 ${action.borderColor}`}
          >
            <div
              className={`w-10 h-10 rounded-lg ${action.bgColor} ${action.iconColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}
            >
              {action.icon}
            </div>
            <h3 className="font-semibold text-surface-900 group-hover:text-primary-600 transition-colors duration-200 text-sm">
              {action.title}
            </h3>
            <p className="text-xs text-surface-500 mt-1 leading-relaxed">
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
  const router = useRouter();
  const [destination, setDestination] = useState('');

  const handleSearch = (dest?: string) => {
    const d = (dest ?? destination).trim();
    router.push(d ? `/signup?destination=${encodeURIComponent(d)}` : '/signup');
  };

  const popularDestinations = [
    'Paris',
    'Tokyo',
    'Bali',
    'New York',
    'Barcelona',
    'Rome',
  ];

  return (
    <div className="animate-fade-in">
      {/* ── Hero ── */}
      <section className="relative bg-surface-900 min-h-[540px] flex items-center overflow-hidden">
        {/* Subtle grain texture */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: '200px 200px',
          }}
        />
        {/* Orange accent glow, top-right */}
        <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 py-24 w-full">
          <h1 className="font-display text-5xl sm:text-[3.75rem] font-bold text-white leading-[1.08] tracking-tight mb-5">
            Trip planning
            <br />
            without the chaos.
          </h1>
          <p className="text-lg text-white/60 max-w-sm mb-10 leading-relaxed">
            Search hotels, restaurants, and activities with live prices. Plan
            with your group. Skip the spreadsheet.
          </p>

          {/* Search */}
          <div className="bg-white rounded-xl p-1.5 flex gap-2 max-w-lg shadow-2xl">
            <div className="flex-1 flex items-center gap-3 px-4 py-3">
              <LuSearch className="w-4 h-4 text-surface-400 flex-shrink-0" />
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Where do you want to go?"
                className="flex-1 text-surface-900 placeholder-surface-400 outline-none text-sm bg-transparent"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors text-sm whitespace-nowrap"
            >
              Search
            </button>
          </div>

          {/* Popular — plain text, no emojis */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-6">
            <span className="text-white/30 text-sm">Try:</span>
            {popularDestinations.map((dest) => (
              <button
                key={dest}
                onClick={() => handleSearch(dest)}
                className="text-white/50 hover:text-white/90 text-sm transition-colors duration-150 underline underline-offset-2 decoration-white/20 hover:decoration-white/50"
              >
                {dest}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── What it actually does ── */}
      <section className="bg-white py-20 border-b border-stone-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xs font-bold text-primary-500 uppercase tracking-widest">
              What it does
            </span>
          </div>

          <div className="divide-y divide-stone-100">
            {/* Feature 1 — Search with real prices */}
            <div className="py-12 grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
              <div className="sm:pr-8">
                <div className="flex items-center gap-2.5 mb-3">
                  <LuSearch className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <h3 className="font-display text-2xl font-bold text-surface-900">
                    Search with live prices
                  </h3>
                </div>
                <p className="text-surface-500 leading-relaxed text-[15px]">
                  Hotels, restaurants, and activities with prices pulled from
                  the web when you search. Not estimates made up at build time.
                  Actual results for the city you&apos;re visiting, not
                  estimates.
                </p>
              </div>

              {/* Mock search result — illustrates real output format */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-2">
                <p className="text-xs text-surface-400 font-medium mb-3">
                  Example: Hotels in Paris, France
                </p>
                {[
                  {
                    name: 'Hotel Lutetia',
                    detail: 'Saint-Germain-des-Pres',
                    price: '$320/night',
                    score: '4.8',
                  },
                  {
                    name: 'Hotel des Grands Boulevards',
                    detail: '2nd Arrondissement',
                    price: '$190/night',
                    score: '4.6',
                  },
                  {
                    name: 'Generator Paris',
                    detail: 'Republique',
                    price: '$55/night',
                    score: '4.3',
                  },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between bg-white rounded-lg px-3 py-2.5 border border-stone-100"
                  >
                    <div className="min-w-0 mr-3">
                      <p className="text-sm font-semibold text-surface-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-surface-400 mt-0.5">
                        {item.detail}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-primary-600">
                        {item.price}
                      </p>
                      <p className="text-xs text-surface-400 mt-0.5">
                        {item.score} / 5
                      </p>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-surface-300 text-right pt-1">
                  via AI web search
                </p>
              </div>
            </div>

            {/* Feature 2 — Shared map */}
            <div className="py-12 grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
              <div className="sm:pr-8">
                <div className="flex items-center gap-2.5 mb-3">
                  <LuMapPin className="w-4 h-4 text-accent-500 flex-shrink-0" />
                  <h3 className="font-display text-2xl font-bold text-surface-900">
                    One map, whole crew
                  </h3>
                </div>
                <p className="text-surface-500 leading-relaxed text-[15px]">
                  Every activity your group adds shows up on a shared map with
                  pins. Click a pin, see the details. No more "wait, which hotel
                  are we staying at?" in the group chat.
                </p>
              </div>

              {/* Mock map activity list */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl overflow-hidden">
                <div className="bg-stone-200 h-24 flex items-center justify-center">
                  <p className="text-xs text-stone-400 font-medium">
                    Shared map view
                  </p>
                </div>
                <div className="p-3 space-y-1.5">
                  {[
                    {
                      name: 'Colosseum',
                      time: '9:00 AM',
                      color: 'bg-primary-400',
                    },
                    {
                      name: 'Trastevere lunch',
                      time: '1:00 PM',
                      color: 'bg-accent-400',
                    },
                    {
                      name: 'Pantheon',
                      time: '3:30 PM',
                      color: 'bg-amber-400',
                    },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-2.5 bg-white rounded-lg px-3 py-2 border border-stone-100"
                    >
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${item.color}`}
                      />
                      <span className="text-sm text-surface-800 font-medium flex-1 truncate">
                        {item.name}
                      </span>
                      <span className="text-xs text-surface-400">
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature 3 — Voting */}
            <div className="py-12 grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
              <div className="sm:pr-8">
                <div className="flex items-center gap-2.5 mb-3">
                  <LuThumbsUp className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <h3 className="font-display text-2xl font-bold text-surface-900">
                    Vote, don&apos;t argue
                  </h3>
                </div>
                <p className="text-surface-500 leading-relaxed text-[15px]">
                  Everyone votes on each activity. The itinerary builds itself
                  from what the group actually wants. No one has to be the
                  decision maker.
                </p>
              </div>

              {/* Mock vote results */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                <p className="text-xs text-surface-400 font-medium mb-4">
                  Group votes · 4 members
                </p>
                <div className="space-y-3">
                  {[
                    { name: 'Colosseum tour', votes: 4, total: 4 },
                    { name: 'Vatican Museums', votes: 3, total: 4 },
                    { name: 'Borghese Gallery', votes: 3, total: 4 },
                    { name: 'Trastevere food walk', votes: 2, total: 4 },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <span className="text-xs text-surface-700 truncate w-36">
                        {item.name}
                      </span>
                      <div className="flex-1 bg-stone-200 rounded-full h-1.5">
                        <div
                          className="bg-primary-400 h-1.5 rounded-full transition-all"
                          style={{
                            width: `${(item.votes / item.total) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-surface-400 w-8 text-right tabular-nums">
                        {item.votes}/{item.total}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-stone-50 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-surface-900 mb-4">
            Start planning.
          </h2>
          <p className="text-surface-500 mb-8 text-lg">
            Free. No credit card. Takes about a minute.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Create a free account
              <LuArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="text-surface-500 hover:text-surface-800 text-sm transition-colors"
            >
              Already have an account
            </Link>
          </div>
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
