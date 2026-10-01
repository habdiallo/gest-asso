# Agent QA Contribo

Cet outillage prépare et trace des campagnes QA manuelles à partir des sources du dépôt. Il ne modifie pas l'application, ne contacte pas la production et ne publie pas automatiquement de branche, d'issue ou de pull request.

## Utilisation

Depuis la racine du dépôt :

```bash
node scripts/qa-agent.mjs --environment integration --profile smoke --dry-run
node scripts/qa-agent.mjs --environment integration --profile full --version v0.1.0 --out qa/runs
node scripts/qa-agent.mjs --environment integration --profile targeted --target members,campaigns --observations observations.json
```

Le profil `smoke` prépare les contrôles critiques, `full` reprend la couverture fonctionnelle disponible et `targeted` limite le plan aux features demandées et à leurs préconditions. Sans fichier d'observations, le run reste en mode préparation et aucun scénario n'est compté comme exécuté.

Les runs sont écrits dans `qa/runs/<runId>/` et contiennent un inventaire, un plan, les résultats, les anomalies, les tickets QA, un manifeste et une synthèse. Les tickets QA sont des artefacts de correction. Leur promotion dans le registre local et leur branche dédiée restent soumises au workflow du dépôt.

Les formats sont définis dans `qa/schemas/`, la politique de données dans `qa/policy.json` et les tests de comportement dans `tests/qa-agent.test.mjs`.

Le module `qa/agent/adapters.mjs` expose un adaptateur guidé par défaut et un contrat de navigateur optionnel. Une action sensible reste non applicable tant que la confirmation attendue n'est pas fournie.
