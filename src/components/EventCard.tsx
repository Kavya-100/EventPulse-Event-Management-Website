import React, { useState, useEffect } from 'react';
import { EventItem } from '../types/event';
import { calculateTimeRemaining } from '../utils/eventUtils';
import { ArrowRight } from 'lucide-react';

interface EventCardProps {
  event: EventItem;
  onSelectEvent: (event: EventItem) => void;
  onRegisterClick: (event: EventItem) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onSelectEvent,
  onRegisterClick,
}) => {
  const [countdown, setCountdown] = useState(() => calculateTimeRemaining(event.date));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(calculateTimeRemaining(event.date));
    }, 1000);
    return () => clearInterval(interval);
  }, [event.date]);

  const seatsLeft = Math.max(0, event.capacity - event.registeredCount);
  const fillPercent = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));
  const isSoldOut = seatsLeft <= 0;

  return (
    <article className="animate-card-enter group flex flex-col bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-2.5 hover:-translate-y-1 hover:shadow-[0_18px_38px_-16px_rgba(18,18,17,0.14)] hover:border-teal-700/35 dark:hover:border-teal-500/40 transition-all duration-300">
      {/* Gallery Matte Inset 16:10 Event Photography */}
      <div
        onClick={() => onSelectEvent(event)}
        className="relative aspect-16/10 w-full rounded-xl bg-stone-100 dark:bg-stone-800 overflow-hidden cursor-pointer"
      >
        <img
          src={event.image}
          alt={event.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-[1.04] transition-transform duration-500 ease-out"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/5 rounded-xl pointer-events-none" />
      </div>

      {/* Card Body */}
      <div className="flex-1 px-3.5 pt-4 pb-2.5 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Unboxed Category + Live Countdown Header */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-teal-800 dark:text-teal-400 truncate">
              {event.category}
            </span>
            <span className="font-mono tabular-nums text-[11px] text-stone-500 dark:text-stone-400 shrink-0">
              {countdown.formatted}
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelectEvent(event)}
            className="text-[18px] font-semibold text-stone-900 dark:text-stone-100 tracking-tight leading-[1.3] line-clamp-2 hover:text-teal-800 dark:hover:text-teal-400 transition-colors cursor-pointer"
          >
            {event.title}
          </h3>

          {/* Date & City Metadata Line */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
            <span className="shrink-0 font-medium text-stone-700 dark:text-stone-300">
              {event.formattedDate.split('·')[0].trim()}
            </span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{event.city}</span>
          </div>

          {/* Short Description */}
          <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
            {event.shortDescription}
          </p>
        </div>

        {/* Capacity & Pricing Footer */}
        <div className="pt-4 border-t border-stone-200/75 dark:border-stone-800 space-y-3.5">
          {/* Capacity Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
              <span className={isSoldOut ? 'font-semibold text-amber-800 dark:text-amber-400' : ''}>
                {isSoldOut ? 'Waitlist open · Sold Out' : `${seatsLeft} spots left`}
              </span>
              <span className="tabular-nums font-mono">{fillPercent}% booked</span>
            </div>
            <div className="w-full h-1 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  fillPercent > 90 ? 'bg-amber-600' : 'bg-teal-700 dark:bg-teal-500'
                }`}
                style={{ width: `${fillPercent}%` }}
              />
            </div>
          </div>

          {/* Pricing & Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-0.5">
            <div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400">Admission</div>
              <div className="text-base font-semibold text-stone-900 dark:text-stone-100 tabular-nums font-mono">
                {event.price === 0 ? (
                  <span className="text-teal-700 dark:text-teal-400">Free</span>
                ) : (
                  `$${event.price}`
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectEvent(event)}
                className="px-3 py-1.5 text-xs font-medium border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                aria-label={`View details for ${event.title}`}
              >
                Details
              </button>

              <button
                onClick={() => onRegisterClick(event)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                  isSoldOut
                    ? 'bg-amber-700 hover:bg-amber-800 text-white'
                    : 'bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-900'
                }`}
                aria-label={
                  isSoldOut ? `Join waitlist for ${event.title}` : `Register for ${event.title}`
                }
              >
                <span>{isSoldOut ? 'Join Waitlist' : 'Register'}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
