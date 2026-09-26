import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';
import type { ElementRef } from '@angular/core';

/**
 * Surface de dialogue générique pour un formulaire (T-15) : superposée et centrée
 * sur desktop/tablette (>= 821px, cohérent avec le point de rupture `min-[821px]`
 * de T-14), plein écran sur mobile. S'appuie sur l'élément natif `<dialog>` pour la
 * gestion clavier (piège de focus, fermeture par Échap, restitution du focus au
 * déclencheur) plutôt que sur une réimplémentation manuelle.
 *
 * Le contenu du formulaire est fourni par l'appelant via la projection de contenu ;
 * ce composant reste neutre et ne connaît aucun formulaire métier précis.
 *
 * La fermeture par clic sur le fond (backdrop) est volontairement absente : elle
 * pourrait faire perdre une saisie en cours. Seuls Échap (natif) et le bouton
 * "Fermer" explicite ferment le dialogue.
 */
@Component({
  selector: 'app-form-dialog',
  templateUrl: './form-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormDialog {
  /** Pilote l'ouverture/fermeture du dialogue natif. */
  readonly open = input(false);

  /** Titre accessible du dialogue, exposé via `aria-label` sur l'élément natif. */
  readonly dialogTitle = input.required<string>();

  /** Kicker optionnel affiché au-dessus du titre dans les dialogues de détail. */
  readonly kicker = input('');

  /** Largeur desktop du dialogue, limitée par la largeur disponible de la fenêtre. */
  readonly desktopWidth = input('560px');

  /** Libellé du bouton de fermeture explicite. */
  readonly closeLabel = input('Fermer');

  /** Émis à la fermeture du dialogue, quelle qu'en soit la cause (Échap, bouton, programmatique). */
  readonly closed = output<void>();

  private readonly dialogElement = viewChild<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    effect(() => {
      const dialog = this.dialogElement()?.nativeElement;
      if (!dialog) {
        return;
      }

      if (this.open() && !dialog.open) {
        dialog.showModal();
      } else if (!this.open() && dialog.open) {
        dialog.close();
      }
    });
  }

  /** Fermeture explicite (bouton "Fermer") : délègue au natif, qui émet l'événement `close`. */
  requestClose(): void {
    this.dialogElement()?.nativeElement.close();
  }

  /** Relaie la fermeture native (Échap, bouton ou `close()` programmatique) à l'appelant. */
  handleNativeClose(): void {
    this.closed.emit();
  }
}
