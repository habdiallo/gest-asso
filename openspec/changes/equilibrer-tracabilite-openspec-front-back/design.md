## Context

Auditer la couverture des specs front et back et corriger les écarts. Le ticket est isolé pour permettre un worktree et une PR dédiés.

## Goals / Non-Goals

**Goals:**

- Traiter le problème identifié et laisser une documentation vérifiable.
- Préserver les frontières d architecture et les contrats hors périmètre.

**Non-Goals:**

- Ne pas mélanger les autres problèmes de l audit dans cette branche.
- Ne pas modifier main ou develop directement.

## Decisions

- `openspec/tickets.json` est la source de vérité pour l'identité, le scope, le
  type, la branche, les dépendances et la liste d'étapes d'un ticket.
- Chaque change planifié conserve le même socle d'artefacts, `proposal.md`,
  `design.md`, une ou plusieurs specs et `tasks.md`, quel que soit le scope
  frontend ou backend. Une sortie générée ne remplace pas ces sources.
- La matrice de traçabilité sépare l'existence des artefacts, l'avancement local
  des cases, la présence réelle de la branche et l'état de la PR. Une case cochée
  ne permet pas de conclure qu'une PR a été fusionnée.
- Les validations minimales sont `node scripts/tickets.mjs check`, la résolution
  et le précontrôle des tickets concernés, puis `openspec status` pour chaque
  change. Les limites ou états non vérifiables sont écrits comme tels.

Les changements dépendants attendent les tickets T-167, T-172, T-174, T-175 et
T-177. T-178 ne modifie aucun code généré ni comportement applicatif.

## Risks / Trade-offs

- Une migration peut exposer des dépendances implicites. Les tests, la documentation et une procédure de retour arrière doivent les rendre visibles.

## Migration Plan

Mettre à jour la documentation et la matrice sur la branche T-178, exécuter les
contrôles du registre et des changes, puis préparer une PR vers `develop`. Le
retour arrière consiste à retirer les ajouts documentaires, sans migration de
données ni impact runtime.

## Open Questions

- Les états de PR distantes restent à confirmer dans le fournisseur Git lors de
  chaque revue ; ils ne sont pas déduits des seules cases OpenSpec.
