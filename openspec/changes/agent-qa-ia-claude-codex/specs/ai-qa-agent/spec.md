## ADDED Requirements

### Requirement: Invocation depuis Claude et Codex

Le dépôt SHALL fournir un skill partagé nommé `qa-agent`, invocable depuis Claude avec `/qa-agent` et depuis Codex avec `$qa-agent`, avec des instructions équivalentes et synchronisées.

#### Scenario: Lancement smoke local depuis Claude

- **WHEN** l'utilisateur demande `/qa-agent teste le smoke de l'environnement local`
- **THEN** l'agent vérifie les prérequis, prépare la campagne smoke et exécute les scénarios accessibles avec les capacités de la session

#### Scenario: Lancement ciblé depuis Codex

- **WHEN** l'utilisateur demande `$qa-agent teste members,campaigns dans l'environnement local`
- **THEN** l'agent sélectionne le profil ciblé, conserve les préconditions nécessaires et rend le chemin du run

### Requirement: Préflight de campagne

L'agent SHALL vérifier l'environnement, la version observée, la sécurité des données, l'accessibilité de l'application et la disponibilité d'une capacité navigateur avant de compter un scénario comme exécuté.

#### Scenario: Application locale indisponible

- **WHEN** l'URL locale ne répond pas ou que l'application n'est pas accessible
- **THEN** l'agent arrête l'exécution, marque les scénarios dépendants comme bloqués et conserve le diagnostic dans le rapport

#### Scenario: Navigateur indisponible

- **WHEN** la session Claude ou Codex ne fournit aucune capacité navigateur autorisée
- **THEN** l'agent produit le plan en mode préparation et n'enregistre aucun scénario comme réussi, échoué ou exécuté

### Requirement: Features OpenSpec terminées comme source de vérité

L'agent SHALL lire les specs fonctionnelles publiées sous `openspec/specs/` et les changes sous `openspec/changes/` dont toutes les tâches sont terminées avant de sélectionner les scénarios et de créer un ticket QA. Chaque attendu issu d'une feature terminée SHALL conserver une référence vers son fichier et son scénario.

#### Scenario: Feature terminée publiée

- **WHEN** une spec sous `openspec/specs/` contient une exigence et un scénario terminé
- **THEN** l'agent ajoute ce scénario au périmètre QA avec sa feature, son attendu et sa référence OpenSpec

#### Scenario: Change non terminé

- **WHEN** un change sous `openspec/changes/` contient au moins une tâche non cochée
- **THEN** l'agent ne le traite pas comme une fonctionnalité livrée et ne crée pas de ticket QA fondé uniquement sur ce change

### Requirement: Exécution guidée par le scénario

Lorsque le navigateur est disponible, l'agent SHALL exécuter les étapes d'un scénario une par une, observer l'interface après chaque action et ne SHALL utiliser que les contrôles nécessaires au scénario courant.

#### Scenario: Parcours conforme

- **WHEN** toutes les étapes sont réalisables et que le résultat observé correspond à l'attendu
- **THEN** l'agent enregistre un résultat `Réussi` avec le scénario, l'environnement, l'acteur et les preuves disponibles

#### Scenario: Parcours non conforme

- **WHEN** le résultat observé diverge de l'attendu et que l'écart est reproductible
- **THEN** l'agent enregistre un résultat `Échoué`, qualifie l'anomalie et génère un ticket QA local dédupliqué

#### Scenario: Ticket fondé sur une feature livrée

- **WHEN** un écart reproductible concerne un scénario issu d'une spec OpenSpec terminée
- **THEN** le ticket QA reprend la référence de la feature et du scénario livrés afin que l'attendu soit traçable

### Requirement: Actions sensibles protégées

L'agent SHALL détecter les actions irréversibles ou financières avant de les exécuter et SHALL demander une confirmation explicite dans la session.

#### Scenario: Suppression sans confirmation

- **WHEN** une étape demande une suppression et qu'aucune confirmation explicite n'est disponible
- **THEN** l'agent n'exécute pas l'action et enregistre le scénario comme `Non applicable` ou `Bloqué` avec la raison

#### Scenario: Confirmation d'une action sensible

- **WHEN** l'utilisateur confirme explicitement une action sensible dans un environnement de test autorisé
- **THEN** l'agent exécute uniquement cette action, enregistre la confirmation et conserve la preuve expurgée

### Requirement: Artefacts et confidentialité

L'agent SHALL réutiliser le format `qa/runs/<runId>/`, expurger les secrets et données personnelles avant écriture, et relier chaque observation à un scénario et à une version.

#### Scenario: Run terminé

- **WHEN** la campagne est terminée ou interrompue
- **THEN** le run contient le plan, les résultats, les anomalies, les tickets QA, le manifeste et une synthèse indiquant les scénarios exécutés et non couverts

#### Scenario: Preuve sensible

- **WHEN** une observation ou une capture contient un token, un mot de passe, un cookie ou une donnée personnelle détectable
- **THEN** la valeur est expurgée avant la persistance et l'artefact ne conserve pas la valeur originale

### Requirement: Neutralité des changements applicatifs

L'agent SHALL observer l'application et produire des artefacts QA sans modifier le code applicatif, les contrats API ou les données de production.

#### Scenario: Campagne locale

- **WHEN** l'agent exécute un run sur l'environnement `local`
- **THEN** il peut écrire uniquement les artefacts QA autorisés et ne modifie pas les sources de l'application

#### Scenario: Demande de publication

- **WHEN** un scénario ou un résultat suggère de créer une issue, une branche ou une pull request
- **THEN** l'agent produit un ticket QA local et demande une action humaine séparée pour toute publication

### Requirement: Parité Claude Codex

Les instructions et règles de sécurité du skill SHALL rester identiques entre les copies Claude et Codex et SHALL être contrôlées par le script de synchronisation du dépôt.

#### Scenario: Contrôle de parité

- **WHEN** la synchronisation des capacités IA est exécutée
- **THEN** les copies du skill `qa-agent` sont identiques et le contrôle de parité réussit
