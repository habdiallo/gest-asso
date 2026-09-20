## Why

Le tableau de bord de gestion (T-117) affiche, au-dessus du panneau « Derniers
règlements », le même libellé de périmètre que le panneau « Synthèse des
cotisations » (ex. « Toutes les campagnes ouvertes · 2 campagne(s) »). Ce
libellé laisse croire que `financialOverview.recentPayments` est filtré par la
campagne sélectionnée (`campaignId`), alors que ce n'est pas le cas dans le
mock de démonstration (`recentPayments` y est une liste statique, indépendante
de `campaignId`). Le contrat (`ManagementFinancialOverview`,
`besoins/openapi.yaml`) place pourtant `recentPayments` dans le même objet que
`selectedCampaign`/`allOpenCampaignsSummary`, ce qui indique qu'un filtrage
par campagne est attendu. De plus, le bouton « Voir l'historique » du même
panneau n'est pas un lien de navigation : c'est un texte statique, alors qu'il
est censé ouvrir l'historique des cotisations de la sélection en cours.

Ce défaut a été identifié pendant la revue de fidélité visuelle du tableau de
bord (T-117) mais volontairement exclu de ce ticket, car il change un
comportement/une source de données plutôt qu'un écart purement visuel (voir
`openspec/changes/alignement-visuel-desktop-design/design.md`, section
« Panneau « Derniers règlements » »). Ce change traite ce suivi.

## What Changes

- Le mock de démonstration (`features/dashboard/mocks/handlers.ts`) filtre
  `recentPayments` par `campaignId` quand une campagne précise est
  sélectionnée : seuls les règlements de cette campagne sont renvoyés. Sans
  sélection (« Toutes les campagnes ouvertes »), l'agrégat toutes campagnes
  ouvertes confondues est conservé (comportement déjà correct), plafonné à 5
  éléments (`maxItems` du contrat).
- Le bouton « Voir l'historique » devient un vrai lien de navigation :
  - Campagne précise sélectionnée : lien vers `/campagnes/:id` avec l'onglet
    Cotisations pré-sélectionné. `campaign-detail-page.ts` peut désormais
    initialiser son onglet actif depuis un paramètre de route (query param),
    en plus de son état local existant.
  - « Toutes les campagnes ouvertes » : le lien est masqué, faute d'écran
    listant un historique combiné de plusieurs campagnes.

## Capabilities

### New Capabilities
- `dashboard-recent-payments-scope` : comportement du panneau « Derniers
  règlements » du tableau de bord de gestion, périmètre de
  `financialOverview.recentPayments` selon la campagne sélectionnée, et
  navigation du bouton « Voir l'historique » vers l'historique des
  cotisations de cette sélection.

### Modified Capabilities
(aucune capability existante avec exigences déjà spécifiées n'est modifiée ;
le tableau de bord et le détail de campagne ont été livrés sous le change
`frontend-tickets-mvp-association`, qui ne porte pas de spec de capability
dédiée pour ce comportement précis.)

## Impact

- `contribo-front/src/app/features/dashboard/mocks/handlers.ts`
- `contribo-front/src/app/features/dashboard/pages/dashboard-page.html`
- `contribo-front/src/app/features/dashboard/pages/dashboard-page.ts`
- `contribo-front/src/app/features/dashboard/pages/dashboard-page.spec.ts`
- `contribo-front/src/app/features/campaigns/pages/campaign-detail-page.ts`
- `contribo-front/src/app/features/campaigns/pages/campaign-detail-page.html`
- `contribo-front/src/app/features/campaigns/pages/campaign-detail-page.spec.ts`
- `contribo-front/src/assets/i18n/fr.json` (libellé du lien, si besoin)
- Aucun impact sur le contrat API (`besoins/openapi.yaml`, déjà conforme) ni
  sur les autres écrans.
