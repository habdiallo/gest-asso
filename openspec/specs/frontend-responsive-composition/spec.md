# frontend-responsive-composition Specification

## Purpose
TBD - created by archiving change harmoniser-responsive-composants. Update Purpose after archive.
## Requirements
### Requirement: Composition responsive de tous les composants visuels

Tous les composants visuels du frontend SHALL rester lisibles, utilisables et
cohérents sur mobile, tablette, desktop intermédiaire et desktop large. Cette
exigence couvre le shell, `shared/`, les composants locaux des features et les
pages qui les composent.

#### Scenario: Largeur mobile étroite

- **WHEN** un composant est affiché sur une largeur mobile étroite
- **THEN** sa composition s'empile, se compacte ou défile localement sans
  débordement horizontal de la page et sans perte de son action principale

#### Scenario: Largeur intermédiaire

- **WHEN** la largeur se situe entre deux seuils responsive existants
- **THEN** les cartes, grilles, formulaires, dialogues et navigations conservent
  des alignements stables sans chevauchement ni rupture visuelle

#### Scenario: Desktop large

- **WHEN** un composant est affiché dans un conteneur large
- **THEN** il conserve une largeur de lecture maîtrisée et ne transforme pas
  l'espace supplémentaire en étirement disproportionné de son contenu

### Requirement: Hiérarchie et densité adaptées au mobile

Les composants SHALL distinguer l'action principale, l'information essentielle,
le statut ou la valeur, le contexte secondaire et l'accès au détail. Une
information secondaire peut être regroupée ou révélée progressivement uniquement
si l'information essentielle reste immédiatement accessible.

#### Scenario: Carte ou KPI mobile

- **WHEN** une carte ou un KPI contient plusieurs niveaux d'information
- **THEN** la valeur principale et son contexte indispensable restent lisibles,
  avec un padding et une organisation proportionnés au conteneur disponible

#### Scenario: Liste mobile

- **WHEN** une liste contient une information principale, un statut, une valeur et
  un contexte secondaire
- **THEN** la ligne ou la carte présente ces éléments dans cet ordre de priorité
  et permet d'accéder au détail sans reproduire toutes les colonnes desktop

### Requirement: Conservation des données et des interactions

Les adaptations responsive SHALL conserver les données essentielles, les droits,
les routes, les contrats d'interaction, les labels et les états fonctionnels des
composants existants. Un tableau SHALL utiliser un défilement local ou une
composition mobile documentée lorsque ses colonnes ne peuvent pas être réduites.

#### Scenario: Tableau trop large

- **WHEN** les colonnes d'un tableau dépassent la largeur du conteneur
- **THEN** seul le conteneur du tableau défile ou une composition mobile prévue
  est utilisée, sans élargir la page entière ni supprimer une donnée essentielle

#### Scenario: Contrôle interactif mobile

- **WHEN** un bouton, champ, select, filtre ou action est affiché sur mobile
- **THEN** il conserve son nom accessible, son focus visible, sa validation et une
  zone d'interaction adaptée au toucher

### Requirement: Cohérence entre composants réutilisables et locaux

Les composants `shared/` et les composants locaux des features SHALL appliquer les
mêmes conventions responsive pour un besoin de composition équivalent. Une
exception locale SHALL être documentée lorsqu'elle répond à une contrainte de
contenu, de conteneur ou de parcours qui ne se généralise pas.

#### Scenario: Même rôle visuel

- **WHEN** deux composants affichent le même rôle visuel dans des features
  différentes
- **THEN** ils utilisent une composition responsive cohérente, sauf exception
  justifiée par leur contenu ou leur conteneur réel

#### Scenario: Exception de composant

- **WHEN** un composant nécessite une largeur, un empilement ou un défilement
  différent pour préserver ses données
- **THEN** l'exception est limitée au composant, vérifiée aux largeurs concernées
  et n'introduit pas de règle globale concurrente

