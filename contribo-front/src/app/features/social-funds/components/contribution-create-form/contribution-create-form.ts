import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MembresService } from '@api';
import type { CreateContributionRequest, MemberSummary, PaymentMethod } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { AmountInput } from '@shared/amount-input/amount-input';
import { PaymentMethodSelect } from '@shared/payment-method-select/payment-method-select';

/** Taille de page utilisée pour charger la liste des membres sélectionnables (`GET /members`). */
const MEMBERS_PAGE_SIZE = 100;

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
 * sans filtre de statut ni recherche : `US-CAG-002`/RG-CAG-004 à 007 ne
 * restreignent pas la contribution aux membres actifs. Limite connue de ce
 * ticket : une seule page de 100 membres est chargée (maximum autorisé par
 * le contrat, `PageSize.maximum: 100`), sans pagination ni recherche dans le
 * sélecteur ; au-delà de ce volume, un membre non affiché reste
 * indisponible à la sélection. Cette amélioration (recherche/pagination du
 * sélecteur) n'est pas ticketisée séparément à ce jour.
 *
 * Ce composant construit le formulaire et sa validation ; son intégration
 * dans l'écran de suivi de cagnotte (`SocialFundDetailPage`), l'appel API
 * réel et le rafraîchissement associé restent hors périmètre (T-88 à T-90).
 */
@Component({
  selector: 'app-contribution-create-form',
  imports: [ReactiveFormsModule, TranslocoPipe, AmountInput, PaymentMethodSelect],
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
  readonly members = signal<MemberSummary[]>([]);

  readonly form = this.formBuilder.group({
    memberId: this.formBuilder.nonNullable.control('', Validators.required),
    amount: this.formBuilder.control<number | null>(null, [Validators.required, Validators.min(1)]),
    contributionDate: this.formBuilder.nonNullable.control('', Validators.required),
    method: this.formBuilder.control<PaymentMethod | null>(null, Validators.required),
  });

  constructor() {
    this.membersService
      .listMembers(0, MEMBERS_PAGE_SIZE)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (memberPage) => {
          this.members.set(memberPage.items);
          this.membersLoading.set(false);
        },
        error: () => {
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
