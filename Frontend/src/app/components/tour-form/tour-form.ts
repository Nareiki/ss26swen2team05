import {
  Component, Input, Output, EventEmitter,
  signal, OnInit, ChangeDetectionStrategy
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Tour, TransportType } from '../../models/tour';
import { OpenRouteService } from '../../services/open-route';

@Component({
  selector: 'app-tour-form',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tour-form.html',
  styleUrls: ['./tour-form.scss']
})
export class TourFormComponent implements OnInit {

  @Input() tour: Tour | null = null;
  @Input() userId: number = 1;

  @Output() tourSaved = new EventEmitter<Tour>();
  @Output() cancel = new EventEmitter<void>();

  isEditMode = signal(false);
  isLoading = signal(false);

  name = signal('');
  description = signal('');
  from = signal('');
  to = signal('');
  transportType = signal<TransportType>(TransportType.HIKE);
  imageUrl = signal('');

  fromCoords = signal<[number, number] | null>(null);
  toCoords = signal<[number, number] | null>(null);

  distance = signal<number>(0);
  estimatedTime = signal<number>(0);
  routeGeoJson = signal<any>(null);

  errors = signal<Record<string, string>>({});
  statusMessage = signal('');

  transportTypes: { value: TransportType; label: string }[] = [
    { value: TransportType.BIKE, label: 'Bike' },
    { value: TransportType.HIKE, label: 'Hike' },
    { value: TransportType.RUNNING, label: 'Running' },
    { value: TransportType.VACATION, label: 'Vacation' }
  ];

  constructor(private ors: OpenRouteService) {}

  ngOnInit(): void {
    if (this.tour) {
      this.isEditMode.set(true);
      this.name.set(this.tour.name);
      this.description.set(this.tour.description);
      this.from.set(this.tour.from);
      this.to.set(this.tour.to);
      this.transportType.set(this.tour.transportType);
      this.imageUrl.set(this.tour.imageUrl ?? '');
      this.fromCoords.set(this.tour.fromCoords);
      this.toCoords.set(this.tour.toCoords);
      this.distance.set(this.tour.distance);
      this.estimatedTime.set(this.tour.estimatedTime);
      this.routeGeoJson.set(this.tour.routeGeoJson);
    }
  }

  onFieldChange(field: string, event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    switch (field) {
      case 'name': this.name.set(value); break;
      case 'description': this.description.set(value); break;
      case 'from': this.from.set(value); break;
      case 'to': this.to.set(value); break;
      case 'imageUrl': this.imageUrl.set(value); break;
    }
    this.errors.update(e => { const c = { ...e }; delete c[field]; return c; });
  }

  async onFromBlur(): Promise<void> {
    const text = this.from().trim();
    if (!text) return;
    this.statusMessage.set('Geocoding start location...');
    const coords = await this.ors.geocode(text);
    if (coords) {
      this.fromCoords.set(coords);
      this.statusMessage.set('Start location found');
      this.tryCalculateRoute();
    } else {
      this.statusMessage.set('Could not find start location');
    }
  }

  async onToBlur(): Promise<void> {
    const text = this.to().trim();
    if (!text) return;
    this.statusMessage.set('Geocoding destination...');
    const coords = await this.ors.geocode(text);
    if (coords) {
      this.toCoords.set(coords);
      this.statusMessage.set('Destination found');
      this.tryCalculateRoute();
    } else {
      this.statusMessage.set('Could not find destination');
    }
  }

  async onMapFromSelected(coords: [number, number]): Promise<void> {
    this.fromCoords.set(coords);
    const name = await this.ors.reverseGeocode(coords[0], coords[1]);
    this.from.set(name ?? `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`);
    this.tryCalculateRoute();
  }

  async onMapToSelected(coords: [number, number]): Promise<void> {
    this.toCoords.set(coords);
    const name = await this.ors.reverseGeocode(coords[0], coords[1]);
    this.to.set(name ?? `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`);
    this.tryCalculateRoute();
  }

  private async tryCalculateRoute(): Promise<void> {
    const f = this.fromCoords();
    const t = this.toCoords();
    if (!f || !t) return;

    this.isLoading.set(true);
    this.statusMessage.set('Calculating route...');

    const profile = this.ors.getProfile(this.transportType());
    const result = await this.ors.getRoute(f, t, profile);

    if (result) {
      this.distance.set(result.distance);
      this.estimatedTime.set(result.duration);
      this.routeGeoJson.set(result.geoJson);
      this.statusMessage.set(`Route: ${result.distance} km, ~${this.formatTime(result.duration)}`);
    } else {
      this.statusMessage.set('Route calculation failed');
    }
    this.isLoading.set(false);
  }

  onTransportChange(type: TransportType): void {
    this.transportType.set(type);
    this.tryCalculateRoute();
  }

  validate(): boolean {
    const errs: Record<string, string> = {};
    if (!this.name().trim()) errs['name'] = 'Name is required';
    if (!this.from().trim()) errs['from'] = 'Start location is required';
    if (!this.to().trim()) errs['to'] = 'Destination is required';
    this.errors.set(errs);
    return Object.keys(errs).length === 0;
  }

  onSave(): void {
    if (!this.validate()) return;

    const tourData: Tour = {
      id: this.tour?.id ?? 0,
      userId: this.tour?.userId ?? this.userId,
      name: this.name().trim(),
      description: this.description().trim(),
      from: this.from().trim(),
      to: this.to().trim(),
      transportType: this.transportType(),
      distance: this.distance(),
      estimatedTime: this.estimatedTime(),
      routeGeoJson: this.routeGeoJson(),
      routeImagePath: this.tour?.routeImagePath ?? '',
      imageUrl: this.imageUrl().trim(),
      popularity: this.tour?.popularity ?? 0,
      childFriendliness: this.tour?.childFriendliness ?? 0,
      fromCoords: this.fromCoords(),
      toCoords: this.toCoords()
    };

    this.tourSaved.emit(tourData);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  formatTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }
}
