## Why

Sur l'en-tête mobile livré par la PR 24, le libellé « Se déconnecter » déborde et est tronqué lorsque le texte est agrandi à 200 %, notamment à 375 × 667 px avec une taille racine de 32 px. La PR étant fusionnée, le [retour de revue P3](https://github.com/habdiallo/gest-asso/pull/24#discussion_r4036186569) doit être traité par un nouveau ticket de correction.

## What Changes

- Adapter la disposition de l'en-tête mobile pour que le contrôle de déconnexion et son libellé complet restent visibles à 320 et 375 px, avec texte à 100 % et 200 %.
- Permettre le retour à la ligne et réserver au contenu la hauteur réellement occupée par l'en-tête.
- Conserver le nom accessible « Se déconnecter », le parcours clavier, le changement de thème et le comportement de déconnexion pour les quatre rôles.
- Ajouter les vérifications de régression du DOM et du rendu réel dans un navigateur.

## Capabilities

### New Capabilities

- `shell-logout-text-resize` : lisibilité et accessibilité de la déconnexion dans l'en-tête mobile lorsque le texte est agrandi. Cette exigence complète le backlog `frontend-shell` ; aucune spec principale n'est encore présente dans `openspec/specs/`.

### Modified Capabilities

Aucune.

## Impact

- Ticket local : T-110, scope `front`, type `fix`, branche `front/fix-110-libelle-deconnexion-200`, change `corriger-libelle-deconnexion-200`.
- Priorité du catalogue : P2, niveau disponible pour une correction d'accessibilité ; sévérité du constat de revue conservée : P3.
- Dépendance : T-14, intégré par la [PR 24](https://github.com/habdiallo/gest-asso/pull/24), commit `4a57723f895b4d9cd141ed1e056d74decfc48949`.
- Code concerné : `contribo-front/src/app/app.html`, tests du shell et, si nécessaire, template/tests de `shared/logout-button/`.
- Livraison : une nouvelle PR vers `main` pour T-110, sans réutiliser la branche fusionnée de T-14.
- Aucun changement de contrat API, de rôle, de session, de dépendance npm ou de migration.
