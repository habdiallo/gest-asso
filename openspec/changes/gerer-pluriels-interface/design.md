## Context

Le frontend Angular utilise déjà Transloco avec une seule langue active, `fr`, et centralise ses libellés dans `contribo-front/src/assets/i18n/fr.json`. Plusieurs clés reçoivent un paramètre numérique mais écrivent encore la flexion sous la forme `(s)`, notamment les compteurs de campagnes, cagnottes, membres, contributeurs et règlements.

Le besoin est transversal aux features qui affichent ces compteurs, mais il ne justifie ni une nouvelle couche frontend, ni une modification du contrat API. Les valeurs restent des nombres issus des données existantes ; seule leur présentation textuelle évolue.

## Goals / Non-Goals

**Goals:**

- Rendre les phrases françaises naturelles pour zéro, un et plusieurs éléments.
- Déclarer les règles de pluralisation dans les traductions, au plus près du contenu linguistique.
- Conserver les clés Transloco et les paramètres métier lorsque leur réutilisation est possible.
- Vérifier tous les libellés actuellement identifiés et empêcher la régression des marqueurs `(s)`.
- Garder les composants et templates indépendants de la règle grammaticale.

**Non-Goals:**

- Ajouter une deuxième langue, un sélecteur de langue ou une stratégie de traduction complète.
- Modifier les modèles API, les agrégats, les règles métier ou les autorisations.
- Réécrire les contenus saisis par les associations.
- Introduire un pipe métier générique qui fabriquerait des mots en dehors des traductions.
- Corriger dans ce ticket les formulations qui ne dépendent pas d'un nombre.

## Decisions

### Utiliser le plugin MessageFormat de Transloco

Le frontend ajoutera le plugin `@jsverse/transloco-messageformat`, aligné sur la version majeure de `@jsverse/transloco`, puis enregistrera `provideTranslocoMessageformat({ locales: 'fr' })` dans `app.config.ts`. Les traductions pourront utiliser une forme ICU telle que `{count, plural, one {# membre} other {# membres}}`.

Cette décision permet de garder la sélection singulier/pluriel dans `fr.json`, de profiter des règles de pluralisation de la locale française et d'éviter une condition dispersée dans chaque feature. Le numéro exact de la dépendance sera résolu pendant l'implémentation selon les peer dependencies réellement installées, puis verrouillé dans `package-lock.json`.

Toutes les interpolations dynamiques de `fr.json` utilisent également la syntaxe ICU `{param}`. Cette migration évite que le transpileur Transloco traite une valeur utilisateur contenant des accolades comme une nouvelle expression ICU.

Alternative écartée : choisir une clé `singular` ou `plural` dans chaque template avec un ternaire. Cette approche fonctionnerait sans dépendance mais dupliquerait la logique linguistique, multiplierait les clés et deviendrait fragile avec les phrases composées comme « actif sur enregistré ».

### Garder les clés de libellés et passer des nombres explicites

Les templates continueront à utiliser le pipe Transloco avec les paramètres numériques déjà disponibles. Les clés contenant un `(s)` seront transformées en messages pluralisables, sans calcul dans le template et sans conversion des nombres en chaînes.

Pour une phrase comportant plusieurs compteurs, chaque segment aura sa propre sélection grammaticale. Par exemple, le résumé des membres conservera `active` et `total` comme deux paramètres numériques et pluralisera séparément « membre actif » et « membre enregistré ».

Alternative écartée : pré-calculer une phrase dans chaque composant. Cela rendrait le texte non réutilisable, mélangerait présentation et logique de langue et compliquerait les tests de traductions.

### Traiter zéro comme un cas testé de la locale française

Le rendu de zéro sera défini et testé explicitement pour chaque famille de libellés. La locale `fr` est fournie explicitement au plugin afin que les catégories de pluralisation françaises soient utilisées, avec le rendu singulier prévu pour zéro dans ces messages. Aucune règle locale n'est codée dans les composants.

### Limiter le périmètre aux libellés réellement concernés

L'implémentation commencera par un inventaire de `fr.json` et des usages des clés. Les clés déjà correctes, les noms de sections et les contenus métier sans compteur resteront inchangés. Les tests seront mis à jour uniquement pour refléter les textes attendus, sans modifier des comportements fonctionnels sans rapport.

## Risks / Trade-offs

- [Dépendance supplémentaire] Le plugin et sa version doivent être compatibles avec Angular 21 et Transloco 8. -> Vérifier les peer dependencies, installer la version alignée et exécuter l'installation, les tests et le build avant livraison.
- [Syntaxe de traduction invalide] Une erreur ICU peut être détectée tardivement au chargement d'une vue. -> Ajouter des tests de rendu couvrant chaque clé pluralisée et vérifier le build de production.
- [Régression de paramètre] Une clé peut être utilisée avec un nom de paramètre différent de celui attendu par le message. -> Auditer les usages par clé et tester les paramètres effectivement passés par les templates.
- [Valeur dynamique interprétée] Un nom saisi par une association peut contenir des accolades et être interprété comme une expression ICU si les anciennes interpolations sont conservées. -> Utiliser des arguments ICU pour toutes les valeurs dynamiques et couvrir les accolades dans les tests.
- [Rendu de zéro inattendu] La catégorie française de pluralisation peut surprendre si la locale n'est pas transmise au plugin. -> Configurer explicitement `locales: 'fr'` et formaliser les sorties 0, 1 et 2 dans les spécifications et les tests.
- [Fausse couverture] Une recherche textuelle peut manquer un libellé construit autrement. -> Compléter l'inventaire par une recherche des clés Transloco recevant `count`, `active`, `total`, `displayed` ou un nom numérique équivalent.

## Migration Plan

1. Résoudre T-141 et vérifier la branche cible `front/feat-141-pluriels-interface` avant toute modification applicative.
2. Valider la compatibilité du plugin MessageFormat, l'ajouter avec le lockfile et configurer le provider Transloco.
3. Migrer les clés et usages identifiés, puis mettre à jour les assertions de tests.
4. Exécuter les validations frontend pertinentes : tests non interactifs, lint, format check et build.
5. En cas de régression, retirer le provider et revenir aux clés précédentes dans la même PR, ou corriger les messages sans toucher aux API.
6. Préparer une PR vers `main` liée à T-141. La fusion reste une action du mainteneur.

## Open Questions

Aucune question bloquante. Le périmètre couvre les clés actuellement utilisées par les vues et le rendu de zéro suit explicitement la locale française.
