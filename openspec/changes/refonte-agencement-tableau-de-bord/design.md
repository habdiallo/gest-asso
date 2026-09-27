## Context

Le tableau de bord de gestion est déjà alimenté par `GET /dashboard` et
possède les données nécessaires pour les KPI, les actions rapides, les
campagnes récentes et les derniers règlements. Dans
`features/dashboard/pages/dashboard-page.html`, les contenus de gestion sont
actuellement répartis dans une grille à deux colonnes : campagnes et
règlements à gauche, actions rapides et synthèses financières à droite. Cette
composition rend les actions moins visibles et répète les montants déjà
présents dans les KPI.

Le périmètre est frontend uniquement. T-126 fournit les primitives visuelles
communes et T-127 traite le filtrage et la navigation du panneau des derniers
règlements. T-135 doit donc réorganiser la page après ces changements, sans
réimplémenter leur comportement.

## Goals / Non-Goals

**Goals:**

- Construire une séquence verticale unique pour le tableau de bord de gestion :
  en-tête et filtres, KPI, actions rapides, campagnes récentes, derniers
  règlements.
- Supprimer les deux panneaux détaillés de synthèse des cotisations et de la
  cagnotte, tout en conservant leurs KPI de référence.
- Donner toute la largeur du contenu principal aux trois blocs opérationnels
  et répartir les quatre actions administrateur avec des cartes homogènes.
- Préserver les liens, les paramètres de navigation, le filtrage par rôle, les
  états vides, les indicateurs de chargement et les données déjà affichées.

**Non-Goals:**

- Modifier les couleurs, la typographie, les composants partagés ou la
  navigation latérale.
- Modifier le contrat API, les modèles de données, les agrégats ou le
  filtrage des règlements.
- Ajouter ou retirer une permission. Pour un rôle qui ne peut pas voir une
  action, la règle actuelle reste appliquée ; la ligne affiche uniquement les
  actions autorisées.
- Réorganiser le tableau de bord membre, dont les KPI, les règlements récents
  et le profil restent inchangés.
- Adapter la composition mobile au-delà du responsive déjà présent.

## Decisions

### Une colonne de gestion, avec des sections pleine largeur

Le conteneur de gestion passe d'une grille principale à deux colonnes à une
colonne avec un espacement vertical constant. Les sections « Actions rapides »,
« Campagnes récentes » et « Derniers règlements » deviennent des frères dans
le flux principal. Cette structure garantit l'ordre demandé et évite de faire
dépendre la priorité visuelle de la hauteur variable des deux colonnes.

Alternative écartée : conserver une grille à deux colonnes et déplacer les
cartes par placement CSS. Cette option resterait fragile lorsque les états
vides, les messages d'erreur ou les droits changent la hauteur d'une section.

### Actions rapides homogènes et conservées selon les droits

Pour l'administrateur, le bloc affiche dans l'ordre « Ajouter un membre »,
« Gérer les rôles », « Gérer les catégories » et « Créer une campagne ». Les
liens existants et leurs paramètres `creer=1` restent inchangés. Les autres
rôles conservent la sélection d'actions actuelle, notamment l'accès aux
membres, aux cagnottes ou aux campagnes selon leurs droits. La grille utilise
quatre colonnes à partir du breakpoint desktop ; elle repasse en grille
adaptée sous ce breakpoint pour ne pas provoquer de débordement.

Alternative écartée : afficher systématiquement quatre actions à tous les
rôles. Cela exposerait des destinations ou des intentions non autorisées et
contredirait la règle actuelle de filtrage côté IHM, qui reste complémentaire
à l'autorisation backend.

### Suppression ciblée des deux synthèses détaillées

Les blocs qui utilisent les libellés `dashboard.synthesis.campaignTitle` et
`dashboard.synthesis.socialFundTitle` sont retirés du template de gestion. Les
signaux et les données de synthèse restent disponibles lorsque les KPI ou le
périmètre sélectionné en ont besoin. Aucun calcul n'est supprimé de
`dashboard-page.ts` si ce calcul alimente encore un KPI, un sélecteur ou le
panneau des règlements.

Alternative écartée : supprimer les propriétés ou les appels associés dans le
service dashboard. Cela élargirait inutilement le changement et pourrait
casser les KPI ou les contrats déjà utilisés.

### Aucune modification du contrat API

Le réagencement ne change ni la requête `GET /dashboard`, ni sa réponse. Les
mocks existants restent la source de validation visuelle et les tests
continuent de vérifier la présence des données et des liens, pas leur nouvelle
forme métier.

## Risks / Trade-offs

- [Risque] Une condition de rôle peut produire moins de quatre actions dans la
  grille. → Mitigation : conserver exactement les conditions existantes et
  tester au moins l'administrateur et un rôle non administrateur.
- [Risque] La suppression des panneaux peut supprimer par erreur un calcul
  encore utilisé par un KPI. → Mitigation : rechercher les consommateurs des
  signaux et conserver les données nécessaires avant de retirer uniquement le
  rendu des synthèses.
- [Risque] Le passage en pleine largeur peut augmenter la hauteur totale de la
  page. → Mitigation : conserver les previews et les états vides existants,
  puis vérifier le rendu à 1440 px et 1024 px.
- [Risque] T-126 ou T-127 peut modifier le template du dashboard avant T-135.
  → Mitigation : déclarer ces tickets comme prérequis et revalider le diff
  contre leur branche intégrée avant l'implémentation.

## Migration Plan

Aucune migration de données ni évolution API. Livrer T-135 dans une PR dédiée
vers `main`, après T-126 et T-127. Le retour arrière consiste à revertir cette
PR, les données et les routes restant inchangées.

## Open Questions

Aucune question bloquante pour le MVP. La règle de visibilité des actions par
rôle existante est reconduite telle quelle.
