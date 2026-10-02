## ADDED Requirements

### Requirement: Définir le périmètre d'un run QA

L'agent SHALL créer un run identifié par un `runId` unique, un profil `smoke`, `full` ou `targeted`, un environnement, une version de l'application et les sources consultées avant de préparer les scénarios.

#### Scenario: Run complet initialisé

- **WHEN** un run `full` est demandé avec un environnement de recette déclaré
- **THEN** l'agent enregistre le `runId`, le profil, la version observée, les sources et l'inventaire des features, routes, rôles et dépendances

#### Scenario: Environnement manquant

- **WHEN** aucun environnement ou aucune version de référence n'est fourni
- **THEN** l'agent refuse l'exécution métier, produit un blocage explicite et ne compte aucun scénario comme exécuté

#### Scenario: Profil ciblé

- **WHEN** un run `targeted` sélectionne une feature et ses dépendances
- **THEN** l'agent inclut la feature, les préconditions nécessaires et les interactions déclarées sans prétendre couvrir les autres fonctionnalités

### Requirement: Construire une couverture à partir des sources du projet

L'agent SHALL analyser le plan T-183, les specs OpenSpec, le cahier métier, le contrat OpenAPI et les features/routes présentes afin de construire une matrice traçable Feature, Scénario, Source et Dépendance.

#### Scenario: Feature exposée par le frontend

- **WHEN** une feature et une route applicative sont découvertes
- **THEN** elles apparaissent dans l'inventaire avec leur source, leurs parcours connus, les rôles concernés et les opérations API associées lorsqu'elles sont disponibles

#### Scenario: Sources contradictoires

- **WHEN** le cahier métier, le contrat API et le comportement documenté indiquent des attentes différentes
- **THEN** l'agent conserve les références en conflit, marque le comportement `à clarifier` et n'en déduit pas un bug confirmé

#### Scenario: Fonctionnalité non couverte

- **WHEN** une fonctionnalité présente ne possède aucun scénario applicable dans le plan
- **THEN** elle figure dans les zones non couvertes avec la raison et une action de couverture proposée

### Requirement: Générer des scénarios manuels exécutables

Pour chaque scénario, l'agent SHALL fournir un identifiant stable, la feature, le contexte, les préconditions, les données, les étapes, le résultat attendu, la priorité, le statut initial et les références aux exigences.

#### Scenario: Couverture nominale et négative

- **WHEN** une feature possède un parcours métier et des règles de permission documentées
- **THEN** le plan contient des scénarios happy path, limites, erreurs de saisie, validations métier, permissions positives et négatives, changements d'état et interactions pertinentes

#### Scenario: Précondition non satisfaisable

- **WHEN** une donnée ou une opération requise n'est pas disponible
- **THEN** le scénario reste dans le plan avec le statut `Bloqué` ou `Non applicable`, la dépendance et la cause, sans être supprimé

#### Scenario: Incohérence UI/UX fonctionnelle

- **WHEN** une incohérence d'interface empêche ou modifie une action métier
- **THEN** l'agent crée un scénario observable et la distingue d'un contrôle purement responsive ou visuel hors périmètre

### Requirement: Guider ou observer l'exécution manuelle

L'agent SHALL exécuter les étapes via un adaptateur autorisé ou les présenter à un testeur, puis SHALL enregistrer le résultat observé, les preuves disponibles, l'acteur, l'environnement et le statut `Réussi`, `Échoué`, `Bloqué` ou `Non applicable`.

#### Scenario: Validation guidée réussie

- **WHEN** le testeur confirme toutes les étapes et observe le comportement attendu
- **THEN** l'agent enregistre un résultat `Réussi` avec l'observation et les références de preuve

#### Scenario: Écart observé

- **WHEN** le comportement observé ne correspond pas au comportement attendu et que la source de l'attendu est établie
- **THEN** l'agent enregistre un résultat `Échoué` avec les étapes réellement suivies, l'observation et la preuve sans modifier l'attendu

#### Scenario: Action sensible

- **WHEN** une étape crée une mutation financière, supprime une donnée ou déclenche une action irréversible
- **THEN** l'agent demande une confirmation autorisée, conserve cette confirmation et marque l'étape non exécutée si elle n'est pas accordée

### Requirement: Qualifier les écarts sans spéculation

L'agent SHALL distinguer les bugs confirmés, erreurs techniques visibles, incohérences métier, problèmes de validation, permissions, régressions, incohérences UI/UX, suspicions et clarifications produit, avec une sévérité et une priorité documentées.

#### Scenario: Bug fonctionnel confirmé

- **WHEN** un scénario échoue avec un attendu tracé et un observé reproductible
- **THEN** l'écart est classé comme anomalie confirmée avec une sévérité parmi `Blocker`, `Critical`, `Major`, `Minor` ou `Trivial`

#### Scenario: Attendu ambigu

- **WHEN** l'observation semble incorrecte mais aucune règle fiable ne permet de trancher
- **THEN** l'agent crée un point de clarification ou une suspicion, sans créer un ticket de correction confirmé

#### Scenario: Blocage technique

- **WHEN** l'API, la route, le compte ou la donnée nécessaire empêche la vérification
- **THEN** l'agent classe le résultat `Bloqué`, identifie la dépendance et ne le compte ni comme réussite ni comme bug fonctionnel confirmé

### Requirement: Éviter les doublons d'anomalies

Avant de créer un ticket, l'agent SHALL comparer l'empreinte normalisée de l'anomalie aux anomalies du run et aux artefacts QA accessibles et SHALL conserver le lien vers toute correspondance.

#### Scenario: Doublon exact

- **WHEN** une anomalie possède la même feature, condition, attente et observation normalisées qu'une anomalie existante
- **THEN** aucun nouveau ticket n'est créé et le run ajoute une observation au ticket existant

#### Scenario: Doublon potentiel

- **WHEN** une anomalie partage une feature et une cause probable mais diffère sur une étape ou une observation
- **THEN** l'agent la marque `doublon potentiel`, présente la correspondance et attend une décision avant de fusionner ou créer

#### Scenario: Nouvelle anomalie

- **WHEN** une anomalie confirmée ne correspond à aucune empreinte existante
- **THEN** l'agent crée un identifiant d'anomalie stable et prépare un unique ticket de correction associé

### Requirement: Produire un ticket de correction exploitable

Chaque ticket QA confirmé SHALL contenir un titre, la feature ou le module, la description, les préconditions, les étapes de reproduction, le comportement observé, le comportement attendu, la sévérité, la priorité, l'impact utilisateur, les pistes techniques non spéculatives, les critères d'acceptation et les tests de non-régression.

#### Scenario: Ticket prêt pour développement

- **WHEN** une anomalie confirmée est unique et reproductible
- **THEN** le ticket contient toutes les informations nécessaires, le lien vers le scénario et le run, et aucun détail non observé n'est présenté comme un fait

#### Scenario: Ticket nécessitant une clarification

- **WHEN** l'anomalie ne peut pas être confirmée ou son attendu est ambigu
- **THEN** l'agent produit une fiche de clarification distincte d'un ticket `fix` et conserve le scénario en attente

#### Scenario: Promotion dans le workflow du dépôt

- **WHEN** un mainteneur valide le périmètre, le scope, le type et la priorité du ticket QA
- **THEN** le ticket peut être enregistré dans `openspec/tickets.json` avec sa branche dédiée, sans modifier `main` ou `develop` et sans embarquer un autre ticket

### Requirement: Conserver la traçabilité et les résultats d'un run

L'agent SHALL produire un plan, les résultats, les anomalies, les tickets et une synthèse reliés par des identifiants stables et SHALL conserver le manifeste des sources, de l'environnement et du profil exécuté.

#### Scenario: Rapport de synthèse complet

- **WHEN** un run se termine ou est interrompu
- **THEN** le rapport indique le périmètre, les features couvertes et non couvertes, les scénarios préparés et exécutés, les réussites, échecs, blocages, anomalies par sévérité, tickets, risques et investigations restantes

#### Scenario: Run interrompu

- **WHEN** l'environnement devient indisponible au milieu d'une campagne
- **THEN** le run est clôturé comme interrompu, les scénarios non exécutés restent distingués, et la reprise peut utiliser les identifiants déjà enregistrés

#### Scenario: Régression entre deux runs

- **WHEN** un scénario précédemment réussi échoue sur une version ultérieure
- **THEN** le rapport identifie la régression, conserve le lien vers le run de référence et ouvre ou rattache une anomalie selon la déduplication

### Requirement: Protéger les données et le périmètre d'action

L'agent SHALL appliquer une politique de données déclarée, expurger les secrets et données personnelles des preuves, refuser la production et ne SHALL effectuer aucune modification applicative ou publication sans autorisation explicite.

#### Scenario: Preuve contenant un secret

- **WHEN** une capture ou un log contient un jeton, un mot de passe ou une donnée sensible détectée
- **THEN** la preuve est expurgée ou rejetée avant écriture et le rapport signale la preuve non persistée

#### Scenario: Environnement de production

- **WHEN** l'environnement fourni est identifié comme production ou ne peut pas être vérifié
- **THEN** l'agent refuse les actions métier et produit un blocage de sécurité

#### Scenario: Publication non autorisée

- **WHEN** un run voudrait pousser une branche, ouvrir une PR ou publier une issue externe sans politique approuvée
- **THEN** l'agent conserve un ticket QA local et laisse l'étape de promotion à un opérateur autorisé
