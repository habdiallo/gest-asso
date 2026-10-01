## Why

L'application dispose de parcours métier couvrant l'authentification, les membres, les catégories de revenu, les campagnes de cotisation, les cagnottes, l'espace personnel et la gestion des utilisateurs. Il manque un plan manuel unique permettant de vérifier ces parcours de bout en bout avec chacun des quatre rôles applicatifs et les variantes de droits de l'Opérateur.

Ce change apporte une base de recette fonctionnelle traçable avant de traiter séparément le rendu et la composition responsive sur desktop, tablette et mobile.

## What Changes

- Définir un plan de test manuel fonctionnel couvrant les parcours actuellement exposés par le frontend et le contrat API.
- Décrire les prérequis de données, les comptes de recette, les états métier et l'ordre d'exécution des campagnes de test.
- Couvrir les rôles Administrateur, Trésorier, Opérateur et Membre, ainsi que les deux états `operatorCanRecordPayments` de l'Opérateur.
- Vérifier les droits positifs et négatifs, les redirections, l'écran d'accès refusé et l'absence d'actions non autorisées.
- Couvrir les états de chargement, absence de données, succès, validation, erreur API, pagination, filtres, recherches et rafraîchissement après mutation lorsque le parcours les expose.
- Fournir une matrice de couverture par fonctionnalité, rôle et scénario, avec des critères observables et une fiche de résultat reproductible.
- Exclure de ce premier volet les mesures de rendu, de dimensionnement, de contraste visuel et de composition desktop, tablette ou mobile. Ces contrôles feront l'objet d'un change ultérieur.

## Capabilities

### New Capabilities

- `manual-functional-test-plan`: plan de recette manuelle fonctionnelle couvrant les parcours métier actuels, les rôles, les droits, les états et la traçabilité des résultats.

### Modified Capabilities

Aucune exigence produit existante n'est modifiée. Les specs fonctionnelles existantes servent de sources de couverture pour le plan.

## Impact

- Documentation et artefacts OpenSpec uniquement dans ce change.
- Sources de référence: `besoins/cahier-user-stories-mvp-association-v2.md`, `besoins/openapi.yaml`, les routes et fonctionnalités de `contribo-front/src/app/`, ainsi que les specs OpenSpec fonctionnelles existantes.
- Aucun changement de code frontend ou backend, de contrat API, de migration, de dépendance ou de configuration d'exécution.
- Ticket local: T-183, scope `docs`, type `chore`, branche `docs/chore-183-plan-tests-manuels-fonctionnels`, PR prévue vers `develop` si la livraison est demandée.
