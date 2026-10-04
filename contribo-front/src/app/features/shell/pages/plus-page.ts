import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserRole } from '@core/api';
import { TranslocoPipe } from '@jsverse/transloco';
import { SessionService } from '@core/session/session.service';
import { PageHeader } from '@shared/page-header/page-header';
import { LogoutButton } from '@shared/logout-button/logout-button';

type PlusDestination = {
  path: string;
  titleKey: string;
  descriptionKey: string;
  icon: 'roles' | 'categories' | 'member-space';
};

const ADMINISTRATOR_DESTINATIONS: readonly PlusDestination[] = [
  {
    path: '/roles-utilisateurs',
    titleKey: 'shell.plus.destinations.roles.title',
    descriptionKey: 'shell.plus.destinations.roles.description',
    icon: 'roles',
  },
  {
    path: '/categories-de-revenu',
    titleKey: 'shell.plus.destinations.categories.title',
    descriptionKey: 'shell.plus.destinations.categories.description',
    icon: 'categories',
  },
  {
    path: '/mon-compte',
    titleKey: 'shell.plus.destinations.account.title',
    descriptionKey: 'shell.plus.destinations.account.description',
    icon: 'member-space',
  },
];

const PERSONAL_DESTINATIONS: readonly PlusDestination[] = [
  {
    path: '/mon-espace',
    titleKey: 'shell.plus.destinations.memberSpace.title',
    descriptionKey: 'shell.plus.destinations.memberSpace.description',
    icon: 'member-space',
  },
];

@Component({
  selector: 'app-plus-page',
  imports: [PageHeader, RouterLink, TranslocoPipe, LogoutButton],
  templateUrl: './plus-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlusPage {
  private readonly session = inject(SessionService);

  readonly kickerKey = computed(() =>
    this.session.user()?.role === UserRole.Administrator
      ? 'shell.plus.kicker'
      : 'memberSpace.kicker',
  );

  readonly destinations = computed(() =>
    this.session.user()?.role === UserRole.Administrator
      ? ADMINISTRATOR_DESTINATIONS
      : PERSONAL_DESTINATIONS,
  );

  readonly user = this.session.user;
  readonly profilePath = computed(() =>
    this.user()?.role === UserRole.Administrator ? '/mon-compte' : '/mon-espace',
  );
  readonly initials = computed(() =>
    (this.user()?.member.displayName ?? '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toLocaleUpperCase('fr'),
  );

  readonly roleLabelKey = computed(
    () =>
      ({
        ADMINISTRATOR: 'shell.sidebar.roles.administrator',
        TREASURER: 'shell.sidebar.roles.treasurer',
        OPERATOR: 'shell.sidebar.roles.operator',
        MEMBER: 'shell.sidebar.roles.member',
      })[this.user()?.role ?? 'MEMBER'],
  );
}
