## Context

Le change `frontend-tickets-mvp-association` contient 107 étapes, dont trois déjà réalisées par l'initialisation `000` et 104 encore ouvertes. Les conventions exigent un ticket réel mais ne définissent pas encore de tracker local. Une proposition de catalogue local est donc produite dans `tickets.json` ; aucun numéro d'issue GitHub n'est attribué ou supposé.

## Goals / Non-Goals

**Goals:** identifier chaque évolution ouverte par un ticket stable, retrouver ses étapes sans ambiguïté et déterminer sa branche avant l'implémentation, avec les mêmes règles dans les trois outils IA.

**Non-Goals:** implémenter le frontend, créer 104 issues GitHub, créer 104 branches immédiatement, modifier les numéros d'étapes ou déclarer l'initialisation terminée.

## Decisions

### 1. Catalogue local versionné

Le catalogue proposé attribue les numéros `1` à `104` dans l'ordre du backlog actuel. L'affichage humain est `T-1`, `T-2`, etc. Les numéros sont globaux au dépôt, sans compteur distinct front/back/docs. Après adoption, toute nouvelle évolution reçoit le prochain numéro disponible ; aucun numéro supprimé/annulé n'est réutilisé et aucun changement d'ordre ne renumérote les tickets.

Le fichier proposé devient `openspec/tickets.json` lors de l'apply. Chaque entrée contient numéro, titre/périmètre issu du backlog, priorité, scope/type, slug explicite, change et étapes couvertes, dépendances et statut de planification. Les cases OpenSpec restent la référence d'exécution ; le catalogue ne duplique pas leur avancement. Une priorité n'est pas un ordre d'exécution.

**Alternative :** numéros d'issues GitHub. Possible si retenue ultérieurement, mais demande une attribution réelle et une correspondance explicite ; une issue et une PR partagent le compteur GitHub. Ne pas transformer `T-1` en `#1` ni publier `Closes #1` pour un ticket local. Les liens GitHub sont facultatifs, distincts de l'identité locale.

### 2. Correspondance ticket / étapes

La granularité existante est conservée : un élément ouvert du backlog devient un ticket, et peut contenir plusieurs étapes techniques lors de son enrichissement. Les références `1.3`, `2.1` ou `US-*` ne deviennent pas le numéro du ticket. Ajouter un repère `[T-<numero>]` aux étapes concernées lors de l'apply, sans modifier leur numéro ni leur case.

Les trois étapes déjà réalisées (`1.1`, `1.2`, `1.4`) conservent leur traçabilité vers `initialisation-front-features`, `000` et la PR #1. Elles ne reçoivent pas de nouveaux tickets de travail.

### 3. Branches explicites et exception 000

Chaque ticket propose sa branche après initialisation et sa branche pendant initialisation, vérifiées depuis le même scope/type/slug :

```text
T-1, étape frontend 1.3 :
  pendant initialisation : front/feat-000-jetons-design
  après initialisation  : front/feat-1-jetons-design
```

Le numéro de ticket distingue les évolutions même pendant l'initialisation ; le slug distingue leurs branches `000`. L'apply sélectionne d'abord le ticket et son change, vérifie les dépendances et l'état Git, puis crée/réutilise uniquement cette branche. Une branche absente du catalogue, un ticket inconnu ou une branche déjà destinée à une autre évolution arrête la génération de code. Le backlog complet n'est jamais implémenté sur une branche unique.

Ne pas renommer les branches `000` tant que le mainteneur n'a pas déclaré la fin de l'initialisation. La migration prévue par CONTRIBUTING reste nécessaire pour les branches ouvertes ; les commits/PR historiques ne sont pas renumérotés.

### 4. Adoption dans les outils

Mettre à jour `CONTRIBUTING.md`, `AGENTS.md` et `openspec/config.yaml` pour accepter les tickets réels du catalogue local et exiger la sélection par `T-<numero>`. Les skills générés OpenSpec restent inchangés. Exemple après adoption : `$openspec-apply-change frontend-tickets-mvp-association, uniquement T-3`.

Un outil léger à implémenter lit le catalogue, contrôle unicité, couverture des étapes ouvertes, identité des dépendances, absence de cycles et cohérence des deux branches. La résolution seule est en lecture ; toute création de branche reste une action explicite de l'apply sur un dépôt vérifié.

## Risks / Trade-offs

- [104 tickets très fins] → préserver le grain demandé ; enrichir chaque ticket avant son apply et relier les dépendances nécessaires.
- [Catalogue issu d'un backlog évolutif] → fixer cette attribution lors de l'adoption ; valider sa couverture, puis ajouter les nouveaux tickets sans renuméroter les anciens.
- [Confusion GitHub/local] → afficher `T-<numero>`, utiliser cette référence dans les titres de commits/PR locaux, éviter les mentions GitHub `#<numero>` sans issue réelle.
- [Deux branches possibles pendant la transition] → phase d'initialisation explicite et contrôlée ; jamais déduite de la présence d'un numéro dans le catalogue.
- [Dépendances techniques à confirmer] → le catalogue donne des prérequis initiaux ; avant chaque apply, relire contrat/specs et ajouter les prérequis manquants dans une PR de planification.

## Migration Plan

Adopter le catalogue après intégration des PR #2, #1 puis #3. Appliquer ce workflow sur `infra/chore-000-registre-tickets-branches`, enrichir les annotations du backlog et valider le résolveur/règles. Publier par PR vers `main`. La présente proposition part de la branche de la PR #3 ; son diff propre ne contient que ce change.

Un retour arrière passe par une PR rétablissant les consignes précédentes, en préservant le catalogue historique et les liens de tickets déjà utilisés. L'initialisation reste active jusqu'à décision du mainteneur.

## Open Questions

Aucune question bloquante pour cette proposition locale. Le tracker GitHub peut être choisi en réponse à la préférence demandée ; il nécessiterait une révision explicite de l'attribution avant publication d'issues. La proposition ne modifie pas encore les règles d'exécution existantes : leur adoption fait partie de l'apply.
