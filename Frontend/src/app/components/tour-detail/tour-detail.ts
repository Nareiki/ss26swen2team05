import {
  Component, Input, Output, EventEmitter,
  signal, computed, ChangeDetectionStrategy
} from '@angular/core';
import { Tour, TransportType } from '../../models/tour';
import { TourLog } from '../../models/tour_log';

@Component({
  selector: 'app-tour-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tour-detail.html',
  styleUrls: ['./tour-detail.scss']
})
export class TourDetailComponent {

  @Input() set tour(value: Tour | null) {
    this._tour.set(value);
  }

  @Input() set logs(value: TourLog[]) {
    this._logs.set(value);
  }

  @Output() editTour = new EventEmitter<Tour>();
  @Output() deleteTour = new EventEmitter<Tour>();
  @Output() addLog = new EventEmitter<Tour>();
  @Output() editLog = new EventEmitter<TourLog>();
  @Output() deleteLog = new EventEmitter<TourLog>();
  @Output() exportTour = new EventEmitter<Tour>();

  _tour = signal<Tour | null>(null);
  _logs = signal<TourLog[]>([]);

  // Tab state
  activeTab = signal<'info' | 'logs'>('info');

  // Computed stats from logs
  avgRating = computed(() => {
    const logs = this._logs();
    if (logs.length === 0) return 0;
    return +(logs.reduce((sum, l) => sum + l.rating, 0) / logs.length).toFixed(1);
  });

  totalLogs = computed(() => this._logs().length);

  avgDifficulty = computed(() => {
    const logs = this._logs();
    if (logs.length === 0) return '—';
    const diffMap: Record<string, number> = { EASY: 1, MEDIUM: 2, HARD: 3, EXPERT: 4 };
    const avg = logs.reduce((sum, l) => sum + (diffMap[l.difficulty] || 2), 0) / logs.length;
    if (avg <= 1.5) return 'Easy';
    if (avg <= 2.5) return 'Medium';
    if (avg <= 3.5) return 'Hard';
    return 'Expert';
  });

  getTransportLabel(type: TransportType): string {
    switch (type) {
      case TransportType.BIKE: return '🚴 Bike';
      case TransportType.HIKE: return '🥾 Hike';
      case TransportType.RUNNING: return '🏃 Running';
      case TransportType.VACATION: return '✈️ Vacation';
      default: return type;
    }
  }

  formatTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('de-AT', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  onEdit(): void {
    const t = this._tour();
    if (t) this.editTour.emit(t);
  }

  onDelete(): void {
    const t = this._tour();
    if (t) this.deleteTour.emit(t);
  }

  onExport(): void {
    const t = this._tour();
    if (t) this.exportTour.emit(t);
  }

  onAddLog(): void {
    const t = this._tour();
    if (t) this.addLog.emit(t);
  }

  onEditLog(log: TourLog): void {
    this.editLog.emit(log);
  }

  onDeleteLog(event: Event, log: TourLog): void {
    event.stopPropagation();
    this.deleteLog.emit(log);
  }
}
