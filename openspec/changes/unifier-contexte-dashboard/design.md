## Context

Le dashboard Angular de gestion possède aujourd'hui deux sélections
indépendantes dans `features/dashboard/pages/dashboard-page.*` : une campagne
et une cagnotte. Les données financières sont déjà exposées par
`GET /dashboard` avec `campaignId` ou `socialFundId`, et les options sont
chargées par les services des campagnes et des cagnottes. Le contrat expose
également `GET /contributions` avec un filtre `socialFundId`, ce qui permet de
charger l'activité des cagnottes sans modifier l'API.

La composition cible reprend la suppression des panneaux de synthèse portée par
T-135. Le nouveau ticket ne doit pas réintroduire cette redondance. Le périmètre
est frontend : le dashboard de gestion, ses tests et les prototypes UX/UI qui
servent de référence desktop et native mobile.

## Goals / Non-Goals

**Goals:**

- Remplacer les deux états de sélection par un état discriminé unique,
  `campaign` ou `socialFund`, avec un identifiant de périmètre facultatif.
- Rendre les indicateurs, activités, actions rapides, libellés et états vides
  dépendants de ce contexte unique.
- Réutiliser les agrégats existants de `GET /dashboard` et l'endpoint existant
  `GET /contributions` pour l'activité des cagnottes.
- Conserver la composition sans synthèse séparée de T-135, les permissions,
  les thèmes clair/sombre et le responsive desktop/mobile.
- Garder une navigation et une lecture cohérentes avec les prototypes `design/`
  et `design/native design/`.

**Non-Goals:**

- Modifier le contrat OpenAPI, le backend, les migrations ou les données
  persistées.
- Réintroduire un panneau « Synthèse des cotisations » ou « Synthèse de la
  cagnotte ».
- Modifier le dashboard du membre ou les écrans de détail des campagnes et
  cagnottes au-delà des liens déjà utilisés.
- Créer un store global : l'état reste local à la feature dashboard tant qu'il
  n'est pas partagé par une autre page.

## Decisions

### Un état de contexte plutôt que deux sélections indépendantes

Le composant conservera un discriminant local, par exemple
`dashboardContextType: 'campaign' | 'socialFund'`, et un identifiant nullable
`dashboardContextId`. Le type détermine la liste d'options, le paramètre API,
les cartes et le flux d'activité. Lors d'un changement de type, l'identifiant
est remis à zéro avant le chargement, ce qui interdit un état impossible où une
campagne et une cagnotte seraient actives simultanément.

Alternative écartée : conserver `selectedCampaignId` et
`selectedSocialFundId` avec une convention disant qu'un seul est prioritaire.
Cette convention laisse des états incohérents dans le template et reproduit la
confusion constatée sur le dashboard.

### Une sélection dépendante du type actif

Le template affiche un contrôle de type accessible et un seul `app-custom-select`.
Le libellé, l'option « Toutes les ... ouvertes » et les options chargées sont
calculés à partir du discriminant. Le changement déclenche le même flux de
rechargement avec un compteur de requête ou une stratégie équivalente pour
ignorer les réponses obsolètes.

Alternative écartée : afficher deux sélecteurs côte à côte avec des valeurs
vides pour le contrôle non actif. Cela conserve la charge cognitive et donne
l'impression que les deux périmètres filtrent encore le dashboard ensemble.

### Brancher l'activité selon le contexte sans modifier l'API

En contexte campagne, le composant continue d'utiliser `financialOverview` et
`recentPayments` de `GET /dashboard`. En contexte cagnotte, il utilise le bilan
`selectedSocialFund` ou `allOpenSocialFundsSummary` et charge les contributions
récentes via `GET /contributions`, avec `socialFundId` uniquement pour une
cagnotte précise. Pour l'agrégat, le service utilise l'absence de filtre et
limite l'affichage au nombre prévu par le dashboard.

Alternative écartée : ajouter un champ `recentContributions` à
`ManagementFinancialOverview`. Le besoin peut être couvert par le contrat
existant, donc une évolution backend créerait une dépendance et une migration
de contrat inutiles.

### Rendu conditionnel des indicateurs et actions

Le contexte campagne rend les cartes membres, cotisations, reste à encaisser et
paiements. Le contexte cagnotte rend les cartes contributeurs, objectif,
contributions encaissées et reste à collecter. Les titres, liens, états vides
et actions de création/consultation suivent le même discriminant, tandis que
les conditions de rôle restent celles déjà présentes.

Les deux panneaux de synthèse ne font pas partie de cette composition. Leur
suppression reste le résultat attendu de T-135 et sera vérifiée par les tests.

### Prototypes comme référence de validation visuelle

Les fichiers `design/app.js`, `design/styles.css` et
`design/native design/app.js` servent à comparer le parcours desktop et native
mobile. Ils ne remplacent pas l'implémentation Angular. Les validations devront
contrôler le même vocabulaire, les mêmes états et l'absence de débordement dans
les thèmes clair et sombre.

## Risks / Trade-offs

- [Risque] Le chargement des contributions échoue alors que le bilan financier
  est disponible. → Mitigation : afficher un état d'erreur local à l'activité,
  conserver les indicateurs cohérents et permettre une nouvelle tentative.
- [Risque] Une réponse tardive d'un ancien contexte écrase le nouveau contexte.
  → Mitigation : conserver le garde de requête existant et l'associer au
  contexte et à la sélection courants.
- [Risque] Une cagnotte sans objectif affiche un pourcentage invalide. →
  Mitigation : rendre l'objectif et le reste optionnels et tester l'état sans
  objectif explicitement.
- [Risque] La suppression des sélections indépendantes casse des tests ou des
  traductions historiques. → Mitigation : adapter les tests du dashboard et
  supprimer uniquement les clés devenues inutiles après recherche des usages.
- [Risque] Le changement de composition réintroduit indirectement une synthèse
  redondante. → Mitigation : conserver un test négatif sur les deux titres de
  synthèse et vérifier le rendu desktop après T-135.

## Migration Plan

1. Attendre l'intégration de T-135 ou rebaser la branche sur une base contenant
   la composition sans synthèses.
2. Implémenter l'état unique et le nouveau rendu dans la feature dashboard,
   puis aligner les prototypes si nécessaire.
3. Régénérer le client uniquement si une vérification montre qu'un contrat
   existant est absent du client local. Aucune modification OpenAPI n'est
   prévue par défaut.
4. Exécuter les tests frontend, le build, le lint et les contrôles de tickets.
5. Préparer une PR vers `develop`. Le retour arrière consiste à revertir cette
   PR, sans migration de données ni changement backend.

## Open Questions

- Confirmer pendant l'implémentation la limite d'éléments à afficher pour
  `GET /contributions`, en conservant la convention existante des activités du
  dashboard.
- Vérifier si les rôles non autorisés voient les options de contexte ou un
 dashboard sans `financialOverview`, selon le discriminant retourné par l'API.
