## ADDED Requirements

### Requirement: Les dialogues mobiles respectent les zones sûres

Le composant partagé de dialogue SHALL laisser un espace visible entre le
bord de la fenêtre et l'en-tête du dialogue sur les petits écrans, y compris
lorsque le navigateur expose une zone sûre supérieure.

#### Scenario: Ouverture d'un formulaire long sur mobile

- **WHEN** un utilisateur ouvre un formulaire long sur un écran mobile
- **THEN** l'en-tête et son bouton de fermeture restent entièrement visibles
- **AND** le contenu du formulaire peut défiler sans déplacer le pied d'action

#### Scenario: Zone sûre système disponible

- **WHEN** la fenêtre fournit `safe-area-inset-top` ou
  `safe-area-inset-bottom`
- **THEN** le dialogue ajoute cette zone à son espacement sans créer de
  recouvrement avec les contrôles

#### Scenario: Fermeture et annulation

- **WHEN** le dialogue est affiché sur mobile
- **THEN** le bouton de fermeture possède un nom accessible et reste atteignable
- **AND** les actions Annuler et Enregistrer restent disponibles dans le pied
  du dialogue

### Requirement: Les groupes d'actions mobiles utilisent la largeur disponible

Un groupe `.form-dialog-actions` contenant deux actions SHALL présenter des
boutons de largeur égale sur mobile, avec une cible tactile d'au moins 44 px de
haut, tant que les libellés restent lisibles dans la largeur disponible.

#### Scenario: Deux actions sur une largeur mobile courante

- **WHEN** un formulaire affiche Annuler et Enregistrer sur un écran mobile
- **THEN** les deux boutons occupent chacun une colonne de même largeur
- **AND** le groupe utilise la largeur disponible avec un espacement constant
- **AND** l'ordre secondaire puis principal est conservé

#### Scenario: Largeur ou zoom très contraint

- **WHEN** la largeur disponible ne permet plus de présenter les deux libellés
  sans débordement
- **THEN** les actions sont empilées dans le même ordre
- **AND** chaque bouton reste entièrement visible et atteignable
