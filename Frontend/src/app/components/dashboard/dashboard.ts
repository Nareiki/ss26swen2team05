import { Component, signal, computed, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { TourListComponent } from '../tour-list/tour-list';
import { TourDetailComponent } from '../tour-detail/tour-detail';
import { MapDisplayComponent } from '../shared/map-display/map-display';
import { Tour } from '../../models/tour';
import { TourLog } from '../../models/tour_log';
import { MOCK_TOURS } from '../../mock_data/mock_tours';
import { MOCK_TOUR_LOGS } from '../../mock_data/mock_tour_logs';
import { AuthService } from '../../services/auth';
import { TourService } from '../../services/tour';
import { TourFormComponent } from '../tour-form/tour-form';

@Component({
  selector: 'app-tour-dashboard',
  standalone: true,
  imports: [TourListComponent, TourDetailComponent, MapDisplayComponent, TourFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class DashboardComponent {

  @ViewChild(TourFormComponent) tourForm?: TourFormComponent;

  selectedTour = signal<Tour | null>(null);
  showForm = signal(false);
  editingTour = signal<Tour | null>(null);

  // Live coords from form (for map preview while editing)
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

  currentUserId = computed(() => {
    return this.authService.getCurrentUser()?.id ?? 1;
  });

  // Map shows form coords when editing, otherwise selected tour coords
  mapFrom = computed(() => {
    if (this.showForm()) return this.formFromCoords();
    return this.selectedTour()?.fromCoords ?? null;
  });

  mapTo = computed(() => {
    if (this.showForm()) return this.formToCoords();
    return this.selectedTour()?.toCoords ?? null;
  });

  mapRouteGeoJson = computed(() => {
    if (this.showForm()) return this.formRouteGeoJson();
    return this.selectedTour()?.routeGeoJson ?? null;
  });

  constructor(
    private tourService: TourService,
    private authService: AuthService
  ) {}

  // ── Tour List Events ──

  onTourSelected(tour: Tour): void {
    this.selectedTour.set(tour);
    this.showForm.set(false);
  }

  onTourCreate(): void {
    this.editingTour.set(null);
    this.formFromCoords.set(null);
    this.formToCoords.set(null);
    this.formRouteGeoJson.set(null);
    this.showForm.set(true);
  }

  onTourEdit(tour: Tour): void {
    this.editingTour.set(tour);
    this.formFromCoords.set(tour.fromCoords);
    this.formToCoords.set(tour.toCoords);
    this.formRouteGeoJson.set(tour.routeGeoJson);
    this.showForm.set(true);
  }

  onTourDelete(tour: Tour): void {
    this.tourService.deleteTour(tour.id);
    if (this.selectedTour()?.id === tour.id) {
      this.selectedTour.set(null);
    }
  }

  // ── Map Click Events (interactive mode when form is open) ──

  onMapFromSelected(coords: [number, number]): void {
    this.formFromCoords.set(coords);
    this.tourForm?.onMapFromSelected(coords);
  }

  onMapToSelected(coords: [number, number]): void {
    this.formToCoords.set(coords);
    this.tourForm?.onMapToSelected(coords);
  }

  // ── Form Events ──

  onFormSave(tour: Tour): void {
    if (tour.id && this.editingTour()) {
      this.tourService.updateTour(tour);
      this.selectedTour.set(tour);
    } else {
      const created = this.tourService.createTour({
        ...tour,
        userId: this.currentUserId()
      });
      this.selectedTour.set(created);
    }
    this.showForm.set(false);
    this.editingTour.set(null);
    this.formFromCoords.set(null);
    this.formToCoords.set(null);
    this.formRouteGeoJson.set(null);
  }

  onFormCancel(): void {
    this.showForm.set(false);
    this.editingTour.set(null);
    this.formFromCoords.set(null);
    this.formToCoords.set(null);
    this.formRouteGeoJson.set(null);
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

  onAddLog(tour: Tour): void {
    // TODO: tour-log-form
  }

  onEditLog(log: TourLog): void {
    // TODO: tour-log-form edit
  }

  onDeleteLog(log: TourLog): void {
    this.tourService.deleteLog(log.id);
    const updated = this.tourService.getTourById(log.tourId);
    if (updated) this.selectedTour.set(updated);
  }

  onLogout(): void {
    this.authService.logout();
  }
}

