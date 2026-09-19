import { TestBed } from '@angular/core/testing';
import { FormDialog } from './form-dialog';

/*
 * jsdom (utilisé par le runner Vitest/`@angular/build:unit-test`) reconnaît
 * `HTMLDialogElement` mais n'implémente pas `showModal()`/`close()` ni la synchronisation
 * de l'événement `close` : https://github.com/jsdom/jsdom/issues/3294 (toujours ouvert en
 * jsdom 28). Le comportement natif réel (piège de focus, fermeture par Échap, restitution du
 * focus au déclencheur) n'est donc pas vérifiable ici et reste délégué au navigateur ; voir
 * la limite documentée dans le dernier test. Ce correctif minimal reproduit uniquement l'effet
 * observable (attribut/propriété `open`, événement `close`) pour permettre de tester la
 * logique du composant (synchronisation avec l'input `open`, émission de `closed`).
 */
if (typeof HTMLDialogElement.prototype.showModal !== 'function') {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement): void {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement): void {
    if (!this.hasAttribute('open')) {
      return;
    }
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}

describe('FormDialog', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormDialog],
    });
  });

  it('opens the native dialog via showModal() when the open input becomes true', () => {
    const fixture = TestBed.createComponent(FormDialog);
    fixture.componentRef.setInput('dialogTitle', 'Ajouter un membre');
    fixture.detectChanges();

    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
    expect(dialog.open).toBe(false);

    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    expect(dialog.open).toBe(true);
  });

  it('closes the native dialog via close() when the open input becomes false', () => {
    const fixture = TestBed.createComponent(FormDialog);
    fixture.componentRef.setInput('dialogTitle', 'Ajouter un membre');
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
    expect(dialog.open).toBe(true);

    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();

    expect(dialog.open).toBe(false);
  });

  it('exposes an accessible name via aria-label matching the dialogTitle input', () => {
    const fixture = TestBed.createComponent(FormDialog);
    fixture.componentRef.setInput('dialogTitle', 'Modifier la cotisation');
    fixture.detectChanges();

    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
    expect(dialog.getAttribute('aria-label')).toBe('Modifier la cotisation');
  });

  it('emits closed and closes the native dialog when the explicit close button is activated', () => {
    const fixture = TestBed.createComponent(FormDialog);
    fixture.componentRef.setInput('dialogTitle', 'Ajouter un membre');
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const emitted: void[] = [];
    fixture.componentInstance.closed.subscribe(() => emitted.push(undefined));

    const closeButton: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(closeButton.getAttribute('type')).toBe('button');
    closeButton.click();

    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
    expect(dialog.open).toBe(false);
    expect(emitted.length).toBe(1);
  });

  it('emits closed when the native dialog is closed programmatically (e.g. by the browser on Escape)', () => {
    const fixture = TestBed.createComponent(FormDialog);
    fixture.componentRef.setInput('dialogTitle', 'Ajouter un membre');
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const emitted: void[] = [];
    fixture.componentInstance.closed.subscribe(() => emitted.push(undefined));

    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
    // Le comportement natif d'Échap (piège de focus, fermeture, restitution du focus) est
    // délégué au navigateur et n'est pas simulé en jsdom : on vérifie ici uniquement que la
    // fermeture native du <dialog>, quelle qu'en soit la cause, déclenche bien la sortie `closed`.
    dialog.close();
    fixture.detectChanges();

    expect(emitted.length).toBe(1);
  });

  it('does not render any close affordance on the backdrop, only the explicit button', () => {
    const fixture = TestBed.createComponent(FormDialog);
    fixture.componentRef.setInput('dialogTitle', 'Ajouter un membre');
    fixture.detectChanges();

    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    );
    expect(buttons).toHaveLength(1);
  });

  /*
   * T-103 : vérification d'accessibilité clavier (piège de focus, fermeture par Échap).
   *
   * Le piège de focus et la fermeture par Échap sont assurés par le navigateur pour
   * tout `<dialog>` ouvert via `showModal()` (contrairement à un simple attribut/propriété
   * `open`, qui ne déclenche ni l'un ni l'autre) : voir la spécification HTML de l'élément
   * `dialog`. jsdom ne réimplémente pas ce comportement natif (limite documentée en tête de
   * fichier), donc le piège de focus réel et l'appui clavier sur Échap ne sont pas
   * observables ici. Les tests ci-dessous vérifient à la place le contrat que le composant
   * doit respecter pour que ce comportement natif s'applique : l'élément est bien un
   * `<dialog>` et l'ouverture/fermeture passe par `showModal()`/`close()`, jamais par une
   * manipulation directe de l'attribut `open` ou une réimplémentation manuelle du piège de
   * focus/d'Échap. Tous les dialogues de formulaire du dépôt (member-create-form,
   * campaign-create-form, record-payment-form, social-fund-create-form,
   * contribution-create-form, create/edit-income-category-dialog, etc.) délèguent
   * entièrement leur rendu de dialogue à `app-form-dialog` : aucun n'implémente de balisage
   * ou de gestion clavier concurrente, donc le comportement vérifié ici s'applique à tous.
   */
  it('renders a native <dialog> element, the only element whose showModal() gives the browser-managed focus trap and Escape-to-close', () => {
    const fixture = TestBed.createComponent(FormDialog);
    fixture.componentRef.setInput('dialogTitle', 'Ajouter un membre');
    fixture.detectChanges();

    const dialog: HTMLElement = fixture.nativeElement.querySelector('dialog');
    expect(dialog.tagName).toBe('DIALOG');
  });

  it('calls the native showModal() (not a direct open attribute/property write) when the open input becomes true', () => {
    const fixture = TestBed.createComponent(FormDialog);
    fixture.componentRef.setInput('dialogTitle', 'Ajouter un membre');
    fixture.detectChanges();

    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
    const showModalSpy = vi.spyOn(dialog, 'showModal');

    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    expect(showModalSpy).toHaveBeenCalledTimes(1);
  });

  it('calls the native close() (not a direct open attribute/property write) when the open input becomes false', () => {
    const fixture = TestBed.createComponent(FormDialog);
    fixture.componentRef.setInput('dialogTitle', 'Ajouter un membre');
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
    const closeSpy = vi.spyOn(dialog, 'close');

    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();

    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it('closes via the native close() when the explicit close button is activated, not via a manual keyboard/focus reimplementation', () => {
    const fixture = TestBed.createComponent(FormDialog);
    fixture.componentRef.setInput('dialogTitle', 'Ajouter un membre');
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
    const closeSpy = vi.spyOn(dialog, 'close');

    const closeButton: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    closeButton.click();

    expect(closeSpy).toHaveBeenCalledTimes(1);
  });
});
