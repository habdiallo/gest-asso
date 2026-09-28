# frontend-mobile-audit Specification

## Purpose
TBD - created by archiving change harmoniser-responsive-composants. Update Purpose after archive.
## Requirements
### Requirement: Audit mobile transversal avant adaptation

Le change SHALL documenter un audit des écrans et composants mobiles existants
avant toute adaptation structurelle. L'audit SHALL couvrir le shell, `shared/`, les
composants locaux des features, les pages, les cartes, formulaires, tableaux,
dialogues, listes, filtres, états vides et navigations.

#### Scenario: Parcours des écrans existants

- **WHEN** la phase de cadrage est terminée
- **THEN** les conventions existantes de header, navigation, CTA, cartes,
  espacements, sticky, fixed, scrolling et états interactifs sont relevées sur
  plusieurs largeurs représentatives

#### Scenario: Problème observé

- **WHEN** un composant présente une densité excessive, un espace inutile, un
  débordement, une troncature ou une cible tactile insuffisante
- **THEN** le problème est relié à une cause, une largeur observée et une règle de
  correction avant toute modification du composant

### Requirement: Capture de référence limitée à la composition

Les captures du dashboard SHALL servir à analyser la hiérarchie, la densité, les
proportions, les cartes et la navigation mobile. Elles SHALL NOT provoquer l'ajout
de sections, données, KPI, routes, liens ou actions absents du produit.

#### Scenario: Comparaison avec la référence

- **WHEN** l'audit compare le dashboard actuel à une capture cible
- **THEN** il compare les principes de composition et de densité, sans reproduire
  littéralement les contenus, l'ordre métier ou les blocs de la capture

#### Scenario: Extension à tous les composants

- **WHEN** une règle responsive est retenue à partir d'une observation du dashboard
- **THEN** elle est évaluée sur les composants équivalents du shell, de `shared/`
  et des features avant d'être considérée comme une convention globale

### Requirement: Vérification visuelle multi-largeur et multi-thème

La validation SHALL couvrir au minimum une largeur mobile étroite, une largeur
mobile large, une largeur tablette, une largeur desktop intermédiaire et une
largeur desktop large, dans les deux thèmes lorsque les composants les supportent.

#### Scenario: Transition entre seuils

- **WHEN** une page ou un composant est vérifié sur une largeur intermédiaire
- **THEN** les débordements, chevauchements, troncatures inutiles et ruptures de
  grille sont relevés et corrigés ou documentés comme exceptions

#### Scenario: Deux thèmes

- **WHEN** un composant adapté est vérifié dans les thèmes clair et sombre
- **THEN** son contraste, son focus, sa hiérarchie et ses états interactifs restent
  perceptibles sans dépendre uniquement de la couleur

