import { Component, signal, computed, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { TourListComponent } from '../tour-list/tour-list';
import { TourDetailComponent } from '../tour-detail/tour-detail';
import { TourFormComponent } from '../tour-form/tour-form';
import { TourLogFormComponent } from '../tour-log-form/tour-log-form';
import { MapDisplayComponent } from '../shared/map-display/map-display';
import { Tour } from '../../models/tour';
import { TourLog } from '../../models/tour_log';
import { TourService } from '../../services/tour';
import { AuthService } from '../../services/auth';

type RightPanel = 'detail' | 'tour-form' | 'log-form';

@Component({
  selector: 'app-tour-dashboard',
  standalone: true,
  imports: [TourListComponent, TourDetailComponent, TourFormComponent, TourLogFormComponent, MapDisplayComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent {

  @ViewChild(TourFormComponent) tourForm?: TourFormComponent;

  selectedTour = signal<Tour | null>(null);
  rightPanel = signal<RightPanel>('detail');

  // Tour form state
  editingTour = signal<Tour | null>(null);

  // Log form state
  editingLog = signal<TourLog | null>(null);
  logFormTourId = signal<number>(0);

  // Map form preview
  formFromCoords = signal<[number, number] | null>(null);
  formToCoords = signal<[number, number] | null>(null);
  formRouteGeoJson = signal<any>(null);

  tours = computed(() => {
    const all = this.tourService.allTours();
    const user = this.authService.getCurrentUser();
    if (user) return all.filter(t => t.userId === user.id);
    return all;
  });

  selectedTourLogs = computed(() => {
    const tour = this.selectedTour();
    const allLogs = this.tourService.allLogs();
    if (!tour) return [];
    return allLogs.filter(l => l.tourId === tour.id);
  });

  currentUserId = computed(() => this.authService.getCurrentUser()?.id ?? 1);

  mapFrom = computed(() => {
    if (this.rightPanel() === 'tour-form') return this.formFromCoords();
    return this.selectedTour()?.fromCoords ?? null;
  });

  mapTo = computed(() => {
    if (this.rightPanel() === 'tour-form') return this.formToCoords();
    return this.selectedTour()?.toCoords ?? null;
  });

  mapRouteGeoJson = computed(() => {
    if (this.rightPanel() === 'tour-form') return this.formRouteGeoJson();
    return this.selectedTour()?.routeGeoJson ?? null;
  });

  isMapInteractive = computed(() => this.rightPanel() === 'tour-form');

  constructor(
    private tourService: TourService,
    private authService: AuthService
  ) {}

  // ── Tour List Events ──

  onTourSelected(tour: Tour): void {
    this.selectedTour.set(tour);
    this.rightPanel.set('detail');
  }

  onTourCreate(): void {
    this.editingTour.set(null);
    this.formFromCoords.set(null);
    this.formToCoords.set(null);
    this.formRouteGeoJson.set(null);
    this.rightPanel.set('tour-form');
  }

  onTourEdit(tour: Tour): void {
    this.editingTour.set(tour);
    this.formFromCoords.set(tour.fromCoords);
    this.formToCoords.set(tour.toCoords);
    this.formRouteGeoJson.set(tour.routeGeoJson);
    this.rightPanel.set('tour-form');
  }

  onTourDelete(tour: Tour): void {
    this.tourService.deleteTour(tour.id);
    if (this.selectedTour()?.id === tour.id) {
      this.selectedTour.set(null);
    }
  }

  // ── Map Click ──

  onMapFromSelected(coords: [number, number]): void {
    this.formFromCoords.set(coords);
    this.tourForm?.onMapFromSelected(coords);
  }

  onMapToSelected(coords: [number, number]): void {
    this.formToCoords.set(coords);
    this.tourForm?.onMapToSelected(coords);
  }

  // ── Tour Form Events ──

  onTourFormSave(tour: Tour): void {
    if (tour.id && this.editingTour()) {
      this.tourService.updateTour(tour);
      this.selectedTour.set(tour);
    } else {
      const created = this.tourService.createTour({ ...tour, userId: this.currentUserId() });
      this.selectedTour.set(created);
    }
    this.rightPanel.set('detail');
    this.editingTour.set(null);
    this.clearFormCoords();
  }

  onTourFormCancel(): void {
    this.rightPanel.set('detail');
    this.editingTour.set(null);
    this.clearFormCoords();
  }

  // ── Log Events ──

  onAddLog(tour: Tour): void {
    this.editingLog.set(null);
    this.logFormTourId.set(tour.id);
    this.rightPanel.set('log-form');
  }

  onEditLog(log: TourLog): void {
    this.editingLog.set(log);
    this.logFormTourId.set(log.tourId);
    this.rightPanel.set('log-form');
  }

  onDeleteLog(log: TourLog): void {
    this.tourService.deleteLog(log.id);
    // Refresh selected tour for updated computed values
    const updated = this.tourService.getTourById(log.tourId);
    if (updated) this.selectedTour.set(updated);
  }

  onLogFormSave(log: TourLog): void {
    if (log.id && this.editingLog()) {
      this.tourService.updateLog(log);
    } else {
      this.tourService.createLog({
        tourId: log.tourId,
        dateTime: log.dateTime,
        comment: log.comment,
        difficulty: log.difficulty,
        totalDistance: log.totalDistance,
        totalTime: log.totalTime,
        rating: log.rating
      });
    }
    // Refresh selected tour
    const updated = this.tourService.getTourById(log.tourId);
    if (updated) this.selectedTour.set(updated);
    this.rightPanel.set('detail');
    this.editingLog.set(null);
  }

  onLogFormCancel(): void {
    this.rightPanel.set('detail');
    this.editingLog.set(null);
  }

  // ── Detail Events ──

  onExportTour(tour: Tour): void {
    const json = this.tourService.exportTour(tour.id);
    if (!json) return;
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tour-${tour.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  onLogout(): void {
    this.authService.logout();
  }

  private clearFormCoords(): void {
    this.formFromCoords.set(null);
    this.formToCoords.set(null);
    this.formRouteGeoJson.set(null);
  }
}
