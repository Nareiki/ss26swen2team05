import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { TourListComponent } from '../tour-list/tour-list';
import { TourDetailComponent } from '../tour-detail/tour-detail';
import { MapDisplayComponent } from '../shared/map-display/map-display';
import { Tour } from '../../models/tour';
import { TourLog } from '../../models/tour_log';
import { MOCK_TOURS } from '../../mock_data/mock_tours';
import { MOCK_TOUR_LOGS } from '../../mock_data/mock_tour_logs';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-tour-dashboard',
  standalone: true,
  imports: [TourListComponent, TourDetailComponent, MapDisplayComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class TourDashboardComponent {

  tours = signal<Tour[]>([]);
  allLogs = signal<TourLog[]>(MOCK_TOUR_LOGS);
  selectedTour = signal<Tour | null>(null);

  // Logs for the currently selected tour
  selectedTourLogs = computed(() => {
    const tour = this.selectedTour();
    if (!tour) return [];
    return this.allLogs().filter(l => l.tourId === tour.id);
  });

  constructor(private authService: AuthService) {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.tours.set(MOCK_TOURS.filter(t => t.userId === user.id));
    } else {
      this.tours.set(MOCK_TOURS);
    }
  }

  onTourSelected(tour: Tour): void {
    this.selectedTour.set(tour);
  }

  onTourCreate(): void {
    this.selectedTour.set(null);
    // TODO: open tour-form
  }

  onTourEdit(tour: Tour): void {
    this.selectedTour.set(tour);
    // TODO: open tour-form in edit mode
  }

  onTourDelete(tour: Tour): void {
    this.tours.update(list => list.filter(t => t.id !== tour.id));
    this.allLogs.update(logs => logs.filter(l => l.tourId !== tour.id));
    if (this.selectedTour()?.id === tour.id) {
      this.selectedTour.set(null);
    }
  }

  onAddLog(tour: Tour): void {
    // TODO: open tour-log-form
  }

  onEditLog(log: TourLog): void {
    // TODO: open tour-log-form in edit mode
  }

  onDeleteLog(log: TourLog): void {
    this.allLogs.update(logs => logs.filter(l => l.id !== log.id));
  }

  onExportTour(tour: Tour): void {
    // TODO: implement export
  }

  onLogout(): void {
    this.authService.logout();
    // TODO: navigate to login
  }
}
