## Why

L'onglet des montants par catégorie de la fiche campagne ne suit pas la hiérarchie ni le vocabulaire du prototype. Le titre, l'action d'édition, les en-têtes, les unités et l'identification visuelle des catégories rendent la lecture moins claire que dans le design cible. Le ticket T-131 corrige cet écart sans modifier les données métier ni les DTO de succès.

La revue de la PR #131 a également mis en évidence que la condition de visibilité de l'action d'édition (`canEditBaremeNow`), assouplie à « tant que la campagne n'est pas clôturée », contredit le contrat `updateCampaignCategoryAmounts` (édition uniquement avant la date de début) et n'était documentée nulle part comme une règle métier délibérée. Ce même ticket T-131 formalise donc le cycle de vie complet d'une campagne à trois états (Brouillon, Ouverte, Clôturée), corrige les actions qui en dépendent et sécurise l'ouverture explicite après configuration du barème.

Le passage automatique de `UPCOMING` à `OPEN` sur la seule date de début est insuffisant : il pourrait figer une campagne incomplète, sans validation finale ni confirmation de l'utilisateur. L'ouverture doit être une action métier contrôlée, après vérification de la préparation et de la date de début.

## What Changes

- Remplacer l'intitulé générique de l'onglet par la présentation « Barème de la campagne » et conserver la description associée au barème.
- Documenter le cycle de vie à trois états d'une campagne (Brouillon/`UPCOMING`, Ouverte/`OPEN`, Clôturée/`CLOSED`) et les actions autorisées par état dans `besoins/cahier-user-stories-mvp-association-v2.md` (RG-COT-017, RG-COT-018, RG-PAY-010).
- Corriger `canEditBaremeNow` pour n'afficher l'action « Modifier les montants » que sur une campagne en Brouillon (`UPCOMING`), conformément au contrat `updateCampaignCategoryAmounts`, en remplaçant l'assouplissement erroné « tant que la campagne n'est pas clôturée » introduit pendant l'alignement visuel.
- Restreindre l'enregistrement d'un règlement (`CampaignDuesTab`) à une campagne Ouverte (`OPEN`), en l'excluant désormais aussi en Brouillon en plus de Clôturée, et formaliser cette règle dans `createPayment` avec le 409 `CAMPAIGN_NOT_OPEN`.
- Conserver toute campagne nouvellement créée en Brouillon (`UPCOMING`) jusqu'à une ouverture explicite par un Administrateur ou un Trésorier.
- Afficher une checklist de préparation couvrant la complétude du barème, la cohérence des dates et la capacité à établir les cotisations.
- Ajouter l'action « Ouvrir la campagne » avec confirmation, disponible uniquement lorsque la checklist est complète et que la date de début est atteinte.
- Ajouter `POST /campaigns/{campaignId}/open`, avec les conflits métier dédiés `CAMPAIGN_NOT_READY`, `CAMPAIGN_START_DATE_NOT_REACHED`, `CAMPAIGN_ALREADY_OPEN` et `CAMPAIGN_CLOSED`.
- Tracer l'ouverture avec `openedAt` et `openedBy`, puis figer le barème et autoriser les règlements uniquement après le passage à `OPEN`.
- Aligner le tableau sur les colonnes du prototype : `Catégorie`, `Montant de cette campagne`, `Membres concernés` et `Total attendu`.
- Présenter chaque catégorie avec une pastille de repérage et son libellé, puis afficher les montants GNF et l'unité « membres » de façon cohérente.
- Préserver les états non configuré, vide, chargement, erreur, édition et sauvegarde, ainsi que les permissions existantes.
- Adapter le rendu responsive et la version mobile sans créer un nouveau composant de tableau lorsque les composants partagés couvrent déjà le besoin.
- Mettre à jour les tests pour vérifier les libellés, l'ordre exact des colonnes, l'action d'édition, l'enregistrement des règlements selon l'état de la campagne et les états de la vue.
- Mettre à jour la documentation métier et le contrat OpenAPI avant toute implémentation de l'action d'ouverture.

## Capabilities

### New Capabilities

- `campaign-category-bareme-visualization`: Décrit la présentation, les colonnes, les actions et les états observables de l'onglet du barème d'une campagne.
- `campaign-lifecycle-actions`: Décrit le cycle de vie à trois états d'une campagne (Brouillon, Ouverte, Clôturée), la checklist de préparation, l'ouverture explicite et les actions autorisées ou exclues selon l'état.

### Modified Capabilities

- Aucune.

## Impact

- Ticket local : T-131, scope `front`, type `fix`, branche `front/fix-131-bareme-campagne`.
- Frontend Angular : `features/campaigns/pages/campaign-detail-page`, `features/campaigns/components/campaign-dues-tab` et leurs tests associés.
- Documentation métier : `besoins/cahier-user-stories-mvp-association-v2.md` (nouvelles règles RG-COT-017, RG-COT-018, RG-PAY-010).
- Composants partagés : réutilisation de `app-data-table`, `app-action-button`, des formateurs GNF et des primitives de responsive déjà présentes.
- API et données : le contrat documente l'état initial `UPCOMING`, la checklist d'ouverture, `POST /campaigns/{campaignId}/open`, les conflits dédiés, ainsi que les métadonnées d'audit `openedAt` et `openedBy`. Le calcul des cotisations reste inchangé et les montants, catégories, effectifs et totaux restent fournis par `Campaign.categoryAmounts`.
- Livraison : une branche et une PR dédiées vers `main`, avec validations frontend et contrôles OpenSpec.
