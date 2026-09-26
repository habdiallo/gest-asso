## ADDED Requirements

### Requirement: Fidélité typographique du tableau des règlements

Le tableau des règlements du détail de campagne SHALL reprendre la hiérarchie typographique et les styles textuels du design cible, sans modifier les données ou la structure métier affichées.

#### Scenario: Affichage nominal des règlements

- **WHEN** l'onglet « Règlements » contient des règlements
- **THEN** le titre de section utilise la typographie d'interface de niveau `h3`, la description utilise le texte secondaire, l'en-tête utilise `font-data` en majuscules avec la petite taille et l'interlettrage du prototype, et les cellules utilisent une taille de 13 px cohérente avec le design
- **AND** le nom du membre est plus contrasté que le mode et la date
- **AND** le montant utilise la police de données tabulaire et la couleur de succès

#### Scenario: Colonnes préservées

- **WHEN** le tableau est rendu
- **THEN** il expose exactement quatre colonnes dans l'ordre membre, montant, mode de règlement, date
- **AND** aucune colonne d'audit ou métadonnée supplémentaire n'est ajoutée

#### Scenario: États non nominaux préservés

- **WHEN** le chargement, l'erreur, l'absence de règlement ou la pagination est affiché
- **THEN** les états et actions existants restent fonctionnels et bénéficient des mêmes tokens textuels cohérents
- **AND** la correction visuelle ne modifie ni l'appel API ni les autorisations d'accès

### Requirement: Lisibilité responsive du tableau

Le tableau SHALL rester lisible sur desktop et petit écran en conservant le conteneur de défilement horizontal local déjà prévu, sans masquer, réordonner ou remplacer les colonnes.

#### Scenario: Largeur desktop de référence

- **WHEN** le détail de campagne est affiché sur une largeur desktop
- **THEN** l'en-tête, les lignes, les séparateurs et les espacements correspondent visuellement au prototype de référence

#### Scenario: Viewport étroit

- **WHEN** le détail de campagne est affiché sur un viewport inférieur à la largeur minimale du tableau
- **THEN** seul le conteneur du tableau peut défiler horizontalement
- **AND** les textes restent lisibles sans chevauchement ni changement de contenu
