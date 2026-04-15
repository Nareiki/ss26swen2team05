import { Injectable, signal } from '@angular/core';
import { Tour } from '../models/tour';
import { TourLog, Difficulty } from '../models/tour_log';
import { MOCK_TOURS } from '../mock_data/mock_tours';
import { MOCK_TOUR_LOGS } from '../mock_data/mock_tour_logs';
import { OpenRouteService } from './open-route';

@Injectable({
  providedIn: 'root'
})
export class TourService {

  private tours = signal<Tour[]>([...MOCK_TOURS]);
  private tourLogs = signal<TourLog[]>([...MOCK_TOUR_LOGS]);
  private nextTourId = signal(100);
  private nextLogId = signal(100);

  allTours = this.tours.asReadonly();
  allLogs = this.tourLogs.asReadonly();

  constructor(private ors: OpenRouteService) {
    // Load real routes for mock tours that have coordinates but no route
    this.loadMockRoutes();
  }

  /** Fetch routes for all mock tours that have coords but no routeGeoJson */
  private async loadMockRoutes(): Promise<void> {
    const toursNeedingRoutes = this.tours().filter(
      t => t.fromCoords && t.toCoords && !t.routeGeoJson
    );

    for (const tour of toursNeedingRoutes) {
      try {
        const profile = this.ors.getProfile(tour.transportType);
        const result = await this.ors.getRoute(tour.fromCoords!, tour.toCoords!, profile);
        if (result) {
          this.tours.update(list =>
            list.map(t => t.id === tour.id ? {
              ...t,
              routeGeoJson: result.geoJson,
              distance: result.distance,
              estimatedTime: result.duration
            } : t)
          );
        }
      } catch (err) {
        console.warn(`Failed to load route for tour ${tour.id}:`, err);
      }
    }
  }

  getToursByUser(userId: number): Tour[] {
    return this.tours().filter(t => t.userId === userId);
  }

  getLogsForTour(tourId: number): TourLog[] {
    return this.tourLogs().filter(l => l.tourId === tourId);
  }

  getTourById(id: number): Tour | undefined {
    return this.tours().find(t => t.id === id);
  }

  // ── Tour CRUD ──

  createTour(tour: Omit<Tour, 'id' | 'popularity' | 'childFriendliness'>): Tour {
    const newTour: Tour = {
      ...tour,
      id: this.nextTourId(),
      popularity: 0,
      childFriendliness: 0
    };
    this.nextTourId.update(id => id + 1);
    this.tours.update(list => [...list, newTour]);
    return newTour;
  }

  updateTour(updated: Tour): void {
    this.tours.update(list =>
      list.map(t => t.id === updated.id ? { ...updated } : t)
    );
  }

  deleteTour(tourId: number): void {
    this.tours.update(list => list.filter(t => t.id !== tourId));
    this.tourLogs.update(logs => logs.filter(l => l.tourId !== tourId));
  }

  // ── Tour Log CRUD ──

  createLog(log: Omit<TourLog, 'id'>): TourLog {
    const newLog: TourLog = { ...log, id: this.nextLogId() };
    this.nextLogId.update(id => id + 1);
    this.tourLogs.update(list => [...list, newLog]);
    this.recomputeTourStats(log.tourId);
    return newLog;
  }

  updateLog(updated: TourLog): void {
    this.tourLogs.update(list =>
      list.map(l => l.id === updated.id ? { ...updated } : l)
    );
    this.recomputeTourStats(updated.tourId);
  }

  deleteLog(logId: number): void {
    const log = this.tourLogs().find(l => l.id === logId);
    if (!log) return;
    const tourId = log.tourId;
    this.tourLogs.update(list => list.filter(l => l.id !== logId));
    this.recomputeTourStats(tourId);
  }

  private recomputeTourStats(tourId: number): void {
    const logs = this.getLogsForTour(tourId);
    const popularity = logs.length;

    let childFriendliness = 5;
    if (logs.length > 0) {
      const diffMap: Record<string, number> = {
        [Difficulty.EASY]: 1, [Difficulty.MEDIUM]: 2,
        [Difficulty.HARD]: 3, [Difficulty.EXPERT]: 4
      };
      const avgDiff = logs.reduce((s, l) => s + (diffMap[l.difficulty] || 2), 0) / logs.length;
      const avgTime = logs.reduce((s, l) => s + l.totalTime, 0) / logs.length;
      const avgDist = logs.reduce((s, l) => s + l.totalDistance, 0) / logs.length;

      let score = 5;
      score -= (avgDiff - 1) * 0.8;
      score -= Math.min(avgTime / 120, 2);
      score -= Math.min(avgDist / 20, 1);
      childFriendliness = Math.max(1, Math.min(5, Math.round(score)));
    }

    this.tours.update(list =>
      list.map(t => t.id === tourId ? { ...t, popularity, childFriendliness } : t)
    );
  }

  // ── Search ──

  searchTours(query: string, userId?: number): Tour[] {
    const q = query.toLowerCase().trim();
    let tours = userId ? this.getToursByUser(userId) : this.tours();
    if (!q) return tours;

    return tours.filter(t => {
      const tourMatch =
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.from.toLowerCase().includes(q) ||
        t.to.toLowerCase().includes(q) ||
        t.transportType.toLowerCase().includes(q);
      const computedMatch =
        `popularity ${t.popularity}`.toLowerCase().includes(q) ||
        `child-friendly ${t.childFriendliness}`.toLowerCase().includes(q);
      const logs = this.getLogsForTour(t.id);
      const logMatch = logs.some(l =>
        l.comment.toLowerCase().includes(q) || l.difficulty.toLowerCase().includes(q)
      );
      return tourMatch || computedMatch || logMatch;
    });
  }

  // ── Import / Export ──

  exportTour(tourId: number): string {
    const tour = this.getTourById(tourId);
    if (!tour) return '';
    const logs = this.getLogsForTour(tourId);
    return JSON.stringify({ tour, logs }, null, 2);
  }

  importTour(json: string, userId: number): Tour | null {
    try {
      const data = JSON.parse(json);
      if (!data.tour) return null;
      const tour = this.createTour({ ...data.tour, userId, id: undefined });
      if (data.logs && Array.isArray(data.logs)) {
        for (const log of data.logs) {
          this.createLog({ ...log, tourId: tour.id, id: undefined });
        }
      }
      return tour;
    } catch { return null; }
  }
}
