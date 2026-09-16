# Tickets locaux et branches

[tickets.json](tickets.json) est le registre actif : 104 tickets frontend,
affichés `T-1` à `T-104`. Leurs étapes portent ces repères dans
[le backlog](changes/frontend-tickets-mvp-association/tasks.md). Les numéros sont
globaux à tous les scopes ; le prochain numéro à l'adoption est `105`.

Le numéro de ticket et le numéro d'étape OpenSpec sont indépendants. Exemple :
T-3 correspond à l'étape `2.1` (écran de connexion).
Les numéros locaux ne désignent pas des issues GitHub.

## Consulter sans modifier

Depuis la racine du dépôt, avec Node.js 24 :

```bash
node scripts/tickets.mjs list
node scripts/tickets.mjs resolve T-3
node scripts/tickets.mjs resolve T-3 --json
node scripts/tickets.mjs check
```

Ces commandes ne créent aucune branche et ne modifient aucun fichier. Depuis
`contribo-front`, utiliser `node ../scripts/tickets.mjs ...`.
L'état d'exécution vient des cases OpenSpec, jamais de `planningStatus`.
`planned/cancelled` décrit uniquement la planification.

## Implémenter un ticket

| Outil | Exemple de sélection explicite |
| --- | --- |
| Codex | `$openspec-apply-change frontend-tickets-mvp-association, uniquement T-3` |
| Claude Code | `/opsx:apply frontend-tickets-mvp-association, uniquement T-3` |
| Copilot VS Code | `/opsx-apply frontend-tickets-mvp-association, uniquement T-3` |
| Copilot CLI | `/openspec-apply-change frontend-tickets-mvp-association, uniquement T-3` |

L'agent lit le ticket résolu, ses artefacts et prérequis, vérifie l'état Git,
préserve les modifications présentes et crée/réutilise la branche attendue.
Avant de générer du code, il exécute :

```bash
node scripts/tickets.mjs verify T-3
```

Le contrôle refuse une autre branche, un ticket annulé ou des prérequis locaux
non terminés. Il inspecte les dépendances transitives et les changes préalables.
Vérifier aussi les PR et la présence de leurs changements dans l'ascendance :
des cases cochées ne prouvent pas une fusion. Sans ticket déductible sans ambiguïté,
l'agent demande sa sélection. Il ne contourne pas les prérequis en implémentant
d'autres tickets, ne traite que les étapes de ce ticket et prépare sa PR vers `main`.

## Fin de la phase d'initialisation

`initializationActive: false` depuis le ticket T-106 : le mainteneur a déclaré
l'initialisation terminée. La résolution utilise désormais toujours
`branchAfterInitialization`, sans option CLI pour revenir en arrière :

| Ticket | Pendant initialisation (historique) | Résolu maintenant |
| --- | --- | --- |
| T-1 | `front/feat-000-jetons-design` | `front/feat-1-jetons-design` |
| T-3 | `front/feat-000-ecran-connexion` | `front/feat-3-ecran-connexion` |

`000` n'est plus accepté par les hooks, la CI ni le script de parité IA pour
une nouvelle branche. La traçabilité historique `000` reste conservée telle
quelle (branches et commits déjà fusionnés, trois étapes frontend
d'initialisation), sans réécriture rétroactive.

## Attribution et maintien des identités

Lors d'une nouvelle planification, utiliser `nextTicketId`, ajouter l'entrée
avec titre/périmètre, priorité, scope/type/slug, change/étapes, dépendances et
les deux noms exacts de branche, puis incrémenter le compteur. Ajouter les repères
`[T-<numero>]` aux étapes concernées. Conserver tous les identifiants existants,
indépendamment de l'ordre d'affichage. Pour une annulation, garder l'entrée avec
`planningStatus: cancelled`, conserver ses étapes historiques et ajuster les
dépendances des autres tickets. Les nouveaux détails techniques peuvent ajouter
des étapes au même ticket sans déplacer les anciennes vers un autre.

Le contrôle local compare les identités avec le registre committé dans `HEAD` ;
avant le premier commit du registre, il utilise l'attribution proposée committée.
En CI et avant livraison, comparer à une référence de base synchronisée :

```bash
git fetch origin
node scripts/tickets.mjs check --base-ref origin/main
node --test tests/tickets.test.mjs
```

Le contrôle refuse les suppressions, réattributions de scope/type/slug/change,
déplacements d'étapes existantes, compteurs réduits, étapes ouvertes non couvertes,
repères incohérents, branches en collision et dépendances absentes ou cycliques.
Les tâches archivées restent lisibles dans leur archive OpenSpec unique.
La CI compare à `origin/main` ; lors de la première adoption sans registre sur
`main`, elle utilise l'attribution proposée committée. Relire aussi le diff de
cette adoption : les contrôles de fichiers ne remplacent pas une revue.

Titres locaux : `feat(front): T-3 ajouter l'écran de connexion`.
Ne pas écrire `Closes #3` pour un ticket local. Référencer séparément une issue
GitHub réelle si elle existe. L'adoption historique du registre reste sous `000`
avec une branche et une PR propres. Aucun push direct sur `main`.
