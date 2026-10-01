# Plan de dépendances pour l implémentation

Les worktrees d implémentation doivent utiliser la branche enregistrée dans
`openspec/tickets.json`. Un ticket ne peut démarrer que lorsque ses dépendances
sont présentes dans la branche de base et que `node scripts/tickets.mjs verify`
réussit pour le ticket sélectionné.

## Vagues parallèles

### Vague 0, fondations indépendantes

- T-164, version commune d OpenAPI Generator
- T-165, tests backend sur PostgreSQL réel
- T-167, formalisation de la situation actuelle de la couche domaine
- T-169, autorisation backend unifiée
- T-170, synchronisation des dépôts Portainer et source de vérité
- T-175, documentation frontend découplée des numéros de tickets

### Vague 1

- T-166 après T-164, correction des tags OpenAPI et régénération
- T-171 après T-167, modèle métier backend indépendant des DTO OpenAPI
- T-174 après T-164, séparation documentation fonctionnelle et contrat OpenAPI
- T-177 après T-164, rationalisation de la génération frontend et de Java

### Vague 2

- T-168 après T-170, réduction des duplications de configuration de déploiement
- T-172 après T-164 et T-166, façade frontend autour du client généré
- T-173 après T-171, découpage du repository JDBC

### Vague 3

- T-176 après T-172, stratégie d état frontend
- T-178 après T-167, T-172, T-174, T-175 et T-177, traçabilité OpenSpec équilibrée

### Vague 4

- T-179 après T-164 à T-178, matrice finale de couverture et décisions résiduelles

## Règles de livraison

Chaque ticket garde une branche et une PR distinctes. Les branches d une même
vague peuvent être développées en parallèle. Une vague suivante attend la
validation des PR nécessaires, pas uniquement la présence de commits dans un
worktree. Aucun ticket ne doit reprendre les anciens T-163 à T-169 de Claude,
car ces branches utilisaient des identifiants désormais réservés ou déjà
attribués.
