import { Injectable, computed, signal } from '@angular/core';
import type { CurrentUser, LoginResponse } from '@core/api';
import { canRecordPayments as canUserRecordPayments } from './payment-authorization';

@Injectable({ providedIn: 'root' })
export class SessionService {
  /** Session tokens are HttpOnly cookies and are never exposed to JavaScript. */
  readonly token = signal<string | null>(null);
  readonly user = signal<CurrentUser | null>(null);

  readonly isAuthenticated = computed(() => this.user() !== null);
  readonly mustChangePassword = computed(() => this.user()?.mustChangePassword === true);
  readonly canRecordPayments = computed(() => canUserRecordPayments(this.user()));

  setSession(response: LoginResponse): void {
    this.user.set(response.user);
  }

  setUser(user: CurrentUser): void {
    this.user.set(user);
  }

  clear(): void {
    this.user.set(null);
  }
}
