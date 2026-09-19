import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import fr from '../../../../../assets/i18n/fr.json';
import { CreateIncomeCategoryDialog } from './create-income-category-dialog';

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

function fillLabel(fixture: ComponentFixture<CreateIncomeCategoryDialog>, value: string): void {
  const input: HTMLInputElement = fixture.nativeElement.querySelector('#income-category-label');
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

function submitForm(fixture: ComponentFixture<CreateIncomeCategoryDialog>): void {
  const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
  form.dispatchEvent(new Event('submit'));
}

describe('CreateIncomeCategoryDialog', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CreateIncomeCategoryDialog,
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

  it('does not propose any amount field, only the label (RG-REV-002)', () => {
    const fixture = TestBed.createComponent(CreateIncomeCategoryDialog);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelectorAll('input').length).toBe(1);
    expect(root.querySelector('#income-category-label')).toBeTruthy();
  });

  it('does not call the API and shows a validation error when submitted without a label (RG-REV-001)', () => {
    const fixture = TestBed.createComponent(CreateIncomeCategoryDialog);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    submitForm(fixture);
    fixture.detectChanges();

    httpMock.expectNone('/api/v1/income-categories');
    const root: HTMLElement = fixture.nativeElement;
    const labelInput = root.querySelector('#income-category-label') as HTMLInputElement;
    expect(labelInput.getAttribute('aria-invalid')).toBe('true');
    expect(root.querySelector('#income-category-label-error')?.textContent).toContain(
      'Le libellé est obligatoire.',
    );
  });

  it('submits the label to POST /api/v1/income-categories', () => {
    const fixture = TestBed.createComponent(CreateIncomeCategoryDialog);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    fillLabel(fixture, 'Catégorie C');

    submitForm(fixture);

    const req = httpMock.expectOne('/api/v1/income-categories');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ label: 'Catégorie C' });
  });

  it('emits created and closed after a successful creation', () => {
    const fixture = TestBed.createComponent(CreateIncomeCategoryDialog);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    fillLabel(fixture, 'Catégorie C');

    const createdEvents: unknown[] = [];
    const closedEvents: unknown[] = [];
    fixture.componentInstance.created.subscribe((category) => createdEvents.push(category));
    fixture.componentInstance.closed.subscribe(() => closedEvents.push(undefined));

    submitForm(fixture);
    httpMock.expectOne('/api/v1/income-categories').flush({
      id: 'cat-new',
      label: 'Catégorie C',
      memberCount: 0,
      updatedAt: '2026-09-17T10:00:00Z',
    });

    expect(createdEvents).toHaveLength(1);
    expect(closedEvents).toHaveLength(1);
  });

  it('shows a duplicate-label error without closing when the API rejects with DUPLICATE_CATEGORY_LABEL', () => {
    const fixture = TestBed.createComponent(CreateIncomeCategoryDialog);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    fillLabel(fixture, 'Standard');

    const closedEvents: unknown[] = [];
    fixture.componentInstance.closed.subscribe(() => closedEvents.push(undefined));

    submitForm(fixture);
    httpMock
      .expectOne('/api/v1/income-categories')
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

  it('retries the same submission and succeeds after a generic failure (T-102)', () => {
    const fixture = TestBed.createComponent(CreateIncomeCategoryDialog);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    fillLabel(fixture, 'Catégorie C');

    const createdEvents: unknown[] = [];
    fixture.componentInstance.created.subscribe((category) => createdEvents.push(category));

    submitForm(fixture);
    httpMock
      .expectOne('/api/v1/income-categories')
      .flush(
        { code: 'INTERNAL_ERROR', message: 'boom' },
        { status: 500, statusText: 'Internal Server Error' },
      );
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'Impossible de créer la catégorie',
    );
    const retryButton = Array.from(root.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Réessayer',
    ) as HTMLButtonElement | undefined;
    expect(retryButton).toBeTruthy();

    retryButton?.click();

    const retryReq = httpMock.expectOne('/api/v1/income-categories');
    expect(retryReq.request.body).toEqual({ label: 'Catégorie C' });
    retryReq.flush({
      id: 'cat-new',
      label: 'Catégorie C',
      memberCount: 0,
      updatedAt: '2026-09-17T10:00:00Z',
    });

    expect(createdEvents).toHaveLength(1);
  });
});
