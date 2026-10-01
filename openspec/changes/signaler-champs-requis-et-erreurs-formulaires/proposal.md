## Why

Les formulaires de l'application utilisent déjà des validateurs, mais l'utilisateur ne dispose pas toujours d'un repère visuel immédiat pour distinguer les champs obligatoires. Les erreurs affichées doivent également indiquer la règle à corriger sans exposer d'information sensible ni transformer un message de sécurité, notamment à la connexion, en aide au contournement.

## What Changes

- Ajouter un indicateur visuel et accessible sur chaque champ obligatoire de tous les formulaires métier concernés.
- Harmoniser les libellés, l'aide associée, `aria-required`, `aria-invalid` et les messages affichés après interaction ou soumission.
- Remplacer les messages trop génériques par des messages adaptés à la règle de validation : obligatoire, format, borne, cohérence entre champs, date, montant ou choix requis.
- Conserver des messages génériques pour les cas où la précision divulguerait une information sensible, notamment l'authentification et l'existence d'un compte.
- Réutiliser les clés Transloco françaises existantes ou en créer de nouvelles cohérentes dans `fr.json`, sans texte métier en dur dans les templates.
- Couvrir les formulaires de connexion, changement de mot de passe, membres, catégories, campagnes, règlements, cagnottes, contributions et gestion des rôles.
- Ajouter des tests de comportement pour la présence de l'indicateur, l'association des messages aux champs et les principales règles de validation.

## Capabilities

### New Capabilities

- `form-validation-feedback`: convention fonctionnelle et accessible pour signaler les champs obligatoires et présenter des erreurs de validation utiles sans divulgation sensible.

### Modified Capabilities

Aucune exigence métier ou API existante n'est modifiée. Les validations serveur restent la source d'autorité pour les contraintes métier et les droits.

## Impact

- Frontend Angular : formulaires et composants partagés dans `contribo-front/src/app/features/` et `contribo-front/src/app/shared/`.
- Traductions : `contribo-front/src/assets/i18n/fr.json`.
- Tests : specs de composants et de pages des features concernées, avec sélecteurs sémantiques et vérifications d'accessibilité DOM.
- Contrat API et backend : aucun changement prévu ; les erreurs API seront mappées à partir des codes stables et de `fieldErrors`.
- Ticket local : T-185, scope `front`, type `feat`, branche `front/feat-185-signaler-champs-requis`, PR prévue vers `develop`.
