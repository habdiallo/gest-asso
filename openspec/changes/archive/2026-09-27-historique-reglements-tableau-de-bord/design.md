## Context

Le tableau de bord de gestion (T-117, `features/dashboard`) affiche un
panneau « Derniers règlements » alimenté par `financialOverview.recentPayments`
(`GET /dashboard`, `besoins/openapi.yaml`). Ce panneau réutilise le libellé de
périmètre du panneau voisin « Synthèse des cotisations » (`campaignScopeView`),
qui décrit la campagne sélectionnée via le sélecteur « Campagne de cotisation »
(`campaignId`). Dans le mock de démonstration actuel
(`features/dashboard/mocks/handlers.ts`), `recentPayments` est une liste
statique d'un seul règlement, non recalculée selon `campaignId` : changer de
campagne dans le sélecteur ne change jamais cette liste, ce qui contredit le
libellé affiché au-dessus. Le bouton « Voir l'historique » du même panneau est
un `<span>` sans navigation.

`campaign-detail-page.ts` gère déjà trois onglets (Barème, Cotisations,
Bilan) via un signal local `activeTab`, sans lecture d'un paramètre de route :
la sélection d'onglet ne survit pas à une navigation externe vers cette page.

## Goals / Non-Goals

**Goals:**
- Rendre `recentPayments` cohérent avec le libellé de périmètre déjà affiché :
  filtré par la campagne sélectionnée quand il y en a une, agrégé sur toutes
  les campagnes ouvertes sinon (comportement déjà correct dans ce second cas).
- Faire de « Voir l'historique » un vrai lien vers l'onglet Cotisations de la
  campagne concernée, sans dupliquer l'écran de détail de campagne existant.
- Traiter proprement le cas « Toutes les campagnes ouvertes », où aucune
  campagne précise ne peut être ciblée par un lien.

**Non-Goals:**
- Construire un écran d'historique combiné listant les règlements de
  plusieurs campagnes à la fois : aucune US ne le demande, et le contrat
  actuel (`listCampaignDues`) est scopé à une seule campagne.
- Modifier le contrat API (`besoins/openapi.yaml`) : le schéma
  `ManagementFinancialOverview` couvre déjà ce besoin (`recentPayments` dans
  le même objet que `selectedCampaign`/`allOpenCampaignsSummary`).
- Modifier le panneau « Synthèse de la cagnotte » ou tout comportement lié aux
  cagnottes : ce change porte uniquement sur les règlements de campagnes.
- Reprendre l'alignement visuel déjà traité par T-117 : ce change ne touche
  que le comportement, pas la présentation déjà conforme à `design/`.

## Decisions

### Filtrer `recentPayments` par `campaignId` dans le mock, pas par nouveau paramètre

Le contrat expose déjà `campaignId` sur `GET /dashboard` et le place dans le
même objet de réponse que `recentPayments`. Le mock applique donc le même
filtre que celui déjà utilisé pour `selectedCampaign` : quand `campaignId` est
fourni, ne garder que les règlements dont `payment.campaign.id` correspond ;
sinon, garder les règlements des campagnes ouvertes (comportement actuel),
plafonnés à 5 (`maxItems` du contrat). Le jeu de données de démonstration est
enrichi d'un second règlement rattaché à une autre campagne, pour que le
filtrage soit visible en changeant de sélection dans le panneau « Périmètre
des indicateurs » (introduit par T-117).

**Alternative écartée** : ajouter un paramètre de requête dédié
(`recentPaymentsCampaignId`). Écartée car redondante avec `campaignId`, déjà
au même niveau de portée dans le contrat existant.

### Navigation « Voir l'historique » via un paramètre de route sur l'écran de détail existant

Plutôt que de créer un nouvel écran d'historique, le bouton devient un
`routerLink` vers `/campagnes/:id` avec un paramètre de requête
(`onglet=cotisations`) que `campaign-detail-page.ts` lit à l'initialisation
pour positionner `activeTab` sur l'onglet Cotisations au lieu du premier
onglet par défaut. Le comportement actuel (navigation interne par clic, sans
paramètre) reste inchangé quand ce paramètre est absent.

**Alternative écartée** : dupliquer l'onglet Cotisations dans un composant
autonome accessible depuis le tableau de bord. Écartée car cela dupliquerait
`CampaignDuesTab` et sa logique de chargement/pagination sans bénéfice, pour
un simple point d'entrée différent vers le même contenu.

### Lien masqué (pas désactivé) pour « Toutes les campagnes ouvertes »

Quand aucune campagne précise n'est sélectionnée, il n'existe pas de page
cible pertinente (pas d'écran d'historique combiné, Non-Goal ci-dessus). Le
bouton est donc masqué plutôt qu'affiché désactivé, pour éviter un contrôle
inerte sans explication visible à l'utilisateur.

**Alternative écartée** : lien vers `/campagnes` (liste filtrée sur le statut
Ouverte). Écartée car cet écran ne montre pas de règlements, seulement des
campagnes : la destination ne répondrait pas à l'intention du clic
(« voir l'historique des règlements »).

## Risks / Trade-offs

- [Risque] Oublier de garder `recentPayments` correctement plafonné à 5 après
  filtrage → Mitigation : test dédié vérifiant `maxItems` respecté avec et
  sans filtre.
- [Compromis] Le mock filtre côté client de test (MSW), le vrai backend n'existe
  pas encore : le comportement réel dépendra de son implémentation future,
  qui devra respecter la même sémantique de `campaignId` documentée ici et
  dans le contrat existant.
- [Risque] Ajouter un paramètre de route lu par `campaign-detail-page.ts`
  pourrait entrer en conflit avec un usage futur de `activeTab` par une autre
  fonctionnalité → Mitigation : le paramètre reste optionnel et n'affecte que
  l'état initial, sans changer le comportement des onglets une fois la page
  chargée (clic, flèches clavier T-64 inchangés).

## Migration Plan

Aucune migration de données. Livraison en un seul ticket/PR vers `main`
(portée limitée, cf. `proposal.md`), laissant l'application fonctionnelle.
Pas de retour arrière global nécessaire.
