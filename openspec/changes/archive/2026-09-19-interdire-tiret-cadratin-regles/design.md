## Context

`AGENTS.md` est le point d'entrée commun lu par Claude, Codex et Copilot
(voir `AI-WORKFLOW.md`). C'est l'emplacement le plus adapté pour une règle
de rédaction transversale, plutôt qu'une règle spécifique frontend
(`.claude/rules/frontend/`) qui ne serait lue que par un sous-ensemble des
agents ou des contextes.

## Goals / Non-Goals

**Goals :**
- Interdire explicitement le tiret cadratin (—) dans tout contenu produit
  par un agent dans ce dépôt, quel que soit l'outil IA utilisé.
- Donner des alternatives de reformulation simples.

**Non-Goals :**
- Ne pas mettre en place de contrôle automatisé (lint, hook, CI) dans ce
  change : la règle est appliquée par les agents eux-mêmes, pas outillée.
- Ne pas purger les fichiers existants contenant déjà un tiret cadratin.

## Decisions

- **Emplacement de la règle : `AGENTS.md`.** Alternative envisagée : ajouter
  la règle dans `.claude/rules/frontend/` (rejetée, car limitée au frontend
  et à Claude alors que la demande vise tout le dépôt et les trois outils).
- **Pas de capacité applicative :** la capacité OpenSpec
  `agent-generated-content-style` documente une règle de rédaction, pas un
  comportement produit ; elle sert uniquement de contrat de traçabilité
  pour ce change.
- **Pas d'application outillée :** conforme au choix du mainteneur de ne
  pas ajouter de contrôle automatisé dans ce change.

## Risks / Trade-offs

- [Risque] La règle écrite seule dépend de la vigilance de chaque agent et
  peut être oubliée sur une longue session. → Mitigation : la règle reste
  courte et placée dans un fichier déjà lu au démarrage de toute évolution
  (`AGENTS.md`).
- [Risque] Incohérence visible entre les nouveaux contenus (sans tiret
  cadratin) et les fichiers existants qui en contiennent déjà. → Mitigation :
  assumé explicitement en Non-Goals ; une purge reste possible via un ticket
  ultérieur si demandée.
