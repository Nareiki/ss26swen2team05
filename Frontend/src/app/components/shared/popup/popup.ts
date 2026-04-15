import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-popup',
  imports: [],
  templateUrl: './popup.html',
  styleUrl: './popup.scss',
})
export class PopupComponent {
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() confirmText: string = 'OK';
  @Output() confirmed = new EventEmitter<void>();

  onConfirm() {
    this.confirmed.emit();
  }
}
