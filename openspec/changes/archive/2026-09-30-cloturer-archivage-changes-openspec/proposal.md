## Why

Après l'archivage du premier lot (T-115), trois autres changes OpenSpec sont
en réalité terminés : leur seule tâche restante était « fusionner la PR sur
demande explicite », et ces PR sont maintenant fusionnées sur `main`
(comptes-demo-connexion-session : PR #22 ; corriger-libelle-deconnexion-200 :
PR #47 ; finaliser-initialisation-000 : PR #9). De plus, le change du lot
précédent (archiver-changes-openspec-termines, T-115) est lui-même terminé
depuis la fusion de sa PR #103.

Archiver un change nécessite un ticket, et ce ticket a lui-même un change qui
finira par être terminé et à archiver à son tour. Pour ne pas laisser
s'accumuler plusieurs changes d'archivage en attente, ce ticket clôt en une
seule fois le change d'archivage précédent (T-115) en plus des trois changes
métier désormais terminés. Le change de CE ticket restera, à son tour,
« en attente d'archivage » jusqu'au prochain lot : c'est un motif borné
(un seul change d'archivage en attente à la fois), pas un cycle qui
s'accumule.

## What Changes

- Cocher la dernière tâche de comptes-demo-connexion-session,
  corriger-libelle-deconnexion-200 et finaliser-initialisation-000,
  reflétant la fusion déjà effectuée de leurs PR respectives.
- Archiver avec `openspec archive <change> -y` : comptes-demo-connexion-session,
  corriger-libelle-deconnexion-200, finaliser-initialisation-000, et
  archiver-changes-openspec-termines (change du ticket T-115, terminé).
- Aucune modification de code applicatif : uniquement des artefacts OpenSpec.

## Capabilities

### New Capabilities
(aucune : opération d'archivage documentaire, pas de nouvelle capacité)

### Modified Capabilities
(aucune capacité applicative modifiée)

## Impact

- `openspec/changes/` : quatre changes déplacés vers `openspec/changes/archive/`.
- `openspec/specs/` : mise à jour des spécifications principales à partir des
  specs delta des changes archivés, le cas échéant.
- Aucun impact sur le code applicatif, les tests ou la CI.
