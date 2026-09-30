## Why

Dix changes OpenSpec ont leur livraison terminée mais restent dans
`openspec/changes/` au lieu d'être archivés, ce qui encombre la liste des
changes actifs et laisse leurs spécifications delta non synchronisées vers
`openspec/specs/` :

- `cadrer-backend-deploiement-reference` (T-142, PR #148 fusionnée) ;
- `implementer-backend-deploiement-mvp` (T-143 à T-152, PR #149 à #155
  fusionnées) ;
- `archiver-changes-openspec-termines-3` (T-153, PR #156 fusionnée) ;
- `durcissement-securite-production` (T-154, PR #162 fusionnée sur `main` via
  la release v0.1.0) ;
- `auth-rsa-portainer` (T-155, PR #160 fusionnée) ;
- `activer-flux-release` (T-156, PR #164 fusionnée sur `main`) ;
- `promouvoir-images-release` (T-157, PR #165 fusionnée) ;
- `cycle-vie-comptes-utilisateurs` (T-158, PR #167 fusionnée) ;
- `aligner-backend-api-v1` (T-159, PR #168 fusionnée ; 13/20 tâches cochées,
  les 7 restantes documentent volontairement l'annulation de T-160 et ne
  correspondent pas à un travail restant, voir son `design.md`) ;
- `cloturer-archivage-changes-openspec` (T-116, ancien ticket dont le travail
  d'archivage réel est déjà présent dans `openspec/changes/archive/` ; seule
  sa propre tâche de publication restait non cochée).

`durcissement-securite-production` et `activer-flux-release` sont fusionnés
sur `main` (via la branche `release/v0.1.0`) mais pas encore réintégrés sur
`develop` au moment de ce ticket ; ceci est un écart de processus distinct,
signalé mais non corrigé ici, qui n'empêche pas l'archivage de leurs
artefacts de planification.

## What Changes

- Cocher la dernière tâche de `cloturer-archivage-changes-openspec` (2.2),
  reflétant que son travail réel est déjà livré.
- Archiver les dix changes avec `openspec archive <change> -y`, ce qui les
  déplace vers `openspec/changes/archive/AAAA-MM-JJ-<change>/` et synchronise
  leurs specs delta vers `openspec/specs/`.
- Aucune modification de code applicatif : uniquement des artefacts OpenSpec.

## Capabilities

### New Capabilities
(aucune : opération d'archivage documentaire, pas de nouvelle capacité)

### Modified Capabilities
(aucune capacité applicative modifiée directement par ce ticket ; les specs
principales sous `openspec/specs/` sont mises à jour par la synchronisation
automatique de `openspec archive`, à partir des specs delta des changes
archivés)

## Impact

- `openspec/changes/` : dix changes déplacés vers `openspec/changes/archive/`.
- `openspec/specs/` : création/mise à jour des spécifications principales à
  partir des specs delta des changes archivés.
- `openspec/tickets.json` : enregistrement de T-161, `nextTicketId` porté à
  162.
- Aucun impact sur le code applicatif, les tests ou la CI.
