## 1. Préparation T-114

Ticket T-114, scope front, type fix, slug filtre-evenement-cagnottes, branche
`front/fix-114-filtre-evenement-cagnottes`. Prérequis : T-83, PR #43 intégrée
dans main. Périmètre : `social-funds-list-page.ts`/`.html`/`.spec.ts`
uniquement. Acceptation : un changement de filtre vide la liste et bloque la
pagination issue de l'ancien filtre jusqu'à la réponse de la page zéro ;
l'échec de ce chargement est traité comme une absence de page et affiche
l'erreur même sans pagination visible ; le changement de page normal
(précédent/suivant) n'est pas régressé.

- [x] 1.1 [T-114] Vérifier Git, réserver le ticket et produire les artefacts
      OpenSpec sur une branche de planification.
- [x] 1.2 [T-114] Résoudre le ticket, utiliser sa branche et vérifier les
      prérequis et leur présence dans l'ascendance avant le code.

## 2. Correction

- [x] 2.1 [T-114] `onEventTypeFilterChange` vide la page affichée
      (`page.set(null)`) avant la requête de page zéro filtrée, ce qui masque
      la pagination et bloque les anciens boutons "Précédent"/"Suivant"
      pendant le chargement ; un échec de ce chargement laisse la page à
      `null` au lieu de conserver l'ancienne liste.
- [x] 2.2 [T-114] Déplacer le message d'erreur `pageActionError` hors du bloc
      conditionnel de la pagination dans `social-funds-list-page.html`, pour
      qu'il s'affiche même quand le résultat filtré tient sur une seule page
      (ou aucune).

## 3. Validation locale

- [x] 3.1 [T-114] Ajouter/adapter les tests : ancienne page vidée et
      pagination masquée pendant le chargement filtré, erreur affichée sur un
      nouveau filtre à une seule page (ou aucune) sans bouton "Suivant"
      cliquable issu de l'ancien filtre, succès du chargement filtré après
      coup, et absence de régression sur le changement de page normal.
- [x] 3.2 [T-114] Exécuter `npm test -- --watch=false` et `npm run build`
      depuis `contribo-front/`, relire le diff.

## 4. Livraison

- [x] 4.1 [T-114] Committer uniquement le périmètre du ticket et pousser la
      branche `front/fix-114-filtre-evenement-cagnottes`.
- [x] 4.2 [T-114] Ouvrir la PR vers `main` avec le modèle du dépôt et
      rapporter les validations et limites ; la revue et la fusion restent à
      faire par le mainteneur.

PR ouverte : https://github.com/habdiallo/gest-asso/pull/96. Revue et fusion
à effectuer par le mainteneur.
