## 1. Préparer le référentiel de recette

- [x] 1.1 [T-183] Vérifier la branche `docs/chore-183-plan-tests-manuels-fonctionnels`, résoudre T-183 et confirmer que les sources de référence sont le cahier métier, le contrat OpenAPI, les routes frontend et les specs fonctionnelles existantes.
- [x] 1.2 [T-183] Définir les comptes de recette des quatre rôles, les deux variantes `operatorCanRecordPayments`, le jeu de données fictif réinitialisable et les prérequis de disponibilité de l'environnement.

## 2. Construire le plan de tests manuels

- [x] 2.1 [T-183] Produire la matrice de couverture par fonctionnalité, rôle, droit, état métier et résultat attendu, en reliant chaque famille aux US/RG et opérations API concernées.
- [x] 2.2 [T-183] Rédiger les cas de test détaillés pour l'authentification, la navigation, les membres, les catégories, les utilisateurs et rôles, les campagnes, les paiements, les cagnottes, le compte et l'espace personnel.

## 3. Vérifier la qualité et la séparation des périmètres

- [x] 3.1 [T-183] Relire les cas pour couvrir les parcours nominaux, validations, erreurs, autorisations positives et négatives, états vides, chargements, filtres, recherches, pagination et rafraîchissements après mutation.
- [x] 3.2 [T-183] Contrôler que les cas responsive, contraste, densité, dimensions et composition desktop, tablette et mobile sont explicitement exclus et orientés vers un change ultérieur.
- [x] 3.3 [T-183] Ajouter et vérifier le protocole de création immédiate d'un ticket `fix` par anomalie indépendante, avec scope `front`, `back` ou `fullstack`, preuves de reproduction et revalidation obligatoire.

## 4. Valider et préparer la livraison documentaire

- [x] 4.1 [T-183] Exécuter les contrôles OpenSpec et registre (`openspec status`, lecture des instructions, `node scripts/tickets.mjs check`, résolution et vérification de T-183), puis corriger les incohérences éventuelles.
- [x] 4.2 [T-183] Relire le diff ciblé, renseigner la validation réelle dans la PR prévue vers `develop` et séparer la revue et la fusion de la préparation locale, sans publication ni fusion sans demande explicite.
