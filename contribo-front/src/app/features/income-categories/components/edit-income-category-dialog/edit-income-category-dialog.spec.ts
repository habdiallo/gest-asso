import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import type { IncomeCategory } from '@api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import fr from '../../../../../assets/i18n/fr.json';
import { EditIncomeCategoryDialog } from './edit-income-category-dialog';

/*
 * jsdom (utilisé par le runner Vitest/`@angular/build:unit-test`) ne
 * synchronise pas `showModal()`/`close()`/l'événement `close` du `<dialog>`
 * natif : https://github.com/jsdom/jsdom/issues/3294 (toujours ouvert en
 * jsdom 28). Voir la même limite documentée dans `form-dialog.spec.ts`.
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

function buildCategory(overrides: Partial<IncomeCategory> = {}): IncomeCategory {
  return {
    id: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10',
    label: 'Catégorie A',
    memberCount: 12,
    updatedAt: '2026-09-02T10:15:00Z',
    ...overrides,
  };
}

function fillLabel(fixture: ComponentFixture<EditIncomeCategoryDialog>, value: string): void {
  const input: HTMLInputElement = fixture.nativeElement.querySelector(
    '#income-category-edit-label',
  );
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

function submitForm(fixture: ComponentFixture<EditIncomeCategoryDialog>): void {
  const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
  form.dispatchEvent(new Event('submit'));
}

describe('EditIncomeCategoryDialog', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        EditIncomeCategoryDialog,
        TranslocoTestingModule.forRoot({
          langs: { fr },
          translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
          preloadLangs: true,
        }),
      ],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('pre-fills the label with the category being edited', () => {
    const fixture = TestBed.createComponent(EditIncomeCategoryDialog);
    fixture.componentRef.setInput('category', buildCategory({ label: 'Standard' }));
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('#income-category-edit-label');
    expect(input.value).toBe('Standard');
  });

  it('shows a warning that the change has no retroactive effect (US-REV-002)', () => {
    const fixture = TestBed.createComponent(EditIncomeCategoryDialog);
    fixture.componentRef.setInput('category', buildCategory());
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain("pas d'effet rétroactif");
  });

  it('does not call the API and shows a validation error when submitted without a label', () => {
    const fixture = TestBed.createComponent(EditIncomeCategoryDialog);
    fixture.componentRef.setInput('category', buildCategory());
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    fillLabel(fixture, '');

    submitForm(fixture);
    fixture.detectChanges();

    httpMock.expectNone('/api/v1/income-categories/a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10');
    const labelInput: HTMLInputElement = fixture.nativeElement.querySelector(
      '#income-category-edit-label',
    );
    expect(labelInput.getAttribute('aria-invalid')).toBe('true');
  });

  it('submits the new label to PUT /api/v1/income-categories/{id}', () => {
    const fixture = TestBed.createComponent(EditIncomeCategoryDialog);
    fixture.componentRef.setInput('category', buildCategory());
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    fillLabel(fixture, 'Catégorie renommée');

    submitForm(fixture);

    const req = httpMock.expectOne(
      '/api/v1/income-categories/a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10',
    );
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ label: 'Catégorie renommée' });
  });

  it('does not call the API and shows a validation error when submitted with a blank label', () => {
    const fixture = TestBed.createComponent(EditIncomeCategoryDialog);
    fixture.componentRef.setInput('category', buildCategory());
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    fillLabel(fixture, '   ');

    submitForm(fixture);
    fixture.detectChanges();

    httpMock.expectNone('/api/v1/income-categories/a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10');
    const labelInput: HTMLInputElement = fixture.nativeElement.querySelector(
      '#income-category-edit-label',
    );
    expect(labelInput.getAttribute('aria-invalid')).toBe('true');
  });

  it('sends a trimmed label to the API', () => {
    const fixture = TestBed.createComponent(EditIncomeCategoryDialog);
    fixture.componentRef.setInput('category', buildCategory());
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    fillLabel(fixture, '  Catégorie renommée  ');

    submitForm(fixture);

    const req = httpMock.expectOne(
      '/api/v1/income-categories/a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10',
    );
    expect(req.request.body).toEqual({ label: 'Catégorie renommée' });
  });

  it('emits updated and closed after a successful modification', () => {
    const fixture = TestBed.createComponent(EditIncomeCategoryDialog);
    fixture.componentRef.setInput('category', buildCategory());
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    fillLabel(fixture, 'Catégorie renommée');

    const updatedEvents: unknown[] = [];
    const closedEvents: unknown[] = [];
    fixture.componentInstance.updated.subscribe((category) => updatedEvents.push(category));
    fixture.componentInstance.closed.subscribe(() => closedEvents.push(undefined));

    submitForm(fixture);
    httpMock
      .expectOne('/api/v1/income-categories/a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10')
      .flush({
        id: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10',
        label: 'Catégorie renommée',
        memberCount: 12,
        updatedAt: '2026-09-17T10:00:00Z',
      });

    expect(updatedEvents).toHaveLength(1);
    expect(closedEvents).toHaveLength(1);
  });

  it('shows a duplicate-label error without closing when the API rejects with DUPLICATE_CATEGORY_LABEL', () => {
    const fixture = TestBed.createComponent(EditIncomeCategoryDialog);
    fixture.componentRef.setInput('category', buildCategory());
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    fillLabel(fixture, 'Standard');

    const closedEvents: unknown[] = [];
    fixture.componentInstance.closed.subscribe(() => closedEvents.push(undefined));

    submitForm(fixture);
    httpMock
      .expectOne('/api/v1/income-categories/a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10')
      .flush(
        { code: 'DUPLICATE_CATEGORY_LABEL', message: 'Une catégorie porte déjà ce libellé.' },
        { status: 409, statusText: 'Conflict' },
      );
    fixture.detectChanges();

    expect(closedEvents).toHaveLength(0);
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Une catégorie porte déjà ce libellé.',
    );
  });

  it('ignores a stale PATCH response after the dialog reopened on another category', () => {
    const fixture = TestBed.createComponent(EditIncomeCategoryDialog);
    fixture.componentRef.setInput('category', buildCategory());
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    fillLabel(fixture, 'Catégorie renommée');

    const updatedEvents: unknown[] = [];
    const closedEvents: unknown[] = [];
    fixture.componentInstance.updated.subscribe((category) => updatedEvents.push(category));
    fixture.componentInstance.closed.subscribe(() => closedEvents.push(undefined));

    submitForm(fixture);
    const staleReq = httpMock.expectOne(
      '/api/v1/income-categories/a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10',
    );

    // Le dialogue est réutilisé pour une autre catégorie avant la réponse de la première requête.
    fixture.componentRef.setInput('open', false);
    fixture.componentRef.setInput(
      'category',
      buildCategory({ id: 'b6d3a1e1-2d2b-5f4b-0e2c-8f3b6c7d0e21', label: 'Catégorie B' }),
    );
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    staleReq.flush({
      id: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10',
      label: 'Catégorie renommée',
      memberCount: 12,
      updatedAt: '2026-09-17T10:00:00Z',
    });

    expect(updatedEvents).toHaveLength(0);
    expect(closedEvents).toHaveLength(0);
    const labelInput: HTMLInputElement = fixture.nativeElement.querySelector(
      '#income-category-edit-label',
    );
    expect(labelInput.value).toBe('Catégorie B');
  });
});
