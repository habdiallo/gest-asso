---
name: qa-agent
description: Agent IA de test QA Contribo. Utiliser pour lancer une campagne smoke, full ou ciblée dans un environnement autorisé, observer l'application avec le navigateur disponible et produire un run QA traçable.
license: MIT
compatibility: Requiert les outils de lecture, shell et navigateur disponibles dans l'hôte Claude ou Codex.
metadata:
  author: contribo
  version: "1.0"
---

# Agent QA IA Contribo

Ce skill est l'entrée commune Claude et Codex pour tester Contribo. Il utilise le modèle de la session pour décider des actions et les capacités navigateur de l'hôte pour observer l'application. Il ne prétend jamais avoir exécuté un scénario sans observation réelle.

## Invocation

- Claude : `/qa-agent teste le smoke de l'environnement local`
- Codex : `$qa-agent teste le smoke de l'environnement local`
- Campagne ciblée : demander explicitement les features, par exemple `members,campaigns`.
- Campagne complète : demander explicitement le profil `full`.

## Préflight obligatoire

1. Lire `AGENTS.md`, `CONTRIBUTING.md`, `qa/policy.json` et le change QA actif si la demande concerne une évolution du dispositif.
2. Lire les specs fonctionnelles publiées sous `openspec/specs/` et les changes sous `openspec/changes/` dont toutes les tâches sont cochées. Ce sont les features livrées à tester et la source de vérité des attendus.
3. Vérifier que l'environnement demandé est `local`, `integration`, `staging` ou `recette`. Refuser `production` et `prod`.
4. Vérifier que l'application locale est démarrée et identifier son URL dans la session. Ne pas inventer une URL, un compte, une version ou un rôle.
5. Vérifier que les données utilisées sont sûres pour les tests et que l'action demandée ne vise pas la production.
6. Vérifier la présence d'une capacité navigateur permettant de lire l'état visible, d'agir sur les contrôles et de recueillir une preuve. Si elle manque, lancer seulement le mode préparation et signaler le blocage.

## Cycle d'exécution

1. Préparer le plan sans observations :

   ```bash
   node scripts/qa-agent.mjs --environment local --profile smoke --dry-run --out qa/runs
   ```

   Adapter `smoke` en `full` ou `targeted` et ajouter `--target feature-a,feature-b` si demandé.

2. Lire le `test-plan.md` du run et sélectionner les scénarios réalisables. Respecter les préconditions, le rôle, l'ordre indiqué et les références OpenSpec des features livrées.
3. Pour chaque scénario, observer l'état initial, exécuter une seule étape à la fois dans le navigateur, puis observer le résultat. Conserver dans la trace uniquement les actions et résultats utiles au scénario.
4. Ne jamais déduire un succès d'une absence d'erreur. Un scénario est `Réussi` uniquement si l'attendu est visible ou vérifiable. Utiliser `Bloqué` si une précondition ou une route manque, et `Non applicable` si une confirmation est requise mais absente.
5. Construire un fichier d'observations JSON temporaire dans le dépôt avec un objet par `scenarioId`. Le format minimal est :

   ```json
   {
     "scenario-id": {
       "status": "Réussi",
       "observation": "Résultat visible dans l'interface.",
       "actor": "Administrateur",
       "actionTrace": [
         {"action": "Ouvrir /dashboard", "result": "Le tableau de bord est visible."}
       ]
     }
   }
   ```

   Pour un écart, utiliser `status: "Échoué"`, décrire l'attendu et l'observé, ajouter `reproducible: true` uniquement après reproduction, et joindre des preuves déjà expurgées.

6. Finaliser le run :

   ```bash
   node scripts/qa-agent.mjs --environment local --profile smoke --observations /chemin/vers/observations.json --out qa/runs
   ```

   Le profil et les features doivent être identiques à ceux du plan. Utiliser `--resume <runDir>` pour reprendre un run interrompu.
7. Lire `summary.md`, `anomalies.md` et les tickets créés. Répondre avec le `runId`, les scénarios exécutés, bloqués et non couverts, les anomalies, les références OpenSpec utilisées et les limites.

## Sécurité

- Demander une confirmation explicite avant toute suppression, désactivation, clôture, paiement, contribution ou mutation irréversible.
- Sans confirmation, ne pas cliquer et enregistrer l'étape comme `Non applicable` ou `Bloqué`.
- Ne jamais copier de mot de passe, token, cookie, email, téléphone ou donnée personnelle dans une observation ou une preuve.
- Le run produit des tickets QA locaux. La création d'une issue, d'une branche, d'une PR ou d'un commit nécessite une demande séparée de l'utilisateur.
- Ne pas modifier le code de l'application pendant la campagne.

## Limites honnêtes

Si l'hôte n'expose pas de navigateur, le skill peut découvrir les scénarios et générer un plan, mais il doit indiquer que zéro scénario a été exécuté. Si l'application ou un rôle n'est pas disponible, conserver le blocage dans le rapport au lieu de simuler le parcours.
