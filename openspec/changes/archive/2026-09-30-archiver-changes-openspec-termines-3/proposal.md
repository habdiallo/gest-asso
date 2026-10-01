## Why

Cinq changes OpenSpec ont toutes leurs tâches cochées et leurs tickets déjà
livrés par PR fusionnée sur `main` (aligner-espace-personnel T-137,
harmoniser-responsive-composants T-139, audit-refactorisation-sans-regression
T-140, gerer-pluriels-interface T-141, archiver-changes-openspec-termines-2
T-136). Ils restent pourtant dans `openspec/changes/` au lieu d'être archivés,
ce qui encombre la liste des changes actifs et ne synchronise pas leurs
spécifications delta vers `openspec/specs/`.

Le change `cadrer-backend-deploiement-reference` (T-142) a lui aussi toutes ses
tâches cochées, mais il est volontairement exclu : son archivage relève de la
clôture de son propre ticket.

## What Changes

- Synchroniser les specs delta des quatre changes qui en ont vers
  `openspec/specs/` (nouvelles capacités, et fusion de `desktop-sidebar-visual`
  avec sa spec principale existante).
- Archiver ces cinq changes avec `openspec archive <change> -y`, ce qui les
  déplace vers `openspec/changes/archive/AAAA-MM-JJ-<change>/`.
- Ne pas archiver les changes dont des tâches restent à cocher, ni
  `cadrer-backend-deploiement-reference`.
- Aucune modification de code applicatif : uniquement des artefacts OpenSpec.

## Capabilities

### New Capabilities
(aucune : opération d'archivage documentaire, pas de nouvelle capacité)

### Modified Capabilities
(aucune capacité applicative modifiée)

## Impact

- `openspec/changes/` : cinq changes déplacés vers `openspec/changes/archive/`.
- `openspec/specs/` : création/mise à jour des spécifications principales à
  partir des specs delta des changes archivés.
- `openspec/tickets.json` : enregistrement de T-153, `nextTicketId` porté à 154.
- Aucun impact sur le code applicatif, les tests ou la CI.
