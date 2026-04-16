import {
  Component, Input, Output, EventEmitter,
  signal, OnInit, ChangeDetectionStrategy
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TourLog, Difficulty } from '../../models/tour_log';

@Component({
  selector: 'app-tour-log-form',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tour-log-form.html',
  styleUrls: ['./tour-log-form.scss']
})
export class TourLogFormComponent implements OnInit {

  @Input() log: TourLog | null = null;
  @Input() tourId: number = 0;

  @Output() logSaved = new EventEmitter<TourLog>();
  @Output() cancel = new EventEmitter<void>();

  isEditMode = signal(false);

  dateTime = signal('');
  comment = signal('');
  difficulty = signal<Difficulty>(Difficulty.MEDIUM);
  totalDistance = signal<number>(0);
  totalTime = signal<number>(0);
  rating = signal<number>(3);

  errors = signal<Record<string, string>>({});

  difficulties = [
    { value: Difficulty.EASY, label: 'Easy' },
    { value: Difficulty.MEDIUM, label: 'Medium' },
    { value: Difficulty.HARD, label: 'Hard' },
    { value: Difficulty.EXPERT, label: 'Expert' }
  ];

  ngOnInit(): void {
    if (this.log) {
      this.isEditMode.set(true);
      this.dateTime.set(this.log.dateTime.slice(0, 16)); // format for datetime-local
      this.comment.set(this.log.comment);
      this.difficulty.set(this.log.difficulty);
      this.totalDistance.set(this.log.totalDistance);
      this.totalTime.set(this.log.totalTime);
      this.rating.set(this.log.rating);
    } else {
      // Default to now
      const now = new Date();
      this.dateTime.set(now.toISOString().slice(0, 16));
    }
  }

  onFieldChange(field: string, event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    switch (field) {
      case 'dateTime': this.dateTime.set(value); break;
      case 'comment': this.comment.set(value); break;
      case 'totalDistance': this.totalDistance.set(parseFloat(value) || 0); break;
      case 'totalTime': this.totalTime.set(parseInt(value) || 0); break;
    }
    this.errors.update(e => { const c = { ...e }; delete c[field]; return c; });
  }

  setDifficulty(diff: Difficulty): void {
    this.difficulty.set(diff);
  }

  setRating(stars: number): void {
    this.rating.set(stars);
  }

  validate(): boolean {
    const errs: Record<string, string> = {};
    if (!this.dateTime()) errs['dateTime'] = 'Date is required';
    if (this.totalDistance() <= 0) errs['totalDistance'] = 'Distance must be greater than 0';
    if (this.totalTime() <= 0) errs['totalTime'] = 'Time must be greater than 0';
    this.errors.set(errs);
    return Object.keys(errs).length === 0;
  }

  onSave(): void {
    if (!this.validate()) return;

    const logData: TourLog = {
      id: this.log?.id ?? 0,
      tourId: this.log?.tourId ?? this.tourId,
      dateTime: this.dateTime(),
      comment: this.comment().trim(),
      difficulty: this.difficulty(),
      totalDistance: this.totalDistance(),
      totalTime: this.totalTime(),
      rating: this.rating()
    };

    this.logSaved.emit(logData);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
