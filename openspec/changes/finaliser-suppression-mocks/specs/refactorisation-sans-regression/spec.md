## MODIFIED Requirements

### Requirement: Alias stables pour les imports profonds

Le frontend MUST utiliser des alias TypeScript pour les imports qui traversent plusieurs racines stables, notamment `@assets/*` pour `src/assets/*`. Les alias existants `@core/*`, `@shared/*`, `@features/*` et `@api` MUST respecter les frontières d'architecture et ne MUST NOT masquer une dépendance directe entre features.

#### Scenario: Import global profond migré

- **WHEN** un module importe une ressource globale avec plusieurs remontées `../`
- **THEN** l'import utilise l'alias racine correspondant et résout de manière identique dans le build, les tests, le lint et les outils TypeScript

#### Scenario: Import local à une feature

- **WHEN** un module importe un voisin strictement local à la même feature
- **THEN** un chemin relatif peut être conservé si celui-ci rend la dépendance locale plus explicite

#### Scenario: Dépendance entre features

- **WHEN** un import tente de relier directement deux features
- **THEN** l'alias ne contourne pas le contrôle d'architecture et la dépendance est refusée, déplacée vers une frontière neutre ou traitée par un ticket distinct

## ADDED Requirements

### Requirement: Présentation responsive des collections

Les collections métier qui proposent une table et une représentation mobile en cartes SHALL utiliser `app-data-table` pour leur surface desktop et tablette. La vue en cartes existante SHALL rester la seule représentation visible sous le breakpoint `tablet`. Le changement SHALL porter uniquement sur l'affichage et SHALL préserver les règles métier, les données, les filtres, les actions et les contrôles de pagination.

#### Scenario: Table partagée sur desktop et tablette

- **WHEN** une collection paginée contient des éléments et que la largeur est au moins celle du breakpoint `tablet`
- **THEN** la collection affiche le tableau projeté par `app-data-table`
- **AND** les informations et actions de chaque ligne restent disponibles

#### Scenario: Cartes mobiles conservées

- **WHEN** la même collection est affichée sous le breakpoint `tablet`
- **THEN** la vue en cartes mobile existante est affichée
- **AND** la table desktop est masquée sans supprimer les données ni les actions

#### Scenario: Pagination inchangée

- **WHEN** la réponse API contient plusieurs pages
- **THEN** les contrôles de pagination, leur seuil d'apparition et les requêtes de page restent identiques sur desktop, tablette et mobile
