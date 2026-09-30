## Context

La spec principale `frontend-shell` provient de la synchronisation du change archive `cycle-vie-comptes-utilisateurs`. Le delta archive contient deux sections `MODIFIED Requirements`, dont la premiere porte sur `Connexion a l application`; la synchronisation precedente a conserve l ancienne version dans la spec principale.

## Goals / Non-Goals

**Goals:**

- Reconstituer un delta OpenSpec non ambigu pour `frontend-shell`.
- Faire apparaitre dans la spec principale les deux parcours de connexion, normale et avec changement de mot de passe obligatoire.
- Conserver les scenarios existants de refus de connexion et d absence d inscription libre.

**Non-Goals:**

- Modifier le code Angular ou le backend.
- Modifier le contrat API ou le comportement de l authentification.
- Revoir les autres requirements de `frontend-shell`.

## Decisions

- Utiliser une seule section `MODIFIED Requirements` dans le delta archive et y placer le contenu complet de chaque requirement modifie, conformément au format OpenSpec.
- Conserver le nom exact `Connexion à l application` dans le delta et la spec principale afin que la synchronisation cible le requirement existant.
- Décrire explicitement les deux branches de connexion : session normale vers le tableau de bord et session limitee vers le changement obligatoire de mot de passe.
- Corriger la spec principale dans la meme PR pour rendre le resultat lisible et verifier directement le contrat documentaire final.

## Risks / Trade-offs

- [Risque] La correction porte sur des artefacts OpenSpec deja archives. Mitigation : ne modifier que le delta concerne et la spec principale, sans toucher aux autres changes archives.
- [Risque] Une synchronisation future pourrait reproduire le probleme si des sections dupliquees sont ajoutees. Mitigation : valider le delta et la spec complete avant publication.
