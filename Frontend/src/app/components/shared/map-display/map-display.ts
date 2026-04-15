import {
  Component, AfterViewInit, OnDestroy, OnChanges, SimpleChanges,
  Input, Output, EventEmitter, ElementRef, ViewChild,
  signal, ChangeDetectionStrategy
} from '@angular/core';
import * as L from 'leaflet';

const iconDefault = L.icon({
  iconRetinaUrl: 'assets/marker-icon-2x.png',
  iconUrl: 'assets/marker-icon.png',
  shadowUrl: 'assets/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41],
  popupAnchor: [1, -34], shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-map-display',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './map-display.html',
  styleUrls: ['./map-display.scss']
})
export class MapDisplayComponent implements AfterViewInit, OnDestroy, OnChanges {

  @ViewChild('mapContainer', { static: true }) mapRef!: ElementRef<HTMLDivElement>;

  @Input() center: [number, number] = [48.2082, 16.3738];
  @Input() zoom = 7;
  @Input() from: [number, number] | null = null;
  @Input() to: [number, number] | null = null;
  @Input() routeGeoJson: any = null;
  @Input() interactive = false;
  @Input() height = '100%';

  @Output() fromSelected = new EventEmitter<[number, number]>();
  @Output() toSelected = new EventEmitter<[number, number]>();
  @Output() mapReady = new EventEmitter<L.Map>();

  selectingFrom = signal(true);

  private map!: L.Map;
  private fromMarker: L.Marker | null = null;
  private toMarker: L.Marker | null = null;
  private routeLayer: L.GeoJSON | null = null;
  private glowLayer: L.GeoJSON | null = null;

  private fromIcon = L.divIcon({
    className: 'custom-marker custom-marker--from',
    html: '<div class="marker-pulse"></div><div class="marker-dot"></div>',
    iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -16]
  });
  private toIcon = L.divIcon({
    className: 'custom-marker custom-marker--to',
    html: '<div class="marker-pulse"></div><div class="marker-dot"></div>',
    iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -16]
  });

  ngAfterViewInit(): void { this.initMap(); }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.map) return;
    if (changes['from'] || changes['to']) this.updateMarkers();
    if (changes['routeGeoJson']) this.updateRoute();
    if (changes['center'] || changes['zoom']) this.map.setView(this.center, this.zoom);
  }

  ngOnDestroy(): void { this.map?.remove(); }

  private initMap(): void {
    // Standard OSM tiles — dark mode is handled by CSS filter on img.leaflet-tile
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    this.map = L.map(this.mapRef.nativeElement, {
      center: this.center,
      zoom: this.zoom,
      layers: [tiles],
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    setTimeout(() => this.map.invalidateSize(), 200);

    if (this.interactive) {
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        const latlng: [number, number] = [e.latlng.lat, e.latlng.lng];
        if (this.selectingFrom()) {
          this.setFromMarker(latlng);
          this.fromSelected.emit(latlng);
        } else {
          this.setToMarker(latlng);
          this.toSelected.emit(latlng);
        }
        this.selectingFrom.update(v => !v);
      });
    }

    this.updateMarkers();
    this.updateRoute();
    this.mapReady.emit(this.map);
  }

  private updateMarkers(): void {
    if (this.from) this.setFromMarker(this.from);
    if (this.to) this.setToMarker(this.to);
    this.fitBoundsToMarkers();
  }

  private setFromMarker(latlng: [number, number]): void {
    if (this.fromMarker) this.map.removeLayer(this.fromMarker);
    this.fromMarker = L.marker(latlng, { icon: this.fromIcon })
      .addTo(this.map).bindPopup('<span>Start</span>');
  }

  private setToMarker(latlng: [number, number]): void {
    if (this.toMarker) this.map.removeLayer(this.toMarker);
    this.toMarker = L.marker(latlng, { icon: this.toIcon })
      .addTo(this.map).bindPopup('<span>Destination</span>');
  }

  private fitBoundsToMarkers(): void {
    const pts: L.LatLng[] = [];
    if (this.fromMarker) pts.push(this.fromMarker.getLatLng());
    if (this.toMarker) pts.push(this.toMarker.getLatLng());
    if (pts.length === 2) this.map.fitBounds(L.latLngBounds(pts), { padding: [50, 50] });
    else if (pts.length === 1) this.map.setView(pts[0], 13);
  }

  private updateRoute(): void {
    if (this.routeLayer) { this.map.removeLayer(this.routeLayer); this.routeLayer = null; }
    if (this.glowLayer) { this.map.removeLayer(this.glowLayer); this.glowLayer = null; }
    if (!this.routeGeoJson) return;

    this.routeLayer = L.geoJSON(this.routeGeoJson, {
      style: () => ({ color: '#00d4ff', weight: 4, opacity: 0.9 })
    }).addTo(this.map);
    this.glowLayer = L.geoJSON(this.routeGeoJson, {
      style: () => ({ color: '#00d4ff', weight: 14, opacity: 0.2 })
    }).addTo(this.map);

    const bounds = this.routeLayer.getBounds();
    if (bounds.isValid()) this.map.fitBounds(bounds, { padding: [50, 50] });
  }

  invalidateSize(): void { this.map && setTimeout(() => this.map.invalidateSize(), 0); }

  resetSelection(): void {
    this.selectingFrom.set(true);
    [this.fromMarker, this.toMarker, this.routeLayer, this.glowLayer].forEach(l => {
      if (l) this.map.removeLayer(l);
    });
    this.fromMarker = this.toMarker = this.routeLayer = this.glowLayer = null;
  }

  getMap(): L.Map { return this.map; }
}
