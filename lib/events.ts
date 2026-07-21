export interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  description: string;
  type: 'partner events' | 'celebration days' | 'marketplace';
}

export const events: Event[] = [
  {
    id: 1,
    title: 'National Cat Day',
    date: '2025-10-29',
    time: 'All Day',
    description: "It's National Cat Day! Give your feline friend some extra attention and love. Better yet, spoil them with a new collar and charm!",
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
  {
    id: 4,
    title: "Pop-Up at Bella's Voice store",
    date: '2025-11-22',
    time: '12:00PM-3:00PM',
    description: "Pop-up event at the Bella's Voice location in Lynwood, Washington!",
    type: 'partner events'
  },
  {
    id: 5,
    title: "Pop-Up at Coby's Cafe",
    date: '2025-12-07',
    time: '11:00AM-3:00PM',
    description: "Pop-up event at the Coby's Cafe location in Seattle, Washington!",
    type: 'partner events'
  },
  {
    id: 6,
    title: "Bella's Voice New Location Celebration",
    date: '2026-01-31',
    time: '10:00AM-2:00PM',
    description: "Pop-up event at the Bella's Voice location in Shoreline, Washington!",
    type: 'partner events'
  },
  {
    id: 7,
    title: 'Bothell Pet Fair',
    date: '2026-06-12',
    time: '11:00AM-2:00PM',
    description: 'Marketplace event at the Bothell Police Department! Over 40 local pet affiliated vendors.',
    type: 'marketplace'
  },
  {
    id: 8,
    title: "Bellvue Children's Business Fair",
    date: '2026-07-11',
    time: '2:30PM-6:00PM',
    description: 'Marketplace event at Bellvue Downtown Park! Support several youth entrpreneurs.',
    type: 'marketplace'
  },
  {
    id: 9,
    title: "Mother's Day Market",
    date: '2026-05-09',
    time: '10:00AM-3:00PM',
    description: "Marketplace event at the Rusty Pelican! Support several entrpreneurs on a Mother's day event.",
    type: 'marketplace'
  },
  {
    id: 10,
    title: "Kenmore Children's Business Fair",
    date: '2026-09-05',
    time: 'All Day',
    description: 'Marketplace event in Kenmore! Support young local entrepreneurs.',
    type: 'marketplace'
  },
];

export function getNextEvent(): Event | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return (
    events
      .filter(e => new Date(e.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] ?? null
  );
}

export function getEventTypeColor(type: string): string {
  switch (type) {
    case 'partner events':   return 'bg-secondary-100 text-secondary-800 border-secondary-200';
    case 'celebration days': return 'bg-green-100 text-green-800 border-green-200';
    case 'marketplace':      return 'bg-pink-100 text-pink-800 border-pink-200';
    default:                 return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getEventTypeIcon(type: string): string {
  switch (type) {
    case 'partner events':   return '🎓';
    case 'celebration days': return '🐾';
    case 'marketplace':      return '🛍️';
    default:                 return '📅';
  }
}
