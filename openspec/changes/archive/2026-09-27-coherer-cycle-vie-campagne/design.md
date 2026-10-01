## Context

T-131 a livré le modèle de cycle de vie et l'ouverture explicite d'une campagne. La fiche de campagne possède déjà la checklist `openingReadiness`, l'action d'ouverture, la restriction des règlements à `OPEN` et le verrouillage du barème après `UPCOMING`. La présentation reste toutefois ambiguë : l'état `UPCOMING` est rendu comme « À venir », l'action de clôture est calculée pour tout état différent de `CLOSED`, et le mock de « Rentrée associative » expose des effectifs et des montants différents entre la liste, le détail et la situation financière.

Le changement reste limité au frontend Angular et aux données MSW. Il doit respecter les frontières de la feature `campaigns`, réutiliser les composants `shared` existants et laisser le contrat OpenAPI de T-131 inchangé.

## Goals / Non-Goals

**Goals:**

- Donner à chaque état une présentation et une matrice d'actions non ambiguës.
- Faire de `Brouillon` le libellé visible de `UPCOMING`, partout où le statut est présenté.
- Afficher la checklist d'ouverture à proximité de la commande d'ouverture et expliquer chaque blocage.
- Conserver une action primaire unique pour le cycle de vie, avec les actions de consultation en secondaire.
- Utiliser une source de données mock cohérente pour la campagne 201, de la carte de liste jusqu'aux cotisations.
- Ajouter des tests observables sur les états, les actions, la checklist et les invariants financiers.

**Non-Goals:**

- Ajouter une transition d'annulation de brouillon ou un quatrième statut.
- Modifier les enums API `UPCOMING`, `OPEN` et `CLOSED`.
- Modifier `POST /campaigns/{campaignId}/open`, `POST /campaigns/{campaignId}/closure` ou les codes de conflit définis par T-131.
- Déclencher automatiquement l'ouverture à la date de début.
- Créer un service transversal ou une couche d'architecture supplémentaire pour calculer les actions.

## Decisions

### Définir une matrice d'actions positive par état

La page dérive les actions de l'état courant, au lieu de considérer qu'une action est disponible dès lors que l'état n'est pas terminal :

| État API | Libellé visible | Action de cycle de vie | Barème | Règlement |
| --- | --- | --- | --- | --- |
| `UPCOMING` | Brouillon | Ouvrir si `openingReadiness.ready` est vrai, sinon afficher les blocages | Modifiable par Administrateur ou Trésorier | Non disponible |
| `OPEN` | Ouverte | Clôturer par confirmation, réservé à Administrateur ou Trésorier | Lecture seule | Disponible selon les règles de rôle |
| `CLOSED` | Clôturée | Aucune action de mutation | Lecture seule | Non disponible |

« Voir la situation des membres » reste une action de consultation secondaire lorsque le détail est chargé. Elle ne doit jamais être présentée comme une autorisation d'enregistrer un règlement. L'action « Clôturer » ne sera rendue que pour `OPEN`. Une annulation de brouillon, si elle est demandée plus tard, devra avoir son propre contrat et son propre libellé.

Le calcul existant `canCloseCampaignNow` sera corrigé pour exiger `CampaignStatus.Open`. La règle positive est alignée sur `campaignOpenForPayments` et évite qu'une évolution future ajoute par erreur une action à tous les états non clôturés.

### Placer la préparation au niveau de la décision d'ouverture

La checklist `openingReadiness` reste dans l'en-tête du détail, immédiatement sous les métriques et proche de l'action « Ouvrir la campagne ». Elle contient les conditions déjà fournies par le contrat : barème complet, dates valides, date de début atteinte et cotisations prêtes.

- Quand toutes les conditions sont satisfaites, l'action d'ouverture est la commande primaire et la confirmation rappelle que le barème sera figé.
- Quand une condition manque, l'interface conserve la campagne en brouillon, affiche un état « Ouverture bloquée » et détaille les raisons. L'action primaire devient la correction de la configuration, par exemple « Modifier les montants » lorsque le barème est incomplet.
- La checklist ne devient jamais une transition automatique. Le serveur reste l'autorité au moment de `openCampaign` et peut encore renvoyer un conflit.

Cette organisation permet de comprendre pourquoi une campagne est encore un brouillon sans confondre date planifiée, état métier et ouverture effective.

### Harmoniser le vocabulaire sans changer le contrat

`campaignStatusLabel` et les traductions associées afficheront « Brouillon » pour `UPCOMING`. Les filtres et textes de liste utiliseront le même vocabulaire, au pluriel si nécessaire. La valeur API et le filtre envoyé au serveur restent `UPCOMING`.

Les commentaires et tests qui décrivent « À venir » seront actualisés lorsqu'ils font référence au statut métier. Les dates de la campagne restent visibles dans le sous-titre afin que l'utilisateur distingue le brouillon de sa période prévue.

### Rendre la campagne mock 201 mathématiquement cohérente

La valeur canonique retenue pour la campagne « Rentrée associative » est celle déjà affichée dans la liste : 62 membres. Le mock utilisera une catégorie Standard à 75 000 GNF pour ces 62 membres, soit 4 650 000 GNF attendus. Tant que le statut reste `UPCOMING`, le résumé financier de la liste et du détail sera identique : 4 650 000 GNF attendus, 0 encaissé, 4 650 000 GNF restants et 0 pourcentage collecté, avec 62 cotisations non réglées.

Les tests vérifieront au minimum les invariants suivants pour cette campagne :

- `campaign.memberCount` vaut 62.
- La somme des `categoryAmounts.memberCount` vaut 62.
- La somme des `categoryAmounts.expectedAmount` vaut `financialSummary.expectedAmount`.
- `financialSummary.dueCounts.total` vaut 62.
- `paid + partiallyPaid + unpaid` vaut `total`.

Après une ouverture mockée, les mêmes données de base seront conservées et seul l'état, les métadonnées d'ouverture et la disponibilité des actions évolueront. Aucun montant de la liste ne sera recopié dans la page par une constante distincte.

### Limiter les modifications à la feature campaigns

Les changements de comportement restent dans `features/campaigns` : `campaign-detail-page`, `campaign-status-labels`, les traductions de campagnes, les mocks MSW et les tests associés. Les primitives `app-action-button`, `app-detail-shell`, `app-detail-metrics` et `app-detail-tabs` sont réutilisées sans nouveau composant partagé.

## Risks / Trade-offs

- [Risque] Renommer le statut visible peut rendre obsolètes des tests ou des captures qui attendent « À venir ». : Mitigation : mettre à jour les tests de liste et de détail ensemble et conserver `UPCOMING` dans les appels API.
- [Risque] Le mock 201 peut être utilisé par des tests de paiement qui attendent des règlements existants. : Mitigation : rechercher tous les consommateurs de l'identifiant 201, aligner leurs assertions sur le scénario brouillon et préserver les scénarios de paiement sur les campagnes `OPEN`.
- [Risque] Une checklist prête n'implique pas que la commande serveur réussira après une course. : Mitigation : conserver la confirmation et le traitement des conflits déjà définis par T-131.
- [Risque] Une action de consultation affichée dans un brouillon pourrait être interprétée comme une action de paiement. : Mitigation : garder l'autorisation positive `campaignOpenForPayments` et tester l'absence de formulaire d'enregistrement sur `UPCOMING`.

## Migration Plan

1. Vérifier la résolution de T-132 et l'état du prérequis T-131 avant toute modification de code.
2. Mettre à jour les libellés et la matrice de visibilité dans `CampaignDetailPage` et `campaign-status-labels`.
3. Ajuster la hiérarchie visuelle de l'en-tête et de la checklist sans modifier le contrat de la page.
4. Aligner les résumés, catégories et cotisations mockées de la campagne 201, puis corriger les tests dépendants.
5. Exécuter les tests ciblés de campaigns, `node scripts/tickets.mjs check`, la validation OpenSpec et les validations frontend prévues par le dépôt.
6. Comparer le détail en états `UPCOMING`, `OPEN` et `CLOSED` dans le navigateur si disponible.
7. Préparer une PR T-132 vers `main` après revue du diff. Le retour arrière consiste à revert cette PR, sans migration de données.

## Open Questions

- Le produit souhaite-t-il conserver un filtre temporel séparé intitulé « À venir » en plus du statut métier « Brouillon » ? Pour T-132, le libellé du statut et du filtre métier sera harmonisé en « Brouillon » afin d'éviter l'ambiguïté.
- Une action d'annulation de brouillon est-elle nécessaire ? Elle est explicitement hors périmètre tant qu'un besoin métier et un contrat API dédiés ne sont pas définis.
