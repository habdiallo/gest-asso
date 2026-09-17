import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import type { CurrentUser } from '@api';
import { ThemeToggle } from '@shared/theme-toggle/theme-toggle';
import { LogoutButton } from '@shared/logout-button/logout-button';
import { NavigationMenu } from '@shared/navigation-menu/navigation-menu';
import { SessionService } from '@core/session/session.service';

const SIDEBAR_ROLE_LABELS: Record<CurrentUser['role'], string> = {
  ADMINISTRATOR: 'Administrateur',
  TREASURER: 'Trésorier',
  OPERATOR: 'Opérateur',
  MEMBER: 'Membre',
};

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ThemeToggle, LogoutButton, NavigationMenu],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly sessionService = inject(SessionService);

  readonly isAuthenticated = this.sessionService.isAuthenticated;
  readonly sidebarProfile = computed(() => {
    const user = this.sessionService.user();
    if (!user) {
      return null;
    }
    const name = user.member.displayName;
    return {
      name,
      initials: name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join('')
        .toLocaleUpperCase('fr'),
      role: SIDEBAR_ROLE_LABELS[user.role],
    };
  });
}
