import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MembresService } from '@api';
import type { CreateContributionRequest, MemberPage, PaymentMethod } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { Subject, debounceTime } from 'rxjs';
import { AmountInput } from '@shared/amount-input/amount-input';
import type { CustomSelectOption } from '@shared/custom-select/custom-select';
import { CustomSelect } from '@shared/custom-select/custom-select';
import { PaymentMethodSelect } from '@shared/payment-method-select/payment-method-select';

/** Taille de page utilisée pour charger la liste des membres sélectionnables (`GET /members`). */
const MEMBERS_PAGE_SIZE = 20;

/**
 * Formulaire d'enregistrement d'une contribution à une cagnotte (T-87,
 * US-CAG-002) : Membre, Cagnotte (contexte), Montant, Date, Mode de
 * règlement. Construit la requête `CreateContributionRequest`
 * (openapi:`createContribution`, `POST /social-funds/{socialFundId}/contributions`)
 * et l'émet via `submitted` ; n'appelle pas l'API lui-même, l'appel API et le
 * rafraîchissement de la cagnotte/des contributions restent à la charge du
 * composant appelant (même répartition des responsabilités que
 * `SocialFundCreateForm`, T-84, et `CampaignCreateForm`, T-65).
 *
 * La cagnotte n'est pas un champ éditable : `socialFundTitle` est reçu en
 * entrée et affiché en lecture seule pour rappeler le contexte de saisie ;
 * `socialFundId` n'appartient pas au contrat `CreateContributionRequest`
 * (il figure dans l'URL de l'opération, à la charge de l'appelant).
 *
 * Sélection du membre : la liste est chargée via `GET /members`
 * (`MembresService.listMembers`, même dépendance que `MembersListPage`),
 * sans filtre de statut : `US-CAG-002`/RG-CAG-004 à 007 ne restreignent pas
 * la contribution aux membres actifs. Une association peut compter plus de
 * membres qu'une seule page n'en affiche (`PageSize.maximum: 100` du
 * contrat) : le sélecteur propose donc une recherche par nom (paramètre
 * contractuel `q`, amortie avec `debounceTime`, même motif que
 * `CampaignsListPage`, T-59) et une pagination (page précédente/suivante),
 * afin qu'un membre situé au-delà de la première page reste sélectionnable.
 * Chaque nouvelle recherche revient à la première page ; une réponse tardive
 * d'une requête précédente (recherche ou pagination) est ignorée via un
 * identifiant de requête, pour ne jamais afficher une liste qui ne
 * correspond plus à la recherche courante.
 *
 * Ce composant construit le formulaire et sa validation ; son intégration
 * dans l'écran de suivi de cagnotte (`SocialFundDetailPage`), l'appel API
 * réel et le rafraîchissement associé restent hors périmètre (T-88 à T-90).
 */
@Component({
  selector: 'app-contribution-create-form',
  imports: [ReactiveFormsModule, TranslocoPipe, AmountInput, CustomSelect, PaymentMethodSelect],
  templateUrl: './contribution-create-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContributionCreateForm {
  private readonly formBuilder = inject(FormBuilder);
  private readonly membersService = inject(MembresService);
  private readonly destroyRef = inject(DestroyRef);

  readonly socialFundTitle = input.required<string>();
  readonly submitting = input(false);
  readonly submitted = output<CreateContributionRequest>();
  readonly cancelled = output<void>();

  readonly membersLoading = signal(true);
  readonly membersError = signal(false);
  private readonly memberPage = signal<MemberPage | null>(null);
  readonly members = computed(() => this.memberPage()?.items ?? []);
  readonly memberSelectOptions = computed<readonly CustomSelectOption[]>(() =>
    this.members().map((member) => ({ value: member.id, label: member.displayName })),
  );

  readonly membersQuery = signal('');
  private readonly membersQueryInput = new Subject<string>();
  private membersRequestId = 0;

  readonly membersPreviousPageDisabled = computed(
    () => this.membersLoading() || (this.memberPage()?.page.number ?? 0) === 0,
  );
  readonly membersNextPageDisabled = computed(() => {
    const page = this.memberPage();
    return this.membersLoading() || !page || page.page.number + 1 >= page.page.totalPages;
  });
  readonly memberPageStatus = computed(() => {
    const page = this.memberPage();
    if (!page || page.page.totalPages <= 1) {
      return null;
    }
    return { current: page.page.number + 1, total: page.page.totalPages };
  });

  readonly form = this.formBuilder.group({
    memberId: this.formBuilder.nonNullable.control('', Validators.required),
    amount: this.formBuilder.control<number | null>(null, [Validators.required, Validators.min(1)]),
    contributionDate: this.formBuilder.nonNullable.control('', Validators.required),
    method: this.formBuilder.control<PaymentMethod | null>(null, Validators.required),
  });

  constructor() {
    this.membersQueryInput
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadMembers(0));

    this.loadMembers(0);
  }

  onMembersQueryInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.membersQuery.set(value);
    this.membersQueryInput.next(value.trim());
  }

  membersPreviousPage(): void {
    const page = this.memberPage();
    if (page && !this.membersPreviousPageDisabled()) {
      this.loadMembers(page.page.number - 1);
    }
  }

  membersNextPage(): void {
    const page = this.memberPage();
    if (page && !this.membersNextPageDisabled()) {
      this.loadMembers(page.page.number + 1);
    }
  }

  private loadMembers(page: number): void {
    this.membersLoading.set(true);
    this.membersError.set(false);

    // Une réponse tardive (recherche ou pagination déjà remplacée) ne doit
    // pas écraser la liste correspondant à la recherche/page courante.
    const requestId = ++this.membersRequestId;
    const query = this.membersQuery().trim();

    this.membersService
      .listMembers(page, MEMBERS_PAGE_SIZE, query || undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (memberPage) => {
          if (requestId !== this.membersRequestId) {
            return;
          }
          this.memberPage.set(memberPage);
          this.membersLoading.set(false);
        },
        error: () => {
          if (requestId !== this.membersRequestId) {
            return;
          }
          this.membersError.set(true);
          this.membersLoading.set(false);
        },
      });
  }

  memberIdInvalid(): boolean {
    const control = this.form.controls.memberId;
    return control.invalid && control.touched;
  }

  contributionDateInvalid(): boolean {
    const control = this.form.controls.contributionDate;
    return control.invalid && control.touched;
  }

  submit(): void {
    if (this.submitting() || this.membersLoading() || this.membersError()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const request: CreateContributionRequest = {
      memberId: raw.memberId,
      amount: raw.amount as number,
      contributionDate: raw.contributionDate,
      method: raw.method as PaymentMethod,
    };
    this.submitted.emit(request);
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
