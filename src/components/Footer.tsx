import React, { useState } from 'react';
import { Mail, Check } from 'lucide-react';

interface FooterProps {
  onNavigateSection: (sectionId: string) => void;
  onOpenDocs: () => void;
  onOpenMyTickets: () => void;
  onOpenCreateEvent: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateSection,
  onOpenDocs,
  onOpenMyTickets,
  onOpenCreateEvent,
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !/^\S+@\S+\.\S+$/.test(newsletterEmail)) {
      setNewsletterError('Please enter a valid email address');
      return;
    }
    setNewsletterError('');
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setNewsletterEmail('');
    }, 4000);
  };

  return (
    <footer className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-3.5">
            <div
              className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Event<em className="italic font-medium text-teal-800 dark:text-teal-400">Pulse</em>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 max-w-sm leading-relaxed">
              An independent directory for conferences, live concerts, community runs, and neighborhood workshops. Passes and reminders stay stored privately in your browser.
            </p>
            <p className="text-xs font-medium text-stone-700 dark:text-stone-300 pt-0.5">
              Website Designer, Maker &amp; Owner:{' '}
              <span className="text-stone-900 dark:text-white font-semibold underline decoration-amber-700/40 underline-offset-4">
                Mr. Kavya Kaushal
              </span>
            </p>
          </div>

          {/* Explore Links */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-100">Explore</h4>
            <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-400">
              <li>
                <button
                  onClick={() => onNavigateSection('events-catalog')}
                  className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-pointer"
                >
                  All Events
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection('featured-events')}
                  className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-pointer"
                >
                  Featured Lineup
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenMyTickets}
                  className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-pointer"
                >
                  My Tickets
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenCreateEvent}
                  className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-pointer"
                >
                  Host an Event
                </button>
              </li>
            </ul>
          </div>

          {/* Guide & Docs */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-100">Guide</h4>
            <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-400">
              <li>
                <button
                  onClick={onOpenDocs}
                  className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-pointer"
                >
                  Project README
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenDocs}
                  className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-pointer"
                >
                  Platform Guide
                </button>
              </li>
            </ul>
          </div>

          {/* Weekly Dispatch */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-100">
              Weekly Dispatch
            </h4>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              One Friday note with new city listings and open registrations. No spam.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-teal-700"
                    aria-label="Email for newsletter updates"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-900 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  {subscribed ? <Check className="w-3.5 h-3.5" /> : <span>Subscribe</span>}
                </button>
              </div>
              {newsletterError && <div className="text-[11px] text-red-500">{newsletterError}</div>}
              {subscribed && (
                <div className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">
                  You&apos;re on the list for Friday dispatches.
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Quiet Copyright & Maker Credit Line */}
        <div className="pt-6 border-t border-stone-200/70 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 dark:text-stone-400">
          <div>
            © {new Date().getFullYear()} EventPulse · Owned by Mr. Kavya Kaushal
          </div>
          <div>Designed &amp; Made by Mr. Kavya Kaushal</div>
        </div>
      </div>
    </footer>
  );
};
