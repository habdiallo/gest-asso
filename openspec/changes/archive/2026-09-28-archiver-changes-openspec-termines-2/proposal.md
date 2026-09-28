## Why

Huit changes OpenSpec ont toutes leurs tâches cochées et leurs tickets déjà
livrés par PR fusionnée sur `main` (enregistrer-contributeurs-externes-cagnotte,
coherer-cycle-vie-campagne, aligner-typographie-tableau-reglements,
aligner-bareme-campagne-design, harmonisation-actions-navigation-sidebar,
historique-reglements-tableau-de-bord, historique-reglements-tableau-de-bord-t127,
frontend-tickets-mvp-association). Ils restent pourtant dans `openspec/changes/`
au lieu d'être archivés, ce qui encombre la liste des changes actifs et ne
synchronise pas leurs spécifications delta vers `openspec/specs/`.

`historique-reglements-tableau-de-bord-t127` est un cas particulier : ses
tâches sont toutes cochées, mais ses artefacts proposal/design/specs n'ont
jamais été rédigés (il fait doublon avec le change
historique-reglements-tableau-de-bord, déjà complet). Archivé quand même,
avec mention explicite de cette incomplétude.

Depuis l'ouverture de la PR #135 de ce ticket, un neuvième change a lui aussi
terminé toutes ses tâches : `harmonisation-boutons-tableaux-select` (T-126),
dont les deux dernières tâches (validations et ouverture de PR) ont été
cochées par la PR #141 fusionnée sur `main`. Il est archivé à son tour sous
ce même ticket T-136, avant la fusion de la PR #135, plutôt que d'ouvrir un
nouveau ticket pour un seul change supplémentaire.

## What Changes

- Archiver ces neuf changes avec `openspec archive <change> -y`, ce qui les
  déplace vers `openspec/changes/archive/AAAA-MM-JJ-<change>/` et synchronise
  leurs spécifications delta vers `openspec/specs/` quand elles existent.
- Ne pas archiver les changes dont des tâches restent à cocher
  (alignement-visuel-desktop-design, aligner-fiche-membre-design,
  harmoniser-details-campagnes-cagnottes, refonte-agencement-tableau-de-bord,
  cloturer-archivage-changes-openspec).
- Aucune modification de code applicatif : uniquement des artefacts OpenSpec.

## Capabilities

### New Capabilities
(aucune : opération d'archivage documentaire, pas de nouvelle capacité)

### Modified Capabilities
(aucune capacité applicative modifiée)

## Impact

- `openspec/changes/` : neuf changes déplacés vers `openspec/changes/archive/`.
- `openspec/specs/` : création/mise à jour des spécifications principales à
  partir des specs delta des changes archivés.
- Aucun impact sur le code applicatif, les tests ou la CI.
