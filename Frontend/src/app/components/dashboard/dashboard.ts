import { Component, signal, computed, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { TourListComponent } from '../tour-list/tour-list';
import { TourDetailComponent } from '../tour-detail/tour-detail';
import { TourFormComponent } from '../tour-form/tour-form';
import { TourLogFormComponent } from '../tour-log-form/tour-log-form';
import { MapDisplayComponent } from '../shared/map-display/map-display';
import { Tour } from '../../models/tour';
import { TourLog } from '../../models/tour_log';
import { TourService } from '../../services/tour';
import { AuthService } from '../../services/auth';

type BottomPanel = 'detail' | 'tour-form' | 'log-form';

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
  @ViewChild(MapDisplayComponent) mapDisplay?: MapDisplayComponent;

  selectedTour = signal<Tour | null>(null);
  bottomPanel = signal<BottomPanel>('detail');

  editingTour = signal<Tour | null>(null);
  editingLog = signal<TourLog | null>(null);
  logFormTourId = signal<number>(0);

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

  showDrawer = computed(() => {
    return this.selectedTour() !== null || this.bottomPanel() !== 'detail';
  });

  mapFrom = computed(() => {
    if (this.bottomPanel() === 'tour-form') return this.formFromCoords();
    return this.selectedTour()?.fromCoords ?? null;
  });

  mapTo = computed(() => {
    if (this.bottomPanel() === 'tour-form') return this.formToCoords();
    return this.selectedTour()?.toCoords ?? null;
  });

  mapRouteGeoJson = computed(() => {
    if (this.bottomPanel() === 'tour-form') return this.formRouteGeoJson();
    return this.selectedTour()?.routeGeoJson ?? null;
  });

  isMapInteractive = computed(() => this.bottomPanel() === 'tour-form');

  constructor(
    private tourService: TourService,
    private authService: AuthService,
    private router: Router
  ) {}

  onTourSelected(tour: Tour): void {
    if (this.selectedTour()?.id === tour.id && this.bottomPanel() === 'detail') {
      this.selectedTour.set(null);
      return;
    }
    this.selectedTour.set(tour);
    this.bottomPanel.set('detail');
  }

  onTourCreate(): void {
    this.editingTour.set(null);
    this.clearFormCoords();
    this.bottomPanel.set('tour-form');
  }

  onTourEdit(tour: Tour): void {
    this.editingTour.set(tour);
    this.formFromCoords.set(tour.fromCoords);
    this.formToCoords.set(tour.toCoords);
    this.formRouteGeoJson.set(tour.routeGeoJson);
    this.bottomPanel.set('tour-form');
  }

  onTourDelete(tour: Tour): void {
    this.tourService.deleteTour(tour.id);
    if (this.selectedTour()?.id === tour.id) {
      this.selectedTour.set(null);
    }
  }

  onMapFromSelected(coords: [number, number]): void {
    this.formFromCoords.set(coords);
    this.tourForm?.onMapFromSelected(coords);
  }

  onMapToSelected(coords: [number, number]): void {
    this.formToCoords.set(coords);
    this.tourForm?.onMapToSelected(coords);
  }

  onTourFormSave(tour: Tour): void {
    if (tour.id && this.editingTour()) {
      this.tourService.updateTour(tour);
      this.selectedTour.set(tour);
    } else {
      const created = this.tourService.createTour({ ...tour, userId: this.currentUserId() });
      this.selectedTour.set(created);
    }
    this.bottomPanel.set('detail');
    this.editingTour.set(null);
    this.clearFormCoords();
    this.invalidateMap();
  }

  onTourFormCancel(): void {
    this.bottomPanel.set('detail');
    this.editingTour.set(null);
    this.clearFormCoords();
    this.invalidateMap();
  }

  onAddLog(tour: Tour): void {
    this.editingLog.set(null);
    this.logFormTourId.set(tour.id);
    this.bottomPanel.set('log-form');
  }

  onEditLog(log: TourLog): void {
    this.editingLog.set(log);
    this.logFormTourId.set(log.tourId);
    this.bottomPanel.set('log-form');
  }

  onDeleteLog(log: TourLog): void {
    this.tourService.deleteLog(log.id);
    const updated = this.tourService.getTourById(log.tourId);
    if (updated) this.selectedTour.set(updated);
  }

  onLogFormSave(log: TourLog): void {
    if (log.id && this.editingLog()) {
      this.tourService.updateLog(log);
    } else {
      this.tourService.createLog({
        tourId: log.tourId, dateTime: log.dateTime, comment: log.comment,
        difficulty: log.difficulty, totalDistance: log.totalDistance,
        totalTime: log.totalTime, rating: log.rating
      });
    }
    const updated = this.tourService.getTourById(log.tourId);
    if (updated) this.selectedTour.set(updated);
    this.bottomPanel.set('detail');
    this.editingLog.set(null);
  }

  onLogFormCancel(): void {
    this.bottomPanel.set('detail');
    this.editingLog.set(null);
  }

  closeDrawer(): void {
    this.selectedTour.set(null);
    this.bottomPanel.set('detail');
    this.editingTour.set(null);
    this.editingLog.set(null);
    this.clearFormCoords();
    this.invalidateMap();
  }

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
    this.router.navigate(['/auth']);
  }

  private clearFormCoords(): void {
    this.formFromCoords.set(null);
    this.formToCoords.set(null);
    this.formRouteGeoJson.set(null);
  }

  /** Tell Leaflet to recalculate size after layout change */
  private invalidateMap(): void {
    setTimeout(() => this.mapDisplay?.invalidateSize(), 100);
  }
}
