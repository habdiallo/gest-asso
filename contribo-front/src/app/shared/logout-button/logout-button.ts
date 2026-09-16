import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '@core/session/session.service';

@Component({
  selector: 'app-logout-button',
  templateUrl: './logout-button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoutButton {
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);

  logout(): void {
    this.sessionService.clear();
    void this.router.navigateByUrl('/login');
  }
}
