## Context

T-187 a ajouté une découverte du projet, une génération de plans QA, un format de run et un adaptateur guidé. Le point manquant est l'exécution par un agent IA : le modèle doit pouvoir lancer la campagne depuis Claude ou Codex, observer l'application locale dans un navigateur autorisé, choisir les actions correspondant au scénario, puis remettre des preuves et un rapport.

Le dépôt synchronise déjà les skills depuis `.claude/skills/` vers Codex et Copilot. Cette mécanique est le point d'entrée portable. Le runtime de l'agent ne doit pas dépendre d'une clé API ou d'un modèle hébergé dans le dépôt : Claude et Codex fournissent le modèle et les outils disponibles à la session. Les specs et changes terminés sous `openspec/` sont une source de vérité obligatoire pour le périmètre fonctionnel livré.

## Goals / Non-Goals

**Goals:**

- Fournir un skill partagé invocable avec `/qa-agent` dans Claude et `$qa-agent` dans Codex.
- Préparer une campagne avec le runtime T-187, puis exécuter les scénarios dans l'application locale au moyen des capacités navigateur de l'hôte.
- Décrire explicitement les capacités manquantes, les blocages et les actions non exécutées.
- Enregistrer des observations normalisées, les preuves expurgées, les anomalies et les tickets QA via les artefacts existants.
- Conserver un mode préparation lorsque l'hôte ne fournit pas de navigateur pilotable.
- Lire les specs fonctionnelles publiées dans `openspec/specs/` et les changes dont toutes les tâches sont terminées dans `openspec/changes/` avant de générer des scénarios ou des tickets QA.
- Retirer les chemins T-187 devenus redondants uniquement après vérification de couverture et migration des tests.

**Non-Goals:**

- Ajouter une fonctionnalité métier ou modifier le frontend et le backend pour faciliter les tests.
- Accéder à la production ou utiliser des données de production.
- Publier automatiquement une issue, une branche, une pull request ou une fusion.
- Exécuter sans confirmation une suppression, une clôture, un paiement, une contribution ou toute autre mutation irréversible.
- Dépendre d'un fournisseur de modèle unique ou imposer une nouvelle API distante.

## Decisions

### 1. Un skill partagé est le point d'entrée Claude et Codex

Le comportement sera décrit dans `.claude/skills/qa-agent/SKILL.md`, puis synchronisé vers `.codex/skills/qa-agent/` et les autres sorties gérées par le script de parité. Le skill expliquera le prérequis, la commande de préparation, la boucle d'observation et le format de restitution. Il n'utilisera ni injection ni substitution propre à Claude.

Alternative écartée : créer deux prompts indépendants. Ils dériveraient rapidement sur les règles de sécurité et les formats de rapport.

### 2. Le modèle orchestre, l'hôte fournit le navigateur

L'agent IA décidera de l'action suivante à partir du scénario et de l'état observé. Il utilisera uniquement une capacité navigateur déclarée par l'hôte, par exemple un navigateur connecté ou un adaptateur local autorisé. Le dépôt définira un contrat d'observation minimal : URL, titre, texte accessible, contrôles visibles, action demandée, résultat, capture ou log lorsque disponible.

Si aucune capacité navigateur n'est disponible, le skill ne simulera pas l'exécution. Il produira le plan et indiquera que la campagne est bloquée en mode préparation.

Alternative écartée : intégrer directement un navigateur spécifique au frontend. Cela ajouterait une dépendance de test à l'application et ne fonctionnerait pas de la même manière dans Claude et Codex.

### 3. Les features OpenSpec terminées sont prioritaires

La découverte lit les scénarios des specs publiées sous `openspec/specs/`, les associe à une feature, et ajoute les références des changes dont `tasks.md` est entièrement coché. Le code, les routes et OpenAPI complètent le périmètre réellement exposé, mais ne remplacent pas une exigence fonctionnelle terminée. Un ticket QA doit référencer la spec ou le change terminé qui justifie l'attendu ; une hypothèse issue du code est marquée à clarifier.

Alternative écartée : construire les tickets uniquement à partir des routes Angular. Cette approche manquerait les permissions, états métier et critères d'acceptation décrits dans les features livrées.

### 4. T-187 reste le moteur de traçabilité

La découverte, les identifiants stables, la redaction, la déduplication et les rapports de T-187 seront réutilisés. Le nouveau ticket ajoutera le protocole qui transforme la session IA en observations acceptées par `runQa`, ainsi que le lanceur et le skill. L'adaptateur `GuidedAdapter` sera supprimé si aucun appel utile ne subsiste après migration des tests ; sinon il restera comme mode de repli documenté.

### 5. La sécurité est appliquée avant et pendant chaque action

Le run exige `local`, `integration`, `staging` ou `recette`, une version et `safeForTestData=true`. Les actions sensibles sont détectées avant exécution. L'agent demande une confirmation explicite et garde une trace de la décision. Les preuves sont expurgées avant écriture. Les secrets présents dans le contexte ou les captures ne doivent jamais être recopiés dans les artefacts.

### 6. Le lancement reste une commande conversationnelle simple

L'utilisateur pourra écrire une instruction courte, par exemple `/qa-agent teste le smoke de l'environnement local`, ou `$qa-agent teste le smoke de l'environnement local`. Le skill demandera seulement les informations indispensables, lancera la préparation, exécutera les scénarios accessibles et fournira le chemin du run. Le script Node restera le moteur déterministe appelé par le skill, pas l'agent IA lui-même.

## Risks / Trade-offs

- [Risque] Claude ou Codex ne dispose pas d'un outil navigateur dans une session donnée. -> Mitigation : vérifier la capacité au préflight, ne rien compter comme exécuté et générer le plan avec un blocage explicite.
- [Risque] Le modèle interprète mal l'état de l'interface. -> Mitigation : limiter les actions au scénario, conserver l'état observé et marquer l'écart comme suspicion tant qu'il n'est pas reproductible.
- [Risque] Une preuve contient un secret ou une donnée personnelle. -> Mitigation : redaction déterministe avant persistance et refus des preuves non expurgées lorsque le type est inconnu.
- [Risque] Le socle guidé et le nouveau protocole se recouvrent. -> Mitigation : audit des appelants, migration des tests, puis suppression explicite dans T-188 uniquement si le mode de repli reste couvert.
- [Risque] Une action métier modifie les données locales. -> Mitigation : environnement jetable ou réinitialisable, confirmations obligatoires et profils smoke par défaut.

## Migration Plan

1. Auditer les appelants T-187 et réserver le contrat d'observation IA.
2. Ajouter le skill partagé et ses adaptations synchronisées.
3. Ajouter le préflight, le protocole d'observations et les fixtures sans navigateur réel.
4. Brancher une session navigateur disponible dans l'hôte, puis exécuter un smoke local non destructif.
5. Comparer les artefacts au run guidé T-187 et supprimer les chemins devenus inutiles si la couverture est équivalente.
6. En cas de retour arrière, conserver le mode préparation et les runs existants, désactiver l'exécution navigateur et restaurer le mode guidé si nécessaire.

## Open Questions

- Quelle capacité navigateur est disponible de façon stable dans les environnements Claude et Codex utilisés par l'équipe ?
- Quelle URL et quel mécanisme de démarrage du frontend local doivent être documentés comme prérequis standard ?
- Faut-il conserver le mode guidé comme fallback permanent ou le retirer après le premier smoke automatisé validé ?
