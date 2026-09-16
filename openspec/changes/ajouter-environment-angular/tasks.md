## 1. Ticket T-108 — Socle `src/environments/` (front, feat)

Ticket : T-108. Scope `front`, type `feat`. Branche pendant l'initialisation
(historique, `initializationActive: true`) : `front/feat-000-environnements-angular`. Branche
réelle (`initializationActive: false`) : `front/feat-108-environnements-angular`. Dépendances :
aucune. Pour conserver la PR 23, sa branche distante garde exceptionnellement le nom
`front/feat-107-environnements-angular` après correction de la collision avec T-107
(comptes de démonstration, PR 22). La branche locale et le registre utilisent T-108.
Périmètre : voir `specs/environnements-angular/spec.md`. Critères d'acceptation : les
trois fichiers `environments/` existent et respectent l'interface `Environment` ; `angular.json`
déclare un `fileReplacements` par configuration (`development`, `mock`, `production`) ; les trois
builds Angular correspondants réussissent.

- [x] 1.1 [T-108] Vérifier `git status --short` / `git branch --show-current`, résoudre le ticket
      (`node scripts/tickets.mjs resolve T-108 --json`) et créer/réutiliser la branche
      `front/feat-108-environnements-angular` à partir de `origin/main`, puis exécuter
      `node scripts/tickets.mjs verify T-108`.
- [x] 1.2 [T-108] Créer `contribo-front/src/environments/environment.ts` (interface
      `Environment`, valeurs `development` : `production: false`, `apiBaseUrl` cohérent avec
      `proxy.conf.json`).
- [x] 1.3 [T-108] Créer `contribo-front/src/environments/environment.mock.ts` et
      `environment.production.ts`, chacun implémentant `Environment`.

## 2. Ticket T-108 — Câblage Angular

- [x] 2.1 [T-108] Ajouter les `fileReplacements` correspondants dans
      `contribo-front/angular.json` pour les configurations `development`, `mock` et
      `production` de la cible `architect.build`.
- [x] 2.2 [T-108] Vérifier `ng build --configuration production`, `ng build --configuration mock`
      et `ng build` (development, par défaut) dans `contribo-front/` ; consigner les résultats
      réels des trois builds.

## 3. Ticket T-108 — Documentation et livraison

- [x] 3.1 [T-108] Documenter le dossier `src/environments/` dans `contribo-front/README.md`
      (paramètres exposés, configuration Angular associée à chaque fichier, absence de secrets,
      non-régression sur `main.mock.ts`).
- [x] 3.2 [T-108] Committer les fichiers du ticket, pousser
      `front/feat-108-environnements-angular` et ouvrir une PR (brouillon si incomplète) vers
      `main` avec le modèle `.github/pull_request_template.md`, en listant les validations
      exécutées ; ne pas fusionner ni activer l'auto-merge sans demande explicite.
