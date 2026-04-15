import { TourLog, Difficulty } from '../models/tour_log';

export const MOCK_TOUR_LOGS: TourLog[] = [
  {
    id: 1,
    tourId: 1,
    dateTime: '2025-03-15T09:30:00',
    comment: 'Great weather, smooth ride through Semmering.',
    difficulty: Difficulty.MEDIUM,
    totalDistance: 205,
    totalTime: 510,
    rating: 4
  },
  {
    id: 2,
    tourId: 1,
    dateTime: '2025-04-02T07:00:00',
    comment: 'Rainy day, had to stop twice.',
    difficulty: Difficulty.HARD,
    totalDistance: 198,
    totalTime: 560,
    rating: 3
  },
  {
    id: 3,
    tourId: 1,
    dateTime: '2025-05-20T08:15:00',
    comment: '',
    difficulty: Difficulty.MEDIUM,
    totalDistance: 202,
    totalTime: 490,
    rating: 5
  },
  {
    id: 4,
    tourId: 2,
    dateTime: '2025-06-10T06:00:00',
    comment: 'Stunning views at the top. Very steep final section.',
    difficulty: Difficulty.EXPERT,
    totalDistance: 14,
    totalTime: 300,
    rating: 5
  },
  {
    id: 5,
    tourId: 3,
    dateTime: '2025-07-01T06:30:00',
    comment: 'Easy morning run along the canal.',
    difficulty: Difficulty.EASY,
    totalDistance: 8,
    totalTime: 42,
    rating: 4
  },
  {
    id: 6,
    tourId: 3,
    dateTime: '2025-07-15T06:45:00',
    comment: 'Slightly faster today.',
    difficulty: Difficulty.EASY,
    totalDistance: 8,
    totalTime: 39,
    rating: 4
  }
];
