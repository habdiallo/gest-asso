import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SessionLogoutService } from '@core/session/session-logout.service';

@Component({
  selector: 'app-logout-button',
  templateUrl: './logout-button.html',
  styleUrl: './logout-button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoutButton {
  private readonly sessionLogoutService = inject(SessionLogoutService);
  private readonly router = inject(Router);

  logout(): void {
    this.sessionLogoutService.logout().subscribe({
      complete: () => void this.router.navigateByUrl('/login'),
    });
  }
}
