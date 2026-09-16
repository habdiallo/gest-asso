import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeToggle } from '@shared/theme-toggle/theme-toggle';
import { LogoutButton } from '@shared/logout-button/logout-button';
import { SessionService } from '@core/session/session.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ThemeToggle, LogoutButton],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly sessionService = inject(SessionService);

  readonly isAuthenticated = this.sessionService.isAuthenticated;
}
