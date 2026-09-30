## Why

La synchronisation du change archive du cycle de vie des comptes a laisse la spec principale `frontend-shell` avec un parcours de connexion incomplet. Le comportement `mustChangePassword` doit apparaitre dans la requirement de connexion afin que la documentation ne contredise pas le parcours de premiere session deja livre.

## What Changes

- Corriger le delta OpenSpec archive pour regrouper les requirements modifies de `frontend-shell` dans une structure synchronisable.
- Mettre a jour la spec principale `frontend-shell` pour distinguer la connexion normale de la connexion avec changement de mot de passe obligatoire.
- Verifier la validation OpenSpec et le registre des tickets.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `frontend-shell`: documenter la redirection vers le changement obligatoire lorsque `mustChangePassword` est actif.

## Impact

- Documentation OpenSpec uniquement : `openspec/specs/frontend-shell/` et le delta archive du cycle de vie des comptes.
- Aucun changement de code applicatif, d API, de migration ou de dependance.
