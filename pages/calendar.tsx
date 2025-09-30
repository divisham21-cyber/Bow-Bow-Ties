import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  description: string;
  type: 'playdate' | 'training' | 'meetup' | 'marketplace';
}

// Dummy event data for Sep-Dec 2025
const dummyEvents: Event[] = [
  {
    id: 1,
    title: 'Popup Save event : Kenmore',
    date: '2025-09-15',
    time: '10:00 AM',
    description: 'Join us for a fun-filled day at the Kenmore Popup Save event! Bring your furry friends for games, treats, and lots of fun!',
    type: 'marketplace'
  },
  {
    id: 2,
    title: 'Training Workshop',
    date: '2025-09-22',
    time: '2:00 PM',
    description: 'Learn basic obedience training techniques.',
    type: 'training'
  },
  {
    id: 7,
    title: 'Golden Meetup',
    date: '2025-09-08',
    time: '11:00 AM',
    description: 'Monthly meetup for Golden Retriever owners.',
    type: 'meetup'
  },
  {
    id: 8,
    title: 'Pet Market Bellevue',
    date: '2025-09-29',
    time: '9:00 AM',
    description: 'Browse and shop for premium pet products at our Bellevue marketplace event.',
    type: 'marketplace'
  },
  {
    id: 3,
    title: 'Golden Retriever Meetup',
    date: '2025-10-05',
    time: '11:00 AM',
    description: 'Monthly meetup for Golden Retriever owners.',
    type: 'meetup'
  },
  {
    id: 9,
    title: 'Fall Market Seattle',
    date: '2025-10-12',
    time: '10:00 AM',
    description: 'Fall-themed pet marketplace with seasonal treats and accessories.',
    type: 'marketplace'
  },
  {
    id: 4,
    title: 'Halloween Pet Costume Contest',
    date: '2025-10-31',
    time: '4:00 PM',
    description: 'Dress up your pets for our spooky costume contest!',
    type: 'playdate'
  },
  {
    id: 6,
    title: 'Advanced Agility Training',
    date: '2025-11-16',
    time: '3:00 PM',
    description: 'Advanced agility training for active dogs.',
    type: 'training'
  },
  {
    id: 10,
    title: 'Holiday Pet Market',
    date: '2025-11-23',
    time: '11:00 AM',
    description: 'Holiday-themed marketplace with festive pet accessories and gifts.',
    type: 'marketplace'
  },
  {
    id: 5,
    title: 'Thanksgiving Dog Walk',
    date: '2025-11-28',
    time: '9:00 AM',
    description: 'Thanksgiving morning walk with your furry friends.',
    type: 'playdate'
  },
  {
    id: 11,
    title: 'Winter Market Redmond',
    date: '2025-12-07',
    time: '10:00 AM',
    description: 'Winter marketplace featuring cozy pet gear and holiday treats.',
    type: 'marketplace'
  },
  {
    id: 12,
    title: 'Holiday Puppy Playdate',
    date: '2025-12-21',
    time: '2:00 PM',
    description: 'Festive holiday playdate with puppies and holiday-themed activities.',
    type: 'playdate'
  }
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
        case 'playdate':
          return 'bg-orange-200 text-orange-900 border-2 border-orange-400';
        case 'training':
          return 'bg-cyan-200 text-cyan-900 border-2 border-cyan-400';
        case 'meetup':
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
      case 'playdate':
        return 'bg-primary-100 text-primary-800 border-primary-200';
      case 'training':
        return 'bg-secondary-100 text-secondary-800 border-secondary-200';
      case 'meetup':
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
      case 'playdate':
        return '🐕';
      case 'training':
        return '🎓';
      case 'meetup':
        return '👥';
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
        <meta name="description" content="View upcoming dog events, playdates, and meetups for Bow-Bow-Ties community." />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-primary-600 hover:text-primary-700 font-semibold">
                  ← Back to Home
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Upcoming Events for Bow-Bow-Ties</h1>
                  <p className="text-gray-600 mt-1">Join our community events and connect with fellow pet lovers</p>
                </div>
              </div>
              <div className="flex space-x-2">
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
                      <span className="text-xs">🐕</span>
                    </div>
                    <span className="text-sm">Playdate Events</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-cyan-200 border-2 border-cyan-400 rounded flex items-center justify-center">
                      <span className="text-xs">🎓</span>
                    </div>
                    <span className="text-sm">Training Sessions</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-emerald-200 border-2 border-emerald-400 rounded flex items-center justify-center">
                      <span className="text-xs">👥</span>
                    </div>
                    <span className="text-sm">Community Meetups</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-pink-200 border-2 border-pink-400 rounded flex items-center justify-center">
                      <span className="text-xs">🛍️</span>
                    </div>
                    <span className="text-sm">Marketplace Events</span>
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
      </div>
    </>
  );
};

export default Calendar;
