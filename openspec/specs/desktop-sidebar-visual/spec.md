# desktop-sidebar-visual Specification

## Purpose
TBD - created by archiving change fidelite-sidebar-desktop-design. Update Purpose after archive.
## Requirements
### Requirement: Cadre visuel de la sidebar desktop

Le frontend SHALL reproduire le cadre de `.sidebar` dans `design/styles.css` pour la sidebar authentifiée au seuil existant de 821 px : largeur 256 px, position fixe à gauche, padding 28 px en haut et 20 px sur les côtés/en bas, fond surface-glass avec flou 24 px et bordure droite line. Le décalage du contenu principal SHALL rester cohérent avec cette largeur.

#### Scenario: Affichage dans les deux thèmes
- **WHEN** un utilisateur connecté consulte l'application à 1440 × 900 ou 1024 × 768 px, avec texte à taille normale, en thème sombre puis clair
- **THEN** le cadre, les espacements et les surfaces de la sidebar correspondent aux règles du prototype dans le thème correspondant
- **AND** la sidebar ne recouvre pas le contenu principal

### Requirement: Marque desktop conforme au prototype

Le frontend SHALL afficher dans la sidebar le logo SVG du prototype dans une marque de 38 × 38 px à rayon 11 px, le nom CONTRIBO en Bebas Neue 25 px et le sous-titre « Gestion associative » en Space Grotesk 8 px avec la casse, l'espacement et l'alignement de `.brand*`. Les SVG décoratifs SHALL être cachés des technologies d'assistance.

#### Scenario: Bloc de marque complet
- **WHEN** la sidebar desktop est visible
- **THEN** son bloc supérieur affiche le logo, le nom et le sous-titre avec les dimensions, couleurs et espacements du prototype
- **AND** il ne crée aucune nouvelle destination de navigation

### Requirement: Présentation des liens et de leur état actif

Le frontend SHALL appliquer aux liens verticaux existants la présentation `.nav` et `.nav-item` du prototype : icône 18 px, texte 14 px, gap 12 px, hauteur nominale 43 px, rayon 9 px et espacement entre items de 5 px. Il SHALL reproduire le survol et l'état actif avec fond gold-wash, bordure teintée, accent sur texte/icône et repère latéral lumineux. Il SHALL permettre l'agrandissement du texte sans couper les libellés. La rubrique Administration SHALL regrouper visuellement les liens Catégories de revenu et Rôles et utilisateurs, dans leur ordre relatif actuel, uniquement lorsqu'ils sont présents.

#### Scenario: Navigation vers une destination existante
- **WHEN** un utilisateur active un lien de sidebar puis consulte une sous-route couverte par ce lien
- **THEN** le lien garde sa destination et son comportement actuels et affiche l'état actif complet avec `aria-current="page"`
- **AND** le repère latéral est visible sans être coupé et le focus clavier reste perceptible

#### Scenario: Présentation selon le rôle actuel
- **WHEN** un Administrateur, Trésorier, Opérateur ou Membre consulte sa sidebar
- **THEN** les liens, leurs libellés et leurs autorisations restent ceux de `navigationItemsForRole`, conformément à la matrice métier §3
- **AND** les éléments graphiques n'ajoutent aucun lien du prototype et aucune rubrique Administration vide

### Requirement: Identité et actions existantes en pied

Le frontend SHALL reproduire la présentation `.profile*` du prototype avec avatar 36 px, nom 13 px et rôle applicatif 11 px à partir des seules données déjà disponibles dans `SessionService.user`. Le bloc SHALL être informatif, sans nouvelle page compte ni nouvelle requête API. Le pied SHALL conserver les actions thème et déconnexion existantes sous l'identité, avec leurs noms accessibles et leur fonctionnement actuels.

#### Scenario: Identité disponible ou en attente
- **WHEN** les données de session sont disponibles
- **THEN** le pied affiche les initiales dérivées du nom, le nom du membre et son rôle applicatif sans données fictives du prototype
- **AND** un nom long peut être tronqué visuellement tout en restant accessible en entier

#### Scenario: Données utilisateur pas encore chargées
- **WHEN** la session est authentifiée mais ses données utilisateur ne sont pas encore disponibles
- **THEN** le bloc conserve son emplacement sans afficher une identité fictive ni déclencher de requête supplémentaire
- **AND** les actions thème et déconnexion restent accessibles

#### Scenario: Hauteur réduite et accès clavier
- **WHEN** la hauteur disponible diminue ou le texte est agrandi à 200 % et l'utilisateur navigue au clavier
- **THEN** les liens et les actions du pied restent atteignables, avec défilement si nécessaire, sans recouvrement ni texte de lien tronqué
- **AND** le changement de thème et la déconnexion produisent les mêmes effets qu'avant la correction visuelle

### Requirement: Périmètre strictement limité à la sidebar

La correction SHALL se limiter à la présentation de la sidebar existante et aux données de présentation nécessaires. Elle SHALL préserver les routes, gardes, droits, logique de session, contrat API, jetons globaux, pages métier, topbar et navigation horizontale mobile, notamment la correction de déconnexion T-110. Elle SHALL conserver le seuil de visibilité existant sans créer de comportement tablette distinct.

#### Scenario: Absence de régression hors sidebar
- **WHEN** l'application est comparée avant/après à 820 px et à une largeur mobile de 375 px, dans les deux thèmes
- **THEN** la sidebar reste masquée et l'en-tête ainsi que la navigation mobile gardent leur rendu et leurs interactions actuels
- **AND** à 821 px la sidebar apparaît sans changement de destination ni recouvrement du contenu principal

#### Scenario: Session absente
- **WHEN** aucun utilisateur n'est authentifié
- **THEN** la sidebar reste absente et le rendu de connexion reste inchangé

