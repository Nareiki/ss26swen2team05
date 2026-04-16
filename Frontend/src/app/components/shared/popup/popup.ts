import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [],
  templateUrl: './popup.html',
  styleUrl: './popup.scss',
})
export class PopupComponent {
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() confirmText: string = 'OK';
  @Input() cancelText: string = '';  // empty = no cancel button (single button mode)
  @Input() variant: 'default' | 'danger' = 'default';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }

  onOverlayClick() {
    // If we have a cancel button, overlay click = cancel
    if (this.cancelText) {
      this.cancelled.emit();
    }
  }
}
