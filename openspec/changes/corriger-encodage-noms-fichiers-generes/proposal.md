## Why

Les tags OpenAPI accentués (`Catégories de revenu`, `Règlements`,
`Utilisateurs et rôles`) produisent, à la génération 7.25.0 actuellement
épinglée, des identifiants et noms de fichiers avec les caractères accentués
simplement supprimés plutôt que translittérés : `catgories-de-revenu`,
`rglements`, `utilisateurs-et-rles` côté client Angular généré, et
`CatgoriesDeRevenuApi`, `RglementsApi`, `UtilisateursEtRlesApi` côté
interfaces Spring générées côté backend (vérifié en relançant
`npm run generate:api` et en lisant `contribo-back/pom.xml`,
`useTags: true`). Il ne s'agit pas d'un traitement incohérent entre tags —
correction par rapport à l'hypothèse de l'analyse initiale : tous les tags qui
« convertissent bien » (`Tableau de bord`, `Espace personnel`) ne contiennent
en réalité aucun caractère accentué ; tous les tags accentués sans exception
sont affectés, des deux côtés du contrat. C'est un défaut de
sanitization/translittération du générateur, pas quelque chose que ce dépôt
peut corriger dans son propre code : la source la plus sûre à corriger est le
texte des tags dans le contrat lui-même.

## What Changes

- Renommer les tags accentués de `besoins/openapi.yaml` vers des libellés
  ASCII équivalents (`Categories de revenu`, `Reglements`,
  `Utilisateurs et roles`), sans changer les chemins, `operationId`, schémas
  ou règles d'autorisation d'aucune opération.
- Régénérer le client Angular et les interfaces backend pour confirmer que
  les noms de fichiers/classes utilisent désormais uniquement des caractères
  ASCII, et que plus aucune référence aux anciens noms tronqués ne subsiste
  dans le code applicatif qui importe ces symboles générés.
- Documenter dans les conventions de contrat (`api-design-first-governance`)
  que les tags OpenAPI doivent rester ASCII pour éviter une régression future
  avec le même générateur.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `api-design-first-governance` : les tags OpenAPI doivent rester ASCII pour
  garantir une génération reproductible côté client et serveur.

## Impact

- `besoins/openapi.yaml` : renommage de 3 tags (`Catégories de revenu`,
  `Règlements`, `Utilisateurs et rôles`), consommé par les deux générateurs.
- Code applicatif frontend qui importe les services générés concernés
  (features `income-categories`, `roles-users`, règlements dans `campaigns`/
  `member-space`) : mise à jour des chemins d'import après régénération.
- Code applicatif backend qui référence les interfaces Spring générées
  correspondantes (`IncomeCategoryController`, `UserAccountController`,
  contrôleurs de règlements) : mise à jour des noms de classes après
  régénération.
- Aucun changement de comportement runtime de l'API (chemins, `operationId`,
  schémas, autorisations inchangés).
