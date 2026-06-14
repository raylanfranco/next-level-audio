// Stub data for the Classes module (Ben's upcoming window-tinting school).
// No backend yet — replace with real API once the class system is built.

export interface ClassStudent {
  id: string;
  name: string;
  email: string;
  enrolledAt: string;
}

export interface ClassCohort {
  id: string;
  title: string;
  startDate: string; // ISO date
  endDate: string;
  totalSeats: number;
  students: ClassStudent[];
  status: 'upcoming' | 'in_progress' | 'completed';
  priceCents: number;
}

export const classCohorts: ClassCohort[] = [
  {
    id: 'cohort-1',
    title: 'Master Window Tinting',
    startDate: '2026-07-13',
    endDate: '2026-07-17',
    totalSeats: 6,
    priceCents: 199900,
    status: 'upcoming',
    students: [
      { id: 's1', name: 'Marcus Reed', email: 'marcus@example.com', enrolledAt: '2026-06-01' },
      { id: 's2', name: 'Dana Okafor', email: 'dana@example.com', enrolledAt: '2026-06-03' },
      { id: 's3', name: 'Liam Pratt', email: 'liam@example.com', enrolledAt: '2026-06-05' },
      { id: 's4', name: 'Sofia Marin', email: 'sofia@example.com', enrolledAt: '2026-06-08' },
    ],
  },
  {
    id: 'cohort-2',
    title: 'Ceramic & PPF Fundamentals',
    startDate: '2026-08-04',
    endDate: '2026-08-06',
    totalSeats: 8,
    priceCents: 129900,
    status: 'upcoming',
    students: [
      { id: 's5', name: 'Priya Shah', email: 'priya@example.com', enrolledAt: '2026-06-10' },
      { id: 's6', name: 'Andre Wallace', email: 'andre@example.com', enrolledAt: '2026-06-11' },
    ],
  },
];

// The soonest upcoming cohort — used by the Overview dashboard panel.
export function nextCohort(): ClassCohort | null {
  const upcoming = classCohorts
    .filter((c) => c.status === 'upcoming')
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  return upcoming[0] ?? null;
}
