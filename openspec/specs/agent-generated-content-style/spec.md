# agent-generated-content-style Specification

## Purpose
TBD - created by archiving change interdire-tiret-cadratin-regles. Update Purpose after archive.
## Requirements
### Requirement: Absence de tiret cadratin dans le contenu produit par un agent
Un agent IA (Claude, Codex, Copilot) SHALL ne jamais insérer de tiret
cadratin (—, U+2014) dans le contenu qu'il génère ou modifie dans ce dépôt :
code source, commentaires, documentation, artefacts OpenSpec, messages de
commit et de pull request. L'agent MUST reformuler avec une virgule, un
point, des parenthèses ou un tiret simple (`-`) dans une énumération.

#### Scenario: Rédaction d'un message de commit
- **WHEN** un agent rédige un message de commit ou une description de PR
- **THEN** le texte ne contient aucun caractère — (U+2014)

#### Scenario: Génération de code ou de documentation
- **WHEN** un agent écrit ou modifie un fichier de code, un commentaire ou
  un document Markdown du dépôt (y compris un artefact OpenSpec)
- **THEN** le contenu ajouté ne contient aucun caractère — (U+2014)

### Requirement: Fichiers existants non réécrits rétroactivement
La règle d'absence de tiret cadratin SHALL s'appliquer uniquement au contenu
nouvellement produit par un agent. Un agent SHALL NOT modifier un fichier
existant dans le seul but d'y retirer un tiret cadratin déjà présent, sauf
demande explicite du mainteneur portant sur ce fichier.

#### Scenario: Fichier existant contenant déjà un tiret cadratin
- **WHEN** un agent lit ou référence un fichier existant qui contient déjà
  un tiret cadratin (par exemple un titre de règle antérieur)
- **THEN** l'agent ne modifie pas ce fichier pour ce seul motif

