## Why

Le ticket T-122 doit traiter l'écart restant entre la page actuelle Utilisateurs et rôles et son équivalent dans `design/`. La page actuelle conserve la recherche et le filtre dans deux champs larges, affiche les utilisateurs sans avatar ni pastilles d'état et expose une action textuelle, alors que le design cible utilise une barre d'outils compacte, un tableau plus lisible et une navigation par chevron.

Le même écart existe dans le dialogue de configuration : le comportement métier est présent, mais son agencement ne reprend pas la hiérarchie visuelle du prototype. Le ticket doit donc aligner la liste et le dialogue sans changer les données, les droits ou le contrat API.

## What Changes

- Aligner T-122 sur le design cible pour la page Utilisateurs et rôles à 1440 px et 1024 px, dans les deux thèmes.
- Remplacer l'organisation actuelle de la barre d'outils par une recherche principale pleine largeur et un déclencheur de filtre de rôle compact, sans supprimer le filtrage API existant.
- Conserver exactement les cinq colonnes métier actuelles, tout en harmonisant leur rendu : avatar et identité dans la colonne utilisateur, rôle applicatif, pastille d'autorisation financière, pastille d'état du compte et chevron d'action.
- Aligner le dialogue de configuration sur le gabarit du design : kicker, identité du compte, sections numérotées, sélection du rôle, autorisation financière conditionnelle pour l'Opérateur, aide globale et pied d'actions commun.
- Conserver l'ouverture du dialogue depuis une ligne, la présélection du rôle, la mise à jour via `PUT /users/{userId}`, la pagination, la recherche, le filtrage, les droits Administrateur et les états de chargement/erreur.
- Ajouter ou ajuster uniquement les fixtures et tests nécessaires pour rendre les états du design observables, sans inventer de données métier ni modifier le contrat API.
- **BREAKING** : aucune. Le changement est visuel et ne modifie ni les colonnes métier, ni les routes, ni les droits, ni les opérations API.

## Capabilities

### New Capabilities

- `desktop-visual-parity` : critères de fidélité visuelle desktop (≥1024 px) pour les écrans métier existants (tableau de bord, membres, catégories de revenu, campagnes, cagnottes, rôles et utilisateurs, mon espace, dialogues de formulaire), par comparaison avec `design/`, sans changement de comportement fonctionnel hors décision explicite sur le lien de navigation tableau de bord.

### Modified Capabilities

- `desktop-sidebar-visual` : la exigence issue de T-111 selon laquelle « les éléments graphiques n'ajoutent aucun lien du prototype [...] aucune rubrique Administration vide » est réexaminée pour la seule destination « Tableau de bord », identifiée par le porteur du produit comme un écart réel avec le prototype. Le reste de cette exigence (pas de nouvelle rubrique vide, pas d'autre destination du prototype comme le sélecteur de rôle de démonstration) reste inchangé.

## Impact

- Zones concernées pour T-122 : `contribo-front/src/app/features/roles-users/`, les traductions françaises associées, les mocks et les tests de composant.
- Les composants partagés `action-button`, `custom-select` et `form-dialog` peuvent être réutilisés ou ajustés uniquement si l'alignement de T-122 l'exige, sans introduire de comportement spécifique aux rôles et utilisateurs dans `shared/`.
- Aucun impact backend, contrat API `besoins/openapi.yaml`, migration ou dépendance npm.
- La branche et la PR de T-122 restent `front/fix-122-alignement-visuel-roles-utilisateurs` vers `main`, après le prérequis T-121.
