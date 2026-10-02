# Accès à l'espace personnel avant le changement de mot de passe

- Type : fix
- Feature : auth
- Sévérité : Major
- Priorité : P1

## Description

Le scénario Temporary login opens the restricted flow produit un écart dans l'environnement local.

## Préconditions


## Reproduction

1. Préparer la situation : a user authenticates with valid credentials while
2. Observer : the API returns a session marked as password-change-only and the

## Comportement observé

Après une connexion avec un compte temporaire, l'ouverture directe de /mon-espace affiche le profil Membre avant le changement de mot de passe obligatoire. Une nouvelle tentative reproduit le même accès, alors que les actions d'onglet redirigent ensuite vers /changer-mot-de-passe.

## Comportement attendu

the API returns a session marked as password-change-only and the

## Critères d acceptance

- Le scénario scenario-ce2065ceb626 respecte le résultat attendu.
- Le comportement reste conforme pour les rôles et états couverts.

## Tests de non-régression

- scenario-ce2065ceb626
- scenario-ce2065ceb626-permissions
- scenario-ce2065ceb626-error-path
