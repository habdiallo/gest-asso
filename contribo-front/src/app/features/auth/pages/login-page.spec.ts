import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import type { ComponentFixture } from '@angular/core/testing';
import { LoginPage } from './login-page';

function fillForm(
  fixture: ComponentFixture<LoginPage>,
  identifier: string,
  password: string,
): void {
  const identifierInput: HTMLInputElement = fixture.nativeElement.querySelector('#identifier');
  const passwordInput: HTMLInputElement = fixture.nativeElement.querySelector('#password');
  identifierInput.value = identifier;
  identifierInput.dispatchEvent(new Event('input'));
  passwordInput.value = password;
  passwordInput.dispatchEvent(new Event('input'));
}

function submitForm(fixture: ComponentFixture<LoginPage>): void {
  const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
  form.dispatchEvent(new Event('submit'));
}

describe('LoginPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('renders the identifier and password fields without any sign-up link', () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('#identifier')).toBeTruthy();
    expect(root.querySelector('#password')?.getAttribute('type')).toBe('password');
    expect(root.querySelectorAll('a, button[type="button"]').length).toBe(0);
  });

  it('does not call the API when submitted with empty fields', () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();

    submitForm(fixture);

    httpMock.expectNone('/api/v1/auth/login');
  });

  it('shows field errors and marks the inputs invalid when submitted with empty fields', () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();

    submitForm(fixture);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const identifierInput = root.querySelector('#identifier') as HTMLInputElement;
    const passwordInput = root.querySelector('#password') as HTMLInputElement;

    expect(identifierInput.getAttribute('aria-invalid')).toBe('true');
    expect(identifierInput.getAttribute('aria-describedby')).toBe('identifier-error');
    expect(root.querySelector('#identifier-error')?.textContent).toContain(
      "L'identifiant est obligatoire.",
    );

    expect(passwordInput.getAttribute('aria-invalid')).toBe('true');
    expect(passwordInput.getAttribute('aria-describedby')).toBe('password-error');
    expect(root.querySelector('#password-error')?.textContent).toContain(
      'Le mot de passe est obligatoire.',
    );
  });

  it('submits the credentials to POST /api/v1/auth/login', () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    fillForm(fixture, 'moussa.bah', 'secret');

    submitForm(fixture);

    const req = httpMock.expectOne('/api/v1/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ identifier: 'moussa.bah', password: 'secret' });
  });

  it('navigates away after a successful login', () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    fillForm(fixture, 'moussa.bah', 'secret');
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');

    submitForm(fixture);
    httpMock.expectOne('/api/v1/auth/login').flush({
      accessToken: 'token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: {
        userId: 'user-1',
        association: { id: 'assoc-1', name: 'Association Démo', currency: 'GNF' },
        member: {
          id: 'member-1',
          firstName: 'Moussa',
          lastName: 'Bah',
          displayName: 'Moussa Bah',
          incomeCategory: { id: 'cat-1', label: 'Salarié' },
          status: 'ACTIVE',
        },
        role: 'ADMINISTRATOR',
        operatorCanRecordPayments: false,
        accountActive: true,
      },
    });

    expect(navigateSpy).toHaveBeenCalledWith('/');
  });

  it('shows a generic error message when authentication fails, without navigating', () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    fillForm(fixture, 'moussa.bah', 'wrong');
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');

    submitForm(fixture);
    httpMock
      .expectOne('/api/v1/auth/login')
      .flush(
        { code: 'INVALID_CREDENTIALS', message: 'Identifiants invalides' },
        { status: 401, statusText: 'Unauthorized' },
      );
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Identifiant ou mot de passe incorrect',
    );
    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
