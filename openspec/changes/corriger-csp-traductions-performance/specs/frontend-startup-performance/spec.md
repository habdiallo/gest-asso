## ADDED Requirements

### Requirement: Le frontend rend la page publique sans attendre les opérations non nécessaires

Le frontend SHALL afficher la page de connexion et ses contrôles essentiels sans attendre une opération de session ou de préparation qui n'est pas nécessaire à ce premier rendu. Les opérations différées SHALL conserver leur gestion d'erreur et SHALL être terminées avant l'action protégée correspondante.

#### Scenario: Backend lent pendant l'ouverture de la page de connexion

- **WHEN** la page `/login` est ouverte et que la récupération de l'utilisateur courant est lente
- **THEN** les libellés, champs et bouton de connexion sont rendus sans attendre cette récupération
- **THEN** aucune action protégée n'est autorisée avant la préparation requise

#### Scenario: Préparation CSRF différée

- **WHEN** un utilisateur ouvre `/login` sans session
- **THEN** l'absence de préparation CSRF globale ne bloque pas le premier rendu
- **THEN** le token CSRF est disponible avant la soumission du formulaire de connexion

### Requirement: Le temps de démarrage est mesuré sur l'image déployée

Le dispositif de validation SHALL mesurer séparément le chargement HTML, les assets principaux, le rendu visible et le moment où le formulaire devient interactif sur l'environnement d'intégration. Les mesures SHALL être associées à l'image frontend et au commit déployés.

#### Scenario: Mesure nominale du chargement

- **WHEN** le smoke test ouvre `/login` avec un cache froid
- **THEN** le rapport contient les mesures de chargement et d'interactivité
- **THEN** le rapport identifie les requêtes ou initializers qui dépassent le budget retenu

#### Scenario: Régression de démarrage

- **WHEN** une nouvelle image dépasse le budget de démarrage ou ajoute une erreur console bloquante
- **THEN** la validation échoue et l'image n'est pas déclarée prête à être déployée
