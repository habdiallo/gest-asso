## Context

`app.html` affiche une sidebar fixe de 256 px à partir de 821 px, un nom de marque seul, une navigation textuelle et une rangée thème/déconnexion. Le prototype utilise une marque illustrée, des liens avec icônes, une rubrique Administration, un état actif complet et une identité en pied. Les polices et jetons nécessaires existent déjà dans le frontend.

Le prototype ne définit pas les droits ni les destinations de l'application : `core/navigation/navigation-items.ts`, les gardes et les specs du shell restent les références fonctionnelles. Ce design fixe la traduction visuelle du prototype sur le menu existant pour T-111 uniquement.

## Goals / Non-Goals

**Goals:** reproduire les éléments graphiques de la sidebar, dans les thèmes Obsidian Midnight et Alabaster Gallery, tout en préservant les contrats de navigation, de session et d'accessibilité.

**Non-Goals:** nouvelles routes ou pages, modification des libellés/destinations/permissions, refonte de l'en-tête ou du contenu, navigation mobile, nouveau breakpoint, sélecteur de rôle, logique de compte, API, dépendances, refactorisation générale du shell ou des styles.

## Decisions

### 1. Référence et mesures locales

Reprendre les règles de `design/styles.css` pour `.sidebar`, `.brand*`, `.nav*` et `.profile*`, et les SVG de `design/app.js`. La référence du bloc latéral prime sur les prescriptions génériques du document DESIGN. Préserver les jetons globaux existants et le focus accessible ; toute adaptation de contraste nécessaire est locale et documentée.

À taille de texte normale, les repères sont : largeur 256 px, padding 28/20/20 px, flou 24 px ; logo 38 px, rayon 11 px et pictogramme 22 px ; nom 25 px Bebas Neue, sous-titre 8 px Space Grotesk ; navigation après 30 px, gap 5 px ; liens 43 px, padding horizontal 12 px, rayon 9 px, icônes 18 px, textes 14 px ; identité avec avatar 36 px, nom 13 px et rôle 11 px. La lisibilité avec texte agrandi prime sur une hauteur fixe qui couperait les libellés.

L'alternative consistant à copier toute la feuille du prototype est écartée : elle affecterait les autres zones de l'application.

### 2. Navigation verticale uniquement

Adapter le rendu `orientation="vertical"` de `NavigationMenu`, avec CSS local ou classes conditionnelles. Associer les icônes aux chemins existants ; utiliser une icône de profil cohérente pour Mon espace. Afficher Administration pour regrouper les deux liens administratifs existants, sans doublon, sans changer leur ordre relatif ni leurs noms. Les liens non administratifs conservent leur ordre relatif. Ne pas afficher de rubrique vide pour les autres rôles.

Conserver les liens Angular, `routerLinkActive` et `ariaCurrentWhenActive="page"`. L'état actif reproduit fond gold-wash, bordure teintée, texte/icône accentués et repère lumineux au bord gauche. Prévoir l'espace pour que le repère ne soit pas coupé par le conteneur de navigation défilant. Les sous-routes conservent leur lien parent actif suivant le comportement actuel.

Les métadonnées d'icône/rubrique sont purement visuelles et n'ajoutent pas de filtrage métier. Le rendu horizontal mobile reste identique. Reprendre la matrice de menus du prototype serait hors périmètre.

### 3. Marque et pied de sidebar

Ajouter le logo vectoriel existant du prototype et le sous-titre au bloc desktop seulement. Les SVG décoratifs restent cachés des technologies d'assistance.

Afficher le nom, les initiales dérivées du nom et le rôle applicatif à partir de `SessionService.user`, en lecture seule. La présentation du profil est informative : ne pas reprendre le bouton du prototype vers une nouvelle page compte. Si les données utilisateur ne sont pas encore chargées, réserver le bloc sans nom fictif ni nouvelle requête. Un nom long est tronqué visuellement comme dans le prototype, avec sa valeur complète accessible.

Conserver les boutons thème et déconnexion existants dans le pied, sous le bloc d'identité, avec leurs comportements et noms accessibles. Ce maintien est l'adaptation nécessaire au shell actuel, puisque le prototype place ces actions ailleurs. Les templates partagés de ces boutons ne sont pas modifiés pour cette seule sidebar.

### 4. Cloisonnement et validation

Limiter les modifications à `app.html`, `app.css`, la lecture de session dans `app.ts`, au menu vertical et, si nécessaire, à ses métadonnées de présentation. Conserver le décalage du contenu principal et le seuil de 821 px. Aucun style global de marque/navigation/profil n'est ajouté.

Comparer des captures recadrées de la sidebar actuelle et du prototype à 1440 × 900 et 1024 × 768 px dans les deux thèmes, avec chaque rôle applicatif. Utiliser les mêmes textes disponibles pour comparer le profil, ou noter les différences de contenu. Vérifier aussi survol, état actif, focus, texte agrandi et hauteur réduite. Contrôler 820/821 px et un viewport mobile pour confirmer le cloisonnement, sans travail de refonte mobile.

## Risks / Trade-offs

- Réutilisation du menu sur mobile : isoler les ajouts dans l'orientation verticale et vérifier le DOM horizontal existant.
- Prototype et application avec menus différents : comparer le style des éléments équivalents, garder la liste des destinations autorisées actuelle (§3 des besoins métier).
- Libellés plus longs que ceux du prototype : conserver les noms actuels et adapter localement le retour à la ligne si nécessaire pour éviter la troncature des liens.
- Couleurs secondaires du prototype peu contrastées : vérifier clair/sombre et préserver WCAG AA avec une adaptation locale explicitée dans la PR.
- Footer plus haut avec les actions conservées : donner le défilement au menu et garder identité/actions accessibles sans recouvrement.

## Migration Plan

Une seule livraison frontend pour T-111, dans sa branche et une PR vers `main`, après vérification des prérequis intégrés. Aucun changement de données ni migration. Retour arrière par annulation de la PR, sans impact sur la session ou le contrat API. Le travail demandé ici s'arrête à la proposition ; les tâches applicatives restent ouvertes.

## Open Questions

Aucune question bloquante. La référence est le prototype versionné dans `design/` ; tout écart d'accessibilité nécessaire sera mesuré et expliqué pendant l'implémentation.
