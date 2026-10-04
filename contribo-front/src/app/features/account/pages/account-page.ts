import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CurrencyCode } from '@core/api';
import { TranslocoPipe } from '@jsverse/transloco';
import { SIDEBAR_ROLE_LABEL_KEYS } from '@core/navigation/sidebar-profile';
import { SessionService } from '@core/session/session.service';
import { SessionLogoutService } from '@core/session/session-logout.service';
import { ThemeService } from '@core/theme/theme.service';
import { ActionButton } from '@shared/action-button/action-button';
import { PageHeader } from '@shared/page-header/page-header';
import { StatusBadge } from '@shared/status-badge/status-badge';
import { map } from 'rxjs';

const CURRENCY_LABEL_KEYS: Record<CurrencyCode, string> = {
  [CurrencyCode.Gnf]: 'account.currency.gnf',
};

@Component({
  selector: 'app-account-page',
  imports: [RouterLink, TranslocoPipe, PageHeader, ActionButton, StatusBadge],
  templateUrl: './account-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountPage {
  private readonly session = inject(SessionService);
  private readonly route = inject(ActivatedRoute);
  private readonly sessionLogoutService = inject(SessionLogoutService);
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);

  readonly user = this.session.user;
  readonly openedFromPlus = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('from') === 'plus')),
    { initialValue: this.route.snapshot.queryParamMap.get('from') === 'plus' },
  );
  readonly theme = this.themeService.theme;
  readonly roleLabelKey = computed(() => {
    const role = this.user()?.role;
    return role ? SIDEBAR_ROLE_LABEL_KEYS[role] : null;
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
    this.sessionLogoutService.logout().subscribe({
      complete: () => void this.router.navigateByUrl('/login'),
    });
  }
}
