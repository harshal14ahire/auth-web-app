import { Component, signal, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-container">
      <div class="auth-card glass-card animate-in">
        <h1>Reset Password</h1>
        <p class="subtitle">Choose a strong, secure new password</p>

        @if (successMessage()) {
          <div class="toast-success-inline" role="alert">
            {{ successMessage() }}
          </div>
          <button class="btn btn-primary" style="width: 100%" (click)="goToLogin()">
            👉 Go to Login
          </button>
        }

        @if (errorMessage()) {
          <div class="toast-error-inline" role="alert">
            {{ errorMessage() }}
          </div>
        }

        @if (!successMessage() && token()) {
          <form (submit)="onSubmit()" #form="ngForm" class="form-container">
            <div class="form-group">
              <label for="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                placeholder="Enter new password (min. 6 chars)"
                [ngModel]="newPassword()"
                (ngModelChange)="newPassword.set($event)"
                required
                minlength="6"
                #newPassInput="ngModel"
              />
              @if (newPassInput.touched && newPassInput.invalid) {
                <div class="form-error">Password must be at least 6 characters long.</div>
              }
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Re-enter new password"
                [ngModel]="confirmPassword()"
                (ngModelChange)="confirmPassword.set($event)"
                required
                #confirmPassInput="ngModel"
              />
              @if (confirmPassInput.touched && confirmPassword() !== newPassword()) {
                <div class="form-error">Passwords do not match.</div>
              }
            </div>

            <button
              type="submit"
              class="btn btn-primary"
              style="width: 100%"
              [disabled]="loading() || form.invalid || confirmPassword() !== newPassword()"
            >
              @if (loading()) {
                <span class="loading">⏳</span> Resetting...
              } @else {
                🔒 Update Password
              }
            </button>
          </form>
        }

        @if (!token()) {
          <div class="toast-error-inline" role="alert">
            No valid password reset token was detected in the URL.
          </div>
          <button class="btn btn-outline" style="width: 100%" routerLink="/login">
            Back to Login
          </button>
        }
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
export class ResetPasswordComponent implements OnInit {
  token = signal<string | null>(null);
  newPassword = signal('');
  confirmPassword = signal('');
  loading = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit(): void {
    const tokenParam = this.route.snapshot.queryParamMap.get('token');
    this.token.set(tokenParam);
  }

  onSubmit(): void {
    if (!this.token() || this.newPassword().length < 6 || this.newPassword() !== this.confirmPassword()) {
      return;
    }

    this.loading.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.authService.resetPassword(this.token()!, this.newPassword()).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.successMessage.set('Your password has been successfully reset.');
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to reset password. The link may have expired or is invalid.');
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
