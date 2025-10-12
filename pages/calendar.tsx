import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  description: string;
  type: 'partner events' | 'celebration days' | 'marketplace';
}

// Dummy event data for Sep-Dec 2025
const dummyEvents: Event[] = [
  {
    id: 1,
    title: 'National Cat Day',
    date: '2025-10-29',
    time: 'All Day',
    description: 'It\'s National Cat Day! Give your feline friend some extra attention and love. Better yet, spoil them with a new collar and charm!',
    type: 'celebration days'
  },
  {
    id: 2,
    title: 'National Senior Pet Month',
    date: '2025-11-01',
    time: 'All month',
    description: 'Old is gold! National Senior Pet Month is dedicated to celebrating and raising awareness for senior pets. They have so much love to give.',
    type: 'celebration days'
  },
  {
    id: 3,
    title: 'Kenmore Winterfest',
    date: '2025-12-06',
    time: '11:00AM-3:00PM',
    description: 'Winter Market at the Hangar in Kenmore, and POP shop! Festive activities and vendors.',
    type: 'marketplace'
  },
];

const Calendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Current month

  // Get only current month
  const getCurrentMonth = () => {
    return currentMonth;
  };

  // Get events for a specific date
  const getEventsForDate = (date: string) => {
    return dummyEvents.filter(event => event.date === date);
  };

  // Check if a date has events
  const hasEvents = (date: string) => {
    return dummyEvents.some(event => event.date === date);
  };

  // Generate calendar days for a month
  const generateCalendarDays = (month: Date) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dateString = current.toISOString().split('T')[0];
      const isCurrentMonth = current.getMonth() === monthIndex;
      const isToday = current.toDateString() === new Date().toDateString();
      const hasEventsOnDate = hasEvents(dateString);
      const dayEvents = getEventsForDate(dateString);

      days.push({
        date: new Date(current),
        dateString,
        isCurrentMonth,
        isToday,
        hasEvents: hasEventsOnDate,
        events: dayEvents,
        day: current.getDate()
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  // Get calendar cell background color based on event type
  const getCalendarCellColor = (events: Event[], isCurrentMonth: boolean, isToday: boolean, isSelected: boolean) => {
    if (isSelected) {
      return 'bg-purple-200 text-purple-900 ring-2 ring-purple-400';
    }
    if (isToday) {
      return 'bg-blue-100 text-blue-800 font-bold ring-2 ring-blue-300';
    }
    if (events.length > 0 && isCurrentMonth) {
      const event = events[0]; // Use first event for color
      switch (event.type) {
        case 'partner events':
          return 'bg-cyan-200 text-cyan-900 border-2 border-cyan-400';
        case 'celebration days':
          return 'bg-emerald-200 text-emerald-900 border-2 border-emerald-400';
        case 'marketplace':
          return 'bg-pink-200 text-pink-900 border-2 border-pink-400';
        default:
          return 'bg-gray-200 text-gray-900 border-2 border-gray-400';
      }
    }
    return isCurrentMonth 
      ? 'text-gray-900 hover:bg-gray-100 border border-gray-200' 
      : 'text-gray-400 border border-gray-200';
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'partner events':
        return 'bg-secondary-100 text-secondary-800 border-secondary-200';
      case 'celebration days':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'marketplace':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get upcoming events for sneak peek (next 6 events)
  const getUpcomingEvents = () => {
    const today = new Date();
    const upcomingEvents = dummyEvents
      .filter(event => new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 6);
    return upcomingEvents;
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'partner events':
        return '🎓';
      case 'celebration days':
        return '🐾';
      case 'marketplace':
        return '🛍️';
      default:
        return '📅';
    }
  };

  return (
    <>
      <Head>
        <title>Upcoming Events - Bow-Bow-Ties</title>
        <meta name="description" content="View upcoming marketplaces, celebration days, and partner events for Bow-Bow-Ties community." />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center py-4 lg:h-24">
              <div className="flex justify-between items-center">
                <Link href="/" className="logo-container">
                  <img 
                    src="/bow_bow_ties.jpg" 
                    alt="Bow-Bow-Ties Logo" 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <h1 className="text-3xl font-bold gradient-text">Bow-Bow-Ties</h1>
                </Link>
              </div>
              
              {/* Mobile Navigation */}
              <nav className="flex md:hidden justify-center space-x-4 mt-2 mb-2">
                <Link href="/" className="text-gray-700 hover:text-primary-600 transition-colors text-base font-bold">Home</Link>
                <Link href="/products" className="text-gray-700 hover:text-primary-600 transition-colors text-base font-bold">Products</Link>
                <a href="/#about" className="text-gray-700 hover:text-primary-600 transition-colors text-base font-bold">About</a>
                <Link href="/calendar" className="text-primary-600 font-bold text-base">Calendar</Link>
              </nav>
              
              {/* Tablet Navigation */}
              <nav className="hidden md:flex lg:hidden justify-center space-x-6 mt-2 mb-2">
                <Link href="/" className="text-gray-700 hover:text-primary-600 transition-colors text-lg font-bold">Home</Link>
                <Link href="/products" className="text-gray-700 hover:text-primary-600 transition-colors text-lg font-bold">Products</Link>
                <a href="/#about" className="text-gray-700 hover:text-primary-600 transition-colors text-lg font-bold">About</a>
                <Link href="/calendar" className="text-primary-600 font-bold text-lg">Calendar</Link>
              </nav>
              
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex space-x-8">
                <Link href="/" className="text-gray-700 hover:text-primary-600 transition-colors text-lg font-bold">Home</Link>
                <Link href="/products" className="text-gray-700 hover:text-primary-600 transition-colors text-lg font-bold">Products</Link>
                <a href="/#about" className="text-gray-700 hover:text-primary-600 transition-colors text-lg font-bold">About</a>
                <Link href="/calendar" className="text-primary-600 font-bold text-lg">Calendar</Link>
              </nav>
              
              <div className="flex items-center justify-center space-x-3 mt-2 lg:mt-0 lg:space-x-4">
                <a 
                  href="https://www.instagram.com/bow_bow_ties" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-110"
                  aria-label="Follow us on Instagram"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-yellow-500 p-0.5">
                    <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center">
                      <svg className="w-7 h-7" viewBox="0 0 24 24">
                        <defs>
                          <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#833ab4"/>
                            <stop offset="50%" stopColor="#fd1d1d"/>
                            <stop offset="100%" stopColor="#fcb045"/>
                          </linearGradient>
                        </defs>
                        <path fill="url(#instagram-gradient)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                  </div>
                </a>
                <a 
                  href="https://www.facebook.com/p/Bow-Bow-Ties-100071472273808/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-110"
                  aria-label="Follow us on Facebook"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center">
                    <svg className="w-7 h-7" fill="white" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                </a>
                <a 
                  href="https://www.etsy.com/shop/bowbowtiesdesigns" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-110"
                  aria-label="Shop on Etsy"
                >
                  <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <text
                        x="12"
                        y="17"
                        textAnchor="middle"
                        fill="white"
                        fontSize="20"
                        fontWeight="900"
                        fontFamily="Arial, sans-serif"
                        stroke="white"
                        strokeWidth="0.3"
                      >
                        E
                      </text>
                    </svg>
                  </div>
                </a>
                <a 
                  href="https://buymeacoffee.com/bowbowties" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-110"
                  aria-label="Buy Me a Coffee"
                >
                  <div className="w-12 h-12 rounded-2xl overflow-hidden">
                    <img 
                      src="/images/donate.jpeg" 
                      alt="Buy Me a Coffee" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Page Title Section */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Upcoming Events for Bow-Bow-Ties</h1>
                <p className="text-gray-600 mt-1">Join our community events and connect with fellow pet lovers</p>
              </div>
              
              {/* Calendar Navigation Buttons */}
              <div className="flex justify-center space-x-2 mt-4 lg:mt-0">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date())}
                  className="px-3 py-1 text-sm bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-md transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Event Banner */}
        {(() => {
          const nextEvent = getUpcomingEvents()[0];
          if (!nextEvent) return null;
          
          return (
            <div className={`${getEventTypeColor(nextEvent.type)} border-b`}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getEventTypeIcon(nextEvent.type)}</span>
                    <div>
                      <h3 className="font-semibold text-lg">Next Event: {nextEvent.title}</h3>
                      <p className="text-sm opacity-75">
                        {new Date(nextEvent.date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })} at {nextEvent.time}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs uppercase font-medium px-3 py-1 rounded-full bg-white bg-opacity-50">
                    {nextEvent.type}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Single Calendar Month - Page Wide */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              {monthNames[getCurrentMonth().getMonth()]} {getCurrentMonth().getFullYear()}
            </h2>
            
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {dayNames.map(day => (
                <div key={day} className="text-center text-lg font-semibold text-gray-700 py-3 bg-gray-50 rounded-lg">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {generateCalendarDays(getCurrentMonth()).map((day, dayIndex) => (
                <button
                  key={dayIndex}
                  onClick={() => {
                    setSelectedDate(day.dateString);
                    // Scroll to event details section after a short delay to allow state update
                    setTimeout(() => {
                      const eventDetailsElement = document.getElementById('event-details');
                      if (eventDetailsElement) {
                        eventDetailsElement.scrollIntoView({ 
                          behavior: 'smooth',
                          block: 'start'
                        });
                      }
                    }, 100);
                  }}
                  className={`
                    relative p-3 h-24 text-sm rounded-lg transition-all duration-200 font-medium flex flex-col items-start justify-start
                    ${getCalendarCellColor(day.events, day.isCurrentMonth, day.isToday, selectedDate === day.dateString)}
                  `}
                >
                  <span className="text-lg font-bold mb-1">{day.day}</span>
                  {day.events.length > 0 && day.isCurrentMonth && (
                    <div className="flex flex-col items-start w-full space-y-1">
                      {day.events.slice(0, 2).map((event, eventIndex) => (
                        <div key={eventIndex} className="text-xs font-medium truncate w-full text-left">
                          <span className="mr-1">{getEventTypeIcon(event.type)}</span>
                          <span className="truncate">{event.title}</span>
                        </div>
                      ))}
                      {day.events.length > 2 && (
                        <span className="text-xs font-bold text-gray-600">+{day.events.length - 2} more</span>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Event Details - Before Legend */}
          {selectedDate && (
            <div id="event-details" className="mt-8 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Events for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
              
              {getEventsForDate(selectedDate).length > 0 ? (
                <div className="space-y-4">
                  {getEventsForDate(selectedDate).map(event => (
                    <div key={event.id} className={`border rounded-lg p-4 ${getEventTypeColor(event.type)}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-lg">{event.title}</h4>
                          <p className="text-sm opacity-75 mt-1">{event.time}</p>
                          <p className="mt-2">{event.description}</p>
                        </div>
                        <span className="text-xs uppercase font-medium px-2 py-1 rounded-full bg-white bg-opacity-50">
                          {event.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No events scheduled for this date.</p>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendar Legend</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Event Types</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-orange-200 border-2 border-orange-400 rounded flex items-center justify-center">
                      <span className="text-xs">🛍️</span>
                    </div>
                    <span className="text-sm">Marketplace Events</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-cyan-200 border-2 border-cyan-400 rounded flex items-center justify-center">
                      <span className="text-xs">🐾</span>
                    </div>
                    <span className="text-sm">Celebration Days</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-emerald-200 border-2 border-emerald-400 rounded flex items-center justify-center">
                      <span className="text-xs">🤝</span>
                    </div>
                    <span className="text-sm">Partner Events</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Calendar Colors</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 ring-2 ring-blue-300 rounded"></div>
                    <span className="text-sm">Today</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-purple-200 ring-2 ring-purple-400 rounded"></div>
                    <span className="text-sm">Selected Date</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-100 border border-gray-200 rounded"></div>
                    <span className="text-sm">Regular Days</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-4 text-center">
              Click on any highlighted date to view event details. Event dates show colorful backgrounds and icons.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h5 className="text-xl font-bold mb-4">🎀 Bow-Bow-Ties</h5>
                <p className="text-gray-400 mb-4">
                  Premium pet accessories for the most stylish companions.
                </p>
                <div className="flex space-x-4">
                  <a 
                    href="https://www.instagram.com/bow_bow_ties" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="transition-transform hover:scale-110"
                    aria-label="Follow us on Instagram"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-pink-600 to-yellow-500 p-0.5">
                      <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                          <defs>
                            <linearGradient id="instagram-gradient-footer" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#833ab4"/>
                              <stop offset="50%" stopColor="#fd1d1d"/>
                              <stop offset="100%" stopColor="#fcb045"/>
                            </linearGradient>
                          </defs>
                          <path fill="url(#instagram-gradient-footer)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </div>
                    </div>
                  </a>
                  <a 
                    href="https://www.facebook.com/p/Bow-Bow-Ties-100071472273808/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="transition-transform hover:scale-110"
                    aria-label="Follow us on Facebook"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                      <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                  </a>
                  <a 
                    href="https://www.etsy.com/shop/bowbowtiesdesigns" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="transition-transform hover:scale-110"
                    aria-label="Shop on Etsy"
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <text
                          x="12"
                          y="17"
                          textAnchor="middle"
                          fill="white"
                          fontSize="16"
                          fontWeight="900"
                          fontFamily="Arial, sans-serif"
                          stroke="white"
                          strokeWidth="0.3"
                        >
                          E
                        </text>
                      </svg>
                    </div>
                  </a>
                  <a 
                    href="https://buymeacoffee.com/bowbowties" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="transition-transform hover:scale-110"
                    aria-label="Buy Me a Coffee"
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden">
                      <img 
                        src="/images/donate.jpeg" 
                        alt="Buy Me a Coffee" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </a>
                </div>
              </div>
              <div>
                <h6 className="font-semibold mb-4">Quick Links</h6>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                  <li><Link href="/products" className="hover:text-white transition-colors">Products</Link></li>
                  <li><a href="/#about" className="hover:text-white transition-colors">About</a></li>
                  <li><Link href="/calendar" className="hover:text-white transition-colors">Calendar</Link></li>
                  <li><a href="/#contact" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h6 className="font-semibold mb-4">Contact</h6>
                <ul className="space-y-2 text-gray-400">
                  <li>📧 bowbowties21@gmail.com</li>
                  <li>📍 Bothell, Washington</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 Bow-Bow-Ties. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Calendar;
