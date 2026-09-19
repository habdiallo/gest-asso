## Why

Le mode mock de main ne compile plus depuis la PR 64 (T-68, commit 295a04d). Son handler de barème traite comme un tableau un champ déclaré Set par le client généré ; le build standard exclut les mocks et la CI ne compile pas le frontend.

## What Changes

- Corriger le type validé du corps JSON du handler sans modifier le contrat ni les fichiers générés.
- Vérifier le traitement d'un tableau JSON valide et le refus d'un corps invalide.
- Ajouter un contrôle CI qui génère le client API puis compile les configurations production et mock.
- Livrer un seul ticket T-113, scope front, type fix, branche `front/fix-113-demarrage-mock`, PR vers main. Prérequis : T-68 déjà intégré.

## Capabilities

### New Capabilities

- `mock-build-validation`: compilation du mode mock et validation du corps JSON du barème, avec contrôle CI reproductible.

### Modified Capabilities

Aucune.

## Impact

Handler MSW campagnes, tests associés, workflow GitHub Actions et documentation de validation frontend. Aucun changement de contrat API, backend, dépendance npm ou migration. Le succès exige une compilation mock et production, un démarrage local et un test du handler sur un tableau JSON.
