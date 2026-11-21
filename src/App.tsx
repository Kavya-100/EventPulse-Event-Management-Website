/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AuthSessionUser, EventItem, FilterState, RegistrationRecord, ScheduledReminder, WaitlistEntry } from './types/event';
import { INITIAL_EVENTS } from './data/mockEvents';
import { resolveBundledEventImage } from './data/eventImages';
import { 
  filterEvents, 
  loadRegistrationsFromStorage, 
  saveRegistrationsToStorage,
  loadWaitlistFromStorage,
  saveWaitlistToStorage,
  loadCustomEventsFromStorage,
  saveCustomEventsToStorage,
  loadRemindersFromStorage,
  saveRemindersToStorage,
  addReminder,
  removeReminder,
  isReminderScheduled,
  REMINDER_LEAD_TIME_MINUTES,
  calculatePreEventReminderDelay,
  reconcileInitialEventCounts,
  updateRegistrationInList,
  loadAuthSessionFromStorage,
  saveAuthSessionToStorage,
  formatProviderLabel,
  filterRegistrationsForAuthUser,
  isCustomEventOwner,
  rescheduleEventDate,
  calculateTimeRemaining,
} from './utils/eventUtils';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { EventFilters } from './components/EventFilters';
import { EventCard } from './components/EventCard';
import { MonthlyCalendarView } from './components/MonthlyCalendarView';
import { EventDetailModal } from './components/EventDetailModal';
import { RegistrationModal } from './components/RegistrationModal';
import { MyTicketsModal } from './components/MyTicketsModal';
import { CreateEventModal } from './components/CreateEventModal';
import { MyAnalyticsModal } from './components/MyAnalyticsModal';
import { ProjectDocsModal } from './components/ProjectDocsModal';
import { SocialAuthModal } from './components/SocialAuthModal';
import { Footer } from './components/Footer';
import { Calendar, Ticket, ArrowRight, Plus, CheckCircle2, LayoutGrid, CalendarDays } from 'lucide-react';

export default function App() {
  // Theme state with local storage persistence
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('eventpulse_theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('eventpulse_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('eventpulse_theme', 'light');
    }
  }, [darkMode]);

  // User's social auth session persisted in localStorage alongside registrations
  const [currentUser, setCurrentUser] = useState<AuthSessionUser | null>(() => {
    return loadAuthSessionFromStorage();
  });

  // User's tickets / registrations persisted in localStorage
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>(() => {
    return loadRegistrationsFromStorage();
  });

  // Events state: custom events combined with initial events reconciled against stored registrations
  const [events, setEvents] = useState<EventItem[]>(() => {
    const custom = loadCustomEventsFromStorage().map((evt) => ({
      ...evt,
      image: resolveBundledEventImage(evt.image, evt.category),
    }));
    const storedRegs = loadRegistrationsFromStorage();
    const reconciledInitial = reconcileInitialEventCounts(INITIAL_EVENTS, storedRegs);
    return [...custom, ...reconciledInitial];
  });

  // User's waitlist entries (stored separately in localStorage)
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>(() => {
    return loadWaitlistFromStorage();
  });

  // User's event reminders persisted in localStorage and managed at the App level
  const [reminders, setReminders] = useState<ScheduledReminder[]>(() => {
    return loadRemindersFromStorage();
  });
  const [notificationPermissionTick, setNotificationPermissionTick] = useState(0);

  // Filter & Search State
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'All',
    location: 'All',
    priceFilter: 'All',
    sortBy: 'upcoming',
  });
  const [catalogView, setCatalogView] = useState<'grid' | 'calendar'>('grid');

  // Modals state
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<EventItem | null>(null);
  const [selectedEventForReg, setSelectedEventForReg] = useState<EventItem | null>(null);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [isMyTicketsOpen, setIsMyTicketsOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Toast / notification feedback
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Schedule browser notifications 5 minutes before each reminded event's start time
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    const timers: number[] = [];

    reminders.forEach((r) => {
      const { delayMs, isPast, withinLeadWindow } = calculatePreEventReminderDelay(
        r.eventDate,
        r.leadMinutes ?? REMINDER_LEAD_TIME_MINUTES
      );
      if (!isPast && !withinLeadWindow && delayMs > 0 && delayMs < 2147483647) {
        const timerId = window.setTimeout(() => {
          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(`🔔 Starting in 5 Minutes: ${r.eventTitle}`, {
                body: `Event begins soon at ${r.eventVenue}, ${r.eventCity}. Have your digital ticket ready!`,
                tag: `eventpulse-reminder-5m-${r.eventId}`,
              });
            } catch (e) {
              console.error('Error firing 5-minute pre-event reminder:', e);
            }
          }
        }, delayMs);
        timers.push(timerId);
      }
    });

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [reminders, notificationPermissionTick]);

  // Filtered and sorted events
  const filteredEvents = useMemo(() => {
    return filterEvents(events, filters);
  }, [events, filters]);

  // Custom events created by the user
  const customEvents = useMemo(() => {
    return events.filter((e) => e.id.startsWith('custom-'));
  }, [events]);

  // Featured marquee events
  const featuredEvents = useMemo(() => {
    return events.filter((e) => e.featured);
  }, [events]);

  const upcomingMarqueeEvent = useMemo(() => {
    return (
      featuredEvents.find((evt) => !calculateTimeRemaining(evt.date).isPast) ||
      featuredEvents[0]
    );
  }, [featuredEvents]);

  const userTicketsCount = useMemo(() => {
    if (!currentUser) return registrations.length;
    return filterRegistrationsForAuthUser(currentUser, registrations).length;
  }, [currentUser, registrations]);

  const catalogStats = useMemo(() => {
    const uniqueCities = new Set(events.map((e) => e.city.trim()).filter(Boolean));
    return {
      totalEvents: events.length,
      cityCount: uniqueCities.size,
      freeEventsCount: events.filter((e) => e.price === 0).length,
      savedPassesCount: registrations.length,
    };
  }, [events, registrations.length]);

  // Check for incoming shared ticket or shared event link parameters
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const sharedCode = params.get('ticket');
    const sharedEventId = params.get('event');
    if (sharedCode) {
      const attendee = params.get('attendee');
      showNotification(
        attendee
          ? `Shared ticket verified: ${sharedCode} (${attendee})`
          : `Shared ticket verified: ${sharedCode}`
      );
    } else if (sharedEventId) {
      const matchedEvent = events.find((e) => e.id === sharedEventId);
      if (matchedEvent) {
        setSelectedEventForDetail(matchedEvent);
      }
    }
  }, []);

  // Handle new registration
  const handleRegistrationSuccess = (newTicket: RegistrationRecord) => {
    const updated = [newTicket, ...registrations];
    setRegistrations(updated);
    saveRegistrationsToStorage(updated);

    // Increment registered count for the event and sync custom events storage
    setEvents((prev) => {
      const nextEvents = prev.map((e) => {
        if (e.id === newTicket.eventId) {
          return {
            ...e,
            registeredCount: Math.min(e.capacity, e.registeredCount + newTicket.ticketCount),
          };
        }
        return e;
      });
      saveCustomEventsToStorage(nextEvents.filter((e) => e.id.startsWith('custom-')));
      return nextEvents;
    });

    showNotification(`Ticket confirmed for ${newTicket.eventTitle}! Pass saved to My Tickets.`);
  };

  // Handle cancellation of registration
  const handleCancelRegistration = (ticketId: string) => {
    const ticketToCancel = registrations.find((t) => t.id === ticketId);
    if (!ticketToCancel) return;

    const updated = registrations.filter((t) => t.id !== ticketId);
    setRegistrations(updated);
    saveRegistrationsToStorage(updated);

    // Decrement event registered count and sync custom events storage
    setEvents((prev) => {
      const nextEvents = prev.map((e) => {
        if (e.id === ticketToCancel.eventId) {
          return {
            ...e,
            registeredCount: Math.max(0, e.registeredCount - ticketToCancel.ticketCount),
          };
        }
        return e;
      });
      saveCustomEventsToStorage(nextEvents.filter((e) => e.id.startsWith('custom-')));
      return nextEvents;
    });

    showNotification(`Registration cancelled for ${ticketToCancel.eventTitle}.`);
  };

  // Handle updating attendee details/tier on an existing stored registration
  const handleUpdateRegistration = (
    ticketId: string,
    updates: Partial<Pick<RegistrationRecord, 'fullName' | 'email' | 'phone' | 'ticketType' | 'specialNotes'>>
  ) => {
    const updated = updateRegistrationInList(ticketId, updates, registrations);
    setRegistrations(updated);
    saveRegistrationsToStorage(updated);
    showNotification('Stored registration details updated in local storage.');
  };

  // Handle importing a JSON backup of registrations
  const handleImportRegistrations = (importedRecords: RegistrationRecord[]) => {
    const existingIds = new Set(registrations.map((r) => r.id));
    const newUnique = importedRecords.filter((r) => !existingIds.has(r.id));
    const merged = [...newUnique, ...registrations];
    setRegistrations(merged);
    saveRegistrationsToStorage(merged);

    const custom = loadCustomEventsFromStorage().map((evt) => ({
      ...evt,
      image: resolveBundledEventImage(evt.image, evt.category),
    }));
    const reconciledInitial = reconcileInitialEventCounts(INITIAL_EVENTS, merged);
    setEvents([...custom, ...reconciledInitial]);
    showNotification(`Imported ${newUnique.length} registration record${newUnique.length === 1 ? '' : 's'} into local storage.`);
  };

  // Handle clearing all locally stored registrations
  const handleClearAllRegistrations = () => {
    setRegistrations([]);
    saveRegistrationsToStorage([]);
    const custom = loadCustomEventsFromStorage().map((evt) => ({
      ...evt,
      image: resolveBundledEventImage(evt.image, evt.category),
    }));
    setEvents([...custom, ...INITIAL_EVENTS]);
    showNotification('All locally stored registrations cleared.');
  };

  // Handle mock social login & logout
  const handleAuthSuccess = (user: AuthSessionUser) => {
    setCurrentUser(user);
    saveAuthSessionToStorage(user);
    showNotification(`Signed in with ${formatProviderLabel(user.provider)} as ${user.fullName}.`);
  };

  const handleSignOut = () => {
    const previousName = currentUser?.fullName;
    setCurrentUser(null);
    saveAuthSessionToStorage(null);
    showNotification(previousName ? `Signed out of ${previousName}'s session.` : 'Signed out.');
  };

  // Handle adding a waitlist entry for a full-capacity event
  const handleWaitlistSuccess = (entry: WaitlistEntry) => {
    const updated = [entry, ...waitlistEntries];
    setWaitlistEntries(updated);
    saveWaitlistToStorage(updated);
    showNotification(`Added to waitlist for ${entry.eventTitle} (Position #${entry.position}).`);
  };

  // Handle removing a waitlist entry
  const handleLeaveWaitlist = (waitlistId: string) => {
    const target = waitlistEntries.find((w) => w.id === waitlistId);
    if (!target) return;

    const remaining = waitlistEntries.filter((w) => w.id !== waitlistId);
    // Re-index queue positions cleanly per event
    const eventCounters: Record<string, number> = {};
    const reindexed = [...remaining]
      .reverse()
      .map((entry) => {
        eventCounters[entry.eventId] = (eventCounters[entry.eventId] || 0) + 1;
        return { ...entry, position: eventCounters[entry.eventId] };
      })
      .reverse();

    setWaitlistEntries(reindexed);
    saveWaitlistToStorage(reindexed);
    showNotification(`Removed from waitlist for ${target.eventTitle}.`);
  };

  // Handle custom event creation
  const handleEventCreated = (newEvent: EventItem) => {
    const updated = [newEvent, ...events];
    setEvents(updated);
    const customList = loadCustomEventsFromStorage();
    saveCustomEventsToStorage([newEvent, ...customList]);
    showNotification(`"${newEvent.title}" published successfully to the event catalog!`);
    
    // Smooth scroll down to catalog
    const catalogEl = document.getElementById('events-catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle organizer drag-and-drop rescheduling of owned custom events in MonthlyCalendarView
  const handleRescheduleCustomEvent = (eventId: string, targetDateKey: string) => {
    const targetEvent = events.find((e) => e.id === eventId);
    if (!targetEvent || !isCustomEventOwner(targetEvent, currentUser)) {
      showNotification('Only the signed-in event owner can reschedule a custom event.');
      return;
    }

    const { date, formattedDate } = rescheduleEventDate(targetEvent.date, targetDateKey);

    setEvents((prev) => {
      const nextEvents = prev.map((e) =>
        e.id === eventId ? { ...e, date, formattedDate } : e
      );
      saveCustomEventsToStorage(nextEvents.filter((e) => e.id.startsWith('custom-')));
      return nextEvents;
    });

    if (selectedEventForDetail?.id === eventId) {
      setSelectedEventForDetail((prev) => (prev ? { ...prev, date, formattedDate } : prev));
    }

    // Keep stored registration and reminder dates synced if present
    setRegistrations((prev) => {
      if (!prev.some((r) => r.eventId === eventId)) return prev;
      const updated = prev.map((r) =>
        r.eventId === eventId ? { ...r, eventDate: formattedDate } : r
      );
      saveRegistrationsToStorage(updated);
      return updated;
    });

    setReminders((prev) => {
      if (!prev.some((r) => r.eventId === eventId)) return prev;
      const updated = prev.map((r) =>
        r.eventId === eventId ? { ...r, eventDate: date } : r
      );
      saveRemindersToStorage(updated);
      return updated;
    });

    showNotification(`Rescheduled "${targetEvent.title}" to ${formattedDate}.`);
  };

  // Toggle an event reminder (saved in localStorage, notifies 5 minutes before event start time)
  const handleToggleReminder = async (
    targetEvent: EventItem
  ): Promise<{ type: 'success' | 'info' | 'error'; message: string }> => {
    if (isReminderScheduled(targetEvent.id, reminders)) {
      const updated = removeReminder(targetEvent.id, reminders);
      setReminders(updated);
      saveRemindersToStorage(updated);
      showNotification(`5-minute reminder cancelled for ${targetEvent.title}.`);
      return {
        type: 'info',
        message: 'Browser alert reminder cancelled for this event.',
      };
    }

    const newReminder: ScheduledReminder = {
      eventId: targetEvent.id,
      eventTitle: targetEvent.title,
      eventDate: targetEvent.date,
      eventVenue: targetEvent.venue,
      eventCity: targetEvent.city,
      scheduledAt: new Date().toISOString(),
      leadMinutes: REMINDER_LEAD_TIME_MINUTES,
    };

    const updated = addReminder(newReminder, reminders);
    setReminders(updated);
    saveRemindersToStorage(updated);

    const { isPast, withinLeadWindow, formattedNotifyLeadTime } = calculatePreEventReminderDelay(
      targetEvent.date,
      REMINDER_LEAD_TIME_MINUTES
    );

    let hasNotificationPermission = false;
    if (typeof window !== 'undefined' && 'Notification' in window) {
      let currentPerm: NotificationPermission = Notification.permission;
      if (currentPerm === 'default') {
        try {
          currentPerm = await Notification.requestPermission();
          setNotificationPermissionTick((n) => n + 1);
        } catch (err) {
          console.warn('Notification permission error:', err);
          currentPerm = 'denied';
        }
      }

      if (currentPerm === 'granted') {
        hasNotificationPermission = true;
        try {
          if (withinLeadWindow && !isPast) {
            new Notification(`🔔 Starting in Under 5 Minutes: ${targetEvent.title}`, {
              body: `Event begins soon at ${targetEvent.venue}, ${targetEvent.city}!`,
              icon: targetEvent.image,
              tag: `eventpulse-reminder-5m-${targetEvent.id}`,
            });
          } else {
            new Notification(`Reminder Set: ${targetEvent.title}`, {
              body: isPast
                ? 'Reminder saved (event start time has passed).'
                : `Browser notification scheduled ${formattedNotifyLeadTime} (5 minutes before start time).`,
              icon: targetEvent.image,
              tag: `eventpulse-confirm-${targetEvent.id}`,
            });
          }
        } catch (e) {
          console.warn('Could not dispatch browser notification:', e);
        }
      }
    }

    showNotification(`Reminder saved for ${targetEvent.title} (alerts 5 min before start).`);

    if (hasNotificationPermission) {
      return {
        type: 'success',
        message: isPast
          ? 'Reminder saved to local storage (event date has concluded).'
          : withinLeadWindow
          ? 'Reminder saved! Event starts within 5 minutes — browser notification sent now.'
          : `Reminder saved! Browser notification scheduled ${formattedNotifyLeadTime} (5 minutes before start time).`,
      };
    }

    return {
      type: 'success',
      message:
        'Reminder saved to local storage! Enable browser notifications in site settings to receive the 5-minute pre-event alert.',
    };
  };

  const handleOpenRegistration = (event: EventItem) => {
    setSelectedEventForReg(event);
    setIsRegModalOpen(true);
  };

  const handleNavigateSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F4] dark:bg-[#111110] text-stone-900 dark:text-stone-100 transition-colors duration-200">
      
      {/* Toast Notification Alert */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 px-4 py-3 rounded-lg shadow-lg border border-stone-700 dark:border-stone-200 flex items-center gap-2.5 text-xs font-medium animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-teal-400 dark:text-teal-700 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Bar Navigation */}
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        myTicketsCount={registrations.length}
        userTicketsCount={userTicketsCount}
        customEventsCount={customEvents.length}
        currentUser={currentUser}
        onOpenMyTickets={() => setIsMyTicketsOpen(true)}
        onOpenMyAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenCreateEvent={() => setIsCreateEventOpen(true)}
        onOpenDocs={() => setIsDocsOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        onNavigateSection={handleNavigateSection}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* Hero Section */}
        <HeroSection
          searchQuery={filters.search}
          onSearchChange={(q) => setFilters((prev) => ({ ...prev, search: q }))}
          onSearchSubmit={() => handleNavigateSection('events-catalog')}
          onExploreClick={() => handleNavigateSection('events-catalog')}
          onQuickFilter={(update) => {
            setFilters((prev) => ({
              ...prev,
              ...update,
            }));
            handleNavigateSection('events-catalog');
          }}
          marqueeEvent={upcomingMarqueeEvent}
          onSelectFeaturedEvent={(evt) => setSelectedEventForDetail(evt)}
          catalogStats={catalogStats}
        />

        {/* Section 1: Asymmetric Editorial Featured Lineup */}
        <section
          id="featured-events"
          className="scroll-mt-16 py-14 bg-[#F3EFE6]/65 dark:bg-stone-900/45 border-b border-stone-200/80 dark:border-stone-800/80 transition-colors"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-amber-800 dark:text-amber-400">
                  Editor&apos;s Picks
                </div>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
                  Featured Gatherings
                </h2>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Flagship conferences, open-air sets, and executive roundtables highlighted this season.
                </p>
              </div>

              <button
                onClick={() => handleNavigateSection('events-catalog')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 dark:text-teal-400 hover:underline underline-offset-4 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {featuredEvents.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Lead Feature Story Card */}
                {(() => {
                  const lead = featuredEvents[0];
                  const leadSeatsLeft = Math.max(0, lead.capacity - lead.registeredCount);
                  const leadSoldOut = leadSeatsLeft <= 0;
                  const leadFill = Math.min(100, Math.round((lead.registeredCount / lead.capacity) * 100));

                  return (
                    <article className="lg:col-span-7 flex flex-col justify-between bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-2.5 hover:border-teal-700/35 dark:hover:border-teal-500/40 hover:shadow-[0_20px_44px_-20px_rgba(18,18,17,0.14)] transition-all duration-300 group">
                      <div
                        onClick={() => setSelectedEventForDetail(lead)}
                        className="relative aspect-16/9 lg:aspect-21/11 w-full rounded-xl bg-stone-100 dark:bg-stone-800 overflow-hidden cursor-pointer"
                      >
                        <img
                          src={lead.image}
                          alt={lead.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/5 rounded-xl pointer-events-none" />
                      </div>

                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-5">
                        <div className="space-y-2.5">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                            <span
                              className="italic text-amber-800 dark:text-amber-400 font-semibold"
                              style={{ fontFamily: 'var(--font-heading)' }}
                            >
                              01.
                            </span>
                            <span className="font-semibold text-teal-800 dark:text-teal-400">
                              {lead.category}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{lead.formattedDate}</span>
                            <span aria-hidden="true">·</span>
                            <span>{lead.venue}, {lead.city}</span>
                          </div>

                          <h3
                            onClick={() => setSelectedEventForDetail(lead)}
                            className="text-2xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight leading-snug hover:text-teal-800 dark:hover:text-teal-400 transition-colors cursor-pointer"
                          >
                            {lead.title}
                          </h3>

                          <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-2">
                            {lead.shortDescription}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-6">
                            <div>
                              <div className="text-[11px] text-stone-500 dark:text-stone-400">Admission</div>
                              <div className="text-lg font-semibold font-mono tabular-nums text-stone-900 dark:text-stone-100">
                                {lead.price === 0 ? 'Free' : `$${lead.price}`}
                              </div>
                            </div>
                            <div className="space-y-1 min-w-[140px]">
                              <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                                <span>{leadSoldOut ? 'Sold Out' : `${leadSeatsLeft} spots left`}</span>
                                <span className="font-mono tabular-nums">{leadFill}%</span>
                              </div>
                              <div className="w-full h-1 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${leadFill > 90 ? 'bg-amber-600' : 'bg-teal-700 dark:bg-teal-500'}`}
                                  style={{ width: `${leadFill}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setSelectedEventForDetail(lead)}
                              className="px-3.5 py-2 text-xs font-medium rounded-lg border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                            >
                              View Schedule
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenRegistration(lead)}
                              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs ${
                                leadSoldOut
                                  ? 'bg-amber-700 hover:bg-amber-800 text-white'
                                  : 'bg-teal-700 hover:bg-teal-800 text-white'
                              }`}
                            >
                              <span>{leadSoldOut ? 'Join Waitlist' : 'Register'}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })()}

                {/* Secondary Featured Index Column */}
                <div className="lg:col-span-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 divide-y divide-stone-200/80 dark:divide-stone-800 flex flex-col overflow-hidden">
                  {featuredEvents.slice(1).map((evt, index) => {
                    const seatsLeft = Math.max(0, evt.capacity - evt.registeredCount);
                    const isSoldOut = seatsLeft <= 0;
                    const editionNumber = `0${index + 2}.`;

                    return (
                      <article
                        key={evt.id}
                        className="p-5 sm:p-6 flex-1 flex flex-col gap-3.5 hover:bg-[#FBF9F4]/70 dark:hover:bg-stone-800/30 transition-colors group"
                      >
                        <div className="flex gap-4 items-start">
                          <div
                            onClick={() => setSelectedEventForDetail(evt)}
                            className="w-28 sm:w-32 aspect-4/3 rounded-xl bg-stone-100 dark:bg-stone-800 overflow-hidden shrink-0 cursor-pointer ring-1 ring-inset ring-black/5 dark:ring-white/5"
                          >
                            <img
                              src={evt.image}
                              alt={evt.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover object-center group-hover:scale-[1.05] transition-transform duration-500 ease-out"
                            />
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-2 text-[11px]">
                              <span className="flex items-center gap-1.5 truncate">
                                <span
                                  className="italic text-amber-800 dark:text-amber-400 font-semibold"
                                  style={{ fontFamily: 'var(--font-heading)' }}
                                >
                                  {editionNumber}
                                </span>
                                <span className="font-semibold text-teal-800 dark:text-teal-400 truncate">
                                  {evt.category}
                                </span>
                              </span>
                              <span className="font-mono tabular-nums font-semibold text-stone-700 dark:text-stone-300 shrink-0">
                                {evt.price === 0 ? 'Free' : `$${evt.price}`}
                              </span>
                            </div>

                            <h3
                              onClick={() => setSelectedEventForDetail(evt)}
                              className="text-[17px] font-semibold text-stone-900 dark:text-stone-100 leading-snug line-clamp-2 hover:text-teal-800 dark:hover:text-teal-400 transition-colors cursor-pointer"
                            >
                              {evt.title}
                            </h3>

                            <div className="text-xs text-stone-500 dark:text-stone-400 truncate">
                              {evt.formattedDate.split('·')[0].trim()} · {evt.city}
                            </div>
                            <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                              {evt.venue}
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-3 leading-relaxed">
                          {evt.shortDescription}
                        </p>

                        <div className="mt-auto pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between gap-3">
                          <span
                            className={`text-[11px] font-medium ${
                              isSoldOut
                                ? 'text-amber-800 dark:text-amber-400 font-semibold'
                                : 'text-stone-500 dark:text-stone-400'
                            }`}
                          >
                            {isSoldOut ? 'Waitlist open · Sold Out' : `${seatsLeft} spots remaining`}
                          </span>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setSelectedEventForDetail(evt)}
                              className="px-3 py-1.5 text-xs font-medium border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                            >
                              Details
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenRegistration(evt)}
                              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                                isSoldOut
                                  ? 'bg-amber-700 hover:bg-amber-800 text-white'
                                  : 'bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-900'
                              }`}
                            >
                              {isSoldOut ? 'Join Waitlist' : 'Register'}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Full Events Catalog with Interactive Filters */}
        <section id="events-catalog" className="scroll-mt-16 py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-medium text-teal-800 dark:text-teal-400">
                Calendar &amp; Directory
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
                Upcoming Events Calendar
              </h2>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Explore events across technology, music, executive leadership, arts, athletics, and cuisine.
              </p>
            </div>

            {/* Grid vs Monthly Calendar Layout Toggle */}
            <div
              role="group"
              aria-label="Event catalog layout view"
              className="inline-flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg self-start sm:self-auto"
            >
              <button
                type="button"
                onClick={() => setCatalogView('grid')}
                aria-pressed={catalogView === 'grid'}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  catalogView === 'grid'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-2xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setCatalogView('calendar')}
                aria-pressed={catalogView === 'calendar'}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  catalogView === 'calendar'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-2xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Calendar</span>
              </button>
            </div>
          </div>

          {/* Interactive Filters Bar */}
          <EventFilters
            filters={filters}
            events={events}
            onChange={(updated) => setFilters((prev) => ({ ...prev, ...updated }))}
            onReset={() =>
              setFilters({
                search: '',
                category: 'All',
                location: 'All',
                priceFilter: 'All',
                sortBy: 'upcoming',
              })
            }
            totalResultsCount={filteredEvents.length}
          />

          {/* Events Grid, Calendar View, or Empty State */}
          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 mx-auto flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                No events found matching your criteria
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
                Try clearing your search term, switching categories or locations, or resetting the price filter to view all available events.
              </p>
              <button
                onClick={() =>
                  setFilters({
                    search: '',
                    category: 'All',
                    location: 'All',
                    priceFilter: 'All',
                    sortBy: 'upcoming',
                  })
                }
                className="px-4 py-2 text-xs font-semibold rounded-md bg-teal-700 hover:bg-teal-800 text-white transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : catalogView === 'calendar' ? (
            <MonthlyCalendarView
              events={filteredEvents}
              registrations={registrations}
              currentUser={currentUser}
              onSelectEvent={(e) => setSelectedEventForDetail(e)}
              onRegisterClick={(e) => handleOpenRegistration(e)}
              onRescheduleEvent={handleRescheduleCustomEvent}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((evt) => (
                <EventCard
                  key={evt.id}
                  event={evt}
                  onSelectEvent={(e) => setSelectedEventForDetail(e)}
                  onRegisterClick={(e) => handleOpenRegistration(e)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Section 3: Architectural Organizer Callout */}
        <section className="py-14 border-t border-stone-200/80 dark:border-stone-800 bg-[#F3EFE6]/55 dark:bg-stone-950/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-gradient-to-br from-[#0F2421] via-[#152522] to-[#1A1A18] dark:from-stone-900 dark:via-stone-900 dark:to-stone-950 border border-stone-800 ring-1 ring-inset ring-white/10 text-stone-100 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[0_24px_60px_-24px_rgba(15,36,33,0.45)]">
              <div className="space-y-2.5 max-w-xl">
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-300">
                  <Ticket className="w-3.5 h-3.5" />
                  <span>For Event Organizers</span>
                </div>
                <h3 className="text-2xl sm:text-[1.85rem] font-semibold text-white tracking-tight leading-snug">
                  Hosting a workshop, gig, or city meetup?
                </h3>
                <p className="text-sm text-stone-300 leading-relaxed">
                  Publish your gathering in under a minute. Track capacity live, drag-and-drop custom event dates on the monthly calendar, and review attendee analytics.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
                <button
                  onClick={() => setIsDocsOpen(true)}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold rounded-lg border border-white/20 text-stone-100 hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Read Guide
                </button>
                <button
                  onClick={() => setIsCreateEventOpen(true)}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Host New Event</span>
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Semantic Footer */}
      <Footer
        onNavigateSection={handleNavigateSection}
        onOpenDocs={() => setIsDocsOpen(true)}
        onOpenMyTickets={() => setIsMyTicketsOpen(true)}
        onOpenCreateEvent={() => setIsCreateEventOpen(true)}
      />

      {/* Modals & Dialogs */}
      <EventDetailModal
        event={selectedEventForDetail}
        allEvents={events}
        currentUser={currentUser}
        reminders={reminders}
        isOpen={Boolean(selectedEventForDetail)}
        onClose={() => setSelectedEventForDetail(null)}
        onSelectEvent={(e) => setSelectedEventForDetail(e)}
        onRegisterClick={(e) => handleOpenRegistration(e)}
        onToggleReminder={handleToggleReminder}
        onToast={showNotification}
      />

      <RegistrationModal
        isOpen={isRegModalOpen}
        onClose={() => {
          setIsRegModalOpen(false);
          setSelectedEventForReg(null);
        }}
        selectedEvent={selectedEventForReg}
        allEvents={events}
        waitlistEntries={waitlistEntries}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onRegistrationSuccess={handleRegistrationSuccess}
        onWaitlistSuccess={handleWaitlistSuccess}
      />

      <MyTicketsModal
        isOpen={isMyTicketsOpen}
        onClose={() => setIsMyTicketsOpen(false)}
        tickets={registrations}
        waitlistEntries={waitlistEntries}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        onCancelRegistration={handleCancelRegistration}
        onUpdateRegistration={handleUpdateRegistration}
        onImportRegistrations={handleImportRegistrations}
        onClearAllRegistrations={handleClearAllRegistrations}
        onLeaveWaitlist={handleLeaveWaitlist}
        onBrowseEvents={() => handleNavigateSection('events-catalog')}
        onToast={showNotification}
      />

      <MyAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        customEvents={customEvents}
        registrations={registrations}
        onOpenCreateEvent={() => setIsCreateEventOpen(true)}
        onSelectEvent={(evt) => setSelectedEventForDetail(evt)}
      />

      <CreateEventModal
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        onEventCreated={handleEventCreated}
        currentUser={currentUser}
      />

      <ProjectDocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />

      <SocialAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={handleAuthSuccess}
        onSignOut={handleSignOut}
      />

    </div>
  );
}
