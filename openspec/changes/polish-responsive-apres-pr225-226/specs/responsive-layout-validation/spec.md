## ADDED Requirements

### Requirement: Composition du shell aux largeurs de référence

Le frontend SHALL conserver une composition lisible et utilisable à 320 px, 375 px, 820 px et en desktop. Le shell SHALL éviter tout débordement horizontal de la page et SHALL conserver l'accès aux actions principales.

#### Scenario: Mobile étroit à 320 px

- **WHEN** le shell est rendu dans une fenêtre de 320 px de large
- **THEN** l'en-tête, la navigation basse et le contenu principal restent contenus dans la fenêtre, sans défilement horizontal de la page ni action principale coupée

#### Scenario: Mobile courant à 375 px

- **WHEN** le shell est rendu dans une fenêtre de 375 px de large
- **THEN** les contrôles conservent une zone tactile utilisable, les libellés accessibles restent associés aux contrôles et le menu de profil reste entièrement atteignable

#### Scenario: Tablette à 820 px

- **WHEN** le shell est rendu dans une fenêtre de 820 px de large
- **THEN** les liens ou actions qui ne tiennent pas simultanément utilisent un défilement local ou un empilement maîtrisé, sans élargir la page entière

#### Scenario: Desktop

- **WHEN** le shell est rendu dans une fenêtre desktop d'au moins 1181 px
- **THEN** la barre latérale et le contenu principal conservent leur séparation, leur largeur de lecture et leurs interactions existantes

### Requirement: Préservation des interactions et de l'accessibilité

Les adaptations responsive SHALL conserver les routes, les droits, les labels accessibles, le focus visible et les zones tactiles existants. Elles SHALL être réalisables par revert sans migration ni changement de contrat API.

#### Scenario: Navigation par clavier

- **WHEN** un utilisateur parcourt le shell au clavier à une largeur de référence
- **THEN** chaque lien et bouton atteignable conserve un focus visible et son nom accessible

#### Scenario: Action principale dans un conteneur compact

- **WHEN** une action ou une barre d'actions ne tient pas sur une largeur mobile ou tablette
- **THEN** l'action principale reste visible ou accessible par le défilement local, sans être supprimée ni déplacée hors de la zone interactive

#### Scenario: Retour arrière

- **WHEN** la PR de polish est revertie
- **THEN** aucune migration, aucun endpoint et aucun état de session ne nécessite de traitement de remise en état
