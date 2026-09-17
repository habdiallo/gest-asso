import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import type { MemberSummary } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { SessionService } from '@core/session/session.service';
import { memberStatusLabel } from '../member-status-labels';

/**
 * Écran profil personnel en lecture seule (T-95, US-MBR-001) : informations
 * personnelles, catégorie de revenu, fonction associative et statut du
 * membre connecté. `besoins/openapi.yaml` n'expose qu'une seule opération de
 * lecture du profil courant, `GET /me` (`operationId: getCurrentUser`), déjà
 * appelée une fois par `EspacePersonnelService` à l'hydratation de session
 * (`app.config.ts`) et exposée par `SessionService.user`. Cette page réutilise
 * cette donnée déjà chargée plutôt que de dupliquer l'appel réseau.
 *
 * Limite connue : les informations de compte applicatif (rôle, autorisation
 * opérateur) ne sont pas affichées ici, seules les données de profil membre
 * demandées par le ticket le sont. Aucune action de modification n'est
 * proposée : la correction d'une information passe par un responsable de
 * l'association (RG cf. cahier des charges, section "Espace membre").
 */
@Component({
  selector: 'app-profile-page',
  imports: [TranslocoPipe],
  templateUrl: './profile-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage {
  private readonly session = inject(SessionService);

  readonly member = computed<MemberSummary | null>(() => this.session.user()?.member ?? null);

  readonly memberStatusLabel = memberStatusLabel;
}
