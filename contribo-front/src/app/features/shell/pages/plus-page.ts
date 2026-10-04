import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserRole } from '@core/api';
import { TranslocoPipe } from '@jsverse/transloco';
import { SessionService } from '@core/session/session.service';
import { PageHeader } from '@shared/page-header/page-header';

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
  imports: [PageHeader, RouterLink, TranslocoPipe],
  templateUrl: './plus-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlusPage {
  private readonly session = inject(SessionService);

  readonly destinations = computed(() =>
    this.session.user()?.role === UserRole.Administrator
      ? ADMINISTRATOR_DESTINATIONS
      : PERSONAL_DESTINATIONS,
  );
}
