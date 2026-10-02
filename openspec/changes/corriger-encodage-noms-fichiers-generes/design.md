## Context

Vérifié directement en relançant `npm run generate:api` (générateur
7.25.0 actuellement épinglé) : les tags OpenAPI `Catégories de revenu`,
`Règlements` et `Utilisateurs et rôles` produisent des fichiers/classes avec
les caractères accentués supprimés sans translittération
(`catgories-de-revenu.service.ts` / `CatgoriesDeRevenuService`,
`rglements.service.ts` / `RglementsService`,
`utilisateurs-et-rles.service.ts` / `UtilisateursEtRlesService`). Le même
défaut touche le backend : `contribo-back/pom.xml` utilise `useTags: true`
sur le générateur `spring`, et les interfaces générées correspondantes
(`CatgoriesDeRevenuApi`, `RglementsApi`, `UtilisateursEtRlesApi`) sont
implémentées directement par `IncomeCategoryController`,
`PaymentController` et `UserAccountController`.

Contrairement à la formulation de l'analyse initiale (« d'autres tags
accentués sont mieux transformés : `espace-personnel`, `tableau-de-bord` »),
ces deux tags de référence (`Espace personnel`, `Tableau de bord`) ne
contiennent en réalité aucun caractère accentué : ce ne sont pas des
contre-exemples. Vérification faite sur l'ensemble des 10 tags du contrat
(`grep -n "tags:" contribo-back/src/main/resources/contribo-api.yml`), les 3 tags accentués sont
systématiquement et intégralement affectés, sans exception. Ce n'est donc
pas une incohérence de traitement entre tags, mais un défaut de
sanitization du générateur qui s'applique uniformément à tout caractère
non-ASCII.

## Goals / Non-Goals

**Goals:**
- Obtenir des noms de fichiers et de classes générés entièrement ASCII des
  deux côtés (front Angular, back Spring), de façon stable et reproductible
  avec le générateur actuellement épinglé.
- Ne changer aucun comportement runtime de l'API (chemins, `operationId`,
  schémas, autorisations).

**Non-Goals:**
- Ne change pas de version de générateur ni ne corrige le comportement de
  sanitization d'OpenAPI Generator lui-même (hors périmètre de ce dépôt).
- Ne modifie pas les libellés affichés à l'utilisateur dans l'IHM : les tags
  OpenAPI ne sont pas rendus dans le produit, seulement utilisés pour le
  regroupement des opérations à la génération.
- N'introduit pas de mapping ou de couche d'alias pour contourner les noms
  générés : les conventions du dépôt interdisent de dupliquer les DTO/services
  générés (`.claude/rules/frontend/api-client.md`).

## Decisions

### Corriger à la source, dans le contrat, plutôt que contourner à la génération

Alternative écartée : configurer un mapping de noms côté générateur
(`nameMappings`/template personnalisé) pour corriger uniquement la sortie.
Rejetée car (a) le même problème existe indépendamment côté backend avec un
générateur différent (`spring` vs `typescript-angular`), donc il faudrait
maintenir deux contournements distincts pour le même défaut, et (b) un tag
displayable en toutes lettres accentuées dans le contrat n'apporte aucune
valeur ici : les tags ne sont consommés que pour la génération de code, jamais
affichés. Renommer les 3 tags dans `contribo-back/src/main/resources/contribo-api.yml`
(`Catégories de revenu` → `Categories de revenu`,
`Règlements` → `Reglements`, `Utilisateurs et rôles` → `Utilisateurs et roles`)
corrige les deux générateurs d'un seul coup, sans configuration
supplémentaire à maintenir.

### Rechercher-remplacer mécanique après régénération, pas de renommage manuel des symboles

Après renommage des tags et régénération, les nouveaux noms de classes
(`CategoriesDeRevenuService`, `ReglementsService`,
`UtilisateursEtRolesService` côté front ; `CategoriesDeRevenuApi`,
`ReglementsApi`, `UtilisateursEtRolesApi` côté back) remplacent
mécaniquement les anciens dans tout le code applicatif qui les référence :
23 fichiers frontend identifiés (`grep -rl` sur
`CatgoriesDeRevenu|RglementsService|UtilisateursEtRles` dans
`contribo-front/src/app`, hors `core/api/generated`) et 3 contrôleurs
backend (`IncomeCategoryController`, `PaymentController`,
`UserAccountController`). Un renommage global cohérent (nouveau nom partout)
plutôt qu'un alias d'import évite de recréer la même incohérence de style que
celle corrigée ici.

## Risks / Trade-offs

- [Le rechercher-remplacer manque une occurrence] → mitigé par la
  compilation TypeScript (`tsc`/`ng build`) et Java (`mvn compile`), qui
  échouent sur toute référence à un symbole désormais inexistant ; aucune
  occurrence ne peut rester silencieusement cassée.
- [Un futur tag accentué réintroduit le même défaut] → mitigé par la
  nouvelle exigence documentée dans `api-design-first-governance` (tags
  ASCII), vérifiable en revue de PR sur tout nouveau tag ajouté au contrat.
- [Renommage de tag perçu comme un changement de contrat] → aucun champ,
  chemin, `operationId` ou schéma n'est modifié ; seul un identifiant de
  regroupement de génération change, sans impact sur les consommateurs HTTP
  réels du contrat.
