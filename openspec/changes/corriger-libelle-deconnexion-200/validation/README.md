# Vérification T-110

## Reproduction et méthode

Serveur Angular en mode mock, Chrome headless, viewport CSS via DevTools. Compte initial : Administrateur de démonstration. Agrandissement du texte seul par `document.documentElement.style.fontSize = '32px'`, comparé à 16 px ; ce contrôle ne constitue pas un audit complet de zoom navigateur ou d'accessibilité.

Avant correction, le bord droit du bouton atteint 512,67 px à 320 et 375 px. Après correction, il reste dans l'en-tête et le libellé est entièrement visible. La taille du texte reste inchangée pour chaque cas.

| Viewport | Texte | Thèmes | Bord droit du bouton après | Hauteur de l'en-tête |
| --- | --- | --- | --- | --- |
| 320 × 568 px | 100 % | clair et sombre | 304 px | 57 px |
| 320 × 568 px | 200 % | clair et sombre | 288 px | 243 px |
| 375 × 667 px | 100 % | clair et sombre | 359 px | 57 px |
| 375 × 667 px | 200 % | clair et sombre | 343 px | 203 px |

Les contrôles automatisés via DevTools vérifient les rectangles du bouton, de chaque fragment du libellé et du changement de thème, l'absence de chevauchement entre actions, la largeur du document, la position du contenu et l'absence de réserve supérieure résiduelle. Ils vérifient aussi le nom du bouton dans l'arbre d'accessibilité Chrome.

La matrice comprend 20 cas : largeurs 320, 375, 820, 821 et 1280 px, tailles racine 16/32 px et thèmes clair/sombre. À 820 px l'en-tête mobile est visible ; à 821 et 1280 px il est masqué et la déconnexion de la barre latérale reste contenue dans son parent. Le maintien en haut au défilement est vérifié à 375 px et 200 %.

Tab atteint le bouton et affiche un focus visible. Entrée déclenche la déconnexion des comptes Administrateur et Opérateur ; Espace celle des comptes Trésorier et Membre. Pour chaque compte, le nom accessible est « Se déconnecter », le jeton local est supprimé, la route devient `/login`, les actions authentifiées disparaissent et le changement de thème reste disponible.

## Captures

- [Avant, 320 px à 200 %, sombre](before-320-200-dark.png).
- [Après, 320 px à 200 %, sombre](after-320-200-dark.png).
- [Avant, 375 px à 200 %, sombre](before-375-200-dark.png).
- [Après, 375 px à 200 %, sombre](after-375-200-dark.png).
- [Après, 375 px à 200 %, clair](after-375-200-light.png).

Mesures : [avant](before-measurements.json) et [après](after-measurements.json). Les captures et mesures portent sur des comptes et données de démonstration.

## Limites

La navigation basse et les contenus métier agrandis restent hors périmètre de T-110. La vérification ne couvre pas les autres navigateurs ni tous les contrastes. L'en-tête prend davantage de hauteur à 200 %, afin de conserver le texte complet ; le début du contenu suit sa hauteur réelle.
