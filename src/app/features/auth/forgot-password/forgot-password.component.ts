import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-container">
      <div class="auth-card glass-card animate-in">
        <h1>Forgot Password?</h1>
        <p class="subtitle">Enter your email to request a reset link</p>

        @if (successMessage()) {
          <div class="toast-success-inline" role="alert">
            {{ successMessage() }}
          </div>
        }

        @if (errorMessage()) {
          <div class="toast-error-inline" role="alert">
            {{ errorMessage() }}
          </div>
        }

        @if (!successMessage()) {
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your registered email"
              [ngModel]="email()"
              (ngModelChange)="email.set($event)"
              required
              email
              #emailInput="ngModel"
              (keyup.enter)="onSubmit()"
            />
            @if (emailInput.touched && emailInput.invalid) {
              <div class="form-error">Please enter a valid email address.</div>
            }
          </div>

          <button
            class="btn btn-primary"
            style="width: 100%; margin-bottom: 16px"
            [disabled]="loading() || !email() || emailInput.invalid"
            (click)="onSubmit()"
          >
            @if (loading()) {
              <span class="loading">⏳</span> Sending...
            } @else {
              📨 Send Reset Link
            }
          </button>
        }

        <p style="text-align: center; margin-top: 20px; font-size: 14px; color: var(--text-secondary)">
          Remember your password? <a routerLink="/login">Sign In</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .toast-success-inline {
      padding: 12px 16px;
      border-radius: var(--radius-sm);
      margin-bottom: 20px;
      font-size: 14px;
      background: rgba(16, 185, 129, 0.12);
      color: var(--success);
      border: 1px solid rgba(16, 185, 129, 0.2);
      line-height: 1.5;
    }
    .toast-error-inline {
      padding: 12px 16px;
      border-radius: var(--radius-sm);
      margin-bottom: 20px;
      font-size: 14px;
      background: rgba(239, 68, 68, 0.12);
      color: var(--danger);
      border: 1px solid rgba(239, 68, 68, 0.2);
      line-height: 1.5;
    }
  `]
})
export class ForgotPasswordComponent {
  email = signal('');
  loading = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  private authService = inject(AuthService);

  onSubmit(): void {
    if (!this.email() || !this.email().includes('@')) return;

    this.loading.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.authService.forgotPassword(this.email()).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.successMessage.set('If your email is registered in our system, a stylized password reset link has been dispatched to it.');
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to send password reset email.');
      }
    });
  }
}
