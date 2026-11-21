import React, { useState, useEffect, useRef } from 'react';
import {
  Ticket,
  Plus,
  Sun,
  Moon,
  Menu,
  X,
  LogIn,
  LogOut,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { AuthSessionUser } from '../types/event';
import { formatProviderLabel } from '../utils/eventUtils';
import { ThemePreviewPopover } from './ThemePreviewPopover';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  myTicketsCount: number;
  userTicketsCount: number;
  customEventsCount: number;
  currentUser: AuthSessionUser | null;
  onOpenMyTickets: () => void;
  onOpenMyAnalytics: () => void;
  onOpenCreateEvent: () => void;
  onOpenDocs: () => void;
  onOpenAuthModal: () => void;
  onSignOut: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleDarkMode,
  myTicketsCount,
  userTicketsCount,
  customEventsCount,
  currentUser,
  onOpenMyTickets,
  onOpenMyAnalytics,
  onOpenCreateEvent,
  onOpenDocs,
  onOpenAuthModal,
  onSignOut,
  onNavigateSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!accountMenuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAccountMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [accountMenuOpen]);

  const handleNavClick = (sectionId: string) => {
    onNavigateSection(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#FBF9F4]/88 dark:bg-[#111110]/88 border-b border-stone-200/80 dark:border-stone-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Signature Editorial Wordmark */}
        <button
          onClick={() => handleNavClick('hero')}
          className="text-left text-[22px] font-semibold tracking-tight text-stone-900 dark:text-stone-100 whitespace-nowrap shrink-0 hover:opacity-85 transition-opacity cursor-pointer"
          style={{ fontFamily: 'var(--font-heading)' }}
          aria-label="EventPulse Home"
        >
          Event<em className="italic font-medium text-teal-800 dark:text-teal-400">Pulse</em>
        </button>

        {/* Zone 2: Clean typographic navigation links with poised underlines */}
        <nav className="hidden lg:flex items-center gap-7 text-[13px] font-medium text-stone-600 dark:text-stone-300">
          <button
            onClick={() => handleNavClick('events-catalog')}
            className="relative py-1 hover:text-stone-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 hover:after:w-full after:bg-teal-700 dark:after:bg-teal-400 after:transition-all after:duration-200"
          >
            Browse Events
          </button>
          <button
            onClick={() => handleNavClick('featured-events')}
            className="relative py-1 hover:text-stone-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 hover:after:w-full after:bg-teal-700 dark:after:bg-teal-400 after:transition-all after:duration-200"
          >
            Featured
          </button>
          <button
            onClick={onOpenMyTickets}
            className="relative py-1 hover:text-stone-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1 after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 hover:after:w-full after:bg-teal-700 dark:after:bg-teal-400 after:transition-all after:duration-200"
            aria-label={`My Tickets, ${myTicketsCount} tickets`}
          >
            <span>My Tickets</span>
            {myTicketsCount > 0 && (
              <span className="text-xs font-mono tabular-nums font-semibold text-teal-700 dark:text-teal-400">
                ({myTicketsCount})
              </span>
            )}
          </button>
          <button
            onClick={onOpenMyAnalytics}
            className="relative py-1 hover:text-stone-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1 after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 hover:after:w-full after:bg-teal-700 dark:after:bg-teal-400 after:transition-all after:duration-200"
            aria-label={`My Analytics, ${customEventsCount} custom events`}
          >
            <span>My Analytics</span>
            {customEventsCount > 0 && (
              <span className="text-xs font-mono tabular-nums font-semibold text-teal-700 dark:text-teal-400">
                ({customEventsCount})
              </span>
            )}
          </button>
          <button
            onClick={onOpenDocs}
            className="relative py-1 hover:text-stone-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 hover:after:w-full after:bg-teal-700 dark:after:bg-teal-400 after:transition-all after:duration-200"
          >
            Docs
          </button>
        </nav>

        {/* Zone 3: Theme controls, Social Account, and Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          <ThemePreviewPopover
            darkMode={darkMode}
            onToggleDarkMode={onToggleDarkMode}
            variant="desktop"
          />

          <button
            onClick={onToggleDarkMode}
            aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
            className="p-2 rounded-md text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 cursor-pointer"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-stone-600" />
            )}
          </button>

          {!currentUser ? (
            <button
              type="button"
              onClick={onOpenAuthModal}
              aria-label="Sign in with Google or GitHub"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
              <span>Sign In</span>
            </button>
          ) : (
            <div ref={accountMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setAccountMenuOpen((prev) => !prev)}
                aria-expanded={accountMenuOpen}
                aria-label={`Account menu for ${currentUser.fullName}`}
                className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span
                  className={`w-6 h-6 rounded-full ${currentUser.avatarColor} text-white flex items-center justify-center text-[10px] font-bold shrink-0`}
                >
                  {currentUser.avatarInitials}
                </span>
                <span className="hidden xl:inline text-xs font-medium max-w-[130px] truncate">
                  {currentUser.fullName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              </button>

              {accountMenuOpen && (
                <div
                  role="menu"
                  aria-label="Signed-in user options"
                  className="absolute right-0 mt-2 w-64 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-lg py-2 z-50 animate-fade-in"
                >
                  <div className="px-3.5 py-2.5 border-b border-stone-100 dark:border-stone-800 space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-8 h-8 rounded-full ${currentUser.avatarColor} text-white flex items-center justify-center text-xs font-bold shrink-0`}
                      >
                        {currentUser.avatarInitials}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                          {currentUser.fullName}
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                          {currentUser.username ? `@${currentUser.username} · ` : ''}
                          {currentUser.email}
                        </div>
                      </div>
                    </div>
                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      <span className="font-medium text-teal-700 dark:text-teal-400">
                        {formatProviderLabel(currentUser.provider)} session
                      </span>
                      <span className="text-stone-500 dark:text-stone-400 tabular-nums">
                        {userTicketsCount} {userTicketsCount === 1 ? 'pass' : 'passes'}
                      </span>
                    </div>
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        onOpenMyTickets();
                      }}
                      className="w-full text-left px-2.5 py-2 text-xs font-medium rounded-md text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Ticket className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                        <span>My Tickets & Passes</span>
                      </span>
                      <span className="text-[11px] font-mono tabular-nums text-teal-700 dark:text-teal-400">
                        {myTicketsCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        onOpenAuthModal();
                      }}
                      className="w-full text-left px-2.5 py-2 text-xs font-medium rounded-md text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-stone-400" />
                      <span>Switch Account</span>
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        onSignOut();
                      }}
                      className="w-full text-left px-2.5 py-2 text-xs font-semibold rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={onOpenCreateEvent}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-teal-700 hover:bg-teal-800 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Host Event</span>
          </button>

          {/* Mobile & Tablet hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
            className="lg:hidden p-2 rounded-md text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-stone-200 dark:border-stone-800 bg-[#FAF9F6] dark:bg-[#121211] px-4 pt-2 pb-4 space-y-2">
          {currentUser ? (
            <div className="p-3 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-8 h-8 rounded-full ${currentUser.avatarColor} text-white flex items-center justify-center text-xs font-bold shrink-0`}
                >
                  {currentUser.avatarInitials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[11px] text-teal-700 dark:text-teal-400 truncate">
                    {formatProviderLabel(currentUser.provider)} · {currentUser.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuthModal();
                  }}
                  className="flex-1 py-1.5 px-2.5 text-xs font-medium rounded-md border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300"
                >
                  Switch Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onSignOut();
                  }}
                  className="flex-1 py-1.5 px-2.5 text-xs font-semibold rounded-md border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuthModal();
              }}
              className="w-full text-left py-2 px-3 text-sm font-medium rounded-md bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 flex items-center gap-2"
            >
              <LogIn className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <span>Sign In with Google or GitHub</span>
            </button>
          )}

          <button
            onClick={() => handleNavClick('events-catalog')}
            className="w-full text-left py-2 px-3 text-sm font-medium rounded-md hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-800 dark:text-stone-200"
          >
            Browse All Events
          </button>
          <button
            onClick={() => handleNavClick('featured-events')}
            className="w-full text-left py-2 px-3 text-sm font-medium rounded-md hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-800 dark:text-stone-200"
          >
            Featured Highlights
          </button>
          <button
            onClick={() => {
              onOpenMyTickets();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 text-sm font-medium rounded-md hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-800 dark:text-stone-200 flex items-center justify-between"
          >
            <span>My Tickets</span>
            {myTicketsCount > 0 && (
              <span className="text-xs font-mono tabular-nums font-semibold text-teal-700 dark:text-teal-400">
                {myTicketsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              onOpenMyAnalytics();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 text-sm font-medium rounded-md hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-800 dark:text-stone-200 flex items-center justify-between"
          >
            <span>My Analytics</span>
            {customEventsCount > 0 && (
              <span className="text-xs font-mono tabular-nums font-semibold text-teal-700 dark:text-teal-400">
                {customEventsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              onOpenDocs();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 text-sm font-medium rounded-md hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-800 dark:text-stone-200"
          >
            Documentation & Guide
          </button>
          <ThemePreviewPopover
            darkMode={darkMode}
            onToggleDarkMode={onToggleDarkMode}
            variant="mobile"
            onAfterAction={() => setMobileMenuOpen(false)}
          />
          <div className="pt-2">
            <button
              onClick={() => {
                onOpenCreateEvent();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-md bg-teal-700 hover:bg-teal-800 text-white"
            >
              <Plus className="w-4 h-4" />
              <span>Host New Event</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
