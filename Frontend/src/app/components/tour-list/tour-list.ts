import {
  Component, Input, Output, EventEmitter,
  signal, computed, ChangeDetectionStrategy
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Tour, TransportType } from '../../models/tour';
import { PopupComponent } from '../shared/popup/popup';

@Component({
  selector: 'app-tour-list',
  standalone: true,
  imports: [FormsModule, PopupComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tour-list.html',
  styleUrls: ['./tour-list.scss']
})
export class TourListComponent {

  @Input() set tours(value: Tour[]) {
    this.allTours.set(value);
  }

  @Output() tourSelected = new EventEmitter<Tour>();
  @Output() tourCreate = new EventEmitter<void>();
  @Output() tourEdit = new EventEmitter<Tour>();
  @Output() tourDelete = new EventEmitter<Tour>();

  allTours = signal<Tour[]>([]);
  searchQuery = signal('');
  selectedTourId = signal<number | null>(null);

  showDeleteConfirm = signal(false);
  tourToDelete = signal<Tour | null>(null);

  filteredTours = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const tours = this.allTours();
    if (!q) return tours;

    return tours.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.from.toLowerCase().includes(q) ||
      t.to.toLowerCase().includes(q) ||
      t.transportType.toLowerCase().includes(q) ||
      `popularity ${t.popularity}`.includes(q) ||
      `child-friendly ${t.childFriendliness}`.includes(q)
    );
  });

  deleteMessage = computed(() => {
    const tour = this.tourToDelete();
    if (!tour) return '';
    return `Are you sure you want to delete "${tour.name}"? This will also delete all associated logs.`;
  });

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  onSelect(tour: Tour): void {
    this.selectedTourId.set(tour.id);
    this.tourSelected.emit(tour);
  }

  onCreate(): void {
    this.tourCreate.emit();
  }

  onEdit(event: Event, tour: Tour): void {
    event.stopPropagation();
    this.tourEdit.emit(tour);
  }

  onDeleteClick(event: Event, tour: Tour): void {
    event.stopPropagation();
    this.tourToDelete.set(tour);
    this.showDeleteConfirm.set(true);
  }

  onConfirmDelete(): void {
    const tour = this.tourToDelete();
    if (tour) this.tourDelete.emit(tour);
    this.showDeleteConfirm.set(false);
    this.tourToDelete.set(null);
  }

  onCancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.tourToDelete.set(null);
  }

  formatTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }
}
