## Context

T-110 traite le [constat P3 de la PR 24](https://github.com/habdiallo/gest-asso/pull/24#discussion_r4036186569), désormais fusionnée. Le shell mobile de `app.html` place la marque et les actions sur une ligne dans un en-tête `fixed` de hauteur `h-14`. Le contenu réserve `pt-14`. Le bouton partagé de déconnexion affiche une icône et un texte dans un conteneur `inline-flex`.

À 375 × 667 px avec `document.documentElement.style.fontSize = '32px'`, le constat mesure le bouton jusqu'à x = 512,67 px. Cette mesure provient de la revue ; elle n'a pas été rejouée pendant la proposition. Les tests Angular/Vitest sous jsdom ne mesurent pas la mise en page réelle.

## Goals / Non-Goals

**Goals:**

- Rendre tout le bouton et le libellé « Se déconnecter » visibles à 320 et 375 px avec texte à 200 %, dans les deux thèmes.
- Garder la marque, le changement de thème et la déconnexion utilisables au clavier.
- Laisser la hauteur de l'en-tête s'adapter au texte sans masquer le début du contenu.
- Préserver la suppression de session et la navigation vers `/login` pour les quatre rôles.

**Non-Goals:**

- Refaire la navigation basse mobile, le menu par rôle ou la barre latérale.
- Modifier le contrat API, la logique de session ou ajouter une dépendance.
- Implémenter la correction pendant cette phase de proposition.

## Decisions

### En-tête mobile dans le flux, avec maintien en haut au défilement

Prévoir un en-tête `sticky top-0` de hauteur automatique, avec une disposition permettant plusieurs lignes pour la marque et les actions. Le contenu suit sa hauteur naturelle ; la réserve mobile `pt-14` est retirée dans la même correction. Le seuil existant de 821 px continue à piloter l'en-tête mobile et la barre latérale.

Cette solution évite de synchroniser une hauteur fixe avec plusieurs tailles de texte. Un en-tête `fixed` avec mesure JavaScript et compensation dynamique ajouterait un état et des effets inutiles pour ce besoin.

### Garder le libellé complet

Autoriser le retour à la ligne du texte et la réduction des conteneurs flexibles. Si nécessaire, isoler le libellé du bouton dans un élément pouvant revenir à la ligne, tout en conservant une icône décorative qui ne disparaît pas. Ne pas utiliser ellipsis, clipping ou réduction de police pour faire tenir l'action.

Une présentation par icône seule avec nom accessible reste une alternative technique, mais ne satisfait pas le choix retenu de garder le libellé visible. Les éventuels ajustements du composant partagé doivent aussi être vérifiés dans la barre latérale.

### Validation du rendu et du comportement

Tester dans Angular le nom accessible complet, la présence de l'action et son comportement de déconnexion. Vérifier dans Chrome le rendu à 320 × 568 et 375 × 667 px avec taille racine à 16 puis 32 px, dans les deux thèmes, sur le compte Administrateur du constat ; compléter le parcours de déconnexion pour les autres rôles.

Mesurer les limites de l'en-tête, du bouton et des fragments de texte pour détecter une troncature interne malgré un bouton dans le viewport. Vérifier l'absence de débordement horizontal du shell, le premier contenu, le focus visible, l'activation par Entrée/Espace et le maintien de l'en-tête au défilement. Contrôler aussi les seuils 820/821 px et un écran desktop.

## Risks / Trade-offs

- [Un en-tête sur plusieurs lignes occupe plus de hauteur] Réduire les espacements sans réduire la taille du texte ; vérifier le contenu à 320 × 568 px.
- [Le composant partagé affecte aussi la barre latérale] Vérifier ses usages desktop/tablette et les deux thèmes.
- [Une réserve supérieure conservée crée un espace vide, ou un positionnement incorrect masque le contenu] Modifier l'en-tête et la réserve ensemble, puis vérifier leur géométrie dans Chrome.
- [Tests DOM verts sans preuve de lisibilité] Joindre les captures et mesures navigateur à la nouvelle PR.

## Migration Plan

La branche `front/fix-110-libelle-deconnexion-200` part de `origin/main`, où le commit de la PR 24 est déjà présent. Après implémentation, tests, build et vérification navigateur, publier une nouvelle PR T-110 vers `main`, avec le lien du constat. La fusion reste une étape distincte. Aucun changement de données ; un retour arrière passe par une PR annulant la correction.

## Open Questions

Aucune décision bloquante. Le nombre exact de lignes dépendra des mesures à 320 px et à 200 % pendant l'implémentation.
