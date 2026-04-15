export interface TourLog {
  id: number;
  tourId: number;
  dateTime: string;       // ISO date string
  comment: string;
  difficulty: Difficulty;
  totalDistance: number;   // in km, actual recorded
  totalTime: number;      // in minutes, actual recorded
  rating: number;         // 1-5
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  EXPERT = 'EXPERT'
}
