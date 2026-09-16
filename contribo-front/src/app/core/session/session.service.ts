import { Injectable, computed, signal } from '@angular/core';
import type { CurrentUser, LoginResponse } from '@api';
import { canRecordPayments as canUserRecordPayments } from './payment-authorization';

const STORAGE_KEY = 'contribo-session-token';

@Injectable({ providedIn: 'root' })
export class SessionService {
  readonly token = signal<string | null>(this.readStoredToken());
  readonly user = signal<CurrentUser | null>(null);

  readonly isAuthenticated = computed(() => this.token() !== null);
  readonly canRecordPayments = computed(() => canUserRecordPayments(this.user()));

  setSession(response: LoginResponse): void {
    this.token.set(response.accessToken);
    this.user.set(response.user);
    localStorage.setItem(STORAGE_KEY, response.accessToken);
  }

  setUser(user: CurrentUser): void {
    this.user.set(user);
  }

  clear(): void {
    this.token.set(null);
    this.user.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  private readStoredToken(): string | null {
    return localStorage.getItem(STORAGE_KEY);
  }
}
