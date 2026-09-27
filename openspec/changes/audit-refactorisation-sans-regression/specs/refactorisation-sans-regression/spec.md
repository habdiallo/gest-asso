## ADDED Requirements

### Requirement: Cartographie globale avant refactorisation

Le changement MUST produire une cartographie du frontend couvrant les points d'entrée, routes, layouts, features, composants, services, état, appels API, types, formulaires, permissions, styles, tests, scripts et configuration avant toute modification structurelle importante.

#### Scenario: Cartographie vérifiable

- **WHEN** la phase d'audit est terminée
- **THEN** chaque zone principale du codebase est reliée à sa responsabilité, ses consommateurs connus et ses validations disponibles

#### Scenario: Zone non comprise

- **WHEN** une zone ne peut pas être comprise de manière fiable, notamment à cause d'un chargement dynamique ou d'une configuration indirecte
- **THEN** elle est signalée comme risque et aucun code n'est supprimé ou déplacé sur la seule base d'une recherche incomplète

### Requirement: Refactorisation fondée sur des preuves

Chaque refactorisation MUST être liée à un problème démontré, à un bénéfice attendu, à une alternative considérée, à un risque identifié et à une validation reproductible.

#### Scenario: Duplication utile à consolider

- **WHEN** plusieurs implémentations réalisent le même traitement avec le même contrat
- **THEN** une consolidation est proposée uniquement si elle réduit réellement la complexité sans masquer les différences légitimes

#### Scenario: Similarité sans bénéfice net

- **WHEN** deux implémentations se ressemblent mais ont des responsabilités ou des évolutions distinctes
- **THEN** elles restent explicites et aucune abstraction commune n'est ajoutée

### Requirement: Conservation du comportement observable

Le résultat MUST conserver les fonctionnalités, parcours, règles métier, validations, permissions, navigation, appels API, gestion des erreurs, données affichées, états loading/empty/error, formats stockés et rendu visuel existants.

#### Scenario: Parcours nominal après refactorisation

- **WHEN** un utilisateur rejoue un parcours couvert avant la modification avec les mêmes entrées et autorisations
- **THEN** les mêmes données, transitions, navigations et résultats visibles sont produits

#### Scenario: Erreur ou permission après refactorisation

- **WHEN** une requête échoue ou qu'un utilisateur ne possède pas l'autorisation requise
- **THEN** le même état d'erreur, le même filtrage d'action et le même contrat API observable sont conservés

### Requirement: Suppression prudente du code mort

Un élément MUST NOT être supprimé comme code mort tant que ses imports statiques et dynamiques, routes, configurations, scripts, tests et consommateurs indirects pertinents n'ont pas été vérifiés.

#### Scenario: Code réellement inutilisé

- **WHEN** aucune référence pertinente n'est trouvée et que les points d'intégration indirects sont vérifiés
- **THEN** la suppression est documentée avec sa preuve et couverte par les validations concernées

#### Scenario: Référence indirecte possible

- **WHEN** une route, une convention de framework ou une configuration peut référencer l'élément sans import direct
- **THEN** l'élément est conservé ou une validation spécifique est ajoutée avant toute suppression

### Requirement: Validation progressive et livraison traçable

Chaque groupe significatif MUST être validé avant le groupe suivant et la livraison MUST rester rattachée à T-140, à sa branche dédiée et à une PR vers `main`.

#### Scenario: Groupe de faible risque

- **WHEN** un groupe de refactorisation interne est terminé
- **THEN** les tests pertinents, le lint, le formatage, le build et les contrôles OpenSpec ou tickets applicables sont exécutés avant de poursuivre

#### Scenario: Régression détectée

- **WHEN** une validation échoue ou qu'un écart visuel ou fonctionnel est constaté
- **THEN** le groupe concerné est isolé, corrigé ou reverti avant toute publication de la suite
