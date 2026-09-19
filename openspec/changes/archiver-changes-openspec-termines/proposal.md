## Why

Dix changes OpenSpec ont toutes leurs tâches cochées et leurs tickets déjà
livrés par PR fusionnée sur `main` (ajouter-environment-angular,
corriger-demarrage-mock, corriger-filtre-evenement-cagnottes,
corriger-regle-i18n-transloco, fidelite-sidebar-desktop-design,
initialisation-front-features, interdire-tiret-cadratin-regles,
mocks-msw-client-api, numerotation-tickets-branches,
skills-agents-multi-outils). Ils restent pourtant dans `openspec/changes/`
au lieu d'être archivés, ce qui encombre la liste des changes actifs et ne
synchronise pas leurs spécifications delta vers `openspec/specs/`.

## What Changes

- Archiver ces dix changes avec `openspec archive <change> -y`, ce qui les
  déplace vers `openspec/changes/archive/AAAA-MM-JJ-<change>/` et synchronise
  leurs spécifications delta vers `openspec/specs/`.
- Ne pas archiver les changes dont des tâches restent à cocher
  (comptes-demo-connexion-session, corriger-libelle-deconnexion-200,
  finaliser-initialisation-000, frontend-tickets-mvp-association).
- Aucune modification de code applicatif : uniquement des artefacts OpenSpec.

## Capabilities

### New Capabilities
(aucune : opération d'archivage documentaire, pas de nouvelle capacité)

### Modified Capabilities
(aucune capacité applicative modifiée)

## Impact

- `openspec/changes/` : dix changes déplacés vers `openspec/changes/archive/`.
- `openspec/specs/` : création/mise à jour des spécifications principales à
  partir des specs delta des changes archivés.
- Aucun impact sur le code applicatif, les tests ou la CI.
