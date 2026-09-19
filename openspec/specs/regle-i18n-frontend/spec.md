# regle-i18n-frontend Specification

## Purpose
TBD - created by archiving change corriger-regle-i18n-transloco. Update Purpose after archive.
## Requirements
### Requirement: Règle i18n frontend alignée sur Transloco
La règle `.claude/rules/frontend/i18n.md` SHALL documenter que Transloco est
l'outil de traduction en place dans `contribo-front` (installé depuis T-3,
configuré dans `app.config.ts`), et non qu'aucun outil de traduction n'est
installé.

#### Scenario: Lecture de la règle avant une modification de vue
- **WHEN** un agent lit `.claude/rules/frontend/i18n.md` avant de modifier ou
  créer une vue dans `contribo-front/src/**`
- **THEN** la règle indique que Transloco est installé et configuré, et que
  les nouveaux libellés d'interface doivent passer par une clé Transloco
  résolue dans `contribo-front/src/assets/i18n/fr.json`

### Requirement: Réutilisation des clés existantes
La règle SHALL demander de vérifier si une clé équivalente existe déjà dans
`fr.json` avant d'en ajouter une nouvelle pour un libellé similaire.

#### Scenario: Ajout d'un libellé déjà présent ailleurs
- **WHEN** un agent ajoute un libellé d'interface identique ou très proche
  d'un libellé déjà présent dans `fr.json`
- **THEN** la règle demande de réutiliser la clé existante plutôt que d'en
  créer une nouvelle avec le même texte

### Requirement: Périmètre limité à fr.json
La règle SHALL préciser que seul `fr.json` est maintenu par les agents et
qu'aucune autre langue (notamment `en.json`) ne doit être créée ou anticipée.

#### Scenario: Tentative d'anticiper une deuxième langue
- **WHEN** un agent envisage de créer `en.json` ou un sélecteur de langue
- **THEN** la règle indique que seul `fr.json` est maintenu par les agents et
  que les autres langues sont hors périmètre, à la charge du mainteneur

