import React, { useMemo } from 'react';
import { FilterState, EventCategory, EventItem } from '../types/event';
import { extractLocationOptions, formatLocationFilterLabel } from '../utils/eventUtils';
import { Search, X, SlidersHorizontal, RotateCcw, MapPin } from 'lucide-react';

interface EventFiltersProps {
  filters: FilterState;
  events: EventItem[];
  onChange: (updated: Partial<FilterState>) => void;
  onReset: () => void;
  totalResultsCount: number;
}

const CATEGORIES: EventCategory[] = [
  'All',
  'Technology',
  'Music & Concerts',
  'Business & Leadership',
  'Design & Arts',
  'Sports & Wellness',
  'Culinary & Culture',
];

export const EventFilters: React.FC<EventFiltersProps> = ({
  filters,
  events,
  onChange,
  onReset,
  totalResultsCount,
}) => {
  const { cities, regions } = useMemo(() => extractLocationOptions(events), [events]);

  const isFiltered = Boolean(
    filters.search ||
    filters.category !== 'All' ||
    filters.location !== 'All' ||
    filters.priceFilter !== 'All' ||
    filters.sortBy !== 'upcoming'
  );

  return (
    <div className="space-y-5">
      {/* Unified Baseline Toolbar: Search, Location, Price Switcher, Sort */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input with Clear Button */}
        <div className="relative flex-1 lg:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Search by title, city, venue, or speaker..."
            className="w-full h-10 pl-10 pr-9 text-sm bg-white dark:bg-stone-900 border border-stone-300/90 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-teal-700 dark:focus:border-teal-500 transition-colors"
            aria-label="Filter events by keyword"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onChange({ search: '' })}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Location, Price & Sort Selectors */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Location (City / Region) Filter */}
          <div className="relative flex items-center">
            <label htmlFor="location-select" className="sr-only">Filter by Location</label>
            <div className="h-10 flex items-center gap-2 px-3 bg-white dark:bg-stone-900 border border-stone-300/90 dark:border-stone-700 rounded-lg text-xs font-medium text-stone-700 dark:text-stone-300">
              <MapPin className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 shrink-0" />
              <select
                id="location-select"
                value={filters.location}
                onChange={(e) => onChange({ location: e.target.value })}
                className="bg-transparent border-none text-xs text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer max-w-[165px]"
                aria-label="Filter events by location"
              >
                <option value="All">All Locations</option>
                {regions.length > 0 && (
                  <optgroup label="Regions">
                    {regions.map((region) => (
                      <option key={`region:${region}`} value={`region:${region}`}>
                        {region}
                      </option>
                    ))}
                  </optgroup>
                )}
                {cities.length > 0 && (
                  <optgroup label="Cities">
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          </div>

          {/* Price Segmented Filter */}
          <div className="h-10 flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 text-xs">
            {(['All', 'Free', 'Paid'] as const).map((price) => (
              <button
                key={price}
                type="button"
                onClick={() => onChange({ priceFilter: price })}
                className={`h-full px-3 font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  filters.priceFilter === price
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-2xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {price === 'All' ? 'All Prices' : price}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex items-center">
            <label htmlFor="sort-select" className="sr-only">Sort Events</label>
            <div className="h-10 flex items-center gap-2 px-3 bg-white dark:bg-stone-900 border border-stone-300/90 dark:border-stone-700 rounded-lg text-xs font-medium text-stone-700 dark:text-stone-300">
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <select
                id="sort-select"
                value={filters.sortBy}
                onChange={(e) => onChange({ sortBy: e.target.value as FilterState['sortBy'] })}
                className="bg-transparent border-none text-xs text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer"
              >
                <option value="upcoming">Upcoming Date</option>
                <option value="popular">Most Popular</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              type="button"
              onClick={onReset}
              className="h-10 inline-flex items-center gap-1.5 px-3 text-xs font-medium text-teal-800 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              aria-label="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Editorial Underline Category Tab Strip */}
      <div className="border-b border-stone-200 dark:border-stone-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar scroll-smooth -mb-px">
          {CATEGORIES.map((cat) => {
            const isActive = filters.category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onChange({ category: cat })}
                className={`py-2.5 text-xs whitespace-nowrap transition-colors cursor-pointer shrink-0 border-b-2 ${
                  isActive
                    ? 'border-teal-700 dark:border-teal-400 text-stone-950 dark:text-white font-semibold'
                    : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 font-medium'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="hidden md:block text-xs text-stone-500 dark:text-stone-400 shrink-0 pb-2">
          Showing <span className="font-semibold text-stone-900 dark:text-stone-100 tabular-nums font-mono">{totalResultsCount}</span> {totalResultsCount === 1 ? 'event' : 'events'}
          {filters.category !== 'All' && <span> in <strong className="text-stone-800 dark:text-stone-200">{filters.category}</strong></span>}
          {filters.location !== 'All' && <span> near <strong className="text-stone-800 dark:text-stone-200">{formatLocationFilterLabel(filters.location)}</strong></span>}
          {filters.search && <span> matching &ldquo;<strong className="text-stone-800 dark:text-stone-200">{filters.search}</strong>&rdquo;</span>}
        </div>
      </div>

      {/* Mobile Results Count Line */}
      <div className="md:hidden text-xs text-stone-500 dark:text-stone-400">
        Showing <span className="font-semibold text-stone-900 dark:text-stone-100 tabular-nums font-mono">{totalResultsCount}</span> {totalResultsCount === 1 ? 'event' : 'events'}
        {filters.category !== 'All' && <span> in <strong className="text-stone-800 dark:text-stone-200">{filters.category}</strong></span>}
        {filters.location !== 'All' && <span> near <strong className="text-stone-800 dark:text-stone-200">{formatLocationFilterLabel(filters.location)}</strong></span>}
        {filters.search && <span> matching &ldquo;<strong className="text-stone-800 dark:text-stone-200">{filters.search}</strong>&rdquo;</span>}
      </div>
    </div>
  );
};
