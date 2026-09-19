## Why

La revue de la PR #43 (T-83, filtre par type d'événement des cagnottes) a
relevé deux défauts P2 sur `social-funds-list-page.ts`/`.html` :

- Lors d'un changement de filtre, l'ancienne page reste affichée pendant le
  chargement de la nouvelle page zéro filtrée, et sa pagination
  (`totalPages()`, `hasNextPage()`, `hasPreviousPage()`) reste calculée à
  partir de cette ancienne page. Rien n'empêche donc un clic sur un ancien
  bouton "Suivant"/"Précédent" pendant ce chargement, ce qui enverrait une
  requête de page qui ne correspond plus au filtre courant.
- Quand le chargement de la page zéro filtrée échoue, `pageActionError` est
  mis à `true` mais le message d'erreur n'est affiché que dans le bloc
  `@if (totalPages() > 1)` du template : si le résultat filtré tient sur une
  seule page (ou zéro), l'erreur reste invisible et l'ancienne liste
  (issue d'un filtre différent) reste affichée sans indication d'échec.

## What Changes

- `onEventTypeFilterChange` (`social-funds-list-page.ts`) vide immédiatement
  la page affichée (`page.set(null)`) avant d'envoyer la requête de page
  zéro filtrée. Cela masque aussitôt la pagination (`totalPages() === 0`),
  ce qui bloque toute navigation issue des anciens contrôles pendant le
  chargement et empêche l'affichage de cagnottes qui ne correspondent plus
  au filtre courant.
- Si ce chargement échoue, la page reste `null` (traitée comme une absence
  de page, comme un échec initial) plutôt que de conserver l'ancienne liste
  d'un filtre différent.
- Le message d'erreur `pageActionError` (`social-funds-list-page.html`) est
  déplacé hors du bloc conditionnel de la pagination : il s'affiche
  désormais y compris quand le résultat filtré tient sur une seule page (ou
  aucune), aux côtés du message "Aucune cagnotte pour le moment." dans ce
  cas.
- Le comportement d'un échec de changement de page précédente/suivante
  (hors changement de filtre) reste inchangé : l'ancienne liste correcte
  reste affichée avec le message d'erreur.

## Capabilities

### Modified Capabilities
- `cagnottes-ui` : correction de l'état affiché par l'écran liste des
  cagnottes lors d'un changement de filtre par type d'événement et de
  l'échec de son chargement (pas de nouvelle capacité).

## Impact

- `contribo-front/src/app/features/social-funds/pages/social-funds-list-page.ts`
- `contribo-front/src/app/features/social-funds/pages/social-funds-list-page.html`
- `contribo-front/src/app/features/social-funds/pages/social-funds-list-page.spec.ts`
- Aucun impact sur le contrat API (`besoins/openapi.yaml`) ni sur les autres
  fonctionnalités frontend.
