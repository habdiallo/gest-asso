## Why

Le tiret cadratin (—) apparaît dans du contenu généré par les agents (code,
commentaires, docs, artefacts OpenSpec, messages de commit/PR) sans que ce
soit une consigne explicite du dépôt. Le mainteneur ne veut plus en voir dans
le projet : il faut une règle explicite, lue par les trois outils IA
(Claude, Codex, Copilot), qui l'interdise dans tout contenu qu'ils produisent.

## What Changes

- Ajouter dans `AGENTS.md` une règle interdisant le tiret cadratin (—, U+2014)
  dans tout contenu généré par un agent : code source, commentaires, docs,
  artefacts OpenSpec, messages de commit et de PR.
- Préciser les alternatives attendues (virgule, point, parenthèses, tiret
  simple `-` dans une énumération) pour guider la reformulation.
- Ne pas réécrire rétroactivement les fichiers existants qui en contiennent
  déjà (ex. titres `# ... — Contribo`) : la règle porte sur les nouvelles
  productions des agents, pas sur une purge du dépôt.
- Aucun contrôle outillé (lint/hook/CI) dans ce change : règle écrite
  uniquement, appliquée par les agents eux-mêmes.

## Capabilities

### New Capabilities
- `agent-generated-content-style` : règle de rédaction transversale appliquée
  par les agents IA (Claude, Codex, Copilot) à tout contenu qu'ils produisent
  dans ce dépôt (code, docs, artefacts OpenSpec, commits, PR).

### Modified Capabilities
(aucune)

## Impact

- `AGENTS.md` : ajout d'une règle de rédaction pour les trois outils IA.
- Aucun impact sur le code applicatif, les tests ou la CI.
- Limite connue : les fichiers déjà livrés avec un tiret cadratin (titres de
  règles existantes, ce même document une fois archivé, etc.) ne sont pas
  modifiés par ce change ; une éventuelle purge ferait l'objet d'un ticket
  séparé si le mainteneur le souhaite.
