# Agent QA Contribo

Cet outillage prépare et trace les campagnes QA de l'agent IA Contribo. Le skill partagé se lance depuis Claude avec `/qa-agent` ou depuis Codex avec `$qa-agent`. Le modèle observe l'application avec le navigateur disponible dans la session, puis remet les observations au moteur de rapports. Il ne modifie pas l'application, ne contacte pas la production et ne publie pas automatiquement de branche, d'issue ou de pull request.

## Utilisation

Depuis la racine du dépôt :

```bash
node scripts/qa-agent.mjs --environment integration --profile smoke --dry-run
node scripts/qa-agent.mjs --environment integration --profile full --version v0.1.0 --out qa/runs
node scripts/qa-agent.mjs --environment integration --profile targeted --target members,campaigns --observations observations.json
```

Pour une première campagne pilotée par l'IA dans l'environnement local, lancer Claude ou Codex depuis la racine du dépôt puis demander :

```text
Teste le smoke de l'environnement local avec le skill qa-agent.
```

L'agent prépare d'abord le plan, vérifie que le navigateur et l'application sont accessibles, exécute seulement les scénarios observés et finalise le run avec `scripts/qa-agent.mjs`. Sans capacité navigateur, il reste en mode préparation et le rapport indique zéro scénario exécuté.

Le profil `smoke` prépare les contrôles critiques, `full` reprend la couverture fonctionnelle disponible et `targeted` limite le plan aux features demandées et à leurs préconditions. Sans fichier d'observations, le run reste en mode préparation et aucun scénario n'est compté comme exécuté.

Les runs sont écrits dans `qa/runs/<runId>/` et contiennent un inventaire, un plan, les résultats, les anomalies, les tickets QA, un manifeste et une synthèse. Les tickets QA sont des artefacts de correction. Leur promotion dans le registre local et leur branche dédiée restent soumises au workflow du dépôt.

Les formats sont définis dans `qa/schemas/`, la politique de données dans `qa/policy.json` et les tests de comportement dans `tests/qa-agent.test.mjs`.

Le contrat d'observations est défini dans `qa/schemas/qa-observations.schema.json`. Le mode guidé de `qa/agent/adapters.mjs` reste disponible comme fallback tant que le skill IA et les capacités navigateur de l'hôte ne couvrent pas tous les parcours. Une action sensible reste non applicable tant que la confirmation attendue n'est pas fournie.
