# Contribo — prototype UX/UI

Prototype responsive de l’application de gestion associative, construit à partir de `DESIGN (5).md` et de `cahier-user-stories-mvp-association-v2.md`.

## Ouvrir le prototype

Le prototype ne nécessite aucune installation. Ouvrez `index.html` dans un navigateur moderne.

Pour le servir localement :

```bash
python3 -m http.server 4173
```

Puis ouvrez `http://localhost:4173`.

## Parcours inclus

- thèmes Obsidian Midnight et Alabaster Gallery ;
- vues Administrateur, Trésorier, Opérateur autorisé, Opérateur non autorisé et Membre ;
- tableaux de bord et navigations adaptés à chaque rôle ;
- membres, fiche membre et formulaire avec verrouillage des champs structurants pour l’Opérateur ;
- désactivation et réactivation d’un membre depuis sa fiche, réservées à l’Administrateur ;
- campagnes, montants par catégorie, situation des membres et paiements partiels ;
- cagnottes et contributions, visuellement séparées des cotisations ;
- utilisateurs, rôles, autorisation globale de l’Opérateur et catégories de revenu ;
- connexion, compte et espace personnel du Membre ;
- affichages desktop, tablette et mobile.
- formulaires ouverts dans des dialogues contextuels sur desktop et en plein écran sur mobile ;
- recherche et filtres actifs pour les membres, campagnes et cagnottes ;
- formatage automatique des montants GNF pendant la saisie.
- onglets sans changement de page pour les situations de campagne, fiches membre et détails de cagnotte ;
- navigation clavier entre les onglets avec les flèches gauche et droite.

Le sélecteur de rôle dans l’en-tête sert uniquement à prévisualiser les variantes du prototype.

## Workflow de contribution et OpenSpec

Chaque évolution suit **un ticket → une branche → une pull request vers `main`**,
sans push direct sur `main`, y compris pour le code généré.
Les branches suivent `<scope>/<type>-<ticket>-<description>`, par exemple
`front/feat-123-ajout-membre` (ticket fictif).
Pendant l'initialisation du projet, le marqueur `000` est autorisé à la place
du numéro réel, avec une branche et une PR dédiées à chaque évolution.

Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour les conventions, les hooks locaux,
le découpage OpenSpec et la protection GitHub à activer. Les agents lisent
[AGENTS.md](AGENTS.md) ; OpenSpec charge les règles depuis
[openspec/config.yaml](openspec/config.yaml).

Le registre [openspec/tickets.json](openspec/tickets.json) relie les 104 tickets
frontend (`T-1` à `T-104`) à leurs tâches et branches. Lire
[openspec/TICKETS.md](openspec/TICKETS.md) pour sélectionner un ticket lors de l'apply.
Les identités sont numérotées ; les branches gardent `000` pendant l'initialisation.

## Règles de développement frontend

L'application Angular se trouve dans `contribo-front/`. Ses conventions sont centralisées dans
`.claude/rules/frontend/` : Angular, TypeScript, templates, langue/formats, lint, client API,
tests et accessibilité. `contribo-front/.claude/CLAUDE.md` importe les huit fichiers pour les
sessions démarrées directement dans l'application.

Le frontend suit une architecture par fonctionnalités (`features/`, `core/`, `shared/`),
avec routage lazy, ESLint Angular/TypeScript, Prettier, Vitest et génération API explicite.
Voir [le README frontend](contribo-front/README.md) pour les commandes et configurations.
L'architecture hexagonale est réservée au backend. Le contrat partagé reste
`besoins/openapi.yaml` et le prototype reste `design/`.

## Skills et agents IA

Les skills OpenSpec et `code-review-senior`, ainsi que l'agent `code-reviewer`,
sont accessibles avec Claude, Codex et Copilot. Voir [AI-WORKFLOW.md](AI-WORKFLOW.md)
pour les commandes et la synchronisation. La revue senior produit un rapport
factuel adapté au projet, sans correction ni publication automatique.
