# Contribo — instructions frontend

@../../AGENTS.md
@../../CONTRIBUTING.md

Application Angular située dans `contribo-front/`. Exécuter les commandes npm depuis ce dossier.
Les chemins `besoins/`, `design/`, `openspec/` et `.claude/rules/` désignent la racine du dépôt parent.

Les règles frontend sont centralisées à la racine, avec un périmètre `paths` limité au frontend
et à ses configurations/contrats. Ces imports les rendent explicites également lorsque le travail
démarre dans `contribo-front/` ; ne pas maintenir de copies concurrentes.

@../../.claude/rules/frontend/angular.md
@../../.claude/rules/frontend/typescript.md
@../../.claude/rules/frontend/templates.md
@../../.claude/rules/frontend/i18n.md
@../../.claude/rules/frontend/eslint.md
@../../.claude/rules/frontend/api-client.md
@../../.claude/rules/frontend/tests.md
@../../.claude/rules/frontend/accessibilite.md
