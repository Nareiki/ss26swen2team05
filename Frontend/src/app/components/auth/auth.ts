import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { PopupComponent } from '../shared/popup/popup';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, PopupComponent],
  templateUrl: './auth.html',
  styleUrls: ['./auth.scss'],
})
export class AuthComponent {
  isRegisterMode = false;
  showPopup = false;

  // Login fields
  loginUsername = '';
  loginPassword = '';

  // Register fields
  registerUsername = '';
  registerPassword = '';
  registerPasswordConfirm = '';

  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onLogin(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.loginUsername.trim() || !this.loginPassword.trim()) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    this.authService.login(this.loginUsername, this.loginPassword).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']); // adjust route as needed
      },
      error: (err) => {
        this.errorMessage =
          err.status === 401
            ? 'Invalid username or password.'
            : 'Login failed. Please try again.';
      },
    });
  }

  onRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (
      !this.registerUsername.trim() ||
      !this.registerPassword.trim() ||
      !this.registerPasswordConfirm.trim()
    ) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }
    if (this.registerPassword.length < 4) {
      this.errorMessage = 'Password must be at least 4 characters.';
      return;
    }
    if (this.registerPassword !== this.registerPasswordConfirm) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.authService.register(this.registerUsername, this.registerPassword).subscribe({
      next: () => {
        this.successMessage = 'Account created! Switching to login…';
        this.registerUsername = '';
        this.registerPassword = '';
        this.registerPasswordConfirm = '';
        this.showPopup = true;

        setTimeout(() => {
          this.showPopup = false;
          this.successMessage = '';
          this.isRegisterMode = false;
        }, 5000);
      },
      error: (err) => {
        this.errorMessage =
          err.status === 409
            ? 'Username already taken.'
            : 'Registration failed. Please try again.';
      },
    });
  }

  onPopupConfirm() {
    this.showPopup = false;
    this.isRegisterMode = false;
  }
}
