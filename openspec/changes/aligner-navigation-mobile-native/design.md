# Design technique

## Shell mobile

Le composant de navigation conserve sa composition verticale desktop. En orientation horizontale, il filtre les destinations principales du rôle et ajoute toujours le lien Plus lorsque la session est active. Les liens d'administration et l'espace personnel ne sont donc plus compressés dans la barre basse.

L'écran Plus est une page Angular lazy-loaded protégée par la session active. Il rend les liens déjà disponibles dans le produit selon le rôle courant. Pour l'administrateur, il expose Utilisateurs et rôles et Catégories de revenu. Pour les autres rôles, il expose l'espace personnel existant. Il ne crée pas de destination Mon accès supplémentaire.

Les écrans secondaires ajoutent un lien de retour explicite vers Plus ou Accueil. Le bouton de thème reste dans l'en-tête mobile à côté du profil et ne dépend pas de la route Plus.

## Référence visuelle

Le dossier `design/native design` conserve la proposition d'écrans natifs utilisée pour vérifier la hiérarchie, les espacements, les états actifs et la navigation du parcours.

## Compatibilité

Les services, permissions, appels API et données existants sont réutilisés. Le changement reste limité au shell frontend, aux liens de navigation et à leur documentation.
