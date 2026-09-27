import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CurrencyCode, UserRole } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { SessionService } from '@core/session/session.service';
import { ThemeService } from '@core/theme/theme.service';
import { ActionButton } from '@shared/action-button/action-button';
import { PageHeader } from '@shared/page-header/page-header';
import { StatusBadge } from '@shared/status-badge/status-badge';

const ROLE_LABEL_KEYS: Record<UserRole, string> = {
  [UserRole.Administrator]: 'account.roles.administrator',
  [UserRole.Treasurer]: 'account.roles.treasurer',
  [UserRole.Operator]: 'account.roles.operator',
  [UserRole.Member]: 'account.roles.member',
};

const CURRENCY_LABEL_KEYS: Record<CurrencyCode, string> = {
  [CurrencyCode.Gnf]: 'account.currency.gnf',
};

@Component({
  selector: 'app-account-page',
  imports: [TranslocoPipe, PageHeader, ActionButton, StatusBadge],
  templateUrl: './account-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountPage {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);

  readonly user = this.session.user;
  readonly theme = this.themeService.theme;
  readonly roleLabelKey = computed(() => {
    const role = this.user()?.role;
    return role ? ROLE_LABEL_KEYS[role] : null;
  });
  readonly currencyLabelKey = computed(() => {
    const currency = this.user()?.association.currency;
    return currency ? CURRENCY_LABEL_KEYS[currency] : null;
  });
  readonly initials = computed(() => {
    const name = this.user()?.member.displayName;
    return name
      ? name
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part.charAt(0))
          .join('')
          .toLocaleUpperCase('fr')
      : '';
  });
  readonly accountStatusLabelKey = computed(() =>
    this.user()?.accountActive ? 'account.status.active' : 'account.status.inactive',
  );
  readonly themeLabelKey = computed(() =>
    this.theme() === 'dark' ? 'account.theme.dark' : 'account.theme.light',
  );

  toggleTheme(): void {
    this.themeService.toggle();
  }

  logout(): void {
    this.session.clear();
    void this.router.navigateByUrl('/login');
  }
}
