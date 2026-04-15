import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { TourListComponent } from '../tour-list/tour-list';
import { MapDisplayComponent } from '../shared/map-display/map-display';
import { Tour } from '../../models/tour';
import { MOCK_TOURS } from '../../mock_data/mock_tours';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-tour-dashboard',
  standalone: true,
  imports: [TourListComponent, MapDisplayComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class TourDashboardComponent {

  tours = signal<Tour[]>([]);
  selectedTour = signal<Tour | null>(null);

  // Panels that can be toggled later
  showForm = signal(false);
  showDetail = signal(true);

  constructor(private authService: AuthService) {
    // Load tours for current user
    const user = this.authService.getCurrentUser();
    if (user) {
      this.tours.set(MOCK_TOURS.filter(t => t.userId === user.id));
    } else {
      this.tours.set(MOCK_TOURS);
    }
  }

  onTourSelected(tour: Tour): void {
    this.selectedTour.set(tour);
    this.showDetail.set(true);
    this.showForm.set(false);
  }

  onTourCreate(): void {
    this.selectedTour.set(null);
    this.showForm.set(true);
    this.showDetail.set(false);
    // TODO: open tour-form component
  }

  onTourEdit(tour: Tour): void {
    this.selectedTour.set(tour);
    this.showForm.set(true);
    this.showDetail.set(false);
    // TODO: open tour-form component in edit mode
  }

  onTourDelete(tour: Tour): void {
    this.tours.update(list => list.filter(t => t.id !== tour.id));
    if (this.selectedTour()?.id === tour.id) {
      this.selectedTour.set(null);
    }
  }

  onLogout(): void {
    this.authService.logout();
    // TODO: navigate to login
  }
}
