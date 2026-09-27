## ADDED Requirements

### Requirement: Hiérarchie verticale du tableau de bord de gestion

Le tableau de bord de gestion SHALL afficher, dans cet ordre, l'en-tête et les
filtres, les quatre KPI principaux, les actions rapides, les campagnes
récentes, puis les derniers règlements. Les sections opérationnelles SHALL
occuper toute la largeur disponible du contenu principal en desktop.

#### Scenario: Affichage gestion desktop

- **WHEN** un utilisateur disposant d'une vue de gestion ouvre le tableau de
  bord à une largeur desktop
- **THEN** l'écran présente les quatre KPI sur une ligne, puis les actions
  rapides, les campagnes récentes et les derniers règlements dans cet ordre,
  chaque bloc utilisant la largeur du contenu principal

#### Scenario: Etat vide ou erreur d'une section

- **WHEN** les campagnes récentes ou les derniers règlements sont vides, ou
  lorsqu'une section affiche une erreur déjà prévue
- **THEN** la section conserve son emplacement dans la hiérarchie et affiche
  son état vide ou son message d'erreur existant sans décaler les autres
  sections dans une colonne latérale

### Requirement: KPI de gestion conservés sans synthèses redondantes

Le tableau de bord de gestion SHALL conserver les KPI « Membres actifs »,
« Cotisations encaissées », « Reste sur cotisations » et « Contributions
encaissées » avec leurs valeurs, unités, agrégats et libellés existants. Il
MUST NOT afficher les panneaux détaillés « Synthèse des cotisations » et
« Synthèse de la cagnotte ».

#### Scenario: Données financières disponibles

- **WHEN** `GET /dashboard` fournit les données de gestion et le bilan
  financier
- **THEN** les quatre KPI affichent les mêmes valeurs qu'avant la
  réorganisation et aucun panneau de synthèse détaillé n'est rendu

#### Scenario: Bilan financier indisponible

- **WHEN** la réponse de gestion ne fournit pas de bilan financier
- **THEN** le tableau de bord conserve le comportement existant pour les KPI
  non financiers et n'affiche pas de synthèse détaillée vide ou artificielle

### Requirement: Actions rapides prioritaires et homogènes

Le bloc « Actions rapides » SHALL être placé immédiatement sous les KPI et
utiliser toute la largeur disponible. Pour un administrateur, il SHALL afficher
sur une ligne desktop quatre cartes de largeur homogène, dans l'ordre « Ajouter
un membre », « Gérer les rôles », « Gérer les catégories » et « Créer une
campagne ». Les destinations, les paramètres de création et les restrictions
par rôle existants MUST rester inchangés.

#### Scenario: Administrateur

- **WHEN** un administrateur consulte le tableau de bord à une largeur desktop
- **THEN** les quatre actions attendues sont visibles immédiatement sous les
  KPI, chacune occupe la même largeur et chaque lien conserve sa destination
  actuelle

#### Scenario: Rôle non administrateur

- **WHEN** un trésorier, un opérateur ou un membre consulte le tableau de bord
- **THEN** seules les actions déjà autorisées pour ce rôle sont affichées,
  sans apparition d'un lien d'administration non autorisé

#### Scenario: Largeur réduite

- **WHEN** la fenêtre est inférieure au breakpoint desktop
- **THEN** les actions restent utilisables et s'adaptent selon la grille
  responsive existante sans débordement horizontal

### Requirement: Contenu métier et navigation inchangés

La réorganisation SHALL conserver les données, les previews, les états de
chargement, les états vides, les liens « Tout afficher », « Voir l'historique »
et les paramètres de route existants. Elle MUST NOT modifier le contrat API,
les permissions, la navigation latérale ou la charte graphique existante.

#### Scenario: Navigation depuis une action ou une liste

- **WHEN** l'utilisateur active une action rapide, « Tout afficher » ou « Voir
  l'historique »
- **THEN** l'application utilise la même route et les mêmes paramètres qu'avant
  la réorganisation

#### Scenario: Comparaison visuelle

- **WHEN** le tableau de bord est comparé au rendu de référence à 1440 px puis
  à 1024 px, en thème sombre puis clair
- **THEN** seules la hiérarchie, la suppression des deux synthèses et la
  répartition de l'espace prévues par T-135 diffèrent, sans changement de
  couleurs ni de composants visuels hors périmètre
