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

### Requirement: Alias stables pour les imports profonds

Le frontend MUST utiliser des alias TypeScript pour les imports qui traversent plusieurs racines stables, notamment `@assets/*` pour `src/assets/*` et `@mocks/*` pour `src/mocks/*` lorsque ces alias sont retenus par l'audit. Les alias existants `@core/*`, `@shared/*`, `@features/*` et `@api` MUST respecter les frontières d'architecture et ne MUST NOT masquer une dépendance directe entre features.

#### Scenario: Import global profond migré

- **WHEN** un module importe une ressource globale avec plusieurs remontées `../`
- **THEN** l'import utilise l'alias racine correspondant et résout de manière identique dans le build, les tests, le lint et les outils TypeScript

#### Scenario: Import local à une feature

- **WHEN** un module importe un voisin strictement local à la même feature
- **THEN** un chemin relatif peut être conservé si celui-ci rend la dépendance locale plus explicite

#### Scenario: Dépendance entre features

- **WHEN** un import ou un mock tente de relier directement deux features
- **THEN** l'alias ne contourne pas le contrôle d'architecture et la dépendance est refusée, déplacée vers une frontière neutre ou traitée par un ticket distinct

### Requirement: Validation progressive et livraison traçable

Chaque groupe significatif MUST être validé avant le groupe suivant et la livraison MUST rester rattachée à T-140, à sa branche dédiée et à une PR vers `main`.

#### Scenario: Groupe de faible risque

- **WHEN** un groupe de refactorisation interne est terminé
- **THEN** les tests pertinents, le lint, le formatage, le build et les contrôles OpenSpec ou tickets applicables sont exécutés avant de poursuivre

#### Scenario: Régression détectée

- **WHEN** une validation échoue ou qu'un écart visuel ou fonctionnel est constaté
- **THEN** le groupe concerné est isolé, corrigé ou reverti avant toute publication de la suite

### Requirement: Parcours à onglets et tableaux accessibles sur mobile

Les composants qui exposent plusieurs onglets MUST rendre tous les onglets
visibles et sélectionnables sur mobile sans dépendre d'un défilement horizontal
non signalé. La disposition mobile MUST être adaptée au nombre d'onglets et à
la longueur de leurs libellés mobiles : un usage peut fournir une version
mobile courte sans modifier le nom accessible complet. Trois libellés courts
tiennent sur une seule ligne en colonnes égales, tandis que les ensembles plus
longs ou plus nombreux utilisent une disposition de repli lisible. Les textes
mobiles doivent revenir à la ligne et casser les mots longs plutôt que dépasser
la largeur disponible. Les tablists locaux qui exposaient
le même parcours MUST réutiliser le composant partagé ou appliquer les mêmes
règles. Les tableaux des onglets de la
fiche membre MUST proposer une présentation en cartes sur les petites
largeurs, tandis que le tableau desktop et ses données restent inchangés. Les
actions mobiles de la fiche membre MUST rester entièrement visibles et
utilisables sans débordement.

#### Scenario: Trois onglets courts sur mobile

- **WHEN** un tablist contient trois onglets courts comme « Cotisations », « Règlements » et « Contributions » sur une largeur mobile
- **THEN** les onglets sont affichés sur une seule ligne en trois colonnes égales, sans défilement horizontal, chaque onglet reste focusable et les relations ARIA `tab`, `tablist` et `tabpanel` sont conservées

#### Scenario: Libellés longs ou nombreux sur mobile

- **WHEN** les libellés d'un tablist ne tiennent pas proprement en trois colonnes ou que le tablist contient plus de trois onglets
- **THEN** une disposition de repli lisible est utilisée sans masquer d'onglet, sans imposer un défilement horizontal et sans modifier l'ordre DOM ou l'indicateur actif

#### Scenario: Tableau d'un onglet de fiche membre sur mobile

- **WHEN** des cotisations, règlements ou contributions sont disponibles sur une petite largeur
- **THEN** chaque élément est présenté sous forme de carte avec ses valeurs métier, sans perte de montant, date, statut ou mode de règlement

#### Scenario: Pagination d'un onglet

- **WHEN** la réponse API contient plus d'une page avec une taille de page de 10
- **THEN** les contrôles de pagination sont affichés et permettent de naviguer entre les pages, sur desktop comme sur mobile
