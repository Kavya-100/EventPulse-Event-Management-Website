import React, { useState, useEffect } from 'react';
import { EventItem, EventCategory } from '../types/event';
import { HERO_EVENT_IMAGE } from '../data/eventImages';
import {
  calculateTimeRemaining,
  addRecentSearch,
  removeRecentSearch,
  loadRecentSearchesFromStorage,
  saveRecentSearchesToStorage,
} from '../utils/eventUtils';
import { Search, ArrowRight, MapPin, Calendar, History, X } from 'lucide-react';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
  onExploreClick: () => void;
  onQuickFilter?: (update: { category?: EventCategory; priceFilter?: 'All' | 'Free' | 'Paid'; location?: string }) => void;
  marqueeEvent?: EventItem;
  onSelectFeaturedEvent?: (event: EventItem) => void;
  catalogStats?: {
    totalEvents: number;
    cityCount: number;
    freeEventsCount: number;
    savedPassesCount: number;
  };
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onQuickFilter,
  marqueeEvent,
  onSelectFeaturedEvent,
  catalogStats,
}) => {
  const targetDate = marqueeEvent?.date || '2026-11-28T16:30:00-05:00';
  const [countdown, setCountdown] = useState(() => calculateTimeRemaining(targetDate));
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    loadRecentSearchesFromStorage()
  );

  useEffect(() => {
    setCountdown(calculateTimeRemaining(targetDate));
    const timer = setInterval(() => {
      setCountdown(calculateTimeRemaining(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const persistQuery = (rawQuery: string) => {
    const trimmed = rawQuery.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const updated = addRecentSearch(trimmed, prev);
      saveRecentSearchesToStorage(updated);
      return updated;
    });
  };

  const handleSubmitSearch = () => {
    persistQuery(searchQuery);
    onSearchSubmit();
  };

  const handleSelectRecentSearch = (term: string) => {
    onSearchChange(term);
    persistQuery(term);
    onSearchSubmit();
  };

  const handleRemoveRecentSearch = (term: string) => {
    setRecentSearches((prev) => {
      const updated = removeRecentSearch(term, prev);
      saveRecentSearchesToStorage(updated);
      return updated;
    });
  };

  const handleClearRecentSearches = () => {
    setRecentSearches([]);
    saveRecentSearchesToStorage([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmitSearch();
    }
  };

  const quickShortcuts: Array<{
    label: string;
    action: () => void;
  }> = [
    {
      label: 'Free Entry',
      action: () => onQuickFilter?.({ category: 'All', priceFilter: 'Free', location: 'All' }),
    },
    {
      label: 'Music & Concerts',
      action: () => onQuickFilter?.({ category: 'Music & Concerts', priceFilter: 'All', location: 'All' }),
    },
    {
      label: 'Design & Arts',
      action: () => onQuickFilter?.({ category: 'Design & Arts', priceFilter: 'All', location: 'All' }),
    },
    {
      label: 'Europe',
      action: () => onQuickFilter?.({ category: 'All', priceFilter: 'All', location: 'region:Europe' }),
    },
  ];

  const seatsLeft = marqueeEvent
    ? Math.max(0, marqueeEvent.capacity - marqueeEvent.registeredCount)
    : 160;

  return (
    <section
      id="hero"
      className="editorial-hero-wash relative pt-12 pb-14 md:pt-16 md:pb-16 overflow-hidden border-b border-stone-200/80 dark:border-stone-800/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Asymmetric Two-Column Editorial Lead */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Masthead Statement, Search, and Quick Filters */}
          <div className="lg:col-span-7 space-y-6 animate-fade-in">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium text-teal-800 dark:text-teal-400">
                <span>Fall &amp; Winter 2026</span>
                <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">/</span>
                <span className="text-stone-600 dark:text-stone-400">
                  Open Cultural &amp; Tech Calendar
                </span>
              </div>
              <div className="w-12 h-[1.5px] bg-amber-700/60 dark:bg-amber-400/60" aria-hidden="true" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[4rem] font-semibold tracking-tight text-stone-900 dark:text-stone-100 leading-[1.04] text-balance max-w-2xl">
              Gatherings <em className="italic font-medium text-teal-800 dark:text-teal-400">worth</em> showing up for.
            </h1>

            <p className="text-base sm:text-[17px] text-stone-600 dark:text-stone-300 max-w-xl leading-relaxed">
              Independent conferences, open-air sets, community runs, and intimate workshops—complete with speaker schedules, live seat counts, venue maps, and QR passes stored locally on your device.
            </p>

            {/* Elevated Architectural Search Bar */}
            <div className="pt-1 space-y-3.5">
              <div className="flex flex-col sm:flex-row items-stretch gap-2 p-1.5 bg-white dark:bg-stone-900 rounded-xl border border-stone-300/90 dark:border-stone-700 max-w-xl shadow-[0_10px_30px_-14px_rgba(20,20,19,0.14)] focus-within:border-teal-700 dark:focus-within:border-teal-500 transition-colors">
                <div className="relative flex-1 flex items-center pl-3">
                  <Search className="w-4 h-4 text-stone-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search by title, city, or venue..."
                    className="w-full px-3 py-2 text-sm bg-transparent text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none"
                    aria-label="Search events"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSubmitSearch}
                  className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 text-white transition-all flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer shadow-xs"
                >
                  <span>Search</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Recent Searches (Last 3 Queries Stored in localStorage) */}
              {recentSearches.length > 0 && (
                <div
                  data-testid="hero-recent-searches"
                  className="flex flex-wrap items-center gap-2 text-xs max-w-xl"
                >
                  <span className="inline-flex items-center gap-1.5 font-medium text-stone-600 dark:text-stone-400">
                    <History className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 shrink-0" />
                    <span>Recent searches:</span>
                  </span>
                  {recentSearches.map((term) => (
                    <div
                      key={term}
                      className="inline-flex items-center rounded-md border border-stone-200/90 dark:border-stone-700/80 bg-white/90 dark:bg-stone-900/90 hover:border-teal-700/50 dark:hover:border-teal-500/50 shadow-2xs transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectRecentSearch(term)}
                        aria-label={`Search for recent query ${term}`}
                        className="pl-2.5 pr-1.5 py-1 text-xs font-medium text-stone-700 dark:text-stone-200 hover:text-teal-800 dark:hover:text-teal-300 transition-colors cursor-pointer max-w-[180px] truncate"
                      >
                        {term}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveRecentSearch(term)}
                        aria-label={`Remove recent search ${term}`}
                        className="pr-1.5 pl-0.5 py-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleClearRecentSearches}
                    className="ml-0.5 text-[11px] font-medium text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Functional Quick-Jump Editorial Index */}
              <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-xs text-stone-500 dark:text-stone-400">
                <span className="font-medium text-stone-700 dark:text-stone-300">Quick filters:</span>
                {quickShortcuts.map((shortcut, index) => (
                  <React.Fragment key={shortcut.label}>
                    <button
                      type="button"
                      onClick={shortcut.action}
                      className="text-stone-600 dark:text-stone-300 hover:text-teal-800 dark:hover:text-teal-400 hover:underline underline-offset-4 transition-colors cursor-pointer"
                    >
                      {shortcut.label}
                    </button>
                    {index < quickShortcuts.length - 1 && (
                      <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">·</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Gallery-Framed Spotlight Placard */}
          <div className="lg:col-span-5 animate-card-enter">
            <div className="p-2.5 rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 shadow-[0_24px_60px_-24px_rgba(17,17,16,0.18)] group">
              <div className="relative aspect-16/10 rounded-xl bg-stone-200 dark:bg-stone-800 overflow-hidden">
                <img
                  src={marqueeEvent?.image || HERO_EVENT_IMAGE}
                  alt={marqueeEvent?.title || 'Spotlight upcoming event'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                />
                {/* Measured Scrim anchored cleanly at lower edge */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between gap-3 text-white">
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium text-stone-100 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-teal-300 shrink-0" />
                      <span className="truncate">
                        {marqueeEvent ? `${marqueeEvent.venue} · ${marqueeEvent.city}` : 'San Francisco, CA'}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono tabular-nums font-semibold text-white shrink-0">
                    {marqueeEvent ? (marqueeEvent.price === 0 ? 'Free' : `$${marqueeEvent.price}`) : '$45'}
                  </span>
                </div>
              </div>

              <div className="px-3.5 pt-4 pb-2.5 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-amber-800 dark:text-amber-400">
                      Next Spotlight Gathering
                    </span>
                    <span className="text-stone-500 dark:text-stone-400 font-mono tabular-nums text-[11px]">
                      {seatsLeft} spots left
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight leading-snug">
                    {marqueeEvent?.title || 'Timber & Strings Sunset Folk Festival'}
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{marqueeEvent ? marqueeEvent.formattedDate : 'Sat, Nov 28, 2026 · 4:30 PM EST'}</span>
                  </p>
                </div>

                {/* Tabular Live Countdown Strip */}
                <div className="pt-3.5 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-3">
                  <div
                    data-testid="hero-live-countdown"
                    className="grid grid-cols-4 gap-2 text-center"
                  >
                    <div className="px-2.5 py-1.5 rounded-lg bg-[#FBF9F4] dark:bg-stone-800/70 border border-stone-200/80 dark:border-stone-700/60">
                      <div className="text-sm font-semibold font-mono tabular-nums text-stone-900 dark:text-stone-100">
                        {countdown.days}
                      </div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400">Days</div>
                    </div>
                    <div className="px-2.5 py-1.5 rounded-lg bg-[#FBF9F4] dark:bg-stone-800/70 border border-stone-200/80 dark:border-stone-700/60">
                      <div className="text-sm font-semibold font-mono tabular-nums text-stone-900 dark:text-stone-100">
                        {countdown.hours}
                      </div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400">Hrs</div>
                    </div>
                    <div className="px-2.5 py-1.5 rounded-lg bg-[#FBF9F4] dark:bg-stone-800/70 border border-stone-200/80 dark:border-stone-700/60">
                      <div className="text-sm font-semibold font-mono tabular-nums text-stone-900 dark:text-stone-100">
                        {countdown.minutes}
                      </div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400">Min</div>
                    </div>
                    <div className="px-2.5 py-1.5 rounded-lg bg-teal-50/80 dark:bg-teal-950/50 border border-teal-200/80 dark:border-teal-800/60">
                      <div className="text-sm font-semibold font-mono tabular-nums text-teal-800 dark:text-teal-400">
                        {countdown.seconds}
                      </div>
                      <div className="text-[10px] text-teal-700 dark:text-teal-400">Sec</div>
                    </div>
                  </div>

                  {marqueeEvent && onSelectFeaturedEvent && (
                    <button
                      type="button"
                      onClick={() => onSelectFeaturedEvent(marqueeEvent)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-900 text-xs font-semibold transition-colors cursor-pointer shrink-0 whitespace-nowrap shadow-xs"
                    >
                      <span>View Event</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Structured Hairline-Divided Catalog Ledger Strip */}
        <div className="mt-14 border-t border-stone-200/80 dark:border-stone-800/80 pt-7 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-stone-200/80 dark:divide-stone-800">
          <div className="md:pr-6 space-y-1">
            <div className="text-2xl sm:text-3xl font-semibold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
              {catalogStats?.totalEvents ?? 6}
            </div>
            <div className="text-xs font-medium text-stone-800 dark:text-stone-200">
              Scheduled Events
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400">
              Curated &amp; host-published listings
            </div>
          </div>
          <div className="md:px-6 space-y-1">
            <div className="text-2xl sm:text-3xl font-semibold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
              {catalogStats?.cityCount ?? 6}
            </div>
            <div className="text-xs font-medium text-stone-800 dark:text-stone-200">
              Host Cities
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400">
              North America &amp; Europe
            </div>
          </div>
          <div className="md:px-6 space-y-1">
            <div className="text-2xl sm:text-3xl font-semibold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
              {catalogStats?.freeEventsCount ?? 1}
            </div>
            <div className="text-xs font-medium text-stone-800 dark:text-stone-200">
              Free-Entry Gatherings
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400">
              Open community passes
            </div>
          </div>
          <div className="md:pl-6 space-y-1">
            <div className="text-2xl sm:text-3xl font-semibold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
              {catalogStats?.savedPassesCount ?? 0}
            </div>
            <div className="text-xs font-medium text-stone-800 dark:text-stone-200">
              Passes Saved on Device
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400">
              Stored privately in browser
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
