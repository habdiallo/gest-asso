## MODIFIED Requirements

### Requirement: Taille et rayon des boutons d'action

Tout bouton d'action affiché dans `contribo-front/src/app/features/*` SHALL avoir
la hauteur minimale et le niveau de rayon définis par les conventions globales du
frontend, issus de l'audit T-138 et exposés par le thème Tailwind lorsque la
convention est récurrente. Le contrat conserve une cible accessible d'au moins
44px de hauteur et distingue le rayon d'un contrôle de celui d'une carte ou d'un
dialogue. Les exceptions SHALL être justifiées par le composant et non par une
copie locale du motif `.btn`.

#### Scenario: Bouton principal d'une liste

- **WHEN** un rôle authentifié autorisé affiche une page de liste comportant un
  bouton d'action principal
- **THEN** ce bouton utilise le composant ou la utility de contrôle commune, respecte
  au moins 44px de hauteur, son rayon de contrôle et ses états accessibles, sans
  utiliser le rayon d'une carte par convenance

#### Scenario: Boutons de pagination

- **WHEN** un tableau paginé affiche ses contrôles précédent et suivant
- **THEN** ces boutons utilisent le même niveau de contrôle que les autres actions
  comparables, conservent un nom accessible et restent utilisables aux largeurs
  intermédiaires

### Requirement: Rayon des conteneurs de tableau

Tout wrapper englobant un tableau de données (`<table>`) dans `contribo-front/src/app/features/*` SHALL utiliser le niveau de rayon de surface
de tableau défini par les conventions globales, exposé par un token Tailwind
réutilisable lorsqu'il est confirmé par l'audit. Le wrapper SHALL conserver son
défilement horizontal local lorsque les colonnes l'exigent.

#### Scenario: Tableau sans rayon défini

- **WHEN** un écran affiche un tableau dont le wrapper ne porte aujourd'hui aucune
  convention de rayon
- **THEN** le wrapper adopte le niveau de surface de tableau commun sans modifier
  les colonnes, les données, la pagination ou les états

#### Scenario: Tableau avec un rayon incorrect

- **WHEN** un écran affiche un wrapper avec un rayon de contrôle, de pastille ou
  une valeur locale non justifiée
- **THEN** le wrapper est migré vers le niveau de surface de tableau documenté,
  et le rayon local est conservé uniquement si l'audit démontre un besoin propre
  à sa composition

### Requirement: Taille et rayon des champs de saisie

Tout champ de saisie (`<input>` texte/date/nombre, `<textarea>`) de `contribo-front/src/app/features/*` SHALL utiliser la hauteur minimale et le niveau de rayon de contrôle des conventions
globales, avec une hauteur minimale accessible de 48px. Le champ SHALL conserver
son anneau de focus doré, sa validation, son label et ses messages d'erreur.

#### Scenario: Champ de saisie d'un formulaire

- **WHEN** un formulaire de création ou d'édition affiche un champ texte, date,
  nombre ou une zone de texte
- **THEN** le champ respecte au moins 48px de hauteur, utilise le rayon de contrôle
  commun, garde son focus visible et conserve la validation existante
