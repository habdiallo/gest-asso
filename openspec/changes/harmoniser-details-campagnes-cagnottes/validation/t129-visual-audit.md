# Audit visuel T-129

Date de vérification : 1 octobre 2026

## Périmètre vérifié

- Référence : `design/index.html`, `design/app.js` et `design/styles.css`.
- Application : `/campagnes/10700000-0000-4000-8000-000000000200` et `/cagnottes/10700000-0000-4000-8000-000000000500`.
- Vues comparées : Situation des membres, Montants par catégorie, Règlements, Contributions et Informations.
- Thème : clair dans le prototype et dans l’application.

## Vérification desktop

Les écrans de détail ont été ouverts dans le navigateur intégré à 1280 x 720. La hiérarchie du shell, la carte hero, les quatre métriques, les onglets soulignés, les surfaces de tableau, les états de pagination et le panneau Informations sont alignés.

Un écart visuel a été corrigé pendant l’audit : les titres de panneaux utilisaient la police condensée des métriques. Ils utilisent maintenant la police de texte Outfit en 16 px, comme les titres de section du prototype. Les libellés visibles ont aussi été alignés pour `Barème de la campagne` et `Contributions enregistrées`.

## Vérification mobile

Le contrôle de la variante responsive a été réalisé dans le code et les tests des primitives : le shell empile les actions sous 661 px, les métriques passent en une colonne, les onglets restent défilables et `app-data-table` conserve le conteneur de débordement horizontal accessible pour les colonnes larges. Une capture visuelle à 440 px n’a pas pu être produite avec le navigateur intégré, qui n’expose pas de redimensionnement de viewport.

## Différences intentionnelles

- La référence propose une action hero générique `Enregistrer un règlement`. L’application conserve `Voir la situation des membres`, car le dialogue existant exige une cotisation sélectionnée et l’enregistrement reste disponible sur chaque ligne éligible. Aucun nouveau parcours métier n’a été inventé dans l’audit visuel.
- Les colonnes `Enregistré par` et les horodatages d’audit visibles dans l’ancien prototype ne sont pas rendus. Le contrat T-129 réserve ces données à une évolution ultérieure et conserve uniquement les quatre colonnes métier demandées.
- Les titres, descriptions, montants et nombres de lignes proviennent de l’API et de ses mocks. Ils peuvent donc différer des valeurs statiques du prototype sans constituer un écart de présentation.

## États contrôlés

- Onglets et relations ARIA sur les cinq panneaux.
- Navigation clavier des onglets.
- Tableaux partagés, états vide, chargement, erreur et pagination.
- Actions autorisées et masquées selon le rôle ou le statut.
- Classes responsive et fallback de débordement horizontal.

## Validations exécutées

- `npm test -- --watch=false` : 70 fichiers et 692 tests réussis.
- `npm run build` : réussi.
- `npm run lint` : réussi.
- `npm run validate:api` : réussi.
- `npx prettier --check` sur les fichiers T-129 : réussi.
- `node scripts/tickets.mjs check` et `node scripts/tickets.mjs verify T-129` : réussis.
- `npm run format:check` global : non réussi à cause de quatre fichiers préexistants hors du diff T-129 : `src/app/features/income-categories/mocks/handlers.spec.ts`, `src/app/features/member-space/components/my-dues.spec.ts`, `src/app/features/members/member-payment-dates.spec.ts` et `src/app/shared/custom-select/custom-select.spec.ts`.
