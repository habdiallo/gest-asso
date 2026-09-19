## 1. Préparation T-113

Ticket T-113, scope front, type fix, slug demarrage-mock, branche `front/fix-113-demarrage-mock`. Prérequis : T-68, PR 64 intégrée dans main. Périmètre : type JSON du mock, tests du handler, compilation CI et documentation. Acceptation : builds production/mock réussis, réponses nominales et erreurs conservées, serveur accessible.

- [x] 1.1 [T-113] Vérifier Git, réserver le ticket et produire les artefacts OpenSpec sur une branche de planification.
- [x] 1.2 [T-113] Résoudre le ticket, utiliser sa branche et vérifier les prérequis et leur présence dans l'ascendance avant le code.

## 2. Correction et prévention

- [x] 2.1 [T-113] Dériver le type du tableau JSON depuis le DTO généré et corriger le garde du handler.
- [x] 2.2 [T-113] Tester une mise à jour valide, une collection invalide et un rôle non autorisé via MSW.
- [x] 2.3 [T-113] Ajouter build:mock, le workflow de génération et compilation des deux configurations, et documenter les validations.

## 3. Validation locale

- [x] 3.1 [T-113] Valider/générer l'API, exécuter les tests pertinents et les builds production et mock, vérifier lint et formatage ciblés.
- [x] 3.2 [T-113] Vérifier registre et artefacts, relire le diff et démarrer le frontend mock avec contrôle HTTP.

## 4. Livraison

- [x] 4.1 [T-113] Préparer la description PR selon le modèle, committer uniquement le périmètre et pousser la branche du ticket.
- [x] 4.2 [T-113] Ouvrir la PR vers main et rapporter les validations et limites ; la revue et la fusion restent à faire par le mainteneur.

PR ouverte : https://github.com/habdiallo/gest-asso/pull/67. Revue et fusion à effectuer par le mainteneur.
