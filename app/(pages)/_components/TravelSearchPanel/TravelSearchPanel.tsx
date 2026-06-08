'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Trip } from '@utils/typeDefs';
import { CircularProgress } from '@mui/material';
import {
  LuX,
  LuSearch,
  LuStar,
  LuPlus,
  LuMapPin,
  LuBuilding2,
  LuCompass,
  LuUtensils,
  LuRefreshCw,
} from 'react-icons/lu';

interface TravelResult {
  name: string;
  type: 'hotel' | 'activity' | 'restaurant';
  description: string;
  priceRange: string;
  rating: number;
  reviewCount: number;
  location: string;
  highlights: string[];
}

type Category = 'hotels' | 'activities' | 'restaurants';

const CATEGORIES: {
  id: Category;
  label: string;
  Icon: React.ElementType;
}[] = [
  { id: 'hotels', label: 'Hotels', Icon: LuBuilding2 },
  { id: 'activities', label: 'Activities', Icon: LuCompass },
  { id: 'restaurants', label: 'Restaurants', Icon: LuUtensils },
];

const CAT_COLORS: Record<
  Category,
  { bg: string; text: string; border: string }
> = {
  hotels: {
    bg: 'bg-blue-50',
    text: 'text-blue-500',
    border: 'border-l-blue-400',
  },
  activities: {
    bg: 'bg-accent-50',
    text: 'text-accent-500',
    border: 'border-l-accent-400',
  },
  restaurants: {
    bg: 'bg-amber-50',
    text: 'text-amber-500',
    border: 'border-l-amber-400',
  },
};

function StarRating({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <LuStar
          key={i}
          className={`w-3 h-3 ${
            i <= full
              ? 'text-amber-400 fill-amber-400'
              : 'text-stone-200 fill-stone-200'
          }`}
        />
      ))}
      <span className="text-xs font-semibold text-surface-700 ml-1">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

interface TravelSearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
}

export default function TravelSearchPanel({
  isOpen,
  onClose,
  trip,
}: TravelSearchPanelProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('hotels');
  const [results, setResults] = useState<Record<Category, TravelResult[]>>({
    hotels: [],
    activities: [],
    restaurants: [],
  });
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const loadedRef = useRef<Record<Category, boolean>>({
    hotels: false,
    activities: false,
    restaurants: false,
  });
  const router = useRouter();

  const location = trip.city
    ? `${trip.city}, ${trip.country}`
    : trip.country;

  const fetchResults = useCallback(
    async (category: Category, searchQuery = '') => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/ai/search-travel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            city: trip.city,
            country: trip.country,
            category,
            query: searchQuery,
          }),
        });
        const data = await res.json();
        if (data.results) {
          setResults((prev) => ({ ...prev, [category]: data.results }));
          loadedRef.current[category] = true;
        } else {
          setError('No results found. Try refining your search.');
        }
      } catch {
        setError('Search failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [trip.city, trip.country]
  );

  // Load on open if not yet loaded
  const handleOpen = useCallback(
    (cat: Category) => {
      if (!loadedRef.current[cat]) {
        fetchResults(cat);
      }
    },
    [fetchResults]
  );

  // Track panel open state to trigger first load
  const prevOpen = useRef(false);
  if (isOpen && !prevOpen.current) {
    prevOpen.current = true;
    handleOpen(activeCategory);
  }
  if (!isOpen) prevOpen.current = false;

  const handleCategoryChange = (cat: Category) => {
    setActiveCategory(cat);
    setQuery('');
    setError(null);
    if (!loadedRef.current[cat]) {
      fetchResults(cat);
    }
  };

  if (!isOpen) return null;

  const catColor = CAT_COLORS[activeCategory];
  const currentResults = results[activeCategory];
  const CategoryIcon =
    CATEGORIES.find((c) => c.id === activeCategory)?.Icon || LuBuilding2;

  return (
    <>
      <div className="fixed inset-0 bg-black/25 z-40" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-[580px] max-w-full bg-white shadow-elevated z-50 flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-gradient-to-r from-primary-50 to-accent-50">
          <div>
            <h3 className="font-display font-semibold text-surface-900 text-base">
              Search Hotels &amp; Activities
            </h3>
            <div className="flex items-center gap-1 text-xs text-surface-500 mt-0.5">
              <LuMapPin className="w-3 h-3" />
              <span>{location}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-btn text-surface-400 hover:text-surface-600 hover:bg-white/80 transition-colors"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex border-b border-stone-200 bg-white px-2">
          {CATEGORIES.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => handleCategoryChange(id)}
              className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium border-b-2 transition-all duration-150 ${
                activeCategory === id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-surface-500 hover:text-surface-700 hover:border-stone-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="p-3 border-b border-stone-100 bg-stone-50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              loadedRef.current[activeCategory] = false;
              fetchResults(activeCategory, query);
            }}
            className="flex gap-2"
          >
            <div className="flex-1 flex items-center gap-2 bg-white border border-stone-200 rounded-lg px-3 py-2 focus-within:border-primary-400 focus-within:ring-1 focus-within:ring-primary-200 transition-all">
              <LuSearch className="w-4 h-4 text-surface-400 flex-shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${activeCategory} in ${location}...`}
                className="flex-1 text-sm text-surface-900 placeholder-surface-400 outline-none bg-transparent"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-surface-200 text-white disabled:text-surface-400 text-sm font-semibold rounded-lg transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <CircularProgress size={28} />
              <p className="text-sm text-surface-500">
                Searching {activeCategory} in {location}...
              </p>
              <p className="text-xs text-surface-400">
                Powered by AI web search
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="p-8 text-center">
              <p className="text-sm text-surface-500 mb-3">{error}</p>
              <button
                onClick={() => fetchResults(activeCategory, query)}
                className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                <LuRefreshCw className="w-4 h-4" />
                Try again
              </button>
            </div>
          )}

          {!loading && !error && currentResults.length > 0 && (
            <div className="p-4 space-y-3">
              <p className="text-xs text-surface-400 font-medium uppercase tracking-wide">
                {currentResults.length} {activeCategory} in {location}
              </p>
              {currentResults.map((result, i) => (
                <div
                  key={i}
                  className={`bg-white rounded-xl border border-stone-200 border-l-4 ${catColor.border} hover:shadow-card transition-all duration-200 overflow-hidden`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Category icon */}
                      <div
                        className={`w-11 h-11 rounded-lg ${catColor.bg} flex items-center justify-center flex-shrink-0`}
                      >
                        <CategoryIcon
                          className={`w-5 h-5 ${catColor.text}`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Name + rating */}
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-surface-900 text-sm leading-tight">
                            {result.name}
                          </h4>
                          <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
                            <StarRating rating={result.rating} />
                            <span className="text-xs text-surface-400">
                              {result.reviewCount.toLocaleString()} reviews
                            </span>
                          </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-1 text-xs text-surface-500 mb-2">
                          <LuMapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{result.location}</span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-surface-600 leading-relaxed line-clamp-2 mb-2.5">
                          {result.description}
                        </p>

                        {/* Highlights */}
                        <div className="flex flex-wrap gap-1">
                          {result.highlights.slice(0, 4).map((h) => (
                            <span
                              key={h}
                              className="text-xs bg-stone-100 text-surface-600 px-2 py-0.5 rounded-full"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer: price + add */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100">
                      <div>
                        <span className="text-base font-bold text-surface-900">
                          {result.priceRange}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          router.push(
                            `/trips/${trip.id}/create-activity?name=${encodeURIComponent(result.name)}`
                          );
                          onClose();
                        }}
                        className="inline-flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors duration-200"
                      >
                        <LuPlus className="w-3.5 h-3.5" />
                        Add to Trip
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && currentResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                <LuSearch className="w-6 h-6 text-surface-400" />
              </div>
              <p className="text-sm font-medium text-surface-700 mb-1">
                No results yet
              </p>
              <p className="text-xs text-surface-500">
                Search for {activeCategory} in {location} above
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-stone-200 bg-stone-50">
          <p className="text-xs text-surface-400 text-center">
            Prices are estimates. Powered by AI web search.
          </p>
        </div>
      </div>
    </>
  );
}
